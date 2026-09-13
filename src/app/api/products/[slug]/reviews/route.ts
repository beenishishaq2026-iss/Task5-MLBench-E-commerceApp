import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Review from '@/models/Review';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/auth';
import { recalculateProductRating } from '@/utils/recalculateProductRating';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const { slug } = await params;

    const product = await Product.findOne({ slug });
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const total = await Review.countDocuments({ product: product._id });
    const reviews = await Review.find({ product: product._id })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json(
      {
        count: reviews.length,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        ratingsAverage: product.ratingsAverage,
        numReviews: product.numReviews,
        reviews,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message: 'Server error', error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;
    if (auth.user.role === 'admin') {
      return NextResponse.json({ message: 'Admin accounts cannot post reviews' }, { status: 403 });
    }

    const { slug } = await params;
    const product = await Product.findOne({ slug });
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const { rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    if (!comment?.trim()) {
      return NextResponse.json({ message: 'Comment is required' }, { status: 400 });
    }

    const existing = await Review.findOne({ product: product._id, user: auth.user._id });
    if (existing) {
      return NextResponse.json({ message: 'You have already reviewed this product' }, { status: 400 });
    }

    const hasDelivered = await Order.exists({
      user: auth.user._id,
      status: 'delivered',
      'items.product': product._id,
    });

    const review = await Review.create({
      product: product._id,
      user: auth.user._id,
      rating,
      comment: comment.trim(),
      verifiedPurchase: !!hasDelivered,
    });

    await recalculateProductRating(product._id);
    const populated = await review.populate('user', 'name');

    return NextResponse.json({ message: 'Review added', review: populated }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message: 'Server error', error: message }, { status: 500 });
  }
}