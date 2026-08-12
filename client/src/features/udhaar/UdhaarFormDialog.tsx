import { useEffect, useRef, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
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
import { useUdhaarMutations } from '@/hooks/useUdhaar';
import { cn } from '@/lib/utils';
import type { Udhaar, UdhaarType } from '@/types';
import { todayKey } from '@/utils/date';
import { parseAmount } from '@/utils/money';

interface UdhaarFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: Udhaar | null;
  /** Skips the "what happened" step when the entry point already knows the type. */
  initialType?: UdhaarType | null;
}

interface FormState {
  personName: string;
  amount: string;
  date: string;
  description: string;
}

const emptyForm = (): FormState => ({
  personName: '',
  amount: '',
  date: todayKey(),
  description: '',
});

export function UdhaarFormDialog({
  open,
  onOpenChange,
  record,
  initialType = null,
}: UdhaarFormDialogProps) {
  const { create, update } = useUdhaarMutations();
  const [type, setType] = useState<UdhaarType | null>(initialType);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const personRef = useRef<HTMLInputElement>(null);

  const isEditing = Boolean(record);

  useEffect(() => {
    if (!open) return;

    if (record) {
      setType(record.type);
      setForm({
        personName: record.personName,
        amount: String(record.originalAmount),
        date: record.date,
        description: record.description,
      });
    } else {
      setType(initialType);
      setForm(emptyForm());
    }
    setErrors({});
  }, [open, record, initialType]);

  useEffect(() => {
    if (!open || !type) return;
    // Person comes first here - the name is what the user is thinking about.
    const timer = window.setTimeout(() => personRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [open, type]);

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    const amount = parseAmount(form.amount);

    if (!form.personName.trim()) nextErrors.personName = 'Whose udhaar is this?';
    if (amount === null || amount <= 0) nextErrors.amount = 'Enter an amount greater than 0';
    if (!form.date) nextErrors.date = 'Pick a date';
    if (record && amount !== null) {
      const alreadyPaid = record.originalAmount - record.remainingAmount;
      if (amount < alreadyPaid) {
        nextErrors.amount = `Cannot be less than the ₹${alreadyPaid} already paid back`;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!type || !validate()) return;

    const input = {
      personName: form.personName.trim(),
      type,
      originalAmount: parseAmount(form.amount) as number,
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
  const gave = type === 'I_GAVE';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {!type ? (
          <>
            <DialogHeader>
              <DialogTitle>What happened?</DialogTitle>
              <DialogDescription>Pick the direction the money moved.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-3">
              <ChoiceButton
                icon={ArrowUpRight}
                title="I gave money"
                subtitle="Someone has to return it to me"
                onClick={() => setType('I_GAVE')}
              />
              <ChoiceButton
                icon={ArrowDownLeft}
                title="I took money"
                subtitle="I have to return it to them"
                onClick={() => setType('I_TOOK')}
              />
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit udhaar' : gave ? 'I gave money' : 'I took money'}
              </DialogTitle>
              <DialogDescription>
                {gave
                  ? 'This amount is expected to come back to you.'
                  : 'This amount has to be returned by you.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField id="udhaar-person" label="Person" error={errors.personName}>
                <Input
                  id="udhaar-person"
                  ref={personRef}
                  value={form.personName}
                  placeholder="e.g. Rahul"
                  aria-invalid={Boolean(errors.personName)}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, personName: event.target.value }))
                  }
                />
              </FormField>

              <FormField id="udhaar-amount" label="Amount" error={errors.amount}>
                <AmountField
                  id="udhaar-amount"
                  value={form.amount}
                  aria-invalid={Boolean(errors.amount)}
                  onChange={(event) => setForm((state) => ({ ...state, amount: event.target.value }))}
                />
              </FormField>

              <FormField id="udhaar-date" label="Date" error={errors.date}>
                <Input
                  id="udhaar-date"
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm((state) => ({ ...state, date: event.target.value }))}
                />
              </FormField>

              <FormField id="udhaar-note" label="Note" hint="Optional">
                <Input
                  id="udhaar-note"
                  value={form.description}
                  placeholder="e.g. For hospital"
                  onChange={(event) =>
                    setForm((state) => ({ ...state, description: event.target.value }))
                  }
                />
              </FormField>

              <DialogFooter>
                {!isEditing ? (
                  <Button type="button" variant="outline" onClick={() => setType(null)}>
                    Back
                  </Button>
                ) : (
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : isEditing ? 'Save changes' : 'Save udhaar'}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ChoiceButtonProps {
  icon: typeof ArrowUpRight;
  title: string;
  subtitle: string;
  onClick: () => void;
}

function ChoiceButton({ icon: Icon, title, subtitle, onClick }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border p-4 text-left transition-colors',
        'hover:border-foreground/25 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}
