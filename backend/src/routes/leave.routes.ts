// src/routes/leave.routes.ts

import { Router } from 'express';
import { requestLeave, getMyLeaveRequests, getAllLeaveRequests, updateLeaveStatus } from '../controllers/leave.controller';
import { protect, adminOrHR } from '../middleware/auth.middleware';

const router = Router();

/**
 * Routes for employees to manage their own leave requests
 */

// Employee submits a new leave request
router.post('/request', protect, requestLeave);

// Employee retrieves their own leave request history
router.get('/my-requests', protect, getMyLeaveRequests);

/**
 * Routes for Admin or HR to manage all employee leave requests
 */

// Admin/HR retrieves all leave requests (optionally filtered by status)
router.get('/all-requests', protect, adminOrHR, getAllLeaveRequests);

// Admin/HR updates the status of a leave request (approve or reject)
router.patch('/:requestId/status', protect, adminOrHR, updateLeaveStatus);

export default router;
