import type { Expense, ExpenseInput } from '@/types';
import { http } from './client';

export type ExpenseQuery = {
  month?: string;
  from?: string;
  to?: string;
  category?: string;
};

export const expenseService = {
  list: (query: ExpenseQuery = {}) => http.get<Expense[]>('/expenses', query),
  create: (input: ExpenseInput) => http.post<Expense>('/expenses', input),
  update: (id: string, input: Partial<ExpenseInput>) => http.put<Expense>(`/expenses/${id}`, input),
  remove: (id: string) => http.delete<{ id: string }>(`/expenses/${id}`),
};
