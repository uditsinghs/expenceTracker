import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { incomeService } from '@/services/api/income.service';
import type { Income, IncomeInput } from '@/types';
import { queryKeys } from './queryKeys';
import { toastApiError } from './toastApiError';

/**
 * The full history is fetched once and filtered in memory, so switching months
 * is instant and every screen reads from the same cache entry.
 */
export function useIncome() {
  return useQuery({
    queryKey: queryKeys.income,
    queryFn: () => incomeService.list(),
  });
}

export function useIncomeMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.income });

  const create = useMutation({
    mutationFn: (input: IncomeInput) => incomeService.create(input),
    onSuccess: (income: Income) => {
      invalidate();
      toast.success(`Income from ${income.source} added`);
    },
    onError: toastApiError,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<IncomeInput> }) =>
      incomeService.update(id, input),
    onSuccess: () => {
      invalidate();
      toast.success('Income updated');
    },
    onError: toastApiError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => incomeService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success('Income deleted');
    },
    onError: toastApiError,
  });

  return { create, update, remove };
}
