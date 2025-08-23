import { Router } from 'express';
import { upsertSalaryComponent } from '../controllers/salary.controller';
import { protect, adminOrHR } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected and accessible only by Admin or HR
router.use(protect, adminOrHR);

/**
 * @route   POST /api/salary-components/:employeeId
 * @desc    Create or update salary components for a specific employee
 * @access  Private (Admin/HR)
 */
router.post('/:employeeId', upsertSalaryComponent);

export default router;
