import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { getAuthUser, forbidden } from '@/lib/auth';

const VALID_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const order = await Order.findById(id).populate('user', 'name email');

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (order.user._id.toString() !== auth.user._id!.toString() && auth.user.role !== 'admin') {
      return NextResponse.json({ message: 'Not authorized to view this order' }, { status: 403 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;
    if (auth.user.role !== 'admin') return forbidden();

    const { id } = await params;
    const { status } = await request.json();

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { message: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (order.isPaid && status === 'pending') {
      return NextResponse.json(
        { message: 'This order is already paid and cannot be set back to pending' },
        { status: 400 }
      );
    }

    order.status = status;
    if (status === 'paid' && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
    }
    await order.save();

    return NextResponse.json({ message: 'Order status updated', order }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}