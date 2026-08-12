import { NavLink, Outlet } from 'react-router-dom';
import { Plus, Wallet } from 'lucide-react';
import { useQuickActions } from '@/components/providers/QuickActionsProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { MonthSwitcher } from './MonthSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { navItems } from './navigation';

export function AppLayout() {
  const primaryItems = navItems.filter((item) => item.primary);

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />

      <div className="lg:pl-60">
        <TopBar />

        <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-4 sm:px-6 lg:max-w-5xl lg:pb-10">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur safe-bottom lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2">
          {primaryItems.slice(0, 2).map((item) => (
            <BottomNavLink key={item.to} to={item.to} label={item.label} icon={item.icon} />
          ))}

          <QuickAddButton />

          {primaryItems.slice(2).map((item) => (
            <BottomNavLink key={item.to} to={item.to} label={item.label} icon={item.icon} />
          ))}
          <BottomNavLink to="/settings" label="More" icon={navItems[navItems.length - 1].icon} />
        </div>
      </nav>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-card px-3 py-5 lg:flex">
      <div className="flex items-center gap-2 px-2 pb-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wallet className="h-4 w-4" />
        </span>
        <span className="text-base font-semibold">MoneyTrack</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <DesktopAddMenu />
    </aside>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-2 lg:hidden">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wallet className="h-4 w-4" />
        </span>
        <span className="hidden text-sm font-semibold xs:inline">MoneyTrack</span>
      </div>

      <div className="hidden lg:block" />

      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <MonthSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}

function DesktopAddMenu() {
  const { addExpense, addIncome, addUdhaar, recordPayment } = useQuickActions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel>Quick add</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => addExpense()}>Expense</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => addIncome()}>Income</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => addUdhaar()}>Udhaar</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => recordPayment()}>Record payment</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function QuickAddButton() {
  const { addExpense, addIncome, addUdhaar, recordPayment } = useQuickActions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Add a record"
          className="-mt-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side="top" className="w-52">
        <DropdownMenuLabel>Quick add</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => addExpense()}>Expense</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => addIncome()}>Income</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => addUdhaar()}>Udhaar</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => recordPayment()}>Record payment</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface BottomNavLinkProps {
  to: string;
  label: string;
  icon: typeof Wallet;
}

function BottomNavLink({ to, label, icon: Icon }: BottomNavLinkProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex min-w-[3.75rem] flex-col items-center gap-1 rounded-lg px-2 py-2 text-[0.65rem] font-medium transition-colors',
          isActive ? 'text-foreground' : 'text-muted-foreground',
        )
      }
    >
      <Icon className="h-5 w-5" />
      {label}
    </NavLink>
  );
}
