export interface SalaryComponent {
  id?: string;
  employee_id: string;
  basic_salary: number;

  // `Record<string, number>` defines an object
  // where the key is a string and the value is a number.
  // This is a perfect fit for JSONB columns in Postgres
  // (e.g., allowances: { transport: 100, meal: 50 }).
  allowances: Record<string, number>;
  deductions: Record<string, number>;
}
