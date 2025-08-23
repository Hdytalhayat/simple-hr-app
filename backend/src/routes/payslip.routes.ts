import { Router } from 'express';
import { generatePayslip, getMyPayslipHistory, downloadPayslipPdf } from '../controllers/payslip.controller';
import { protect, adminOrHR } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/payslips/my-history
 * @desc    Get payslip history for the logged-in employee
 * @access  Private (Employee)
 */
router.get('/my-history', protect, getMyPayslipHistory);

/**
 * @route   POST /api/payslips/generate
 * @desc    Generate a payslip for a specific employee (Admin/HR only)
 * @access  Private (Admin/HR)
 */
router.post('/generate', protect, adminOrHR, generatePayslip);

/**
 * @route   GET /api/payslips/:payslipId/download
 * @desc    Download a specific payslip as a PDF (Employee or Admin/HR)
 * @access  Private (Employee can download their own; Admin/HR can download any)
 */
router.get('/:id/download', protect, downloadPayslipPdf);

export default router;
