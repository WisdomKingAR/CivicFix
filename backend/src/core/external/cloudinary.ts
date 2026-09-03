// src/core/external/cloudinary.ts
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env } from '../config/env';

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Uploads an in-memory image buffer directly to Cloudinary using streaming.
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder = 'civicfix/complaints'
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1200, crop: 'limit' },
        ],
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload to Cloudinary failed with empty result.'));
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

export { cloudinary };
