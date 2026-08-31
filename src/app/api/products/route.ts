import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import slugify from '@/utils/slugify';
import { uploadImage } from '@/utils/cloudinary';
import APIFeatures from '@/utils/apiFeatures';
import { getAuthUser, forbidden } from '@/lib/auth';
import { parseMultipleImages } from '@/utils/upload';
import type { IProduct } from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      query[key] = value;
    });

    let includeInactive = false;
    if (query.all === 'true') {
      const auth = await getAuthUser(request);
      includeInactive = !('error' in auth) && auth.user.role === 'admin';
    }

    const baseQuery = includeInactive
      ? Product.find({}).populate('category', 'name slug')
      : Product.find({ isActive: true }).populate('category', 'name slug');

    const features = new APIFeatures<IProduct>(baseQuery, query).search().filter().sort().paginate();

    const products = await features.query;

    const totalFilters: Record<string, any> = includeInactive ? {} : { isActive: true };

    if (query.category) {
      const categoryIds = query.category.split(',').map((id) => id.trim()).filter(Boolean);
      totalFilters.category = categoryIds.length > 1 ? { $in: categoryIds } : categoryIds[0];
    }

    if (query.brand) {
      totalFilters.brand = query.brand;
    }

    if (query.minPrice || query.maxPrice) {
      totalFilters.price = {};
      if (query.minPrice) totalFilters.price.$gte = Number(query.minPrice);
      if (query.maxPrice) totalFilters.price.$lte = Number(query.maxPrice);
    }

    if (query.inStock === 'true') {
      totalFilters.stock = { $gt: 0 };
    }

    if (query.isFeatured === 'true') {
      totalFilters.isFeatured = true;
    }

    if (query.search) {
      totalFilters.$text = { $search: query.search };
    }

    const total = await Product.countDocuments(totalFilters);

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 12;

    return NextResponse.json(
      {
        count: products.length,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        products,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET PRODUCTS ERROR:', error);
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
    const price = formData.get('price') as string | null;
    const discountPrice = formData.get('discountPrice') as string | null;
    const category = formData.get('category') as string | null;
    const brand = formData.get('brand') as string | null;
    const stock = formData.get('stock') as string | null;
    const sku = formData.get('sku') as string | null;
    const isFeatured = formData.get('isFeatured');

    if (!name?.trim() || !description?.trim() || price === null || price === '' || !category) {
      return NextResponse.json(
        {
          message: 'Name, description, price, and category are required',
          received: { name, description, price, category },
        },
        { status: 400 }
      );
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return NextResponse.json({ message: 'Invalid category' }, { status: 400 });
    }

    let images: { url: string; publicId: string }[] = [];
    const files = await parseMultipleImages(formData, 'images', 5);
    if (files.length > 0) {
      const uploads = await Promise.all(
        files.map((file) => uploadImage(file.buffer, 'mlbench-ecommerce/products'))
      );
      images = uploads.map((result) => ({ url: result.secure_url, publicId: result.public_id }));
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      discountPrice: discountPrice !== null && discountPrice !== '' ? Number(discountPrice) : null,
      category,
      brand: brand?.trim() || '',
      stock: stock !== null && stock !== '' ? Number(stock) : 0,
      sku: sku?.trim() || undefined,
      images,
      isFeatured: isFeatured === 'true',
      slug: slugify(name),
      createdBy: auth.user._id,
    });

    return NextResponse.json({ message: 'Product created successfully', product }, { status: 201 });
  } catch (error: any) {
    console.error('CREATE PRODUCT ERROR:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}