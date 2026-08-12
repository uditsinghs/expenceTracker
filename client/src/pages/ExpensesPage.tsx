import { useMemo, useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { DataState } from '@/components/common/DataState';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { RecordActions } from '@/components/common/RecordActions';
import { useQuickActions } from '@/components/providers/QuickActionsProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { categoryMeta } from '@/features/expenses/categoryMeta';
import {
  ExpenseFilters,
  defaultExpenseFilters,
  type ExpenseFilterState,
} from '@/features/expenses/ExpenseFilters';
import { useExpenseMutations } from '@/hooks/useExpenses';
import { useFinanceData } from '@/hooks/useFinanceData';
import type { Expense } from '@/types';
import {
  formatDate,
  formatMonthLabelShort,
  isInMonth,
  isWithinRange,
  shiftMonth,
} from '@/utils/date';
import { totalExpenses } from '@/utils/calculations';
import { formatMoney } from '@/utils/money';

export function ExpensesPage() {
  const { expenses, month, isLoading, isError, refetch } = useFinanceData();
  const { addExpense, editExpense } = useQuickActions();
  const { remove } = useExpenseMutations();
  const [filters, setFilters] = useState<ExpenseFilterState>(defaultExpenseFilters);

  const previousMonth = shiftMonth(month, -1);

  const visible = useMemo(() => {
    const term = filters.search.trim().toLowerCase();

    return expenses.filter((expense) => {
      if (filters.period === 'current' && !isInMonth(expense.date, month)) return false;
      if (filters.period === 'previous' && !isInMonth(expense.date, previousMonth)) return false;
      if (
        filters.period === 'custom' &&
        !isWithinRange(expense.date, filters.from || undefined, filters.to || undefined)
      ) {
        return false;
      }
      if (filters.category !== 'all' && expense.category !== filters.category) return false;
      if (term) {
        const haystack = `${expense.description} ${expense.category}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [expenses, filters, month, previousMonth]);

  const periodTotal = totalExpenses(visible);
  const hasFilters =
    filters.search.trim().length > 0 || filters.category !== 'all' || filters.period !== 'current';

  return (
    <div className="space-y-4">
      <PageHeader
        title="Expenses"
        description="Everything you spent."
        action={
          <Button size="sm" onClick={() => addExpense()}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        }
      />

      <DataState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <ExpenseFilters
          value={filters}
          onChange={setFilters}
          currentMonthLabel={formatMonthLabelShort(month)}
          previousMonthLabel={formatMonthLabelShort(previousMonth)}
        />

        <Card>
          <CardContent className="flex items-center justify-between p-4 sm:p-5">
            <div>
              <p className="text-xs text-muted-foreground">Total for selected period</p>
              <p className="mt-1 text-2xl font-semibold tabular">{formatMoney(periodTotal)}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {visible.length} {visible.length === 1 ? 'expense' : 'expenses'}
            </p>
          </CardContent>
        </Card>

        {visible.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={hasFilters ? 'No expenses match these filters' : 'No expenses yet'}
            description={
              hasFilters
                ? 'Try a different period or category.'
                : 'Start tracking where your money goes.'
            }
            action={
              hasFilters ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFilters(defaultExpenseFilters)}
                >
                  Clear filters
                </Button>
              ) : (
                <Button size="sm" onClick={() => addExpense()}>
                  <Plus className="h-4 w-4" />
                  Add expense
                </Button>
              )
            }
          />
        ) : (
          <Card>
            <CardContent className="divide-y divide-border p-2 sm:p-3">
              {visible.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onEdit={() => editExpense(expense)}
                  onDelete={() => remove.mutate(expense.id)}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </DataState>
    </div>
  );
}

interface ExpenseRowProps {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
}

function ExpenseRow({ expense, onEdit, onDelete }: ExpenseRowProps) {
  const meta = categoryMeta[expense.category];

  return (
    <div className="flex items-center gap-3 px-1 py-3">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.chip}`}
      >
        <meta.icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{expense.description || expense.category}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {expense.category} · {formatDate(expense.date)}
        </p>
      </div>

      <p className="shrink-0 text-sm font-semibold tabular">-{formatMoney(expense.amount)}</p>

      <RecordActions
        onEdit={onEdit}
        onDelete={onDelete}
        deleteTitle="Delete this expense?"
        deleteDescription={`${expense.description || expense.category} of ${formatMoney(expense.amount)} will be removed and your balance will be recalculated.`}
      />
    </div>
  );
}
