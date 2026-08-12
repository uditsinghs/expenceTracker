import { HandCoins, Plus, TrendingUp, Wallet } from 'lucide-react';
import { useQuickActions } from '@/components/providers/QuickActionsProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function QuickActionsCard() {
  const { addExpense, addIncome, addUdhaar, recordPayment } = useQuickActions();

  const actions = [
    { label: 'Add expense', icon: Wallet, onClick: () => addExpense() },
    { label: 'Add income', icon: TrendingUp, onClick: () => addIncome() },
    { label: 'Add udhaar', icon: HandCoins, onClick: () => addUdhaar() },
    { label: 'Record payment', icon: Plus, onClick: () => recordPayment() },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className="flex items-center gap-2 rounded-xl border border-border px-3 py-3 text-left text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <action.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 truncate">{action.label}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
