import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { deleteImage } from '@/utils/cloudinary';
import { getAuthUser, forbidden } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; publicId: string }> }
) {
  try {
    await connectDB();

    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;
    if (auth.user.role !== 'admin') return forbidden();

    const { slug: id, publicId } = await params;
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const decodedPublicId = decodeURIComponent(publicId);

    const imageExists = product.images.some((img) => img.publicId === decodedPublicId);
    if (!imageExists) {
      return NextResponse.json({ message: 'Image not found on this product' }, { status: 404 });
    }

    await deleteImage(decodedPublicId);

    product.images = product.images.filter((img) => img.publicId !== decodedPublicId) as any;
    await product.save();

    return NextResponse.json({ message: 'Image removed successfully', product }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE PRODUCT IMAGE ERROR:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
