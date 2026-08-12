export const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Family',
  'Education',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const INCOME_SOURCES = [
  'Salary',
  'Freelance',
  'Business',
  'Rent',
  'Gift',
  'Refund',
  'Other',
] as const;

export type UdhaarType = 'I_GAVE' | 'I_TOOK';
export type UdhaarStatus = 'PENDING' | 'PARTIALLY_PAID' | 'SETTLED';

/** ISO calendar date, `YYYY-MM-DD`. */
export type DateString = string;

interface Persisted {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Income extends Persisted {
  amount: number;
  source: string;
  date: DateString;
  description: string;
}

export interface Expense extends Persisted {
  amount: number;
  category: ExpenseCategory;
  date: DateString;
  description: string;
}

export interface Repayment {
  id: string;
  amount: number;
  date: DateString;
  note: string;
  createdAt: string;
}

export interface Udhaar extends Persisted {
  personName: string;
  type: UdhaarType;
  originalAmount: number;
  remainingAmount: number;
  status: UdhaarStatus;
  date: DateString;
  description: string;
  repayments: Repayment[];
}

export type IncomeInput = {
  amount: number;
  source: string;
  date: DateString;
  description?: string;
};

export type ExpenseInput = {
  amount: number;
  category: ExpenseCategory;
  date: DateString;
  description?: string;
};

export type UdhaarInput = {
  personName: string;
  type: UdhaarType;
  originalAmount: number;
  date: DateString;
  description?: string;
};

export type RepaymentInput = {
  amount: number;
  date: DateString;
  note?: string;
};

/** A single row in the unified transaction feed. */
export type TransactionKind = 'INCOME' | 'EXPENSE' | 'UDHAAR_GIVEN' | 'UDHAAR_TAKEN' | 'UDHAAR_RECEIVED' | 'UDHAAR_REPAID';

export interface Transaction {
  id: string;
  kind: TransactionKind;
  title: string;
  subtitle: string;
  date: DateString;
  /** Positive when money comes in, negative when it goes out. */
  amount: number;
  /** Id of the record this row was derived from, for navigation. */
  sourceId: string;
}
