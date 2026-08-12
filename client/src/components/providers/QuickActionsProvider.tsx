import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { ExpenseFormDialog } from '@/features/expenses/ExpenseFormDialog';
import { IncomeFormDialog } from '@/features/income/IncomeFormDialog';
import { RecordPaymentDialog } from '@/features/udhaar/RecordPaymentDialog';
import { UdhaarFormDialog } from '@/features/udhaar/UdhaarFormDialog';
import type { Expense, Income, Udhaar, UdhaarType } from '@/types';

interface QuickActionsValue {
  addIncome: (defaultDate?: string) => void;
  editIncome: (record: Income) => void;
  addExpense: (defaultDate?: string) => void;
  editExpense: (record: Expense) => void;
  addUdhaar: (type?: UdhaarType) => void;
  editUdhaar: (record: Udhaar) => void;
  recordPayment: (record?: Udhaar) => void;
}

const QuickActionsContext = createContext<QuickActionsValue | null>(null);

/**
 * Every add/edit form lives here once, so any screen can open one without
 * duplicating dialog state.
 */
export function QuickActionsProvider({ children }: { children: ReactNode }) {
  const [incomeState, setIncomeState] = useState<{ open: boolean; record: Income | null; date?: string }>(
    { open: false, record: null },
  );
  const [expenseState, setExpenseState] = useState<{
    open: boolean;
    record: Expense | null;
    date?: string;
  }>({ open: false, record: null });
  const [udhaarState, setUdhaarState] = useState<{
    open: boolean;
    record: Udhaar | null;
    type: UdhaarType | null;
  }>({ open: false, record: null, type: null });
  const [paymentState, setPaymentState] = useState<{ open: boolean; record: Udhaar | null }>({
    open: false,
    record: null,
  });

  const value = useMemo<QuickActionsValue>(
    () => ({
      addIncome: (date) => setIncomeState({ open: true, record: null, date }),
      editIncome: (record) => setIncomeState({ open: true, record }),
      addExpense: (date) => setExpenseState({ open: true, record: null, date }),
      editExpense: (record) => setExpenseState({ open: true, record }),
      addUdhaar: (type) => setUdhaarState({ open: true, record: null, type: type ?? null }),
      editUdhaar: (record) => setUdhaarState({ open: true, record, type: record.type }),
      recordPayment: (record) => setPaymentState({ open: true, record: record ?? null }),
    }),
    [],
  );

  return (
    <QuickActionsContext.Provider value={value}>
      {children}

      <IncomeFormDialog
        open={incomeState.open}
        onOpenChange={(open) => setIncomeState((state) => ({ ...state, open }))}
        record={incomeState.record}
        defaultDate={incomeState.date}
      />
      <ExpenseFormDialog
        open={expenseState.open}
        onOpenChange={(open) => setExpenseState((state) => ({ ...state, open }))}
        record={expenseState.record}
        defaultDate={expenseState.date}
      />
      <UdhaarFormDialog
        open={udhaarState.open}
        onOpenChange={(open) => setUdhaarState((state) => ({ ...state, open }))}
        record={udhaarState.record}
        initialType={udhaarState.type}
      />
      <RecordPaymentDialog
        open={paymentState.open}
        onOpenChange={(open) => setPaymentState((state) => ({ ...state, open }))}
        record={paymentState.record}
      />
    </QuickActionsContext.Provider>
  );
}

export function useQuickActions(): QuickActionsValue {
  const context = useContext(QuickActionsContext);
  if (!context) throw new Error('useQuickActions must be used inside a QuickActionsProvider');
  return context;
}
