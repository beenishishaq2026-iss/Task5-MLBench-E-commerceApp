import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser, forbidden } from '@/lib/auth';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;
    if (auth.user.role !== 'admin') return forbidden();

    const [totalUsers, totalProducts, totalOrders, revenueAgg] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    return NextResponse.json(
      {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenueAgg[0]?.total || 0,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('ADMIN STATS ERROR:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}