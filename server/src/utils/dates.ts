import { ApiError } from './ApiError.js';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_ONLY = /^\d{4}-\d{2}$/;

/**
 * Calendar dates are stored at UTC midnight so a record never drifts into a
 * neighbouring day/month because of the server or client timezone.
 */
export function toUtcDate(value: string): Date {
  if (!DATE_ONLY.test(value)) {
    throw ApiError.badRequest(`Invalid date "${value}". Expected format YYYY-MM-DD.`);
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime()) || date.getUTCMonth() !== month - 1) {
    throw ApiError.badRequest(`Invalid date "${value}".`);
  }
  return date;
}

export function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Inclusive start / exclusive end range for a `YYYY-MM` month key. */
export function monthRange(month: string): { start: Date; end: Date } {
  if (!MONTH_ONLY.test(month)) {
    throw ApiError.badRequest(`Invalid month "${month}". Expected format YYYY-MM.`);
  }
  const [year, monthNumber] = month.split('-').map(Number);
  return {
    start: new Date(Date.UTC(year, monthNumber - 1, 1)),
    end: new Date(Date.UTC(year, monthNumber, 1)),
  };
}

/** Builds a Mongo date filter from `month`, or a `from`/`to` custom range. */
export function buildDateFilter(query: {
  month?: unknown;
  from?: unknown;
  to?: unknown;
}): Record<string, Date> | undefined {
  if (typeof query.month === 'string' && query.month.length > 0) {
    const { start, end } = monthRange(query.month);
    return { $gte: start, $lt: end };
  }

  const filter: Record<string, Date> = {};
  if (typeof query.from === 'string' && query.from.length > 0) {
    filter.$gte = toUtcDate(query.from);
  }
  if (typeof query.to === 'string' && query.to.length > 0) {
    const to = toUtcDate(query.to);
    filter.$lte = to;
  }
  return Object.keys(filter).length > 0 ? filter : undefined;
}
