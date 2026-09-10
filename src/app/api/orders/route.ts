import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { getAuthUser, forbidden } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;
    if (auth.user.role !== 'admin') return forbidden();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

const filter: Record<string, unknown> = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json(
      {
        count: orders.length,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        orders,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;

    const { shippingAddress } = await request.json();

    if (!shippingAddress) {
      return NextResponse.json({ message: 'shippingAddress is required' }, { status: 400 });
    }

    const requiredFields = ['fullName', 'address', 'city', 'postalCode', 'country', 'phone'];
    for (const field of requiredFields) {
      if (!shippingAddress[field]) {
        return NextResponse.json({ message: `shippingAddress.${field} is required` }, { status: 400 });
      }
    }

    const cart = await Cart.findOne({ user: auth.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ message: 'Your cart is empty' }, { status: 400 });
    }

    const unavailable: string[] = [];
    const insufficientStock: { name: string; available: number; requested: number }[] = [];

    for (const item of cart.items as any) {
      const product = item.product;
      if (!product || !product.isActive) {
        unavailable.push(item.product?.name || 'A product in your cart');
        continue;
      }
      if (item.quantity > product.stock) {
        insufficientStock.push({
          name: product.name,
          available: product.stock,
          requested: item.quantity,
        });
      }
    }

    if (unavailable.length > 0) {
      return NextResponse.json(
        {
          message: `${unavailable.join(', ')} is no longer available. Please remove it from your cart.`,
        },
        { status: 400 }
      );
    }

    if (insufficientStock.length > 0) {
      const details = insufficientStock
        .map((p) =>
          p.available > 0
            ? `"${p.name}" only has ${p.available} unit(s) left (you requested ${p.requested})`
            : `"${p.name}" is out of stock`
        )
        .join('; ');
      return NextResponse.json(
        { message: `No more products available. ${details}. Please update your cart.` },
        { status: 400 }
      );
    }

    const decremented: { productId: string; quantity: number }[] = [];

    for (const item of cart.items as any) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        
        for (const done of decremented) {
          await Product.findByIdAndUpdate(done.productId, { $inc: { stock: done.quantity } });
        }
        return NextResponse.json(
          {
            message: `No more products available. "${item.product.name}" was just sold out. Please update your cart.`,
          },
          { status: 409 }
        );
      }

      decremented.push({ productId: item.product._id.toString(), quantity: item.quantity });
    }

    const orderItems = cart.items.map((item: any) => {
      const price =
        item.product.discountPrice && item.product.discountPrice < item.product.price
          ? item.product.discountPrice
          : item.product.price;

      return {
        product: item.product._id,
        name: item.product.name,
        image: item.product.images[0]?.url || '',
        price,
        quantity: item.quantity,
      };
    });

    const itemsPrice = orderItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    let order;
    try {
      order = await Order.create({
        user: auth.user._id,
        items: orderItems,
        shippingAddress,
        itemsPrice,
        totalPrice: itemsPrice,
      });
    } catch (err) {
      // Order creation failed after stock was already deducted — roll it back.
      for (const done of decremented) {
        await Product.findByIdAndUpdate(done.productId, { $inc: { stock: done.quantity } });
      }
      throw err;
    }


    return NextResponse.json({ message: 'Order placed successfully', order }, { status: 201 });
 } catch (error) {
  const message = error instanceof Error ? error.message : "Server error";
  return NextResponse.json({ message: "Server error", error: message }, { status: 500 });
}
}