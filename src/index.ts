// ============================================================
// @peregrinus/gantt-core — Public API
// ============================================================

// Styles (consumers import '@peregrinus/gantt-core/styles.css')
import './styles.css';

// Main component
export { GanttChart } from './components/GanttChart';

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
