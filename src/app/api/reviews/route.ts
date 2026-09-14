import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import { getAuthUser, forbidden } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;
    if (auth.user.role !== 'admin') {
      return forbidden();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const replied = searchParams.get('replied'); // 'true' | 'false' | null

    const filter: Record<string, unknown> = {};
    if (replied === 'true') filter.adminReply = { $exists: true, $ne: null };
    if (replied === 'false') filter.adminReply = { $in: [null, undefined] };

    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json(
      { reviews, total, page, totalPages: Math.ceil(total / limit) || 1 },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message: 'Server error', error: message }, { status: 500 });
  }
}