import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/auth';
import type { Types } from 'mongoose';

async function getOrCreateCart(userId: Types.ObjectId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
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
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;

    const { productId, quantity } = await request.json();

    if (!productId) {
      return NextResponse.json({ message: 'productId is required' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    if (!product.isActive) {
      return NextResponse.json({ message: 'This product is no longer available' }, { status: 400 });
    }

    if (product.stock <= 0) {
      return NextResponse.json({ message: 'No more products available in stock' }, { status: 400 });
    }

    const qtyToAdd = quantity && quantity > 0 ? quantity : 1;

    const cart = await getOrCreateCart(auth.user._id as Types.ObjectId);

    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    const alreadyInCart = existingItem ? existingItem.quantity : 0;
    const requestedTotal = alreadyInCart + qtyToAdd;

    if (requestedTotal > product.stock) {
      const canStillAdd = product.stock - alreadyInCart;
      if (canStillAdd <= 0) {
        return NextResponse.json(
          {
            message: `No more products available. You already have the maximum stock (${product.stock}) of "${product.name}" in your cart.`,
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          message: `Only ${product.stock} unit(s) of "${product.name}" are available in stock. You can add up to ${canStillAdd} more.`,
        },
        { status: 400 }
      );
    }

    if (existingItem) {
      existingItem.quantity = requestedTotal;
    } else {
      cart.items.push({ product: productId, quantity: qtyToAdd } as any);
    }

    await cart.save();
    await cart.populate('items.product');

    return NextResponse.json({ message: 'Item added to cart', cart }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;

    const cart = await getOrCreateCart(auth.user._id as Types.ObjectId);
    cart.items = [] as any;
    await cart.save();

    return NextResponse.json({ message: 'Cart cleared', cart }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}