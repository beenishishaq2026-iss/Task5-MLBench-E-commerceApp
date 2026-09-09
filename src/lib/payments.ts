import stripe from '@/lib/stripe';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Cart from '@/models/Cart';
import { SERVER_API_URL } from '@/lib/api';
import type Stripe from 'stripe';

// Prefer an explicitly-configured FRONTEND_URL, but fall back to the same
// Vercel-aware resolver api.ts uses instead of hardcoding localhost — that
// fallback silently sent Stripe's redirect to the wrong origin whenever
// FRONTEND_URL was unset or stale in a given environment (e.g. still
// pointing at localhost after deploying), which drops the user's auth
// cookie and bounces them to /login instead of the success page.
const FRONTEND_URL = process.env.FRONTEND_URL || SERVER_API_URL;

export async function createCheckoutSession(orderId: string, userId: string) {
  const order = await Order.findById(orderId);

  if (!order) {
    return { status: 404 as const, body: { message: 'Order not found' } };
  }

  if (order.user.toString() !== userId) {
    return { status: 403 as const, body: { message: 'Not authorized for this order' } };
  }

  if (order.isPaid) {
    return { status: 400 as const, body: { message: 'This order is already paid' } };
  }

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.name },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${FRONTEND_URL}/orders/${order._id}?payment=pending`,
    // Release reserved stock reasonably quickly if the customer never pays.
    // 30 minutes is Stripe's minimum allowed expiration window.
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    metadata: {
      orderId: order._id!.toString(),
    },
  });

  order.stripeSessionId = session.id;
  await order.save();

  return { status: 200 as const, body: { url: session.url } };
}

// The success page reads this straight from Stripe using the session id in
// the URL, rather than trusting order.isPaid — that flag is only set once
// the webhook fires, which can lag a second or two behind the redirect and
// would otherwise show a false "still confirming" state right after payment.
export async function getSessionStatus(sessionId: string, userId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    return { status: 404 as const, body: { message: 'Order not found for this session' } };
  }

  const order = await Order.findById(orderId);

  if (!order) {
    return { status: 404 as const, body: { message: 'Order not found' } };
  }

  if (order.user.toString() !== userId) {
    return { status: 403 as const, body: { message: 'Not authorized for this order' } };
  }

  return {
    status: 200 as const,
    body: {
      isPaid: session.payment_status === 'paid',
      order: {
        _id: order._id!.toString(),
        totalPrice: order.totalPrice,
        shippingAddress: order.shippingAddress,
      },
    },
  };
}

export async function handleStripeWebhookEvent(rawBody: string, signature: string) {
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET as string
  ) as Stripe.Event;

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.status = 'paid';
          await order.save();

          // Payment is confirmed now — safe to clear the cart.
          await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
        }
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && !order.isPaid && order.status !== 'cancelled') {
          order.status = 'cancelled';
          await order.save();

          // Give the reserved stock back since this order was never paid.
          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: item.quantity },
            });
          }

          console.warn(`Order ${orderId} auto-cancelled — checkout session expired unpaid.`);
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;
      console.warn(
        `Payment failed for payment intent ${intent.id}: ${
          intent.last_payment_error?.message ?? 'no error message provided'
        }`
      );
      break;
    }

    default:
      break;
  }

  return event;
}