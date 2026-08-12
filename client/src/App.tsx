import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { QuickActionsProvider } from '@/components/providers/QuickActionsProvider';
import { MonthProvider } from '@/hooks/useMonth';
import { ThemeProvider } from '@/hooks/useTheme';
import { DashboardPage } from '@/pages/DashboardPage';
import { ExpensesPage } from '@/pages/ExpensesPage';
import { IncomePage } from '@/pages/IncomePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { UdhaarPage } from '@/pages/UdhaarPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MonthProvider>
          <Router>
            <QuickActionsProvider>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/udhaar" element={<UdhaarPage />} />
                  <Route path="/income" element={<IncomePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </QuickActionsProvider>
          </Router>
        </MonthProvider>
      </ThemeProvider>

      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
