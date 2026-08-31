import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import slugify from '@/utils/slugify';
import { uploadImage } from '@/utils/cloudinary';
import { getAuthUser, forbidden } from '@/lib/auth';
import { parseSingleImage } from '@/utils/upload';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    let filter: Record<string, any> = { isActive: true };

    if (searchParams.get('all') === 'true') {
      const auth = await getAuthUser(request);
      if (!('error' in auth) && auth.user.role === 'admin') {
        filter = {}; // admins can see inactive categories too
      }
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    const counts = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', productCount: { $sum: 1 } } },
    ]);
    const countMap: Record<string, number> = counts.reduce((acc, c) => {
      acc[c._id.toString()] = c.productCount;
      return acc;
    }, {} as Record<string, number>);

    const categoriesWithCounts = categories.map((cat) => ({
      ...cat.toObject(),
      productCount: countMap[cat._id.toString()] || 0,
    }));

    return NextResponse.json(
      { count: categoriesWithCounts.length, categories: categoriesWithCounts },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}