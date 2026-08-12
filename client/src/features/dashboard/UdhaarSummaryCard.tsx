import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UdhaarSummary } from '@/utils/calculations';
import { formatMoney } from '@/utils/money';

export function UdhaarSummaryCard({ summary }: { summary: UdhaarSummary }) {
  const allClear = summary.toReceive === 0 && summary.toPay === 0;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="min-w-0 truncate">Udhaar summary</CardTitle>
        <Link
          to="/udhaar"
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent>
        {allClear ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" />
            No outstanding udhaar. You&apos;re all clear.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-success/8 p-3">
              <p className="text-xs text-muted-foreground">You will receive</p>
              <p className="mt-1 text-lg font-semibold tabular text-success">
                {formatMoney(summary.toReceive)}
              </p>
            </div>
            <div className="rounded-xl bg-warning/8 p-3">
              <p className="text-xs text-muted-foreground">You need to pay</p>
              <p className="mt-1 text-lg font-semibold tabular text-warning">
                {formatMoney(summary.toPay)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
