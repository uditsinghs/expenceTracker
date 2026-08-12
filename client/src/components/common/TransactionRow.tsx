import { ArrowDownLeft, ArrowUpRight, HandCoins, Wallet, type LucideIcon } from 'lucide-react';
import { categoryMeta } from '@/features/expenses/categoryMeta';
import { cn } from '@/lib/utils';
import type { Transaction, TransactionKind, ExpenseCategory } from '@/types';
import { formatDateShort } from '@/utils/date';
import { formatSignedMoney } from '@/utils/money';

interface RowVisual {
  icon: LucideIcon;
  chip: string;
}

function visualFor(transaction: Transaction): RowVisual {
  const kind: TransactionKind = transaction.kind;

  if (kind === 'EXPENSE') {
    const meta = categoryMeta[transaction.subtitle as ExpenseCategory];
    return meta
      ? { icon: meta.icon, chip: meta.chip }
      : { icon: Wallet, chip: 'bg-muted text-muted-foreground' };
  }
  if (kind === 'INCOME') {
    return { icon: Wallet, chip: 'bg-success/12 text-success' };
  }
  if (kind === 'UDHAAR_GIVEN' || kind === 'UDHAAR_REPAID') {
    return { icon: ArrowUpRight, chip: 'bg-warning/12 text-warning' };
  }
  return { icon: ArrowDownLeft, chip: 'bg-primary/10 text-foreground' };
}

const kindLabel: Record<TransactionKind, string> = {
  INCOME: 'Income',
  EXPENSE: 'Expense',
  UDHAAR_GIVEN: 'Udhaar given',
  UDHAAR_TAKEN: 'Udhaar taken',
  UDHAAR_RECEIVED: 'Udhaar received',
  UDHAAR_REPAID: 'Udhaar repaid',
};

interface TransactionRowProps {
  transaction: Transaction;
  onClick?: (transaction: Transaction) => void;
}

export function TransactionRow({ transaction, onClick }: TransactionRowProps) {
  const { icon: Icon, chip } = visualFor(transaction);
  const isUdhaar = transaction.kind !== 'INCOME' && transaction.kind !== 'EXPENSE';
  const positive = transaction.amount > 0;

  const content = (
    <>
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', chip)}>
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{transaction.title}</span>
          {isUdhaar ? <HandCoins className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : null}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {kindLabel[transaction.kind]}
          {transaction.subtitle && transaction.subtitle !== kindLabel[transaction.kind]
            ? ` · ${transaction.subtitle}`
            : ''}
        </span>
      </span>

      <span className="shrink-0 text-right">
        <span
          className={cn(
            'block text-sm font-semibold tabular',
            positive ? 'text-success' : 'text-foreground',
          )}
        >
          {formatSignedMoney(transaction.amount)}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {formatDateShort(transaction.date)}
        </span>
      </span>
    </>
  );

  if (!onClick) {
    return <div className="flex items-center gap-3 px-1 py-3">{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => onClick(transaction)}
      className="flex w-full items-center gap-3 rounded-lg px-1 py-3 text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </button>
  );
}
