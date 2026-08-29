// Ported 1:1 from the old backend's controllers/paymentController.js.
//
// IMPORTANT: in the old Express app this controller existed but was never
// mounted (there was no paymentRoutes.js and app.js never did
// `app.use('/api/payments', ...)`), so it was 100% dead/unreachable code -
// checkout only ever hit POST /api/orders. To preserve that exact behavior,
// this file is intentionally NOT wired up as a Route Handler under
// src/app/api/. It's kept here, present but dormant, so the Stripe logic is
// available to wire up later (e.g. by adding
// src/app/api/payments/checkout/[orderId]/route.ts that calls
// createCheckoutSession, and src/app/api/payments/webhook/route.ts that
// calls handleStripeWebhookEvent) without changing today's behavior.

import stripe from '@/lib/stripe';
import Order from '@/models/Order';
import type Stripe from 'stripe';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

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
      unit_amount: Math.round(item.price * 100), // stripe wants cents
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: `${FRONTEND_URL}/orders/${order._id}?payment=success`,
    cancel_url: `${FRONTEND_URL}/orders/${order._id}?payment=cancelled`,
    metadata: {
      orderId: order._id!.toString(),
    },
  });

  order.stripeSessionId = session.id;
  await order.save();

  return { status: 200 as const, body: { url: session.url } };
}

export async function handleStripeWebhookEvent(rawBody: string, signature: string) {
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET as string
  ) as Stripe.Event;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.status = 'paid';
        await order.save();
      }
    }
  }

  return event;
}
