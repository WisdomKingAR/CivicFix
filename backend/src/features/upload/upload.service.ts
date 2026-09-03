// src/features/upload/upload.service.ts
import { uploadBufferToCloudinary } from '../../core/external/cloudinary';

export class UploadService {
  public static async uploadImage(buffer: Buffer, folder = 'civicfix/complaints') {
    const result = await uploadBufferToCloudinary(buffer, folder);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    };
  }
}
