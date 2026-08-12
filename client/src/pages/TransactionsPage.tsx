import { useMemo, useState } from 'react';
import { Receipt, Search } from 'lucide-react';
import { DataState } from '@/components/common/DataState';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { TransactionRow } from '@/components/common/TransactionRow';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFinanceData } from '@/hooks/useFinanceData';
import { EXPENSE_CATEGORIES, type Transaction, type TransactionKind } from '@/types';
import { formatMonthLabel, formatMonthLabelShort } from '@/utils/date';
import { formatMoney } from '@/utils/money';

type TypeFilter = 'all' | 'INCOME' | 'EXPENSE' | 'UDHAAR';
type ScopeFilter = 'month' | 'all';

const udhaarKinds: TransactionKind[] = [
  'UDHAAR_GIVEN',
  'UDHAAR_TAKEN',
  'UDHAAR_RECEIVED',
  'UDHAAR_REPAID',
];

export function TransactionsPage() {
  const { transactions, allTransactions, month, isLoading, isError, refetch } = useFinanceData();

  const [search, setSearch] = useState('');
  const [type, setType] = useState<TypeFilter>('all');
  const [category, setCategory] = useState('all');
  const [scope, setScope] = useState<ScopeFilter>('month');

  const source = scope === 'month' ? transactions : allTransactions;

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    return source.filter((row) => {
      if (type === 'INCOME' && row.kind !== 'INCOME') return false;
      if (type === 'EXPENSE' && row.kind !== 'EXPENSE') return false;
      if (type === 'UDHAAR' && !udhaarKinds.includes(row.kind)) return false;
      if (category !== 'all' && !(row.kind === 'EXPENSE' && row.subtitle === category)) return false;
      if (term) {
        const haystack = `${row.title} ${row.subtitle}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [source, search, type, category]);

  const totals = useMemo(() => summarise(visible), [visible]);
  const hasFilters = search.trim().length > 0 || type !== 'all' || category !== 'all';

  return (
    <div className="space-y-4">
      <PageHeader
        title="Transactions"
        description={scope === 'month' ? formatMonthLabel(month) : 'All time'}
      />

      <DataState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by description or person"
              className="pl-9"
              aria-label="Search transactions"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Select value={scope} onValueChange={(value) => setScope(value as ScopeFilter)}>
              <SelectTrigger aria-label="Period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">{formatMonthLabelShort(month)}</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={type} onValueChange={(value) => setType(value as TypeFilter)}>
              <SelectTrigger aria-label="Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="UDHAAR">Udhaar</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger aria-label="Category" className="col-span-2 sm:col-span-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {EXPENSE_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-4 sm:p-5">
            <div>
              <p className="text-xs text-muted-foreground">Money in</p>
              <p className="mt-1 text-lg font-semibold tabular text-success">
                {formatMoney(totals.inflow)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Money out</p>
              <p className="mt-1 text-lg font-semibold tabular">{formatMoney(totals.outflow)}</p>
            </div>
          </CardContent>
        </Card>

        {visible.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={hasFilters ? 'No matching transactions' : 'No transactions yet'}
            description={
              hasFilters
                ? 'Try clearing the search or filters.'
                : 'Add income, an expense or an udhaar to get started.'
            }
            action={
              hasFilters ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setType('all');
                    setCategory('all');
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Card>
            <CardContent className="divide-y divide-border p-2 sm:p-3">
              {visible.map((row) => (
                <TransactionRow key={row.id} transaction={row} />
              ))}
            </CardContent>
          </Card>
        )}
      </DataState>
    </div>
  );
}

function summarise(rows: Transaction[]) {
  let inflow = 0;
  let outflow = 0;
  for (const row of rows) {
    if (row.amount >= 0) inflow += row.amount;
    else outflow += Math.abs(row.amount);
  }
  return { inflow, outflow };
}
