import { Request, Response } from 'express';
import pool from '../config/db';

/**
 * @desc    Create or update salary components for an employee
 * @route   POST /api/salary-components/:employeeId
 * @access  Private (Admin/HR)
 */
export const upsertSalaryComponent = async (req: Request, res: Response) => {
  const { employeeId } = req.params;                 // Get employee ID from URL params
  const { basic_salary, allowances, deductions } = req.body; // Get salary data from request body

  // Basic input validation
  if (basic_salary === undefined || !allowances || !deductions) {
    return res.status(400).json({ message: 'Basic salary, allowances, and deductions are required.' });
  }

  try {
    // Upsert query: Insert a new record or update existing one based on employee_id
    const query = `
      INSERT INTO salary_components (employee_id, basic_salary, allowances, deductions)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (employee_id) DO UPDATE SET
        basic_salary = EXCLUDED.basic_salary,
        allowances = EXCLUDED.allowances,
        deductions = EXCLUDED.deductions,
        updated_at = NOW()
      RETURNING *;
    `;
    
    const result = await pool.query(query, [employeeId, basic_salary, allowances, deductions]);

    // Respond with the saved or updated salary component
    res.status(200).json({ message: 'Salary component saved successfully.', data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error occurred.' });
  }
};
