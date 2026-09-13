import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import { getAuthUser, forbidden } from '@/lib/auth';
import { recalculateProductRating } from '@/utils/recalculateProductRating';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }
    if (review.user.toString() !== auth.user._id!.toString()) {
      return forbidden();
    }

    const { rating, comment } = await request.json();
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json({ message: 'Rating must be between 1 and 5' }, { status: 400 });
      }
      review.rating = rating;
    }
    if (comment !== undefined) {
      if (!comment.trim()) {
        return NextResponse.json({ message: 'Comment is required' }, { status: 400 });
      }
      review.comment = comment.trim();
    }

    await review.save();
    await recalculateProductRating(review.product);

    return NextResponse.json({ message: 'Review updated', review }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message: 'Server error', error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }
    if (review.user.toString() !== auth.user._id!.toString() && auth.user.role !== 'admin') {
      return forbidden();
    }

    const productId = review.product;
    await review.deleteOne();
    await recalculateProductRating(productId);

    return NextResponse.json({ message: 'Review deleted' }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message: 'Server error', error: message }, { status: 500 });
  }
}