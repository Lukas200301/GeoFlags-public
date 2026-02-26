import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

/**
 * Avatar Upload Middleware
 *
 * SECURITY MEASURES:
 * - Only accepts JPEG/JPG files (prevents executable uploads)
 * - File size limited to 2MB
 * - Files stored outside webroot with unique hashed names
 * - MIME type validation (prevents extension spoofing)
 * - Removes original filename metadata
 * - Magic byte verification ensures files are actual JPEG images
 */

// Create the uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../cache/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, _file, cb) => {
    // SECURITY: Generate cryptographically secure random filename
    // This prevents:
    // 1. Path traversal attacks
    // 2. Filename collisions
    // 3. Revealing upload timestamp or user info
    const randomName = crypto.randomBytes(16).toString('hex');
    cb(null, randomName + '.jpg'); // Force .jpg extension
  }
});

// Create the multer instance
const upload = multer({
  storage: storage,
  fileFilter: (_req, file, cb) => {
    // SECURITY: Strict file type validation
    // Check both MIME type and extension
    const allowedMimeTypes = ['image/jpeg', 'image/jpg'];
    const mimetype = allowedMimeTypes.includes(file.mimetype);
    const extname = /\.(jpeg|jpg)$/i.test(path.extname(file.originalname).toLowerCase());

    if (!mimetype) {
      return cb(new Error('Invalid file type. Only JPEG images are allowed (MIME type check failed).'));
    }

    if (!extname) {
      return cb(new Error('Invalid file extension. Only .jpg and .jpeg files are allowed.'));
    }

    // Both checks passed
    cb(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // SECURITY: 2MB file size limit
    files: 1, // SECURITY: Only allow one file per request
    fields: 0, // SECURITY: Don't allow additional fields
  }
});

// SECURITY: Add additional validation middleware
export const validateAvatarUpload = (req: any, res: any, next: any) => {
  // Ensure file was actually uploaded
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Additional security: Verify file exists and is readable
  const filePath = req.file.path;
  if (!fs.existsSync(filePath)) {
    return res.status(500).json({ message: 'File upload failed' });
  }

  // SECURITY: Verify file is actually a valid JPEG by checking magic bytes
  const buffer = fs.readFileSync(filePath);
  const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;

  if (!isJPEG) {
    // Delete the invalid file
    fs.unlinkSync(filePath);
    return res.status(400).json({ message: 'Invalid file format. File is not a valid JPEG image.' });
  }

  next();
};

export default upload;
