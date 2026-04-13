import { describe, expect, it } from 'vitest';
import { calculateTimeRange, dateToX, xToDate } from './dateUtils';
import type { GanttTask } from '../types';

const tasks: GanttTask[] = [
  {
    id: 't1',
    name: 'Task 1',
    start: new Date('2025-03-10'),
    end: new Date('2025-03-25'),
    progress: 0,
  },
  {
    id: 't2',
    name: 'Task 2',
    start: new Date('2025-04-01'),
    end: new Date('2025-04-15'),
    progress: 0,
  },
];

describe('dateToX / xToDate round-trip', () => {
  it('day view: round-trips to the same calendar day', () => {
    const range = calculateTimeRange(tasks, 'day');
    const w = 40;
    const date = new Date('2025-03-15');
    const x = dateToX(date, range, w, 'day');
    const back = xToDate(x, range, w, 'day');
    expect(back.toDateString()).toBe(date.toDateString());
  });

  it('week view: round-trips to the same calendar day', () => {
    const range = calculateTimeRange(tasks, 'week');
    const w = 168;
    const date = new Date('2025-03-15');
    const x = dateToX(date, range, w, 'week');
    const back = xToDate(x, range, w, 'week');
    expect(back.toDateString()).toBe(date.toDateString());
  });

  it('month view: mid-month round-trip lands on the same calendar month', () => {
    const range = calculateTimeRange(tasks, 'month');
    const w = 120;
    const date = new Date('2025-03-15');
    const x = dateToX(date, range, w, 'month');
    const back = xToDate(x, range, w, 'month');
    expect(back.getFullYear()).toBe(date.getFullYear());
    expect(back.getMonth()).toBe(date.getMonth());
  });
});

describe('zero-duration tasks', () => {
  it('dateToX(start) === dateToX(end) when start and end are the same instant', () => {
    const range = calculateTimeRange(tasks, 'day');
    const w = 60;
    const start = new Date('2025-03-20');
    const end = new Date('2025-03-20');

    for (const view of ['day', 'week', 'month'] as const) {
      const r = calculateTimeRange(tasks, view);
      expect(dateToX(start, r, w, view)).toBe(dateToX(end, r, w, view));
    }

    // Sanity: the same call across the day-view range produces a finite x.
    expect(Number.isFinite(dateToX(start, range, w, 'day'))).toBe(true);
  });
});

describe('column-boundary behavior', () => {
  it('day view: range.start sits at x=0; +1 day advances by exactly columnWidth', () => {
    const range = calculateTimeRange(tasks, 'day');
    const w = 40;
    expect(dateToX(range.start, range, w, 'day')).toBe(0);

    const next = new Date(range.start);
    next.setDate(next.getDate() + 1);
    expect(dateToX(next, range, w, 'day')).toBeCloseTo(w, 6);
  });

  it('week view: +7 days advances by exactly columnWidth', () => {
    const range = calculateTimeRange(tasks, 'week');
    const w = 168;
    expect(dateToX(range.start, range, w, 'week')).toBe(0);

    const next = new Date(range.start);
    next.setDate(next.getDate() + 7);
    expect(dateToX(next, range, w, 'week')).toBeCloseTo(w, 6);
  });

  it('month view: first-of-month lands on an integer multiple of columnWidth', () => {
    const range = calculateTimeRange(tasks, 'month');
    const w = 120;
    expect(dateToX(range.start, range, w, 'month')).toBe(0);

    const nextMonth = new Date(
      range.start.getFullYear(),
      range.start.getMonth() + 1,
      1,
    );
    const x = dateToX(nextMonth, range, w, 'month');
    expect(x % w).toBeCloseTo(0, 6);
  });
});
