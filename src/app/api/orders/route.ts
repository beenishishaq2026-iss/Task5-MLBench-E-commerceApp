import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
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

    const filter: Record<string, any> = {};
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

    const order = await Order.create({
      user: auth.user._id,
      items: orderItems,
      shippingAddress,
      itemsPrice,
      totalPrice: itemsPrice,
    });

    cart.items = [] as any;
    await cart.save();

    return NextResponse.json({ message: 'Order placed successfully', order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}