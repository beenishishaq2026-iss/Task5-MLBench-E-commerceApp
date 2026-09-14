import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { getAuthUser, forbidden } from '@/lib/auth';
import slugify from '@/utils/slugify';
import { uploadImage } from '@/utils/cloudinary';
import { parseSingleImage } from '@/utils/upload';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    let filter: Record<string, unknown> = { isActive: true };

    if (searchParams.get('all') === 'true') {
      const auth = await getAuthUser(request);
      if (!('error' in auth) && auth.user.role === 'admin') {
        filter = {}; 
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ message: "Server error", error: message }, { status: 500 });
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
    const description = (formData.get('description') as string | null) || '';
    const isActive = formData.get('isActive');

    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json({ message: 'A category with this name already exists' }, { status: 409 });
    }

    let image: { url: string | null; publicId: string | null } = { url: null, publicId: null };
    const file = await parseSingleImage(formData, 'image');
    if (file) {
      const result = await uploadImage(file.buffer, 'mlbench-ecommerce/categories');
      image = { url: result.secure_url, publicId: result.public_id };
    }

    const category = await Category.create({
      name: name.trim(),
      slug: slugify(name),
      description,
      isActive: isActive !== null ? isActive === 'true' : true,
      image,
    });

    return NextResponse.json(
      { message: 'Category created successfully', category },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message: 'Server error', error: message }, { status: 500 });
  }
}