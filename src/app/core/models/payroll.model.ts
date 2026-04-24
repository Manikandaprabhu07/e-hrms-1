/**
 * Payroll period enum
 */
export enum PayrollPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  HALF_YEARLY = 'half_yearly',
  ANNUAL = 'annual'
}

/**
 * Salary structure component
 */
export interface SalaryComponent {
  id: string;
  name: string;
  description: string;
  isEarning: boolean; // true for earning, false for deduction
  isFixed: boolean;
  value: number;
  percentage?: number;
}

/**
 * Employee salary structure
 */
export interface EmployeeSalaryStructure {
  id: string;
  employeeId: string;
  baseSalary: number;
  components: SalaryComponent[];
  effectiveDate: Date;
  endDate?: Date;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  isActive: boolean;
}

/**
 * Payroll slip/salary statement
 */
export interface PayrollSlip {
  id: string;
  employeeId: string;
  period: PayrollPeriod;
  periodStart: Date;
  periodEnd: Date;
  baseSalary: number;
  earnings: Array<{ component: string; amount: number }>;
  deductions: Array<{ component: string; amount: number }>;
  totalEarnings: number;
  totalDeductions: number;
  netPayable: number;
  status: 'draft' | 'processed' | 'paid' | 'cancelled';
  issuedDate: Date;
  paidDate?: Date;
  taxableIncome: number;
  incomeTax: number;
  pfContribution: number;
}

/**
 * Salary advance request
 */
export interface SalaryAdvanceRequest {
  id: string;
  employeeId: string;
  amount: number;
  requestDate: Date;
  approvedDate?: Date;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  approvedBy?: string;
  reason: string;
  repaymentMonths: number;
  remarks?: string;
}

/**
 * Bonus/Incentive model
 */
export interface Bonus {
  id: string;
  employeeId: string;
  type: string;
  amount: number;
  reason: string;
  approvedBy: string;
  approvalDate: Date;
  disbursementDate: Date;
  status: 'pending' | 'approved' | 'disbursed' | 'cancelled';
}
