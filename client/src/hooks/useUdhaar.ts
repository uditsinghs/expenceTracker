import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { udhaarService } from '@/services/api/udhaar.service';
import type { RepaymentInput, UdhaarInput } from '@/types';
import { formatMoney } from '@/utils/money';
import { queryKeys } from './queryKeys';
import { toastApiError } from './toastApiError';

export function useUdhaar() {
  return useQuery({
    queryKey: queryKeys.udhaar,
    queryFn: () => udhaarService.list(),
  });
}

export function useUdhaarMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.udhaar });

  const create = useMutation({
    mutationFn: (input: UdhaarInput) => udhaarService.create(input),
    onSuccess: (record) => {
      invalidate();
      toast.success(
        record.type === 'I_GAVE'
          ? `Noted: ${record.personName} owes you ${formatMoney(record.originalAmount)}`
          : `Noted: you owe ${record.personName} ${formatMoney(record.originalAmount)}`,
      );
    },
    onError: toastApiError,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<UdhaarInput> }) =>
      udhaarService.update(id, input),
    onSuccess: () => {
      invalidate();
      toast.success('Udhaar updated');
    },
    onError: toastApiError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => udhaarService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success('Udhaar deleted');
    },
    onError: toastApiError,
  });

  const addRepayment = useMutation({
    mutationFn: ({ id, input }: { id: string; input: RepaymentInput }) =>
      udhaarService.addRepayment(id, input),
    onSuccess: (record) => {
      invalidate();
      toast.success(
        record.status === 'SETTLED'
          ? `All settled with ${record.personName}`
          : `Payment recorded. ${formatMoney(record.remainingAmount)} left.`,
      );
    },
    onError: toastApiError,
  });

  const removeRepayment = useMutation({
    mutationFn: ({ id, repaymentId }: { id: string; repaymentId: string }) =>
      udhaarService.removeRepayment(id, repaymentId),
    onSuccess: () => {
      invalidate();
      toast.success('Payment entry removed');
    },
    onError: toastApiError,
  });

  return { create, update, remove, addRepayment, removeRepayment };
}
