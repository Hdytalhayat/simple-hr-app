// src/routes/employee.routes.ts

import { Router } from 'express';
import { getAllEmployees } from '../controllers/employee.controller';
import { protect, adminOrHR } from '../middleware/auth.middleware';

// Create a new router instance for employee-related routes
const router = Router();

/**
 * @route   GET /employees
 * @desc    Get all employees
 * @access  Protected (only Admin or HR can access)
 * 
 * Middleware order:
 * 1. protect   → verifies JWT and attaches user info to the request
 * 2. adminOrHR → checks if the user role is Admin or HR
 * 3. getAllEmployees → controller that fetches employee data from DB
 */
router.get('/', protect, adminOrHR, getAllEmployees);

// ... other employee routes will go here (e.g., POST, PUT, DELETE)

export default router;
