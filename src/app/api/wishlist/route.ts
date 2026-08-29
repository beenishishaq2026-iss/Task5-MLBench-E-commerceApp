import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Wishlist from '@/models/Wishlist';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/auth';
import type { Types } from 'mongoose';

async function getOrCreateWishlist(userId: Types.ObjectId) {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }
  return wishlist;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;

    const wishlist = await getOrCreateWishlist(auth.user._id as Types.ObjectId);
    await wishlist.populate('products');
    return NextResponse.json({ wishlist }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ message: 'productId is required' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const wishlist = await getOrCreateWishlist(auth.user._id as Types.ObjectId);

    const alreadyIn = wishlist.products.some((p) => p.toString() === productId);

    if (!alreadyIn) {
      wishlist.products.push(productId as any);
      await wishlist.save();
    }

    await wishlist.populate('products');
    return NextResponse.json({ message: 'Added to wishlist', wishlist }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
