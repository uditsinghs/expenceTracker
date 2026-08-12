import { useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useUdhaarMutations } from '@/hooks/useUdhaar';
import { cn } from '@/lib/utils';
import type { Udhaar } from '@/types';
import { formatDate } from '@/utils/date';
import { formatMoney } from '@/utils/money';
import { repaymentWording, statusLabel, statusVariant, typeLabel, udhaarMeaning } from './udhaarMeta';

interface UdhaarDetailDialogProps {
  record: Udhaar | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (record: Udhaar) => void;
  onRecordPayment: (record: Udhaar) => void;
}

export function UdhaarDetailDialog({
  record,
  open,
  onOpenChange,
  onEdit,
  onRecordPayment,
}: UdhaarDetailDialogProps) {
  const { remove, removeRepayment } = useUdhaarMutations();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [repaymentToDelete, setRepaymentToDelete] = useState<string | null>(null);

  if (!record) return null;

  const gave = record.type === 'I_GAVE';
  const wording = repaymentWording(record.type);
  const paidBack = record.originalAmount - record.remainingAmount;
  const timeline = [...record.repayments].sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {record.personName}
              <Badge variant={statusVariant[record.status]}>{statusLabel[record.status]}</Badge>
            </DialogTitle>
            <DialogDescription>{udhaarMeaning(record)}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/60 p-3 text-center">
            <Figure label="Original" value={formatMoney(record.originalAmount)} />
            <Figure label={wording.past} value={formatMoney(paidBack)} />
            <Figure
              label="Remaining"
              value={formatMoney(record.remainingAmount)}
              className={cn(
                record.remainingAmount > 0 ? (gave ? 'text-success' : 'text-warning') : undefined,
              )}
            />
          </div>

          {record.description ? (
            <p className="text-sm text-muted-foreground">{record.description}</p>
          ) : null}

          <div>
            <p className="mb-2 text-sm font-medium">Timeline</p>
            <ol className="space-y-3">
              <TimelineEntry
                date={formatDate(record.date)}
                title={`${typeLabel[record.type]} ${formatMoney(record.originalAmount)}`}
                tone="start"
              />
              {timeline.map((repayment) => (
                <TimelineEntry
                  key={repayment.id}
                  date={formatDate(repayment.date)}
                  title={`${wording.past} ${formatMoney(repayment.amount)}`}
                  note={repayment.note}
                  onRemove={() => setRepaymentToDelete(repayment.id)}
                />
              ))}
            </ol>
            {timeline.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">No payments recorded yet.</p>
            ) : null}
          </div>

          <Separator />

          <div className="flex flex-col gap-2 sm:flex-row">
            {record.status !== 'SETTLED' ? (
              <Button className="flex-1" onClick={() => onRecordPayment(record)}>
                <Plus className="h-4 w-4" />
                Record payment
              </Button>
            ) : null}
            <Button variant="outline" className="flex-1" onClick={() => onEdit(record)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this udhaar?"
        description={`The record for ${record.personName} and its ${record.repayments.length} payment entries will be permanently removed.`}
        onConfirm={() => {
          remove.mutate(record.id);
          setConfirmDelete(false);
          onOpenChange(false);
        }}
      />

      <ConfirmDialog
        open={repaymentToDelete !== null}
        onOpenChange={(value) => !value && setRepaymentToDelete(null)}
        title="Remove this payment?"
        description="The remaining amount and status will be recalculated."
        confirmLabel="Remove"
        onConfirm={() => {
          if (repaymentToDelete) {
            removeRepayment.mutate({ id: record.id, repaymentId: repaymentToDelete });
          }
          setRepaymentToDelete(null);
        }}
      />
    </>
  );
}

function Figure({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-0.5 text-sm font-semibold tabular', className)}>{value}</p>
    </div>
  );
}

interface TimelineEntryProps {
  date: string;
  title: string;
  note?: string;
  tone?: 'start';
  onRemove?: () => void;
}

function TimelineEntry({ date, title, note, tone, onRemove }: TimelineEntryProps) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1.5 flex flex-col items-center">
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            tone === 'start' ? 'bg-foreground' : 'bg-muted-foreground/50',
          )}
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">
          {date}
          {note ? ` · ${note}` : ''}
        </p>
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove payment"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </li>
  );
}
