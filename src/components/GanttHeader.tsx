import type { DateColumn } from '../utils/dateUtils';

interface GanttHeaderProps {
  columns: DateColumn[];
  columnWidth: number;
  height: number;
  scrollLeft: number;
}

export function GanttHeader({
  columns,
  columnWidth,
  height,
  scrollLeft,
}: GanttHeaderProps) {
  return (
    <div className="gantt-header" style={{ height }}>
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
  );
}
