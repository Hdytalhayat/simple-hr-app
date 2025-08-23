// src/routes/attendance.routes.ts

import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  getAttendanceHistory,
  getAttendanceReport,
} from '../controllers/attendance.controller';
import { protect, adminOrHR } from '../middleware/auth.middleware';

// Create a new router instance for attendance-related routes
const router = Router();

/**
 * ===============================
 * Routes for logged-in employees
 * ===============================
 */

// @route   POST /api/attendance/check-in
// @desc    Employee performs check-in
// @access  Private (requires valid JWT)
router.post('/check-in', protect, checkIn);

// @route   PATCH /api/attendance/check-out
// @desc    Employee performs check-out
// @access  Private (requires valid JWT)
router.patch('/check-out', protect, checkOut);

// @route   GET /api/attendance/today
// @desc    Get today’s attendance record for logged-in employee
// @access  Private (requires valid JWT)
router.get('/today', protect, getTodayAttendance);

// @route   GET /api/attendance/history
// @desc    Get last 30 attendance records for logged-in employee
// @access  Private (requires valid JWT)
router.get('/history', protect, getAttendanceHistory);

/**
 * ===============================
 * Routes for Admin/HR only
 * ===============================
 */

// @route   GET /api/attendance/report
// @desc    Get attendance report for all employees (optionally filter by date)
// @access  Private (Admin/HR only)
router.get('/report', protect, adminOrHR, getAttendanceReport);

export default router;
