import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import PDFDocument from 'pdfkit';
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

// @desc    Download payslip as a PDF
// @route   GET /api/payslips/:id/download
// @access  Private
export const downloadPayslipPdf = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;           // Payslip ID from URL
  const employeeId = req.user?.id;     // Logged-in employee ID
  const userRole = req.user?.role;     // Logged-in user role (Admin, HR, Employee)

  try {
    // 1. Fetch payslip data joined with employee info
    const query = `
      SELECT p.*, e.full_name, e.job_title, e.department
      FROM payslips p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.id = $1
    `;
    const payslipRes = await pool.query(query, [id]);

    if (payslipRes.rows.length === 0) {
      return res.status(404).json({ message: 'Payslip not found.' });
    }
    const payslip = payslipRes.rows[0];

    // 2. Authorization: Employee can only download their own payslip unless Admin/HR
    if (userRole !== 'Admin' && userRole !== 'HR' && payslip.employee_id !== employeeId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // 3. Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A5' });

    // 4. Set response headers for file download
    const filename = `payslip-${payslip.full_name}-${payslip.pay_period_month}-${payslip.pay_period_year}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // 5. Pipe PDF stream to response
    doc.pipe(res);

    // 6. Fill PDF content
    // Header
    doc.fontSize(16).font('Helvetica-Bold').text('EMPLOYEE PAYSLIP', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('PT. Startup Keren Sekali', { align: 'center' });
    doc.moveDown(2);

    // Employee Details
    doc.fontSize(10).font('Helvetica-Bold').text(`Name: ${payslip.full_name}`);
    doc.font('Helvetica').text(`Position: ${payslip.job_title || '-'}`);
    doc.text(`Period: ${payslip.pay_period_month}/${payslip.pay_period_year}`);
    doc.moveDown();

    // Earnings Details
    doc.font('Helvetica-Bold').text('Earnings');
    doc.font('Helvetica').text(`Basic Salary: Rp ${new Intl.NumberFormat('id-ID').format(payslip.basic_salary)}`);
    for (const [key, value] of Object.entries(payslip.details.allowances)) {
        doc.text(`${key}: Rp ${new Intl.NumberFormat('id-ID').format(value as number)}`);
    }
    doc.font('Helvetica-Bold').text(`Total Earnings: Rp ${new Intl.NumberFormat('id-ID').format(parseFloat(payslip.basic_salary) + parseFloat(payslip.total_allowances))}`);
    doc.moveDown();
    
    // Deductions
    doc.font('Helvetica-Bold').text('Deductions');
    for (const [key, value] of Object.entries(payslip.details.deductions)) {
        doc.text(`${key}: Rp ${new Intl.NumberFormat('id-ID').format(value as number)}`);
    }
    doc.font('Helvetica-Bold').text(`Total Deductions: Rp ${new Intl.NumberFormat('id-ID').format(payslip.total_deductions)}`);
    doc.moveDown(2);
    
    // Net Salary
    doc.fontSize(12).font('Helvetica-Bold').text(`NET SALARY: Rp ${new Intl.NumberFormat('id-ID').format(payslip.net_salary)}`, { align: 'right' });

    // 7. Finalize PDF
    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate PDF payslip.' });
  }
};

