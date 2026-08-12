import { addMonths, format, isValid, parseISO, subDays } from 'date-fns';
import type { DateString } from '@/types';

/** `YYYY-MM` key identifying the month a screen is currently showing. */
export type MonthKey = string;

export function todayKey(): DateString {
  return format(new Date(), 'yyyy-MM-dd');
}

export function currentMonthKey(): MonthKey {
  return format(new Date(), 'yyyy-MM');
}

export function monthKeyOf(date: DateString): MonthKey {
  return date.slice(0, 7);
}

export function shiftMonth(month: MonthKey, delta: number): MonthKey {
  return format(addMonths(parseISO(`${month}-01`), delta), 'yyyy-MM');
}

/** "August 2026" */
export function formatMonthLabel(month: MonthKey): string {
  return format(parseISO(`${month}-01`), 'MMMM yyyy');
}

/** "Aug 2026" */
export function formatMonthLabelShort(month: MonthKey): string {
  return format(parseISO(`${month}-01`), 'MMM yyyy');
}

/** "12 Aug 2026" */
export function formatDate(date: DateString): string {
  const parsed = parseISO(date);
  return isValid(parsed) ? format(parsed, 'd MMM yyyy') : date;
}

/** "12 Aug" - compact rows where the year is obvious from context. */
export function formatDateShort(date: DateString): string {
  const parsed = parseISO(date);
  return isValid(parsed) ? format(parsed, 'd MMM') : date;
}

/** "Today" / "Yesterday" / "12 Aug 2026" */
export function formatRelativeDate(date: DateString): string {
  const today = new Date();
  if (date === format(today, 'yyyy-MM-dd')) return 'Today';
  if (date === format(subDays(today, 1), 'yyyy-MM-dd')) return 'Yesterday';
  return formatDate(date);
}

export function isInMonth(date: DateString, month: MonthKey): boolean {
  return date.startsWith(month);
}

/** Inclusive comparison - safe because dates are zero padded `YYYY-MM-DD` strings. */
export function isWithinRange(date: DateString, from?: string, to?: string): boolean {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function greeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
