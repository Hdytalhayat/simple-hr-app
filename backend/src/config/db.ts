// src/config/db.ts

// Import PostgreSQL connection pool from the 'pg' library
import { Pool } from 'pg';
// Import dotenv to load environment variables from .env
import dotenv from 'dotenv';

// Load environment variables into process.env
dotenv.config();

// Create a new PostgreSQL connection pool
// A pool manages multiple client connections efficiently
const pool = new Pool({
  // Database username (from .env file)
  user: process.env.DB_USER,

  // Database host (e.g., localhost, or remote server address)
  host: process.env.DB_HOST,

  // Database name to connect to
  database: process.env.DB_DATABASE,

  // Database password (from .env file)
  password: process.env.DB_PASSWORD,

  // Database port number (must be converted from string to number)
  port: parseInt(process.env.DB_PORT as string, 10),
});

// Export the pool instance so it can be used in other files
export default pool;
