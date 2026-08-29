import cloudinary from '@/lib/cloudinary';
import streamifier from 'streamifier';
import type { UploadApiResponse } from 'cloudinary';

export const uploadImage = (
  buffer: Buffer,
  folder = 'mlbench-ecommerce'
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result as UploadApiResponse);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const deleteImage = async (publicId?: string | null) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};
