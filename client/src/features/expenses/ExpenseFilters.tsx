import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EXPENSE_CATEGORIES } from '@/types';

export type PeriodFilter = 'current' | 'previous' | 'custom' | 'all';

export interface ExpenseFilterState {
  period: PeriodFilter;
  from: string;
  to: string;
  category: string;
  search: string;
}

export const defaultExpenseFilters: ExpenseFilterState = {
  period: 'current',
  from: '',
  to: '',
  category: 'all',
  search: '',
};

interface ExpenseFiltersProps {
  value: ExpenseFilterState;
  onChange: (value: ExpenseFilterState) => void;
  /** Label for the "current" option, which follows the month switcher. */
  currentMonthLabel: string;
  previousMonthLabel: string;
}

export function ExpenseFilters({
  value,
  onChange,
  currentMonthLabel,
  previousMonthLabel,
}: ExpenseFiltersProps) {
  const update = (patch: Partial<ExpenseFilterState>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value.search}
          onChange={(event) => update({ search: event.target.value })}
          placeholder="Search by note or category"
          className="pl-9"
          aria-label="Search expenses"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Select
          value={value.period}
          onValueChange={(period) => update({ period: period as PeriodFilter })}
        >
          <SelectTrigger aria-label="Period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">{currentMonthLabel}</SelectItem>
            <SelectItem value="previous">{previousMonthLabel}</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>

        <Select value={value.category} onValueChange={(category) => update({ category })}>
          <SelectTrigger aria-label="Category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {EXPENSE_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {value.period === 'custom' ? (
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={value.from}
            onChange={(event) => update({ from: event.target.value })}
            aria-label="From date"
          />
          <Input
            type="date"
            value={value.to}
            onChange={(event) => update({ to: event.target.value })}
            aria-label="To date"
          />
        </div>
      ) : null}
    </div>
  );
}
