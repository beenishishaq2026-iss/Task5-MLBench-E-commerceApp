import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
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

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;

    const { productId, quantity } = await request.json();

    if (!productId) {
      return NextResponse.json({ message: 'productId is required' }, { status: 400 });
    }

    const qty = quantity && quantity > 0 ? quantity : 1;

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const cart = await getOrCreateCart(auth.user._id as Types.ObjectId);
    const existingItem = cart.items.find((i) => i.product.toString() === productId);
    const nextQuantity = (existingItem?.quantity || 0) + qty;

    if (nextQuantity > product.stock) {
      return NextResponse.json(
        {
          message:
            product.stock > 0
              ? `Only ${product.stock} unit(s) of "${product.name}" are available in stock.`
              : `No more products available. "${product.name}" is currently out of stock.`,
        },
        { status: 400 }
      );
    }

    if (existingItem) {
      existingItem.quantity = nextQuantity;
    } else {
      cart.items.push({ product: product._id, quantity: qty } as never);
    }

    await cart.save();
    await cart.populate('items.product');

    return NextResponse.json({ message: 'Added to cart', cart }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message: 'Server error', error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;

    const cart = await getOrCreateCart(auth.user._id as Types.ObjectId);
    cart.items.splice(0, cart.items.length);
    await cart.save();
    await cart.populate('items.product');

    return NextResponse.json({ message: 'Cart cleared', cart }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message: 'Server error', error: message }, { status: 500 });
  }
}
