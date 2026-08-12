import { HandCoins, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { MonthlySummary, UdhaarSummary } from '@/utils/calculations';
import { formatMoney } from '@/utils/money';

interface SummaryCardsProps {
  summary: MonthlySummary;
  udhaar: UdhaarSummary;
}

export function SummaryCards({ summary, udhaar }: SummaryCardsProps) {
  const netLabel =
    udhaar.netOutstanding > 0
      ? 'Net to receive'
      : udhaar.netOutstanding < 0
        ? 'Net to pay'
        : 'All clear';

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Income"
        value={formatMoney(summary.totalIncome)}
        icon={TrendingUp}
        chip="bg-success/12 text-success"
      />
      <StatCard
        label="Expenses"
        value={formatMoney(summary.totalExpenses)}
        icon={TrendingDown}
        chip="bg-destructive/12 text-destructive"
      />
      <StatCard
        label="Available"
        value={formatMoney(summary.availableBalance)}
        icon={Wallet}
        chip="bg-primary/10 text-foreground"
        valueClassName={summary.availableBalance < 0 ? 'text-destructive' : undefined}
        hint={summary.availableBalance < 0 ? 'You have overspent this month' : undefined}
      />
      <StatCard
        label="Outstanding udhaar"
        value={formatMoney(Math.abs(udhaar.netOutstanding))}
        icon={HandCoins}
        chip="bg-warning/12 text-warning"
        hint={netLabel}
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: typeof Wallet;
  chip: string;
  hint?: string;
  valueClassName?: string;
}

function StatCard({ label, value, icon: Icon, chip, hint, valueClassName }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className={cn('flex h-7 w-7 items-center justify-center rounded-full', chip)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className={cn('mt-2 text-xl font-semibold tabular sm:text-2xl', valueClassName)}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}
