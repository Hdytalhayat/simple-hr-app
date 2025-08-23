// src/controllers/leave.controller.ts

import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * @desc    Employee submits a leave request
 * @route   POST /api/leave/request
 * @access  Private
 */
export const requestLeave = async (req: AuthRequest, res: Response) => {
  const employeeId = req.user?.id;
  const { leave_type, start_date, end_date, reason } = req.body;

  // Input validation
  if (!leave_type || !start_date || !end_date || !reason) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const newRequest = await pool.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [employeeId, leave_type, start_date, end_date, reason]
    );

    res.status(201).json({
      message: 'Leave request submitted successfully.',
      data: newRequest.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error occurred.' });
  }
};

/**
 * @desc    Get all leave requests submitted by the logged-in employee
 * @route   GET /api/leave/my-requests
 * @access  Private
 */
export const getMyLeaveRequests = async (req: AuthRequest, res: Response) => {
  const employeeId = req.user?.id;

  try {
    const result = await pool.query(
      `SELECT * FROM leave_requests 
       WHERE employee_id = $1 
       ORDER BY created_at DESC`,
      [employeeId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error occurred.' });
  }
};

/**
 * @desc    (Admin/HR) Get all leave requests from employees
 * @route   GET /api/leave/all-requests?status=Pending
 * @access  Private (Admin/HR only)
 */
export const getAllLeaveRequests = async (req: AuthRequest, res: Response) => {
  const { status } = req.query;

  try {
    let query = `
      SELECT lr.id, lr.start_date, lr.end_date, lr.leave_type, lr.reason, lr.status, e.full_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
    `;
    const params: any[] = [];

    // Apply status filter if provided
    if (status) {
      query += ' WHERE lr.status = $1';
      params.push(status);
    }

    // Order by Pending requests first, then by creation date
    query += ` ORDER BY 
      CASE lr.status WHEN 'Pending' THEN 1 ELSE 2 END, 
      lr.created_at DESC`;

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error occurred.' });
  }
};

/**
 * @desc    (Admin/HR) Approve or reject a leave request
 * @route   PATCH /api/leave/:requestId/status
 * @access  Private (Admin/HR only)
 */
export const updateLeaveStatus = async (req: AuthRequest, res: Response) => {
  const { requestId } = req.params;
  const { status } = req.body; // Expected: 'Approved' or 'Rejected'
  const approverId = req.user?.id;

  if (!status || !['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    const result = await pool.query(
      `UPDATE leave_requests 
       SET status = $1, approved_by = $2, updated_at = NOW() 
       WHERE id = $3 RETURNING *`,
      [status, approverId, requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    // TODO: Add email notification logic here in the next phase.

    res.status(200).json({
      message: `Leave request has been ${status.toLowerCase()}.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error occurred.' });
  }
};
