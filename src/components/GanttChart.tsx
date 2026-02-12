import type { GanttChartProps } from '../types';

/**
 * GanttChart — Main component.
 *
 * This is a placeholder that will be implemented across build sessions.
 * It exists now so the project compiles and the demo page renders.
 */
export function GanttChart(props: GanttChartProps) {
  const { tasks, groups = [], viewMode = 'week', readOnly = false } = props;

  return (
    <div
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h3 style={{ margin: '0 0 12px' }}>
        @peregrinus/gantt-core — Scaffold
      </h3>
      <p style={{ color: '#666', margin: '0 0 8px' }}>
        View: <strong>{viewMode}</strong> | Tasks: <strong>{tasks.length}</strong> |
        Groups: <strong>{groups.length}</strong> | Read-only: <strong>{String(readOnly)}</strong>
      </p>
      <p style={{ color: '#999', fontSize: 14 }}>
        This placeholder will be replaced with the actual Gantt chart implementation.
      </p>
    </div>
  );
}
