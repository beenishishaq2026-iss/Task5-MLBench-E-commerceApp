import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import slugify from '@/utils/slugify';
import { uploadImage, deleteImage } from '@/utils/cloudinary';
import { getAuthUser, forbidden } from '@/lib/auth';
import { parseMultipleImages } from '@/utils/upload';

// Same pattern as categories: GET looks the record up by `slug`, PUT/DELETE
// look it up by Mongo `_id` - matching the old /api/products/:slug (GET)
// vs /api/products/:id (PUT/DELETE) Express routes.

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const { slug } = await params;

    const product = await Product.findOne({ slug }).populate('category', 'name slug');
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ product }, { status: 200 });
  } catch (error: any) {
    console.error('GET PRODUCT BY SLUG ERROR:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();

    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;
    if (auth.user.role !== 'admin') return forbidden();

    const { slug: id } = await params;
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string | null;
    const description = formData.get('description');
    const price = formData.get('price');
    const discountPrice = formData.get('discountPrice');
    const category = formData.get('category') as string | null;
    const brand = formData.get('brand');
    const stock = formData.get('stock');
    const sku = formData.get('sku');
    const isFeatured = formData.get('isFeatured');
    const isActive = formData.get('isActive');

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return NextResponse.json({ message: 'Invalid category' }, { status: 400 });
      }
      product.category = category as any;
    }

    if (name?.trim()) {
      product.name = name.trim();
      product.slug = slugify(name);
    }

    if (description !== null) product.description = description as string;
    if (price !== null && price !== '') product.price = Number(price);

    if (discountPrice !== null) {
      product.discountPrice = discountPrice === '' ? null : Number(discountPrice as string);
    }

    if (brand !== null) product.brand = brand as string;
    if (stock !== null && stock !== '') product.stock = Number(stock);
    if (sku !== null) product.sku = sku as string;

    if (isFeatured !== null) {
      product.isFeatured = isFeatured === 'true';
    }
    if (isActive !== null) {
      product.isActive = isActive === 'true';
    }

    const files = await parseMultipleImages(formData, 'images', 5);
    if (files.length > 0) {
      const uploads = await Promise.all(
        files.map((file) => uploadImage(file.buffer, 'mlbench-ecommerce/products'))
      );
      const newImages = uploads.map((result) => ({ url: result.secure_url, publicId: result.public_id }));
      product.images.push(...newImages);
    }

    await product.save();
    return NextResponse.json({ message: 'Product updated successfully', product }, { status: 200 });
  } catch (error: any) {
    console.error('UPDATE PRODUCT ERROR:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();

    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;
    if (auth.user.role !== 'admin') return forbidden();

    const { slug: id } = await params;
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    if (product.images && product.images.length > 0) {
      await Promise.all(product.images.map((img) => deleteImage(img.publicId)));
    }

    await product.deleteOne();
    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE PRODUCT ERROR:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
