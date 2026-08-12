import { PieChart } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { categoryMeta } from '@/features/expenses/categoryMeta';
import { cn } from '@/lib/utils';
import type { CategoryTotal } from '@/utils/calculations';
import { formatMoney } from '@/utils/money';

interface ExpenseBreakdownCardProps {
  breakdown: CategoryTotal[];
  /** Keeps the dashboard short; the expenses page shows everything. */
  limit?: number;
}

export function ExpenseBreakdownCard({ breakdown, limit = 5 }: ExpenseBreakdownCardProps) {
  const rows = breakdown.slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState
            icon={PieChart}
            title="Nothing to break down yet"
            description="Add an expense to see where your money goes."
            className="border-0 py-6"
          />
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const meta = categoryMeta[row.category];
              return (
                <div key={row.category}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <meta.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {row.category}
                    </span>
                    <span className="font-medium tabular">{formatMoney(row.total)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn('h-full rounded-full', meta.bar)}
                      style={{ width: `${Math.max(row.percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {breakdown.length > limit ? (
              <p className="pt-1 text-xs text-muted-foreground">
                +{breakdown.length - limit} more{' '}
                {breakdown.length - limit === 1 ? 'category' : 'categories'}
              </p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
