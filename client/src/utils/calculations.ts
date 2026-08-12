import type { Expense, ExpenseCategory, Income, Udhaar } from '@/types';
import { roundMoney } from './money';
import { isInMonth, type MonthKey } from './date';

export interface MonthlySummary {
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
}

export interface UdhaarSummary {
  /** Money others still owe the user. */
  toReceive: number;
  /** Money the user still owes others. */
  toPay: number;
  /** toReceive - toPay. Positive means more is coming back than going out. */
  netOutstanding: number;
  pendingCount: number;
}

export function sumBy<T>(items: T[], pick: (item: T) => number): number {
  return roundMoney(items.reduce((total, item) => total + pick(item), 0));
}

export function totalIncome(records: Income[]): number {
  return sumBy(records, (record) => record.amount);
}

export function totalExpenses(records: Expense[]): number {
  return sumBy(records, (record) => record.amount);
}

export function filterByMonth<T extends { date: string }>(records: T[], month: MonthKey): T[] {
  return records.filter((record) => isInMonth(record.date, month));
}

/**
 * Income and expenses for one month. Udhaar is deliberately excluded: lending
 * money out is not an expense and borrowing money is not income.
 */
export function calculateMonthlySummary(
  income: Income[],
  expenses: Expense[],
  month: MonthKey,
): MonthlySummary {
  const incomeTotal = totalIncome(filterByMonth(income, month));
  const expenseTotal = totalExpenses(filterByMonth(expenses, month));

  return {
    totalIncome: incomeTotal,
    totalExpenses: expenseTotal,
    availableBalance: roundMoney(incomeTotal - expenseTotal),
  };
}

/**
 * Outstanding udhaar is intentionally month independent - a pending debt from
 * March is still owed in August.
 */
export function calculateUdhaarSummary(records: Udhaar[]): UdhaarSummary {
  const open = records.filter((record) => record.status !== 'SETTLED');
  const toReceive = sumBy(
    open.filter((record) => record.type === 'I_GAVE'),
    (record) => record.remainingAmount,
  );
  const toPay = sumBy(
    open.filter((record) => record.type === 'I_TOOK'),
    (record) => record.remainingAmount,
  );

  return {
    toReceive,
    toPay,
    netOutstanding: roundMoney(toReceive - toPay),
    pendingCount: open.length,
  };
}

export interface CategoryTotal {
  category: ExpenseCategory;
  total: number;
  /** Share of the period's expenses, 0-100. */
  percentage: number;
}

export function calculateCategoryBreakdown(expenses: Expense[]): CategoryTotal[] {
  const totals = new Map<ExpenseCategory, number>();
  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  }

  const grandTotal = totalExpenses(expenses);
  return [...totals.entries()]
    .map(([category, total]) => ({
      category,
      total: roundMoney(total),
      percentage: grandTotal > 0 ? roundMoney((total / grandTotal) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Actual cash that moved in the month, including udhaar movement, which the
 * income/expense totals ignore on purpose.
 */
export function calculateCashFlow(income: Income[], expenses: Expense[], udhaar: Udhaar[], month: MonthKey) {
  const { totalIncome: incomeTotal, totalExpenses: expenseTotal } = calculateMonthlySummary(
    income,
    expenses,
    month,
  );

  let cashIn = 0;
  let cashOut = 0;

  for (const record of udhaar) {
    if (isInMonth(record.date, month)) {
      if (record.type === 'I_GAVE') cashOut += record.originalAmount;
      else cashIn += record.originalAmount;
    }
    for (const repayment of record.repayments) {
      if (!isInMonth(repayment.date, month)) continue;
      if (record.type === 'I_GAVE') cashIn += repayment.amount;
      else cashOut += repayment.amount;
    }
  }

  return {
    income: incomeTotal,
    expenses: expenseTotal,
    udhaarIn: roundMoney(cashIn),
    udhaarOut: roundMoney(cashOut),
    netCashFlow: roundMoney(incomeTotal - expenseTotal + cashIn - cashOut),
  };
}

export function totalRepaid(record: Udhaar): number {
  return sumBy(record.repayments, (repayment) => repayment.amount);
}
