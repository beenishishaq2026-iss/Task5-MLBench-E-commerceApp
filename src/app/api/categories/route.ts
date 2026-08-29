import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import slugify from '@/utils/slugify';
import { uploadImage } from '@/utils/cloudinary';
import { getAuthUser, forbidden } from '@/lib/auth';
import { parseSingleImage } from '@/utils/upload';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

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

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;
    if (auth.user.role !== 'admin') return forbidden();

    const formData = await request.formData();
    const name = formData.get('name') as string | null;
    const description = formData.get('description') as string | null;

    if (!name) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      return NextResponse.json({ message: 'Category already exists with this name' }, { status: 400 });
    }

    const categoryData: Record<string, any> = {
      name,
      description,
      slug: slugify(name),
    };

    const file = await parseSingleImage(formData, 'image');
    if (file) {
      const result = await uploadImage(file.buffer, 'mlbench-ecommerce/categories');
      categoryData.image = { url: result.secure_url, publicId: result.public_id };
    }

    const category = await Category.create(categoryData);
    return NextResponse.json({ message: 'Category created successfully', category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
