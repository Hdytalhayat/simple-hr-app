// src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db'; // Needed to validate the user against the database

// Define the expected structure of the JWT payload
interface JwtPayload {
  id: string;
  role: string;
}

// Extend Express's Request type to include a `user` property
// This prevents TypeScript errors when we add `req.user`
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * 🔒 Middleware to protect routes.
 * - Verifies the JWT token from the `Authorization` header.
 * - If valid, attaches the user data to `req.user`.
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // 1. Check if Authorization header exists and follows "Bearer <token>" format
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extract the token from header
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify token using secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as JwtPayload;

      // 4. (Optional but recommended) Verify that the user still exists in the database
      const userResult = await pool.query('SELECT id, role FROM employees WHERE id = $1', [decoded.id]);
      
      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: 'Unauthorized: user not found.' });
      }

      // 5. Attach user payload to the request object
      req.user = {
        id: userResult.rows[0].id,
        role: userResult.rows[0].role,
      };

      // Continue to the next middleware or controller
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Unauthorized: invalid token.' });
    }
  }

  // If no token was provided
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: no token provided.' });
  }
};

/**
 * 🛡️ Middleware for role-based authorization.
 * - Only allows access if the user role is 'Admin' or 'HR'.
 * - Must be used AFTER the `protect` middleware.
 */
export const adminOrHR = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Check user role that was set by the `protect` middleware
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'HR')) {
    // Role is valid → allow access
    next();
  } else {
    // Role is not valid → block access
    res.status(403).json({ message: 'Access denied: insufficient permissions.' });
  }
};
