import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * @desc    Generate a payslip for an employee
 * @route   POST /api/payslips/generate
 * @access  Private (Admin/HR)
 */
export const generatePayslip = async (req: Request, res: Response) => {
  const { employee_id, month, year } = req.body;

  // Validate required input
  if (!month || !year) {
    return res.status(400).json({ message: 'Pay period month and year are required.' });
  }

  try {
    // 1. Retrieve salary components for the employee
    const salaryCompRes = await pool.query(
      'SELECT * FROM salary_components WHERE employee_id = $1',
      [employee_id]
    );

    if (salaryCompRes.rows.length === 0) {
      return res.status(404).json({ message: 'Salary components for this employee are not set.' });
    }

    const salaryComp = salaryCompRes.rows[0];

    // 2. Calculate totals
    const basic_salary = parseFloat(salaryComp.basic_salary);
    const total_allowances = Object.values<number>(salaryComp.allowances).reduce((sum, val) => sum + val, 0);
    const total_deductions = Object.values<number>(salaryComp.deductions).reduce((sum, val) => sum + val, 0);
    const net_salary = basic_salary + total_allowances - total_deductions;

    // 3. Prepare detailed breakdown for the payslip
    const details = {
      basic_salary: basic_salary,
      allowances: salaryComp.allowances,
      deductions: salaryComp.deductions,
    };

    // 4. Insert the payslip into the database
    const newPayslip = await pool.query(
      `INSERT INTO payslips (employee_id, pay_period_month, pay_period_year, basic_salary, total_allowances, total_deductions, net_salary, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [employee_id, month, year, basic_salary, total_allowances, total_deductions, net_salary, details]
    );

    // Respond with the generated payslip
    res.status(201).json({ message: 'Payslip generated successfully.', data: newPayslip.rows[0] });
  } catch (error: any) {
    // Handle unique constraint error if a payslip for the period already exists
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Payslip for this employee and period already exists.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error occurred.' });
  }
};

/**
 * @desc    Get payslip history for the logged-in employee
 * @route   GET /api/payslips/my-history
 * @access  Private (Employee)
 */
export const getMyPayslipHistory = async (req: AuthRequest, res: Response) => {
  const employeeId = req.user?.id;

  try {
    const result = await pool.query(
      `SELECT id, pay_period_month, pay_period_year, net_salary, generated_at
       FROM payslips
       WHERE employee_id = $1
       ORDER BY pay_period_year DESC, pay_period_month DESC`,
      [employeeId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error occurred.' });
  }
};
