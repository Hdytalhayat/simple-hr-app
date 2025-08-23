// src/controllers/attendance.controller.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
/**
 * @desc    Employee performs Check-in
 * @route   POST /api/attendance/check-in
 * @access  Private
 */
export const checkIn = async (req: AuthRequest, res: Response) => {
  const employeeId = req.user?.id;

  try {
    // 1. Check if the employee already checked in today
    const todayAttendance = await pool.query(
      'SELECT id FROM attendance WHERE employee_id = $1 AND attendance_date = CURRENT_DATE',
      [employeeId]
    );

    if (todayAttendance.rows.length > 0) {
      return res.status(400).json({ message: 'You have already checked in today.' });
    }

    // 2. If not yet checked in, create a new attendance record
    const newAttendance = await pool.query(
      'INSERT INTO attendance (employee_id, check_in_time, status) VALUES ($1, NOW(), $2) RETURNING *',
      [employeeId, 'Hadir'] // "Hadir" = Present
    );

    res.status(201).json({ message: 'Check-in successful.', data: newAttendance.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during check-in.' });
  }
};

/**
 * @desc    Employee performs Check-out
 * @route   PATCH /api/attendance/check-out
 * @access  Private
 */
export const checkOut = async (req: AuthRequest, res: Response) => {
  const employeeId = req.user?.id;

  try {
    // 1. Find today's attendance record for the employee
    const attendanceRecord = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND attendance_date = CURRENT_DATE',
      [employeeId]
    );

    if (attendanceRecord.rows.length === 0) {
      return res.status(404).json({ message: 'You have not checked in today.' });
    }

    if (attendanceRecord.rows[0].check_out_time !== null) {
      return res.status(400).json({ message: 'You have already checked out today.' });
    }

    // 2. Update the record with check-out time
    const updatedAttendance = await pool.query(
      'UPDATE attendance SET check_out_time = NOW() WHERE id = $1 RETURNING *',
      [attendanceRecord.rows[0].id]
    );

    res.status(200).json({ message: 'Check-out successful.', data: updatedAttendance.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during check-out.' });
  }
};

/**
 * @desc    Get today's attendance status for the logged-in employee
 * @route   GET /api/attendance/today
 * @access  Private
 */
export const getTodayAttendance = async (req: AuthRequest, res: Response) => {
  const employeeId = req.user?.id;

  try {
    const result = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND attendance_date = CURRENT_DATE',
      [employeeId]
    );

    // If no record found, return null
    res.status(200).json(result.rows[0] || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching today\'s attendance.' });
  }
};

/**
 * @desc    Get attendance history for the logged-in employee
 * @route   GET /api/attendance/history
 * @access  Private
 */
export const getAttendanceHistory = async (req: AuthRequest, res: Response) => {
  const employeeId = req.user?.id;

  try {
    // Fetch last 30 records (most recent first)
    const result = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = $1 ORDER BY attendance_date DESC LIMIT 30',
      [employeeId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching attendance history.' });
  }
};

/**
 * @desc    (Admin/HR) Get attendance report for all employees
 * @route   GET /api/attendance/report
 * @access  Private (Admin/HR only)
 */
export const getAttendanceReport = async (req: AuthRequest, res: Response) => {
  // Optional filter by date (e.g., /report?date=2025-08-23)
  const { date } = req.query;

  try {
    let query = `
      SELECT a.id, a.attendance_date, a.check_in_time, a.check_out_time, a.status, 
             e.full_name, e.department
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
    `;
    const params: any[] = [];

    if (date) {
      query += ' WHERE a.attendance_date = $1';
      params.push(date);
    }

    query += ' ORDER BY a.attendance_date DESC, e.full_name ASC';

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while generating attendance report.' });
  }
};

// @desc    (Admin/HR) Export attendance report to CSV
// @route   GET /api/attendance/report/export
// @access  Private (Admin/HR)
export const exportAttendanceReport = async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query; // Optional filter by date range

    try {
        // Base SQL query to join attendance with employee info
        let query = `
            SELECT a.attendance_date, e.full_name, e.department, a.check_in_time, a.check_out_time, a.status
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
        `;
        const params = [];

        // Add date range filter if both startDate and endDate are provided
        if (startDate && endDate) {
            params.push(startDate, endDate);
            query += ' WHERE a.attendance_date BETWEEN $1 AND $2';
        }

        // Order results by date descending and employee name ascending
        query += ' ORDER BY a.attendance_date DESC, e.full_name ASC';

        const result = await pool.query(query, params);

        // Set response headers for CSV download
        const filename = `attendance_report_${Date.now()}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Configure CSV Writer to write directly to the response stream
        const csvWriter = createCsvWriter({
            path: res as any, // Stream directly to client
            header: [
                { id: 'attendance_date', title: 'DATE' },
                { id: 'full_name', title: 'EMPLOYEE NAME' },
                { id: 'department', title: 'DEPARTMENT' },
                { id: 'check_in_time', title: 'CHECK-IN' },
                { id: 'check_out_time', title: 'CHECK-OUT' },
                { id: 'status', title: 'STATUS' },
            ]
        });

        // Format data for CSV
        const records = result.rows.map(row => ({
            ...row,
            attendance_date: new Date(row.attendance_date).toLocaleDateString('id-ID'),
            check_in_time: row.check_in_time ? new Date(row.check_in_time).toLocaleTimeString('id-ID') : '-',
            check_out_time: row.check_out_time ? new Date(row.check_out_time).toLocaleTimeString('id-ID') : '-',
        }));

        // Write records to CSV
        await csvWriter.writeRecords(records);

        // End response stream
        res.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to export attendance report.' });
    }
};

