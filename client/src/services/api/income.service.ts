import type { Income, IncomeInput } from '@/types';
import { http } from './client';

export type IncomeQuery = {
  month?: string;
  from?: string;
  to?: string;
};

export const incomeService = {
  list: (query: IncomeQuery = {}) => http.get<Income[]>('/income', query),
  create: (input: IncomeInput) => http.post<Income>('/income', input),
  update: (id: string, input: Partial<IncomeInput>) => http.put<Income>(`/income/${id}`, input),
  remove: (id: string) => http.delete<{ id: string }>(`/income/${id}`),
};
