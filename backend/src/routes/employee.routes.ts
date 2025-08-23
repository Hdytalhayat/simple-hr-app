// src/routes/employee.routes.ts

import { Router } from 'express';
import { 
    createEmployee, 
    getAllEmployees, 
    getEmployeeById, 
    updateEmployee, 
    deleteEmployee 
} from '../controllers/employee.controller';
import { protect, adminOrHR } from '../middleware/auth.middleware';

const router = Router();

// Apply middleware: 
// All routes below are protected (require authentication) 
// and can only be accessed by Admin or HR roles
router.use(protect, adminOrHR);

// Route: /api/employees
// - POST   → Create a new employee
// - GET    → Get all employees
router.route('/')
  .post(createEmployee)
  .get(getAllEmployees);

// Route: /api/employees/:id
// - GET    → Get a specific employee by ID
// - PUT    → Update employee data by ID
// - DELETE → Delete employee by ID
router.route('/:id')
  .get(getEmployeeById)
  .put(updateEmployee)
  .delete(deleteEmployee);

export default router;
