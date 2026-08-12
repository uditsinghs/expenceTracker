import {
  ArrowLeftRight,
  HandCoins,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom bar - the rest stay in the desktop sidebar. */
  primary?: boolean;
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, primary: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, primary: true },
  { to: '/expenses', label: 'Expenses', icon: Wallet },
  { to: '/udhaar', label: 'Udhaar', icon: HandCoins, primary: true },
  { to: '/income', label: 'Income', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: Settings },
];
