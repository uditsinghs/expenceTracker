import { Link } from 'react-router-dom';
import { ArrowRight, Receipt } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { TransactionRow } from '@/components/common/TransactionRow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuickActions } from '@/components/providers/QuickActionsProvider';
import type { Transaction } from '@/types';

interface RecentTransactionsCardProps {
  transactions: Transaction[];
  limit?: number;
}

export function RecentTransactionsCard({ transactions, limit = 6 }: RecentTransactionsCardProps) {
  const { addExpense } = useQuickActions();
  const rows = transactions.slice(0, limit);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="min-w-0 truncate">Recent transactions</CardTitle>
        {transactions.length > 0 ? (
          <Link
            to="/transactions"
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        ) : null}
      </CardHeader>

      <CardContent>
        {rows.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Nothing here yet"
            description="Your income, expenses and udhaar for this month will show up here."
            action={
              <Button size="sm" onClick={() => addExpense()}>
                Add expense
              </Button>
            }
            className="border-0 py-6"
          />
        ) : (
          <div className="divide-y divide-border">
            {rows.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
