// src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Employee } from '../interfaces/employee.interface';

/**
 * @desc    Authenticate user & return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Basic input validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    // 2. Look up the user by email in the database
    const result = await pool.query('SELECT * FROM employees WHERE email = $1', [email]);
    const user: Employee = result.rows[0];

    // If no user found, return generic error (avoid leaking info)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 3. Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 4. Ensure the account is active before allowing login
    if (user.employment_status !== 'Aktif') {
      return res.status(403).json({ message: 'Your account is not active. Please contact HR.' });
    }

    // 5. Prepare payload for JWT (user ID & role only, no sensitive data)
    const payload = {
      id: user.id,
      role: user.role,
    };

    // 6. Generate and sign JWT (valid for 1 day)
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY as string, {
      expiresIn: '1d',
    });

    // 7. Send response with token and safe user details (exclude password)
    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    // Generic server error response
    res.status(500).json({ message: 'An error occurred on the server.' });
  }
};
