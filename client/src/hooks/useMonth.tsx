import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { currentMonthKey, shiftMonth, type MonthKey } from '@/utils/date';

interface MonthContextValue {
  month: MonthKey;
  setMonth: (month: MonthKey) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
  isCurrentMonth: boolean;
}

const MonthContext = createContext<MonthContextValue | null>(null);

/** The selected month is shared so the dashboard and lists stay in sync. */
export function MonthProvider({ children }: { children: ReactNode }) {
  const [month, setMonth] = useState<MonthKey>(currentMonthKey);

  const goToPreviousMonth = useCallback(() => setMonth((value) => shiftMonth(value, -1)), []);
  const goToNextMonth = useCallback(() => setMonth((value) => shiftMonth(value, 1)), []);
  const goToCurrentMonth = useCallback(() => setMonth(currentMonthKey()), []);

  const value = useMemo(
    () => ({
      month,
      setMonth,
      goToPreviousMonth,
      goToNextMonth,
      goToCurrentMonth,
      isCurrentMonth: month === currentMonthKey(),
    }),
    [month, goToPreviousMonth, goToNextMonth, goToCurrentMonth],
  );

  return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>;
}

export function useMonth(): MonthContextValue {
  const context = useContext(MonthContext);
  if (!context) throw new Error('useMonth must be used inside a MonthProvider');
  return context;
}
