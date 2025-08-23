import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define storage location for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save files in the 'uploads' folder
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to avoid conflicts
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname); // Extract original file extension
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

// Filter to allow only specific file types (optional but recommended)
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const mimetype = allowedTypes.test(file.mimetype); // Check MIME type
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase()); // Check file extension

  if (mimetype && extname) {
    return cb(null, true); // Accept file
  }
  cb('Error: File type not allowed!'); // Reject file
};

// Configure multer upload
const upload = multer({
  storage: storage,        // Set storage settings
  fileFilter: fileFilter,  // Set file type filter
  limits: { fileSize: 1024 * 1024 * 5 } // Max file size: 5MB
});

export default upload; // Export configured multer instance
