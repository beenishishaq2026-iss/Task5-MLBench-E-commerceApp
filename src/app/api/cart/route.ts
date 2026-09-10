import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import { getAuthUser } from '@/lib/auth';
import type { Types } from 'mongoose';

async function getOrCreateCart(userId: Types.ObjectId) {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  return cart;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;

    const cart = await getOrCreateCart(auth.user._id as Types.ObjectId);

    await cart.populate('items.product');

    return NextResponse.json({ cart }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Server error';

    return NextResponse.json(
      { message: 'Server error', error: message },
      { status: 500 }
    );
  }
}