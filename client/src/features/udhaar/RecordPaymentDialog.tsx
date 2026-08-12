import { useEffect, useMemo, useRef, useState } from 'react';
import { AmountField } from '@/components/common/AmountField';
import { EmptyState } from '@/components/common/EmptyState';
import { FormField } from '@/components/common/FormField';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUdhaar, useUdhaarMutations } from '@/hooks/useUdhaar';
import { HandCoins } from 'lucide-react';
import type { Udhaar } from '@/types';
import { todayKey } from '@/utils/date';
import { formatMoney, parseAmount } from '@/utils/money';
import { repaymentWording, typeLabel } from './udhaarMeta';

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When absent the user first picks which udhaar the payment belongs to. */
  record?: Udhaar | null;
}

export function RecordPaymentDialog({ open, onOpenChange, record }: RecordPaymentDialogProps) {
  const { data: allUdhaar = [] } = useUdhaar();
  const { addRepayment } = useUdhaarMutations();

  const [selectedId, setSelectedId] = useState<string | null>(record?.id ?? null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayKey);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const amountRef = useRef<HTMLInputElement>(null);

  const openRecords = useMemo(
    () => allUdhaar.filter((item) => item.status !== 'SETTLED'),
    [allUdhaar],
  );

  // Always read the selected record from the cache so remaining stays fresh.
  const selected = useMemo(
    () => allUdhaar.find((item) => item.id === (record?.id ?? selectedId)) ?? null,
    [allUdhaar, record?.id, selectedId],
  );

  useEffect(() => {
    if (!open) return;
    setSelectedId(record?.id ?? null);
    setAmount('');
    setDate(todayKey());
    setNote('');
    setErrors({});
  }, [open, record?.id]);

  useEffect(() => {
    if (!open || !selected) return;
    const timer = window.setTimeout(() => amountRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [open, selected]);

  function validate(target: Udhaar): boolean {
    const nextErrors: Record<string, string> = {};
    const value = parseAmount(amount);

    if (value === null || value <= 0) {
      nextErrors.amount = 'Enter an amount greater than 0';
    } else if (value > target.remainingAmount) {
      nextErrors.amount = `Cannot be more than the remaining ${formatMoney(target.remainingAmount)}`;
    }
    if (!date) nextErrors.date = 'Pick a date';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || !validate(selected)) return;

    try {
      await addRepayment.mutateAsync({
        id: selected.id,
        input: { amount: parseAmount(amount) as number, date, note: note.trim() },
      });
      onOpenChange(false);
    } catch {
      // Errors surface as toasts from the mutation hooks.
    }
  }

  const wording = selected ? repaymentWording(selected.type) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            {selected && wording
              ? `${wording.helper} The original amount stays unchanged.`
              : 'Pick the udhaar this payment belongs to.'}
          </DialogDescription>
        </DialogHeader>

        {!selected ? (
          openRecords.length === 0 ? (
            <EmptyState
              icon={HandCoins}
              title="No outstanding udhaar"
              description="You're all clear. There is nothing to record a payment against."
            />
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {openRecords.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{item.personName}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {typeLabel[item.type]} · {formatMoney(item.remainingAmount)} left
                    </span>
                  </span>
                  <Badge variant={item.type === 'I_GAVE' ? 'success' : 'warning'}>
                    {item.type === 'I_GAVE' ? 'To receive' : 'To pay'}
                  </Badge>
                </button>
              ))}
            </div>
          )
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl bg-muted/60 p-3">
              <p className="text-sm font-medium">{selected.personName}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {typeLabel[selected.type]} {formatMoney(selected.originalAmount)} ·{' '}
                {formatMoney(selected.remainingAmount)} remaining
              </p>
            </div>

            <FormField
              id="payment-amount"
              label={wording?.past ?? 'Amount'}
              error={errors.amount}
              hint={`Maximum ${formatMoney(selected.remainingAmount)}`}
            >
              <AmountField
                id="payment-amount"
                ref={amountRef}
                value={amount}
                aria-invalid={Boolean(errors.amount)}
                onChange={(event) => setAmount(event.target.value)}
              />
            </FormField>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(String(selected.remainingAmount))}
              >
                Full amount
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(String(Math.round(selected.remainingAmount / 2)))}
              >
                Half
              </Button>
            </div>

            <FormField id="payment-date" label="Date" error={errors.date}>
              <Input
                id="payment-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </FormField>

            <FormField id="payment-note" label="Note" hint="Optional">
              <Input
                id="payment-note"
                value={note}
                placeholder="e.g. Paid by UPI"
                onChange={(event) => setNote(event.target.value)}
              />
            </FormField>

            <DialogFooter>
              {!record ? (
                <Button type="button" variant="outline" onClick={() => setSelectedId(null)}>
                  Back
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={addRepayment.isPending}>
                {addRepayment.isPending ? 'Saving...' : 'Save payment'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
