import { Plus, TrendingUp } from 'lucide-react';
import { DataState } from '@/components/common/DataState';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { RecordActions } from '@/components/common/RecordActions';
import { useQuickActions } from '@/components/providers/QuickActionsProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useIncomeMutations } from '@/hooks/useIncome';
import type { Income } from '@/types';
import { formatDate, formatMonthLabel } from '@/utils/date';
import { formatMoney } from '@/utils/money';

export function IncomePage() {
  const { monthIncome, summary, month, isLoading, isError, refetch } = useFinanceData();
  const { addIncome, editIncome } = useQuickActions();
  const { remove } = useIncomeMutations();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Income"
        description={formatMonthLabel(month)}
        action={
          <Button size="sm" onClick={() => addIncome()}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        }
      />

      <DataState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <Card>
          <CardContent className="flex items-center justify-between p-4 sm:p-5">
            <div>
              <p className="text-xs text-muted-foreground">Total income this month</p>
              <p className="mt-1 text-2xl font-semibold tabular text-success">
                {formatMoney(summary.totalIncome)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {monthIncome.length} {monthIncome.length === 1 ? 'entry' : 'entries'}
            </p>
          </CardContent>
        </Card>

        {monthIncome.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No income added for this month"
            description="Add your salary or any other money you received."
            action={
              <Button size="sm" onClick={() => addIncome()}>
                <Plus className="h-4 w-4" />
                Add income
              </Button>
            }
          />
        ) : (
          <Card>
            <CardContent className="divide-y divide-border p-2 sm:p-3">
              {monthIncome.map((record) => (
                <IncomeRow
                  key={record.id}
                  record={record}
                  onEdit={() => editIncome(record)}
                  onDelete={() => remove.mutate(record.id)}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </DataState>
    </div>
  );
}

interface IncomeRowProps {
  record: Income;
  onEdit: () => void;
  onDelete: () => void;
}

function IncomeRow({ record, onEdit, onDelete }: IncomeRowProps) {
  return (
    <div className="flex items-center gap-3 px-1 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/12 text-success">
        <TrendingUp className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{record.source}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {formatDate(record.date)}
          {record.description ? ` · ${record.description}` : ''}
        </p>
      </div>

      <p className="shrink-0 text-sm font-semibold tabular text-success">
        +{formatMoney(record.amount)}
      </p>

      <RecordActions
        onEdit={onEdit}
        onDelete={onDelete}
        deleteTitle="Delete this income?"
        deleteDescription={`${record.source} of ${formatMoney(record.amount)} will be removed and your balance will be recalculated.`}
      />
    </div>
  );
}
