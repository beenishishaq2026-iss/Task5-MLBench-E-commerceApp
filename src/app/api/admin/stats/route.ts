import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser, forbidden } from '@/lib/auth';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';

const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
  }
  return days;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;
    if (auth.user.role !== 'admin') return forbidden();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueAgg,
      revenueByDayAgg,
      statusAgg,
      recentOrders,
      topProductsAgg,
      salesByCategoryAgg,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),

      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),

      Order.aggregate([
        { $match: { isPaid: true, paidAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
            total: { $sum: '$totalPrice' },
          },
        },
      ]),

      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),

      Order.find({})
        .sort('-createdAt')
        .limit(6)
        .populate('user', 'name email')
        .select('items totalPrice status isPaid createdAt user'),

      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$items.name' },
            image: { $first: '$items.image' },
            sold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),

      Order.aggregate([
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productDoc',
          },
        },
        { $unwind: { path: '$productDoc', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'categories',
            localField: 'productDoc.category',
            foreignField: '_id',
            as: 'categoryDoc',
          },
        },
        { $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $ifNull: ['$categoryDoc.name', 'Uncategorized'] },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 6 },
      ]),
    ]);

    // Fill in the last 7 days so the chart never has gaps, even on days
    // with zero paid orders.
    const revenueByDayMap = new Map<string, number>(
      revenueByDayAgg.map((r: { _id: string; total: number }) => [r._id, r.total])
    );
    const revenueByDay = lastNDays(7).map((date) => ({
      date,
      total: revenueByDayMap.get(date) || 0,
    }));

    const orderStatusCounts = ORDER_STATUSES.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<(typeof ORDER_STATUSES)[number], number>
    );
    for (const row of statusAgg as { _id: string; count: number }[]) {
      if (row._id && row._id in orderStatusCounts) {
        orderStatusCounts[row._id as (typeof ORDER_STATUSES)[number]] = row.count;
      }
    }

    return NextResponse.json(
      {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenueAgg[0]?.total || 0,
        revenueByDay,
        orderStatusCounts,
        recentOrders,
        topProducts: topProductsAgg,
        salesByCategory: salesByCategoryAgg,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message: 'Server error', error: message }, { status: 500 });
  }
}
