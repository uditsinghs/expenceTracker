import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatMoney, formatSignedMoney } from '@/utils/money';

interface CashFlowCardProps {
  cashFlow: {
    income: number;
    expenses: number;
    udhaarIn: number;
    udhaarOut: number;
    netCashFlow: number;
  };
}

export function CashFlowCard({ cashFlow }: CashFlowCardProps) {
  const hasUdhaarMovement = cashFlow.udhaarIn > 0 || cashFlow.udhaarOut > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash flow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <Row label="Income" value={formatMoney(cashFlow.income)} />
        <Row label="Expenses" value={formatSignedMoney(-cashFlow.expenses)} />

        {hasUdhaarMovement ? (
          <>
            <Row label="Udhaar received" value={formatSignedMoney(cashFlow.udhaarIn)} muted />
            <Row label="Udhaar given out" value={formatSignedMoney(-cashFlow.udhaarOut)} muted />
          </>
        ) : null}

        <Separator className="my-1" />

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Net cash flow</span>
          <span
            className={cn(
              'text-base font-semibold tabular',
              cashFlow.netCashFlow < 0 ? 'text-destructive' : 'text-success',
            )}
          >
            {formatSignedMoney(cashFlow.netCashFlow)}
          </span>
        </div>

        {hasUdhaarMovement ? (
          <p className="pt-1 text-xs text-muted-foreground">
            Udhaar is counted as cash movement only, never as income or expense.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={cn(muted ? 'text-muted-foreground' : 'text-foreground')}>{label}</span>
      <span className="font-medium tabular">{value}</span>
    </div>
  );
}
