// ============================================================
// @peregrinus/gantt-core — Public API
// ============================================================

// Styles (consumers import '@peregrinus/gantt-core/styles.css')
import './styles.css';

// Main component
export { GanttChart } from './components/GanttChart';

// Hooks
export { useGanttTree } from './hooks/useGanttTree';
export type { UseGanttTreeResult } from './hooks/useGanttTree';

// Types — drag (for advanced consumers)
export type { DragMode, DragState } from './hooks/useGanttDrag';

// Types — core
export type {
  GanttTask,
  GanttGroup,
  GanttChartProps,
  GanttTheme,
  ViewMode,
  TaskChangeEvent,
  ProgressChangeEvent,
  DependencyCreateEvent,
} from './types';

// Types — layout (useful for advanced consumers)
export type {
  GanttRow,
  GanttBar,
  GanttLayoutResult,
} from './hooks/useGanttLayout';

// Types — date utilities
export type { TimeRange, DateColumn } from './utils/dateUtils';

// Utilities — colors
export { darkenHex, lightenHex, hexToRgba } from './utils/colors';

// Utilities — arrow paths (for advanced consumers)
export { computeArrowPath } from './utils/arrowPath';
export type { ArrowEndpoints, ArrowPathResult } from './utils/arrowPath';
