import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import slugify from '@/utils/slugify';
import { uploadImage, deleteImage } from '@/utils/cloudinary';
import { getAuthUser, forbidden } from '@/lib/auth';
import { parseSingleImage } from '@/utils/upload';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const { slug } = await params;

    const category = await Category.findOne({ slug });
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ category }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();

    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;
    if (auth.user.role !== 'admin') return forbidden();

    const { slug: id } = await params; // this route's dynamic segment holds an _id here, not a slug
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string | null;
    const description = formData.get('description');
    const isActive = formData.get('isActive');

    if (name) {
      category.name = name;
      category.slug = slugify(name);
    }
    if (description !== null) category.description = description as string;
    if (isActive !== null) category.isActive = isActive === 'true';

    const file = await parseSingleImage(formData, 'image');
    if (file) {
      if (category.image && category.image.publicId) {
        await deleteImage(category.image.publicId);
      }
      const result = await uploadImage(file.buffer, 'mlbench-ecommerce/categories');
      category.image = { url: result.secure_url, publicId: result.public_id };
    }

    await category.save();
    return NextResponse.json({ message: 'Category updated successfully', category }, { status: 200 });
  } catch (error: any) {
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
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    if (category.image && category.image.publicId) {
      await deleteImage(category.image.publicId);
    }

    await category.deleteOne();
    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
