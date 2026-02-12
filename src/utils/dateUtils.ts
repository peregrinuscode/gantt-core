import type { GanttTask, ViewMode } from '../types';

/** The visible time range of the chart */
export interface TimeRange {
  start: Date;
  end: Date;
}

/** A single column in the timeline grid */
export interface DateColumn {
  /** Column index (0-based) */
  index: number;
  /** Date this column represents */
  date: Date;
  /** Formatted label for the header */
  label: string;
  /** Pixel x-position of the column's left edge */
  x: number;
  /** Whether this column falls on a weekend (day view only) */
  isWeekend: boolean;
}

// ---- Helpers ----

/** Strip time from a Date, returning midnight UTC-local */
function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

/** Start of the week (Monday) for a given date */
function startOfWeek(d: Date): Date {
  const r = startOfDay(d);
  const day = r.getDay(); // 0=Sun, 1=Mon ...
  const diff = day === 0 ? 6 : day - 1; // shift so Monday=0
  r.setDate(r.getDate() - diff);
  return r;
}

/** Start of the month for a given date */
function startOfMonth(d: Date): Date {
  const r = startOfDay(d);
  r.setDate(1);
  return r;
}

/** Number of milliseconds in one day */
const MS_PER_DAY = 86_400_000;

/** Difference in calendar days between two dates */
function diffDays(a: Date, b: Date): number {
  return (startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_PER_DAY;
}

/** Add `n` days to a date */
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Add `n` months to a date */
function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}

// ---- Public API ----

/**
 * Auto-detect the time range from a set of tasks, with padding on each side.
 * Padding: ~7 days for day/week views, ~1 month for month view.
 */
export function calculateTimeRange(
  tasks: GanttTask[],
  viewMode: ViewMode = 'week',
): TimeRange {
  if (tasks.length === 0) {
    const now = new Date();
    return { start: addDays(now, -14), end: addDays(now, 14) };
  }

  let min = tasks[0].start.getTime();
  let max = tasks[0].end.getTime();

  for (const t of tasks) {
    if (t.start.getTime() < min) min = t.start.getTime();
    if (t.end.getTime() > max) max = t.end.getTime();
  }

  const padding = viewMode === 'month' ? 30 : 7;
  const start = addDays(new Date(min), -padding);
  const end = addDays(new Date(max), padding);

  // Snap to view-mode boundaries
  const snappedStart =
    viewMode === 'month'
      ? startOfMonth(start)
      : viewMode === 'week'
        ? startOfWeek(start)
        : startOfDay(start);

  const snappedEnd =
    viewMode === 'month'
      ? startOfMonth(addMonths(end, 1))
      : viewMode === 'week'
        ? addDays(startOfWeek(end), 7)
        : addDays(startOfDay(end), 1);

  return { start: snappedStart, end: snappedEnd };
}

/**
 * Convert a Date to an x-coordinate in pixels.
 *
 * For day/week views this is a simple linear interpolation over days.
 * For month view, each month gets exactly one `columnWidth` unit.
 */
export function dateToX(
  date: Date,
  timeRange: TimeRange,
  columnWidth: number,
  viewMode: ViewMode,
): number {
  if (viewMode === 'month') {
    // Months are variable-width in real life, but we give each column equal width.
    // Interpolate within the current month.
    const monthsFromStart = monthsBetween(timeRange.start, date);
    // Fractional position within the current month
    const daysInMonth = daysInMonthOf(date);
    const dayOfMonth = date.getDate() - 1; // 0-based
    const frac = dayOfMonth / daysInMonth;
    return (Math.floor(monthsFromStart) + frac) * columnWidth;
  }

  // Day and week: linear by days
  const days = diffDays(timeRange.start, date);
  const colDays = viewMode === 'week' ? 7 : 1;
  return (days / colDays) * columnWidth;
}

/**
 * Convert an x-coordinate back to a Date.
 * Inverse of `dateToX`. Used later for drag interactions.
 */
export function xToDate(
  x: number,
  timeRange: TimeRange,
  columnWidth: number,
  viewMode: ViewMode,
): Date {
  if (viewMode === 'month') {
    const monthIndex = x / columnWidth;
    const wholeMonths = Math.floor(monthIndex);
    const frac = monthIndex - wholeMonths;
    const base = addMonths(timeRange.start, wholeMonths);
    const daysIn = daysInMonthOf(base);
    return addDays(base, Math.round(frac * daysIn));
  }

  const colDays = viewMode === 'week' ? 7 : 1;
  const days = (x / columnWidth) * colDays;
  return addDays(timeRange.start, Math.round(days));
}

/**
 * Generate column definitions for the entire time range.
 */
export function getColumns(
  timeRange: TimeRange,
  columnWidth: number,
  viewMode: ViewMode,
  locale?: string,
): DateColumn[] {
  const columns: DateColumn[] = [];

  if (viewMode === 'month') {
    let current = startOfMonth(timeRange.start);
    let index = 0;
    while (current.getTime() < timeRange.end.getTime()) {
      columns.push({
        index,
        date: new Date(current),
        label: formatMonthLabel(current, locale),
        x: index * columnWidth,
        isWeekend: false,
      });
      current = addMonths(current, 1);
      index++;
    }
    return columns;
  }

  const step = viewMode === 'week' ? 7 : 1;
  let current =
    viewMode === 'week'
      ? startOfWeek(timeRange.start)
      : startOfDay(timeRange.start);
  let index = 0;

  while (current.getTime() < timeRange.end.getTime()) {
    const day = current.getDay();
    columns.push({
      index,
      date: new Date(current),
      label:
        viewMode === 'week'
          ? formatWeekLabel(current, locale)
          : formatDayLabel(current, locale),
      x: index * columnWidth,
      isWeekend: day === 0 || day === 6,
    });
    current = addDays(current, step);
    index++;
  }

  return columns;
}

/**
 * Snap a date to the nearest grid boundary for the given view mode.
 */
export function snapToGrid(date: Date, viewMode: ViewMode): Date {
  switch (viewMode) {
    case 'day':
      return startOfDay(date);
    case 'week':
      return startOfWeek(date);
    case 'month':
      return startOfMonth(date);
  }
}

// ---- Month-view helpers ----

function monthsBetween(a: Date, b: Date): number {
  return (
    (b.getFullYear() - a.getFullYear()) * 12 +
    (b.getMonth() - a.getMonth()) +
    (b.getDate() - a.getDate()) / daysInMonthOf(a)
  );
}

function daysInMonthOf(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

// ---- Formatting helpers ----

function formatDayLabel(d: Date, locale?: string): string {
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

function formatWeekLabel(d: Date, locale?: string): string {
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

function formatMonthLabel(d: Date, locale?: string): string {
  return d.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
}
