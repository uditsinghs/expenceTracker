import { useMemo, useState } from 'react';
import { HandCoins, Plus, Search } from 'lucide-react';
import { DataState } from '@/components/common/DataState';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { useQuickActions } from '@/components/providers/QuickActionsProvider';
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
import { UdhaarCard } from '@/features/udhaar/UdhaarCard';
import { UdhaarDetailDialog } from '@/features/udhaar/UdhaarDetailDialog';
import { useFinanceData } from '@/hooks/useFinanceData';
import type { Udhaar } from '@/types';
import { formatMoney } from '@/utils/money';

type UdhaarFilter =
  | 'all'
  | 'I_GAVE'
  | 'I_TOOK'
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'SETTLED';

const filterOptions: { value: UdhaarFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'I_GAVE', label: 'I gave' },
  { value: 'I_TOOK', label: 'I took' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PARTIALLY_PAID', label: 'Partially paid' },
  { value: 'SETTLED', label: 'Settled' },
];

export function UdhaarPage() {
  const { udhaar, udhaarSummary, isLoading, isError, refetch } = useFinanceData();
  const { addUdhaar, editUdhaar, recordPayment } = useQuickActions();

  const [filter, setFilter] = useState<UdhaarFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    return udhaar.filter((record) => {
      if (filter === 'I_GAVE' || filter === 'I_TOOK') {
        if (record.type !== filter) return false;
      } else if (filter !== 'all' && record.status !== filter) {
        return false;
      }
      if (term) {
        const haystack = `${record.personName} ${record.description}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [udhaar, filter, search]);

  // Read from the live list so the dialog updates right after a payment.
  const selected = udhaar.find((record) => record.id === selectedId) ?? null;
  const hasFilters = filter !== 'all' || search.trim().length > 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Udhaar"
        description="Money you gave and money you took."
        action={
          <Button size="sm" onClick={() => addUdhaar()}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        }
      />

      <DataState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <Card>
          <CardContent className="grid grid-cols-2 gap-3 p-4 sm:p-5">
            <div>
              <p className="text-xs text-muted-foreground">You will receive</p>
              <p className="mt-1 text-xl font-semibold tabular text-success">
                {formatMoney(udhaarSummary.toReceive)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">You need to pay</p>
              <p className="mt-1 text-xl font-semibold tabular text-warning">
                {formatMoney(udhaarSummary.toPay)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_11rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by person or note"
              className="pl-9"
              aria-label="Search udhaar"
            />
          </div>

          <Select value={filter} onValueChange={(value) => setFilter(value as UdhaarFilter)}>
            <SelectTrigger aria-label="Filter udhaar">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={HandCoins}
            title={hasFilters ? 'Nothing matches these filters' : 'No outstanding udhaar'}
            description={hasFilters ? 'Try a different filter or search.' : "You're all clear."}
            action={
              hasFilters ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFilter('all');
                    setSearch('');
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button size="sm" onClick={() => addUdhaar()}>
                  <Plus className="h-4 w-4" />
                  Add udhaar
                </Button>
              )
            }
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2 [&>*]:min-w-0">
            {visible.map((record) => (
              <UdhaarCard
                key={record.id}
                record={record}
                onClick={(item: Udhaar) => setSelectedId(item.id)}
              />
            ))}
          </div>
        )}
      </DataState>

      <UdhaarDetailDialog
        record={selected}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onEdit={(record) => {
          setSelectedId(null);
          editUdhaar(record);
        }}
        onRecordPayment={(record) => {
          setSelectedId(null);
          recordPayment(record);
        }}
      />
    </div>
  );
}
