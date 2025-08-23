// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Memperluas tipe Request dari Express untuk menyertakan properti 'user'
export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  // ... Logika verifikasi JWT ...
  // Jika valid:
  // const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // req.user = decoded; // Menambahkan payload ke request
  // next();
};

export const adminOrHR = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'HR')) {
    next();
  } else {
    res.status(403).json({ message: 'Akses ditolak. Membutuhkan hak akses Admin atau HR.' });
  }
};