import { useMemo } from 'react';
import {
  calculateCashFlow,
  calculateCategoryBreakdown,
  calculateMonthlySummary,
  calculateUdhaarSummary,
  filterByMonth,
} from '@/utils/calculations';
import { buildTransactions } from '@/utils/transactions';
import { useExpenses } from './useExpenses';
import { useIncome } from './useIncome';
import { useMonth } from './useMonth';
import { useUdhaar } from './useUdhaar';

/**
 * One place that reads the three caches and derives every figure the screens
 * show, so totals can never disagree between pages.
 */
export function useFinanceData() {
  const { month } = useMonth();
  const incomeQuery = useIncome();
  const expenseQuery = useExpenses();
  const udhaarQuery = useUdhaar();

  const income = incomeQuery.data ?? [];
  const expenses = expenseQuery.data ?? [];
  const udhaar = udhaarQuery.data ?? [];

  return useMemo(() => {
    const monthIncome = filterByMonth(income, month);
    const monthExpenses = filterByMonth(expenses, month);

    return {
      month,
      income,
      expenses,
      udhaar,
      monthIncome,
      monthExpenses,
      summary: calculateMonthlySummary(income, expenses, month),
      udhaarSummary: calculateUdhaarSummary(udhaar),
      cashFlow: calculateCashFlow(income, expenses, udhaar, month),
      categoryBreakdown: calculateCategoryBreakdown(monthExpenses),
      transactions: buildTransactions(monthIncome, monthExpenses, udhaar).filter((row) =>
        row.date.startsWith(month),
      ),
      allTransactions: buildTransactions(income, expenses, udhaar),
      isLoading: incomeQuery.isLoading || expenseQuery.isLoading || udhaarQuery.isLoading,
      isError: incomeQuery.isError || expenseQuery.isError || udhaarQuery.isError,
      error: incomeQuery.error ?? expenseQuery.error ?? udhaarQuery.error,
      refetch: () => {
        void incomeQuery.refetch();
        void expenseQuery.refetch();
        void udhaarQuery.refetch();
      },
    };
  }, [income, expenses, udhaar, month, incomeQuery, expenseQuery, udhaarQuery]);
}
