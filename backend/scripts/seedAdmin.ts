import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define initial admin credentials
// For better security, use environment variables instead of hardcoding
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@perusahaan.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';
const ADMIN_FULL_NAME = 'Main Admin';

// Create a new PostgreSQL connection pool specifically for this script
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT as string, 10),
});

const seedAdminUser = async () => {
  console.log('Starting admin seeding process...');

  try {
    // 1. Check if an admin with this email already exists
    const userExists = await pool.query(
      'SELECT id FROM employees WHERE email = $1',
      [ADMIN_EMAIL]
    );
    if (userExists.rows.length > 0) {
      console.log(`Admin with email ${ADMIN_EMAIL} already exists. Skipping seeding.`);
      return; // Stop execution if admin already exists
    }

    console.log('Admin does not exist, creating now...');

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // 3. Insert new admin into the database
    const query = `
      INSERT INTO employees (full_name, email, password_hash, role, employment_status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, role;
    `;
    const values = [ADMIN_FULL_NAME, ADMIN_EMAIL, password_hash, 'Admin', 'Aktif'];

    const newAdmin = await pool.query(query, values);

    console.log('✅ Admin created successfully:');
    console.table(newAdmin.rows);

  } catch (error) {
    console.error('❌ Error occurred during admin seeding:', error);
  } finally {
    // 4. Close the pool so the script can exit
    await pool.end();
    console.log('Database connection closed.');
  }
};

// Run the seeder function
seedAdminUser();
