import { Router } from 'express';
import upload from '../config/multer.config';
import { uploadDocument, getDocumentsByEmployee } from '../controllers/document.controller';
import { protect, adminOrHR } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication & role-based middleware for all routes in this router
// Only authenticated users with Admin or HR role can access
router.use(protect, adminOrHR);

// Route for uploading a document
// 'document' is the field name from the form input
// Multer middleware handles file upload
router.post('/upload/:employeeId', upload.single('document'), uploadDocument);

// Route for fetching all documents for a specific employee
router.get('/:employeeId', getDocumentsByEmployee);

export default router; // Export the router to be used in the main app
