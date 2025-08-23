export interface Payslip {
  id?: string;                     // Optional unique ID (UUID)
  employee_id: string;             // Reference to the employee
  pay_period_month: number;        // Month of the payslip (1–12)
  pay_period_year: number;         // Year of the payslip
  basic_salary: number;            // Base salary
  total_allowances: number;        // Sum of all allowances
  total_deductions: number;        // Sum of all deductions
  net_salary: number;              // Final salary after deductions
  details: {
    basic_salary: number;          // Base salary repeated in details for clarity
    allowances: Record<string, number>; // Key-value pairs for allowance components
    deductions: Record<string, number>; // Key-value pairs for deduction components
    // Optional dynamic deductions, e.g., attendance penalties
    dynamic_deductions?: Record<string, number>;
  };
  generated_at?: Date;             // Timestamp when payslip was generated
}
