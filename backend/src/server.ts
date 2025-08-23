// src/server.ts

// Import dotenv to load environment variables from a .env file
import dotenv from 'dotenv';
// Import express (web framework) and type definitions for Express, Request, and Response
import express, { Express, Request, Response } from 'express';
// Import CORS middleware to allow cross-origin requests
import cors from 'cors';

import employeeRoutes from './routes/employee.routes';
import authRoutes from './routes/auth.routes';
import attendanceRoutes from './routes/attendance.routes';
import leaveRoutes from './routes/leave.routes';         

// Load environment variables into process.env
dotenv.config();

// Create an Express application instance
const app: Express = express();

// ====== Middleware ======
// Enable CORS so this API can be accessed from other domains (e.g., frontend apps)
app.use(cors());
// Enable JSON body parsing for incoming requests (so req.body can be used)
app.use(express.json());

// ====== Routes ======
// A simple test route (GET /) to verify that the API is running
app.get('/', (req: Request, res: Response) => {
  res.send('Simple HR App API (TypeScript) is running!');
});

// Authentication routes (login, register, etc.)
app.use('/api/auth', authRoutes);

// Employee routes (CRUD operations for employees)
app.use('/api/employees', employeeRoutes);

// Attendance routes (check-in, check-out, attendance history)
app.use('/api/attendance', attendanceRoutes);

// Leave request routes (apply for leave, approve/reject leave)
app.use('/api/leave', leaveRoutes);


// ====== Server Initialization ======
// Get port number from environment variables, default to 3001 if not provided
const PORT: number = parseInt(process.env.PORT as string, 10) || 3001;

// Start the Express server and listen on the given port
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
