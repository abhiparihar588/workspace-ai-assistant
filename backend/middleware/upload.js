/**
 * middleware/upload.js
 * Multer configuration for handling file uploads (screenshots, docs)
 */

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer storage to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: process.env.UPLOAD_DIR || 'workspace_uploads',
    allowed_formats: ['jpeg', 'png', 'jpg', 'webp', 'gif', 'pdf', 'doc', 'docx'],
    // Optional: you can define transformation here
    // transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024,  // Default 5MB
    files: 3,
  },
});

module.exports = upload;
