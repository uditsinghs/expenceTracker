import { Database, Moon, Sun } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useTheme } from '@/hooks/useTheme';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { income, expenses, udhaar } = useFinanceData();

  const repaymentCount = udhaar.reduce((total, record) => total + record.repayments.length, 0);

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" description="Appearance and data." />

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setTheme('light')}
          >
            <Sun className="h-4 w-4" />
            Light
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setTheme('dark')}
          >
            <Moon className="h-4 w-4" />
            Dark
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Your data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Income entries" value={income.length} />
          <Row label="Expenses" value={expenses.length} />
          <Row label="Udhaar records" value={udhaar.length} />
          <Row label="Payment entries" value={repaymentCount} />
          <Separator className="my-2" />
          <p className="text-xs text-muted-foreground">
            Everything is stored in MongoDB through the MoneyTrack API, so your records stay
            available after a refresh and across devices.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular">{value}</span>
    </div>
  );
}
