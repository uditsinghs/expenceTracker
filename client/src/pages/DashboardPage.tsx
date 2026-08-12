import { CashFlowCard } from '@/features/dashboard/CashFlowCard';
import { ExpenseBreakdownCard } from '@/features/dashboard/ExpenseBreakdownCard';
import { QuickActionsCard } from '@/features/dashboard/QuickActionsCard';
import { RecentTransactionsCard } from '@/features/dashboard/RecentTransactionsCard';
import { SummaryCards } from '@/features/dashboard/SummaryCards';
import { UdhaarSummaryCard } from '@/features/dashboard/UdhaarSummaryCard';
import { useFinanceData } from '@/hooks/useFinanceData';
import { formatMonthLabel, greeting } from '@/utils/date';
import { DataState } from '@/components/common/DataState';

export function DashboardPage() {
  const data = useFinanceData();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">{greeting()} 👋</h1>
        <p className="text-sm text-muted-foreground">{formatMonthLabel(data.month)}</p>
      </div>

      <DataState isLoading={data.isLoading} isError={data.isError} onRetry={data.refetch}>
        <div className="space-y-4">
          <SummaryCards summary={data.summary} udhaar={data.udhaarSummary} />

          {/* min-w-0 keeps the grid tracks from being widened by their content. */}
          <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
            <CashFlowCard cashFlow={data.cashFlow} />
            <UdhaarSummaryCard summary={data.udhaarSummary} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
            <RecentTransactionsCard transactions={data.transactions} />
            <div className="space-y-4">
              <ExpenseBreakdownCard breakdown={data.categoryBreakdown} />
              <QuickActionsCard />
            </div>
          </div>
        </div>
      </DataState>
    </div>
  );
}
