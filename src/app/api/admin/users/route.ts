import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser, forbidden } from '@/lib/auth';
import User from '@/models/User';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;
    if (auth.user.role !== 'admin') return forbidden();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '15', 10) || 15;

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email role isVerified createdAt')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    // Attach each user's order count / total spend in one aggregate pass
    // rather than a query per user.
    const userIds = users.map((u) => u._id);
    const orderStatsAgg = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: { $cond: ['$isPaid', '$totalPrice', 0] } },
        },
      },
    ]);
    const orderStatsMap = new Map(
      orderStatsAgg.map((row) => [row._id.toString(), row])
    );

    const usersWithStats = users.map((u) => {
      const stats = orderStatsMap.get(u._id.toString());
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        isVerified: u.isVerified,
        createdAt: u.createdAt,
        orderCount: stats?.orderCount || 0,
        totalSpent: stats?.totalSpent || 0,
      };
    });

    return NextResponse.json(
      {
        users: usersWithStats,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message: 'Server error', error: message }, { status: 500 });
  }
}
