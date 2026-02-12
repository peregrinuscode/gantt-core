import type { DateColumn } from '../utils/dateUtils';

interface GanttHeaderProps {
  columns: DateColumn[];
  columnWidth: number;
  height: number;
  scrollLeft: number;
  taskListWidth: number;
}

export function GanttHeader({
  columns,
  columnWidth,
  height,
  scrollLeft,
  taskListWidth,
}: GanttHeaderProps) {
  return (
    <div className="gantt-header" style={{ height }}>
      {/* Task list header cell */}
      {taskListWidth > 0 && (
        <div
          className="gantt-header-cell gantt-header-cell--task-list"
          style={{ width: taskListWidth, height }}
        >
          Tasks
        </div>
      )}

      {/* Date columns (offset by scroll) */}
      <div className="gantt-header-dates" style={{ overflow: 'hidden', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            transform: `translateX(-${scrollLeft}px)`,
          }}
        >
          {columns.map((col) => (
            <div
              key={col.index}
              className="gantt-header-cell"
              style={{ width: columnWidth, height }}
            >
              {col.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
