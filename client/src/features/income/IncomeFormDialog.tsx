import { useEffect, useRef, useState } from 'react';
import { AmountField } from '@/components/common/AmountField';
import { FormField } from '@/components/common/FormField';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIncomeMutations } from '@/hooks/useIncome';
import { INCOME_SOURCES, type Income } from '@/types';
import { todayKey } from '@/utils/date';
import { parseAmount } from '@/utils/money';

interface IncomeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing an existing record. */
  record?: Income | null;
  defaultDate?: string;
}

interface FormState {
  amount: string;
  source: string;
  customSource: string;
  date: string;
  description: string;
}

const emptyForm = (date: string): FormState => ({
  amount: '',
  source: 'Salary',
  customSource: '',
  date,
  description: '',
});

export function IncomeFormDialog({ open, onOpenChange, record, defaultDate }: IncomeFormDialogProps) {
  const { create, update } = useIncomeMutations();
  const [form, setForm] = useState<FormState>(() => emptyForm(defaultDate ?? todayKey()));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const amountRef = useRef<HTMLInputElement>(null);

  const isEditing = Boolean(record);

  useEffect(() => {
    if (!open) return;

    if (record) {
      const isKnownSource = (INCOME_SOURCES as readonly string[]).includes(record.source);
      setForm({
        amount: String(record.amount),
        source: isKnownSource ? record.source : 'Other',
        customSource: isKnownSource ? '' : record.source,
        date: record.date,
        description: record.description,
      });
    } else {
      setForm(emptyForm(defaultDate ?? todayKey()));
    }
    setErrors({});

    // The amount is the first thing anyone wants to type.
    const timer = window.setTimeout(() => amountRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [open, record, defaultDate]);

  const resolvedSource = form.source === 'Other' ? form.customSource.trim() : form.source;

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    const amount = parseAmount(form.amount);

    if (amount === null || amount <= 0) nextErrors.amount = 'Enter an amount greater than 0';
    if (!resolvedSource) nextErrors.source = 'Where did this money come from?';
    if (!form.date) nextErrors.date = 'Pick a date';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    const input = {
      amount: parseAmount(form.amount) as number,
      source: resolvedSource,
      date: form.date,
      description: form.description.trim(),
    };

    try {
      if (record) {
        await update.mutateAsync({ id: record.id, input });
      } else {
        await create.mutateAsync(input);
      }
      onOpenChange(false);
    } catch {
      // Errors surface as toasts from the mutation hooks.
    }
  }

  const isSaving = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit income' : 'Add income'}</DialogTitle>
          <DialogDescription>Money you earned or received.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField id="income-amount" label="Amount" error={errors.amount}>
            <AmountField
              id="income-amount"
              ref={amountRef}
              value={form.amount}
              aria-invalid={Boolean(errors.amount)}
              onChange={(event) => setForm((state) => ({ ...state, amount: event.target.value }))}
            />
          </FormField>

          <FormField id="income-source" label="Source" error={errors.source}>
            <Select
              value={form.source}
              onValueChange={(value) => setForm((state) => ({ ...state, source: value }))}
            >
              <SelectTrigger id="income-source">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {INCOME_SOURCES.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {form.source === 'Other' ? (
            <FormField id="income-custom-source" label="Source name">
              <Input
                id="income-custom-source"
                value={form.customSource}
                placeholder="e.g. Cashback"
                onChange={(event) =>
                  setForm((state) => ({ ...state, customSource: event.target.value }))
                }
              />
            </FormField>
          ) : null}

          <FormField id="income-date" label="Date" error={errors.date}>
            <Input
              id="income-date"
              type="date"
              value={form.date}
              onChange={(event) => setForm((state) => ({ ...state, date: event.target.value }))}
            />
          </FormField>

          <FormField id="income-note" label="Note" hint="Optional">
            <Input
              id="income-note"
              value={form.description}
              placeholder="e.g. August salary"
              onChange={(event) =>
                setForm((state) => ({ ...state, description: event.target.value }))
              }
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : isEditing ? 'Save changes' : 'Save income'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
