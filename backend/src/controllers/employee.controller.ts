// src/controllers/employee.controller.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcryptjs';

/**
 * @desc    Create a new employee (only Admin/HR can perform this)
 * @route   POST /api/employees
 * @access  Private (Admin/HR)
 */
export const createEmployee = async (req: Request, res: Response) => {
  const { full_name, email, password, job_title, department, role, employment_status } = req.body;

  // Validate required fields
  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ message: 'Full name, email, password, and role are required.' });
  }

  try {
    // Check if email is already registered
    const userExists = await pool.query('SELECT id FROM employees WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert new employee into the database
    const newEmployee = await pool.query(
      `INSERT INTO employees (full_name, email, password_hash, job_title, department, role, employment_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, full_name, email, role`,
      [full_name, email, password_hash, job_title, department, role, employment_status || 'Active']
    );

    res.status(201).json({ message: 'Employee successfully created.', data: newEmployee.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * @desc    Get all employees
 * @route   GET /api/employees
 * @access  Private (Admin/HR)
 */
export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    // Query all employees sorted by name
    const result = await pool.query(
      'SELECT id, full_name, email, job_title, department, role, employment_status FROM employees ORDER BY full_name ASC'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * @desc    Get details of a single employee by ID
 * @route   GET /api/employees/:id
 * @access  Private (Admin/HR)
 */
export const getEmployeeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, job_title, department, role, employment_status FROM employees WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * @desc    Update employee details
 * @route   PUT /api/employees/:id
 * @access  Private (Admin/HR)
 */
export const updateEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { full_name, job_title, department, role, employment_status } = req.body;

  // Validate required fields
  if (!full_name || !role) {
    return res.status(400).json({ message: 'Full name and role are required.' });
  }

  try {
    // Update employee details
    const result = await pool.query(
      `UPDATE employees 
       SET full_name = $1, job_title = $2, department = $3, role = $4, employment_status = $5, updated_at = NOW()
       WHERE id = $6 RETURNING id, full_name, email, role`,
      [full_name, job_title, department, role, employment_status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    res.status(200).json({ message: 'Employee successfully updated.', data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * @desc    Delete an employee
 * @route   DELETE /api/employees/:id
 * @access  Private (Admin/HR)
 */
export const deleteEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Delete employee by ID
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    res.status(200).json({ message: 'Employee successfully deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
