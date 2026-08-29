import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectDB();

    const brands = await Product.distinct('brand', { isActive: true, brand: { $ne: '' } });

    const priceStats = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } },
    ]);

    return NextResponse.json(
      {
        brands,
        minPrice: priceStats[0]?.minPrice || 0,
        maxPrice: priceStats[0]?.maxPrice || 0,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET PRODUCT FILTERS ERROR:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
