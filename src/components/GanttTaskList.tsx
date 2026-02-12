import type { GanttRow } from '../hooks/useGanttLayout';

interface GanttTaskListProps {
  rows: GanttRow[];
  width: number;
  rowHeight: number;
  totalHeight: number;
  onToggleCollapse: (id: string) => void;
}

const INDENT_PX = 16;

/** Inline SVG chevron — points right when collapsed, down when expanded */
function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`gantt-chevron ${expanded ? 'gantt-chevron--expanded' : ''}`}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden="true"
    >
      <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GanttTaskList({
  rows,
  width,
  rowHeight,
  totalHeight,
  onToggleCollapse,
}: GanttTaskListProps) {
  if (width <= 0) return null;

  return (
    <div
      className="gantt-task-list"
      style={{ width, minHeight: totalHeight }}
      role="list"
    >
      {rows.map((row) => {
        // The raw ID to pass to toggle (strip the "group-" or "task-" prefix)
        const rawId = row.type === 'group'
          ? row.groupId!
          : row.taskId!;

        const indent = row.level * INDENT_PX;

        return (
          <div
            key={row.id}
            className={`gantt-task-list-row ${row.type === 'group' ? 'gantt-task-list-row--group' : ''}`}
            style={{ height: rowHeight }}
            role="listitem"
          >
            {/* Colored accent bar for group rows */}
            {row.type === 'group' && row.color && (
              <div
                className="gantt-task-list-accent"
                style={{ backgroundColor: row.color }}
              />
            )}

            {/* Indentation spacer */}
            <div style={{ width: indent, flexShrink: 0 }} />

            {/* Toggle button or spacer */}
            {row.hasChildren ? (
              <button
                className="gantt-task-list-toggle"
                onClick={() => onToggleCollapse(rawId)}
                aria-label={row.isCollapsed ? `Expand ${row.name}` : `Collapse ${row.name}`}
                aria-expanded={!row.isCollapsed}
              >
                <Chevron expanded={!row.isCollapsed} />
              </button>
            ) : (
              <div className="gantt-task-list-toggle-spacer" />
            )}

            {/* Task/group name */}
            <span className="gantt-task-list-name" title={row.name}>
              {row.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
