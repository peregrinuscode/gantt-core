import { useMemo } from 'react';
import type { GanttTask, GanttGroup, ViewMode } from '../types';
import {
  calculateTimeRange,
  dateToX,
  getColumns,
  type TimeRange,
  type DateColumn,
} from '../utils/dateUtils';

/** A single visible row (group header or task) */
export interface GanttRow {
  type: 'group' | 'task';
  id: string;
  /** Pixel y-position of the row's top edge */
  y: number;
  /** Row height in pixels */
  height: number;
  /** Associated group ID */
  groupId?: string;
  /** Associated task ID (only for type='task') */
  taskId?: string;
  /** Indentation level: 0=group, 1=top-level task, 2+=child */
  level: number;
  /** Display name for the task list panel */
  name: string;
  /** Color (group color or task override) */
  color?: string;
  /** Whether this row has child rows (children tasks or group with tasks) */
  hasChildren: boolean;
  /** Whether this row is currently collapsed */
  isCollapsed: boolean;
}

/** A positioned task bar ready for SVG rendering */
export interface GanttBar {
  taskId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  progress: number;
  /** Task name for display on the bar */
  name: string;
}

/** Complete layout result from useGanttLayout */
export interface GanttLayoutResult {
  rows: GanttRow[];
  bars: GanttBar[];
  columns: DateColumn[];
  timeRange: TimeRange;
  totalWidth: number;
  totalHeight: number;
}

const DEFAULT_COLOR = '#3f51b5';
const BAR_HEIGHT_FRACTION = 0.7;

/**
 * Compute the full layout of the Gantt chart.
 *
 * Returns rows (for the task list and grid backgrounds),
 * bars (for SVG rendering), columns (for the timeline grid),
 * and overall dimensions.
 */
export function useGanttLayout(
  tasks: GanttTask[],
  groups: GanttGroup[],
  viewMode: ViewMode,
  rowHeight: number,
  columnWidth: number,
  collapsedIds: Set<string>,
  locale?: string,
): GanttLayoutResult {
  return useMemo(() => {
    const timeRange = calculateTimeRange(tasks, viewMode);
    const columns = getColumns(timeRange, columnWidth, viewMode, locale);

    // Build a lookup for group colors
    const groupColorMap = new Map<string, string>();
    for (const g of groups) {
      groupColorMap.set(g.id, g.color);
    }

    // Build task lookup and children map
    const taskMap = new Map<string, GanttTask>();
    const childrenMap = new Map<string, GanttTask[]>();
    for (const t of tasks) {
      taskMap.set(t.id, t);
      if (t.parentId) {
        const siblings = childrenMap.get(t.parentId) ?? [];
        siblings.push(t);
        childrenMap.set(t.parentId, siblings);
      }
    }

    // Sort groups
    const sortedGroups = [...groups].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );

    // Build ordered rows
    const rows: GanttRow[] = [];
    const bars: GanttBar[] = [];

    const barHeight = rowHeight * BAR_HEIGHT_FRACTION;

    function addTaskRows(
      tasksInScope: GanttTask[],
      groupId: string,
      level: number,
    ) {
      const sorted = [...tasksInScope].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      );

      for (const task of sorted) {
        const y = rows.length * rowHeight;
        const children = childrenMap.get(task.id);
        const hasChildren = !!children && children.length > 0;
        const isCollapsed = collapsedIds.has(task.id);

        rows.push({
          type: 'task',
          id: `task-${task.id}`,
          y,
          height: rowHeight,
          groupId,
          taskId: task.id,
          level,
          name: task.name,
          color: task.color ?? groupColorMap.get(groupId),
          hasChildren,
          isCollapsed,
        });

        // Calculate bar position
        const x = dateToX(task.start, timeRange, columnWidth, viewMode);
        const xEnd = dateToX(task.end, timeRange, columnWidth, viewMode);
        const width = Math.max(xEnd - x, 2); // minimum 2px so it's visible

        const color =
          task.color ?? groupColorMap.get(groupId) ?? DEFAULT_COLOR;

        bars.push({
          taskId: task.id,
          x,
          y: y + (rowHeight - barHeight) / 2,
          width,
          height: barHeight,
          color,
          progress: task.progress,
          name: task.name,
        });

        // Add children recursively (only if not collapsed)
        if (children && !isCollapsed) {
          addTaskRows(children, groupId, level + 1);
        }
      }
    }

    if (sortedGroups.length > 0) {
      for (const group of sortedGroups) {
        // Check if group has any tasks
        const topLevel = tasks.filter(
          (t) => t.groupId === group.id && !t.parentId,
        );
        const hasChildren = topLevel.length > 0;
        const isCollapsed = collapsedIds.has(group.id);

        // Group header row
        const y = rows.length * rowHeight;
        rows.push({
          type: 'group',
          id: `group-${group.id}`,
          y,
          height: rowHeight,
          groupId: group.id,
          level: 0,
          name: group.name,
          color: group.color,
          hasChildren,
          isCollapsed,
        });

        // Top-level tasks in this group (skip if group is collapsed)
        if (!isCollapsed) {
          addTaskRows(topLevel, group.id, 1);
        }
      }
    } else {
      // No groups — just add all top-level tasks
      const topLevel = tasks.filter((t) => !t.parentId);
      addTaskRows(topLevel, '', 1);
    }

    const totalWidth =
      columns.length > 0
        ? columns[columns.length - 1].x + columnWidth
        : 0;
    const totalHeight = rows.length * rowHeight;

    return { rows, bars, columns, timeRange, totalWidth, totalHeight };
  }, [tasks, groups, viewMode, rowHeight, columnWidth, collapsedIds, locale]);
}
