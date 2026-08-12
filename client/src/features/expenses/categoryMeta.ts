import {
  Bus,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  Home,
  MoreHorizontal,
  Receipt,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import type { ExpenseCategory } from '@/types';

interface CategoryMeta {
  icon: LucideIcon;
  /** Tailwind classes for the icon chip - kept muted to stay readable in both themes. */
  chip: string;
  /** Bar colour used in the expense breakdown. */
  bar: string;
}

export const categoryMeta: Record<ExpenseCategory, CategoryMeta> = {
  Food: { icon: UtensilsCrossed, chip: 'bg-orange-500/12 text-orange-600 dark:text-orange-400', bar: 'bg-orange-500' },
  Rent: { icon: Home, chip: 'bg-blue-500/12 text-blue-600 dark:text-blue-400', bar: 'bg-blue-500' },
  Travel: { icon: Bus, chip: 'bg-cyan-500/12 text-cyan-600 dark:text-cyan-400', bar: 'bg-cyan-500' },
  Shopping: { icon: ShoppingBag, chip: 'bg-violet-500/12 text-violet-600 dark:text-violet-400', bar: 'bg-violet-500' },
  Bills: { icon: Receipt, chip: 'bg-amber-500/12 text-amber-600 dark:text-amber-400', bar: 'bg-amber-500' },
  Entertainment: { icon: Clapperboard, chip: 'bg-pink-500/12 text-pink-600 dark:text-pink-400', bar: 'bg-pink-500' },
  Health: { icon: HeartPulse, chip: 'bg-red-500/12 text-red-600 dark:text-red-400', bar: 'bg-red-500' },
  Family: { icon: Users, chip: 'bg-teal-500/12 text-teal-600 dark:text-teal-400', bar: 'bg-teal-500' },
  Education: { icon: GraduationCap, chip: 'bg-indigo-500/12 text-indigo-600 dark:text-indigo-400', bar: 'bg-indigo-500' },
  Other: { icon: MoreHorizontal, chip: 'bg-slate-500/12 text-slate-600 dark:text-slate-400', bar: 'bg-slate-500' },
};
