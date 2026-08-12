import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Udhaar } from '@/types';
import { formatDate } from '@/utils/date';
import { formatMoney } from '@/utils/money';
import { statusLabel, statusVariant, udhaarMeaning } from './udhaarMeta';

interface UdhaarCardProps {
  record: Udhaar;
  onClick: (record: Udhaar) => void;
}

export function UdhaarCard({ record, onClick }: UdhaarCardProps) {
  const gave = record.type === 'I_GAVE';
  const settled = record.status === 'SETTLED';
  const paidBack = record.originalAmount - record.remainingAmount;
  const progress = record.originalAmount > 0 ? (paidBack / record.originalAmount) * 100 : 0;

  return (
    <button
      type="button"
      onClick={() => onClick(record)}
      className="w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            gave ? 'bg-success/12 text-success' : 'bg-warning/12 text-warning',
          )}
        >
          {gave ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold">{record.personName}</p>
            <Badge variant={statusVariant[record.status]}>{statusLabel[record.status]}</Badge>
          </div>

          <p className="mt-0.5 truncate text-xs text-muted-foreground">{udhaarMeaning(record)}</p>

          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">
                {settled ? 'Original amount' : 'Remaining'}
              </p>
              <p
                className={cn(
                  'text-lg font-semibold tabular',
                  settled ? 'text-muted-foreground' : gave ? 'text-success' : 'text-warning',
                )}
              >
                {formatMoney(settled ? record.originalAmount : record.remainingAmount)}
              </p>
            </div>
            <p className="pb-1 text-xs text-muted-foreground">{formatDate(record.date)}</p>
          </div>

          {paidBack > 0 && !settled ? (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full', gave ? 'bg-success' : 'bg-warning')}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatMoney(paidBack)} of {formatMoney(record.originalAmount)} settled
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}
