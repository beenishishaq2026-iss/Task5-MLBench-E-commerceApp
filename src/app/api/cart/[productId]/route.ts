import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import { getAuthUser } from '@/lib/auth';
import type { Types } from 'mongoose';

async function getOrCreateCart(userId: Types.ObjectId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;

    const { productId } = await params;
    const { quantity } = await request.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json({ message: 'quantity must be at least 1' }, { status: 400 });
    }

    const cart = await getOrCreateCart(auth.user._id as Types.ObjectId);
    const item = cart.items.find((i) => i.product.toString() === productId);

    if (!item) {
      return NextResponse.json({ message: 'Item not in cart' }, { status: 404 });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');

    return NextResponse.json({ message: 'Cart updated', cart }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;

    const { productId } = await params;
    const cart = await getOrCreateCart(auth.user._id as Types.ObjectId);
    cart.items = cart.items.filter((i) => i.product.toString() !== productId) as any;

    await cart.save();
    await cart.populate('items.product');

    return NextResponse.json({ message: 'Item removed from cart', cart }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
