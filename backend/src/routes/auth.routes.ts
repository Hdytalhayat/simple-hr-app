// src/routes/auth.routes.ts

import { Router } from 'express';
import { loginUser } from '../controllers/auth.controller';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public (anyone can attempt login)
 */
router.post('/login', loginUser);

export default router;
