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
import { useExpenseMutations } from '@/hooks/useExpenses';
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory } from '@/types';
import { todayKey } from '@/utils/date';
import { parseAmount } from '@/utils/money';

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: Expense | null;
  defaultDate?: string;
}

interface FormState {
  amount: string;
  category: ExpenseCategory | '';
  date: string;
  description: string;
}

const emptyForm = (date: string): FormState => ({
  amount: '',
  category: 'Food',
  date,
  description: '',
});

export function ExpenseFormDialog({
  open,
  onOpenChange,
  record,
  defaultDate,
}: ExpenseFormDialogProps) {
  const { create, update } = useExpenseMutations();
  const [form, setForm] = useState<FormState>(() => emptyForm(defaultDate ?? todayKey()));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const amountRef = useRef<HTMLInputElement>(null);

  const isEditing = Boolean(record);

  useEffect(() => {
    if (!open) return;

    if (record) {
      setForm({
        amount: String(record.amount),
        category: record.category,
        date: record.date,
        description: record.description,
      });
    } else {
      setForm(emptyForm(defaultDate ?? todayKey()));
    }
    setErrors({});

    const timer = window.setTimeout(() => amountRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [open, record, defaultDate]);

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    const amount = parseAmount(form.amount);

    if (amount === null || amount <= 0) nextErrors.amount = 'Enter an amount greater than 0';
    if (!form.category) nextErrors.category = 'Pick a category';
    if (!form.date) nextErrors.date = 'Pick a date';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    const input = {
      amount: parseAmount(form.amount) as number,
      category: form.category as ExpenseCategory,
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
          <DialogTitle>{isEditing ? 'Edit expense' : 'Add expense'}</DialogTitle>
          <DialogDescription>Money you actually spent.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField id="expense-amount" label="Amount" error={errors.amount}>
            <AmountField
              id="expense-amount"
              ref={amountRef}
              value={form.amount}
              aria-invalid={Boolean(errors.amount)}
              onChange={(event) => setForm((state) => ({ ...state, amount: event.target.value }))}
            />
          </FormField>

          <FormField id="expense-category" label="Category" error={errors.category}>
            <Select
              value={form.category}
              onValueChange={(value) =>
                setForm((state) => ({ ...state, category: value as ExpenseCategory }))
              }
            >
              <SelectTrigger id="expense-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="expense-date" label="Date" error={errors.date}>
            <Input
              id="expense-date"
              type="date"
              value={form.date}
              onChange={(event) => setForm((state) => ({ ...state, date: event.target.value }))}
            />
          </FormField>

          <FormField id="expense-note" label="Note" hint="Optional">
            <Input
              id="expense-note"
              value={form.description}
              placeholder="e.g. Lunch"
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
              {isSaving ? 'Saving...' : isEditing ? 'Save changes' : 'Save expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
