import { JSX as JSX_2 } from 'react/jsx-runtime';

/** Input endpoints for an arrow from source bar to target bar */
export declare interface ArrowEndpoints {
    /** Source bar right edge x */
    sourceX: number;
    /** Source bar vertical center y */
    sourceY: number;
    /** Target bar left edge x */
    targetX: number;
    /** Target bar vertical center y */
    targetY: number;
    /** Row height — used for detour routing when bars overlap */
    rowHeight: number;
    /** Source bar width — used for backward routing */
    sourceWidth: number;
    /** Source bar top y */
    sourceTop: number;
    /** Target bar top y */
    targetTop: number;
    /** Source bar height */
    sourceHeight: number;
    /** Target bar height */
    targetHeight: number;
}

/** Result: SVG path `d` attribute + arrowhead polygon `points` */
export declare interface ArrowPathResult {
    /** SVG path d attribute for the connecting line */
    path: string;
    /** SVG polygon points for the arrowhead triangle */
    arrowHead: string;
}

/**
 * Compute the SVG path and arrowhead for a dependency arrow.
 *
 * Two routing cases:
 * 1. **Normal**: target is to the right of source — route right → vertical → right to target
 * 2. **Backward**: target overlaps or is left of source — route around via detour
 */
export declare function computeArrowPath(ep: ArrowEndpoints, cornerRadius?: number): ArrowPathResult;

/** Darken a hex color by reducing each RGB channel. */
export declare function darkenHex(color: string, amount?: number): string;

/** A single column in the timeline grid */
export declare interface DateColumn {
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

/** Dependency creation result */
export declare interface DependencyCreateEvent {
    fromTaskId: string;
    toTaskId: string;
}

export declare type DragMode = 'move' | 'resize-left' | 'resize-right' | 'progress';

export declare interface DragState {
    taskId: string;
    mode: DragMode;
    /** Bar coordinates at the start of the drag */
    originalBar: GanttBar;
    /** Current ghost bar position (updated during drag) */
    ghostBar: GanttBar;
    /** Current ghost progress value (only meaningful in progress mode) */
    ghostProgress: number;
}

/** A positioned task bar ready for SVG rendering */
export declare interface GanttBar {
    taskId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    progress: number;
    /** Task name for display on the bar */
    name: string;
    /** True for group summary bars (collapsed groups) — not interactive */
    isSummary?: boolean;
}

export declare function GanttChart(props: GanttChartProps): JSX_2.Element;

/** Main component props */
export declare interface GanttChartProps {
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
    /** IDs of groups/tasks that should start collapsed */
    initialCollapsed?: string[];
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

/** A collapsible group of tasks (rendered as a header row in the task list) */
export declare interface GanttGroup {
    /** Unique identifier */
    id: string;
    /** Display name */
    name: string;
    /** Color used for the group header and as default for tasks in this group */
    color: string;
    /** Sort order among groups */
    sortOrder?: number;
}

/** Complete layout result from useGanttLayout */
export declare interface GanttLayoutResult {
    rows: GanttRow[];
    bars: GanttBar[];
    columns: DateColumn[];
    timeRange: TimeRange;
    totalWidth: number;
    totalHeight: number;
}

/** A single visible row (group header or task) */
export declare interface GanttRow {
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

/** A single task bar on the chart */
export declare interface GanttTask {
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

/** Theme configuration via CSS custom properties */
export declare interface GanttTheme {
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

/** Convert a hex color to an rgba() string. */
export declare function hexToRgba(color: string, alpha: number): string;

/** Lighten a hex color by increasing each RGB channel. */
export declare function lightenHex(color: string, amount?: number): string;

/** Progress change result */
export declare interface ProgressChangeEvent {
    taskId: string;
    progress: number;
}

/** Drag/resize result passed to event callbacks */
export declare interface TaskChangeEvent {
    taskId: string;
    start: Date;
    end: Date;
}

/** The visible time range of the chart */
export declare interface TimeRange {
    start: Date;
    end: Date;
}

/**
 * Manage expand/collapse state for groups and parent tasks.
 *
 * All items start expanded (empty Set) unless `initialCollapsed` is provided.
 */
export declare function useGanttTree(initialCollapsed?: Iterable<string>): UseGanttTreeResult;

export declare interface UseGanttTreeResult {
    /** Set of currently collapsed IDs (group or task IDs) */
    collapsedIds: Set<string>;
    /** Toggle the collapsed state of a group or parent task */
    toggleCollapse: (id: string) => void;
    /** Check if a given ID is collapsed */
    isCollapsed: (id: string) => boolean;
}

/** Time scale for the timeline grid */
export declare type ViewMode = 'day' | 'week' | 'month';

export { }
