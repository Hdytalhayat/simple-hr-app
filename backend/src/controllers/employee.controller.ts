// src/controllers/employee.controller.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { Employee } from '../interfaces/employee.interface';

// Controller function to fetch all employees from the database
export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    // Query the database to select employee details
    // Excluding sensitive fields such as password_hash
    const result = await pool.query(
      'SELECT id, full_name, email, job_title, department, employment_status, role FROM employees ORDER BY created_at DESC'
    );

    // Return the employee data as JSON with HTTP status 200 (OK)
    res.status(200).json(result.rows);
  } catch (error) {
    // If something goes wrong, return an error with status 500 (Internal Server Error)
    res.status(500).json({ message: 'Server Error', error });
  }
};

// ... other controller functions (create, update, delete) will go here
