import { Request, Response } from 'express';
import pool from '../config/db';

// Controller to handle document upload for an employee
export const uploadDocument = async (req: Request, res: Response) => {
  const { employeeId } = req.params;  // Get employee ID from URL parameters
  const { document_type } = req.body; // Get document type from request body

  // Validate that a file was uploaded
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  // Validate that document type is provided
  if (!document_type) {
    return res.status(400).json({ message: 'Document type is required.' });
  }

  const { originalname, path } = req.file; // Extract file name and path

  try {
    // Insert new document record into the database
    const newDoc = await pool.query(
      'INSERT INTO employee_documents (employee_id, document_name, document_type, file_path) VALUES ($1, $2, $3, $4) RETURNING *',
      [employeeId, originalname, document_type, path]
    );

    // Respond with the newly created document
    res.status(201).json({ message: 'Document uploaded successfully.', data: newDoc.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error occurred.' });
  }
};

// Controller to fetch all documents for a specific employee
export const getDocumentsByEmployee = async (req: Request, res: Response) => {
  const { employeeId } = req.params; // Get employee ID from URL parameters

  try {
    // Query all documents for the employee, ordered by upload date (latest first)
    const result = await pool.query(
      'SELECT id, document_name, document_type, uploaded_at FROM employee_documents WHERE employee_id = $1 ORDER BY uploaded_at DESC',
      [employeeId]
    );

    // Respond with the list of documents
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error occurred.' });
  }
};
