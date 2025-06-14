import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
dotenv.config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
// Storage cho ảnh
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'images',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'],
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  },
});
// Multer config cho ảnh
export const uploadImage = multer({
  storage: imageStorage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // Giới hạn 10MB cho ảnh
    files: 5 // Tối đa 5 files
  },
  fileFilter: (req, file, cb) => {
    // Kiểm tra file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
  }
});

// Storage cho video
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'],
  },
});
// Multer config cho video (giữ nguyên)
export const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Giới hạn 100MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file video!'), false);
    }
  }
});

// Export cloudinary instance để sử dụng trong controller
export { cloudinary };
// Utility functions cho ảnh
export const imageUtils = {
  // Upload ảnh từ URL hoặc base64
  uploadFromUrl: async (imageUrl, options = {}) => {
    const defaultOptions = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      folder: 'images',
      ...options
    };
    try {
      const result = await cloudinary.uploader.upload(imageUrl, defaultOptions);
      return result;
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  },
  // Lấy thông tin chi tiết của ảnh
  getAssetInfo: async (publicId, options = {}) => {
    const defaultOptions = {
      colors: true,
      image_metadata: true,
      ...options
    };
    try {
      const result = await cloudinary.api.resource(publicId, defaultOptions);
      return result;
    } catch (error) {
      throw new Error(`Get asset info failed: ${error.message}`);
    }
  },
  // Tạo URL với transformation
  createTransformedUrl: (publicId, transformations = []) => {
    return cloudinary.url(publicId, {
      transformation: transformations,
      secure: true
    });
  },
  // Xóa ảnh
  deleteImage: async (publicId) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }
};