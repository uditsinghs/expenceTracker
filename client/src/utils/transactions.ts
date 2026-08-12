import type { Expense, Income, Transaction, Udhaar } from '@/types';

/**
 * Flattens income, expenses and every udhaar movement into one feed.
 * Udhaar rows keep their own kinds so the UI can style them differently from
 * ordinary spending.
 */
export function buildTransactions(
  income: Income[],
  expenses: Expense[],
  udhaar: Udhaar[],
): Transaction[] {
  const rows: Transaction[] = [];

  for (const record of income) {
    rows.push({
      id: `income-${record.id}`,
      kind: 'INCOME',
      title: record.source,
      subtitle: record.description || 'Income',
      date: record.date,
      amount: record.amount,
      sourceId: record.id,
    });
  }

  for (const record of expenses) {
    rows.push({
      id: `expense-${record.id}`,
      kind: 'EXPENSE',
      title: record.description || record.category,
      subtitle: record.category,
      date: record.date,
      amount: -record.amount,
      sourceId: record.id,
    });
  }

  for (const record of udhaar) {
    const gave = record.type === 'I_GAVE';

    rows.push({
      id: `udhaar-${record.id}`,
      kind: gave ? 'UDHAAR_GIVEN' : 'UDHAAR_TAKEN',
      title: record.personName,
      subtitle: gave ? 'You gave' : 'You took',
      date: record.date,
      amount: gave ? -record.originalAmount : record.originalAmount,
      sourceId: record.id,
    });

    for (const repayment of record.repayments) {
      rows.push({
        id: `repayment-${repayment.id}`,
        kind: gave ? 'UDHAAR_RECEIVED' : 'UDHAAR_REPAID',
        title: record.personName,
        subtitle: gave ? 'Got money back' : 'Returned money',
        date: repayment.date,
        amount: gave ? repayment.amount : -repayment.amount,
        sourceId: record.id,
      });
    }
  }

  return sortNewestFirst(rows);
}

export function sortNewestFirst(rows: Transaction[]): Transaction[] {
  return [...rows].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function isUdhaarTransaction(kind: Transaction['kind']): boolean {
  return kind !== 'INCOME' && kind !== 'EXPENSE';
}
