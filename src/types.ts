// ============================================================
// @peregrinus/gantt-core - Type Definitions
// ============================================================
// Zero-dependency Gantt chart types.
// These are generic — no framework-specific types (no MUI, etc.)
// ============================================================

/** Time scale for the timeline grid */
export type ViewMode = 'day' | 'week' | 'month';

/** A single task bar on the chart */
export interface GanttTask {
  /** Unique identifier */
  id: string;
  /** Display name shown on the bar and in the task list */
  name: string;
  /** Bar start date */
  start: Date;
  /** Bar end date (exclusive — the bar covers start..end-1) */
  end: Date;
  /** Completion percentage 0-100 */
  progress: number;
  /** Group this task belongs to (matches GanttGroup.id) */
  groupId?: string;
  /** Parent task id for hierarchy (tree structure) */
  parentId?: string;
  /** IDs of tasks this task depends on (arrows drawn FROM dependency TO this task) */
  dependencies?: string[];
  /** Sort order within its group/parent */
  sortOrder?: number;
  /** Disable drag/resize for this specific task */
  disabled?: boolean;
  /** Custom color for this task bar (overrides group color) */
  color?: string;
  /** Arbitrary metadata passed through to event callbacks */
  meta?: Record<string, unknown>;
}

/** A collapsible group of tasks (rendered as a header row in the task list) */
export interface GanttGroup {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Color used for the group header and as default for tasks in this group */
  color: string;
  /** Sort order among groups */
  sortOrder?: number;
}

/** Drag/resize result passed to event callbacks */
export interface TaskChangeEvent {
  taskId: string;
  start: Date;
  end: Date;
}

/** Progress change result */
export interface ProgressChangeEvent {
  taskId: string;
  progress: number;
}

/** Dependency creation result */
export interface DependencyCreateEvent {
  fromTaskId: string;
  toTaskId: string;
}

/** Theme configuration via CSS custom properties */
export interface GanttTheme {
  /** Background color of the timeline grid */
  '--gantt-bg'?: string;
  /** Color of grid lines */
  '--gantt-grid-line'?: string;
  /** Today marker color */
  '--gantt-today'?: string;
  /** Weekend/non-working day background */
  '--gantt-weekend-bg'?: string;
  /** Header background */
  '--gantt-header-bg'?: string;
  /** Header text color */
  '--gantt-header-text'?: string;
  /** Task bar text color */
  '--gantt-bar-text'?: string;
  /** Task bar border radius */
  '--gantt-bar-radius'?: string;
  /** Task bar height as fraction of row height (0-1) */
  '--gantt-bar-height'?: string;
  /** Progress overlay fill on task bars */
  '--gantt-bar-progress-fill'?: string;
  /** Dependency arrow color */
  '--gantt-arrow-color'?: string;
  /** Row hover background */
  '--gantt-row-hover'?: string;
  /** Selected row background */
  '--gantt-row-selected'?: string;
  /** Font family */
  '--gantt-font'?: string;
  /** Font size */
  '--gantt-font-size'?: string;
}

/** Main component props */
export interface GanttChartProps {
  /** Array of tasks to display */
  tasks: GanttTask[];
  /** Optional grouping (categories). Tasks with matching groupId are grouped under these. */
  groups?: GanttGroup[];
  /** Time scale */
  viewMode?: ViewMode;
  /** Width of the task list panel in pixels (0 to hide) */
  taskListWidth?: number;
  /** Height of each row in pixels */
  rowHeight?: number;
  /** Width of each time column in pixels */
  columnWidth?: number;
  /** Read-only mode: disables all drag/resize interactions */
  readOnly?: boolean;
  /** Show dependency arrows */
  showDependencies?: boolean;
  /** Show today marker line */
  showTodayMarker?: boolean;
  /** Theme overrides via CSS custom properties */
  theme?: GanttTheme;
  /** Locale for date formatting (e.g. 'es-MX', 'en-US') */
  locale?: string;

  // --- Events ---

  /** Fired when a task bar is moved (drag) */
  onTaskMove?: (event: TaskChangeEvent) => void;
  /** Fired when a task bar edge is dragged (resize) */
  onTaskResize?: (event: TaskChangeEvent) => void;
  /** Fired when the progress handle is dragged */
  onProgressChange?: (event: ProgressChangeEvent) => void;
  /** Fired when a task is clicked */
  onTaskClick?: (taskId: string) => void;
  /** Fired when a task is double-clicked */
  onTaskDoubleClick?: (taskId: string) => void;
  /** Fired when a dependency is created via link mode */
  onDependencyCreate?: (event: DependencyCreateEvent) => void;
}
