import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { expenseService } from '@/services/api/expense.service';
import type { ExpenseInput } from '@/types';
import { queryKeys } from './queryKeys';
import { toastApiError } from './toastApiError';

export function useExpenses() {
  return useQuery({
    queryKey: queryKeys.expenses,
    queryFn: () => expenseService.list(),
  });
}

export function useExpenseMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.expenses });

  const create = useMutation({
    mutationFn: (input: ExpenseInput) => expenseService.create(input),
    onSuccess: () => {
      invalidate();
      toast.success('Expense added');
    },
    onError: toastApiError,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ExpenseInput> }) =>
      expenseService.update(id, input),
    onSuccess: () => {
      invalidate();
      toast.success('Expense updated');
    },
    onError: toastApiError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => expenseService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success('Expense deleted');
    },
    onError: toastApiError,
  });

  return { create, update, remove };
}
