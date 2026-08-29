import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Wishlist from '@/models/Wishlist';
import { getAuthUser } from '@/lib/auth';
import type { Types } from 'mongoose';

async function getOrCreateWishlist(userId: Types.ObjectId) {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }
  return wishlist;
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;

    const { productId } = await params;
    const wishlist = await getOrCreateWishlist(auth.user._id as Types.ObjectId);
    wishlist.products = wishlist.products.filter((p) => p.toString() !== productId) as any;

    await wishlist.save();
    await wishlist.populate('products');

    return NextResponse.json({ message: 'Removed from wishlist', wishlist }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
