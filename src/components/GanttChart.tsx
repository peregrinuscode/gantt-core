import type { GanttChartProps, ViewMode } from '../types';
import { useGanttLayout } from '../hooks/useGanttLayout';
import { useGanttTree } from '../hooks/useGanttTree';
import { useGanttScroll } from '../hooks/useGanttScroll';
import { dateToX } from '../utils/dateUtils';
import { GanttHeader } from './GanttHeader';
import { GanttTaskBar } from './GanttTaskBar';
import { GanttTaskList } from './GanttTaskList';

/** Default column widths per view mode */
const DEFAULT_COLUMN_WIDTH: Record<ViewMode, number> = {
  day: 50,
  week: 80,
  month: 120,
};

const DEFAULT_ROW_HEIGHT = 50;
const HEADER_HEIGHT = 40;

export function GanttChart(props: GanttChartProps) {
  const {
    tasks,
    groups = [],
    viewMode = 'week',
    taskListWidth = 0,
    rowHeight = DEFAULT_ROW_HEIGHT,
    columnWidth: columnWidthProp,
    showTodayMarker = true,
    theme,
    locale,
    onTaskClick,
    onTaskDoubleClick,
  } = props;

  const columnWidth = columnWidthProp ?? DEFAULT_COLUMN_WIDTH[viewMode];

  // Expand/collapse state
  const { collapsedIds, toggleCollapse } = useGanttTree();

  // Scroll synchronization
  const { containerRef, scrollLeft, handleScroll } = useGanttScroll();

  const layout = useGanttLayout(
    tasks,
    groups,
    viewMode,
    rowHeight,
    columnWidth,
    collapsedIds,
    locale,
  );

  const { rows, bars, columns, timeRange, totalWidth, totalHeight } = layout;

  // Today marker x-position
  const today = new Date();
  const todayX = dateToX(today, timeRange, columnWidth, viewMode);
  const showToday =
    showTodayMarker &&
    today >= timeRange.start &&
    today <= timeRange.end;

  // Build inline style from theme prop
  const themeStyle: React.CSSProperties = theme
    ? (Object.fromEntries(
        Object.entries(theme).filter(([, v]) => v !== undefined),
      ) as React.CSSProperties)
    : {};

  return (
    <div className="gantt-core" style={themeStyle}>
      {/* Date header */}
      <GanttHeader
        columns={columns}
        columnWidth={columnWidth}
        height={HEADER_HEIGHT}
        scrollLeft={scrollLeft}
        taskListWidth={taskListWidth}
      />

      {/* Body: task list + scrollable timeline */}
      <div className="gantt-body">
        {/* Scrollable container (task list is sticky inside it) */}
        <div
          ref={containerRef}
          className="gantt-timeline-container"
          onScroll={handleScroll}
        >
          {/* Task list panel (sticky left) */}
          <div className="gantt-body-inner" style={{ width: taskListWidth + totalWidth }}>
            <GanttTaskList
              rows={rows}
              width={taskListWidth}
              rowHeight={rowHeight}
              totalHeight={totalHeight}
              onToggleCollapse={toggleCollapse}
            />

            {/* SVG timeline */}
            <svg
              className="gantt-svg"
              width={totalWidth}
              height={totalHeight}
            >
              {/* Grid layer: weekend backgrounds + vertical lines */}
              <g className="gantt-grid-layer">
                {/* Weekend column backgrounds */}
                {columns
                  .filter((col) => col.isWeekend)
                  .map((col) => (
                    <rect
                      key={`weekend-${col.index}`}
                      className="gantt-weekend-rect"
                      x={col.x}
                      y={0}
                      width={columnWidth}
                      height={totalHeight}
                    />
                  ))}

                {/* Vertical grid lines */}
                {columns.map((col) => (
                  <line
                    key={`line-${col.index}`}
                    className="gantt-grid-line"
                    x1={col.x}
                    y1={0}
                    x2={col.x}
                    y2={totalHeight}
                  />
                ))}

                {/* Horizontal row separators */}
                {rows.map((row) => (
                  <line
                    key={`hline-${row.id}`}
                    className="gantt-grid-line"
                    x1={0}
                    y1={row.y + row.height}
                    x2={totalWidth}
                    y2={row.y + row.height}
                  />
                ))}

                {/* Group row backgrounds */}
                {rows
                  .filter((r) => r.type === 'group')
                  .map((row) => (
                    <rect
                      key={`group-bg-${row.id}`}
                      className="gantt-group-row"
                      x={0}
                      y={row.y}
                      width={totalWidth}
                      height={row.height}
                    />
                  ))}
              </g>

              {/* Bars layer */}
              <g className="gantt-bars-layer">
                {bars.map((bar) => (
                  <GanttTaskBar
                    key={bar.taskId}
                    bar={bar}
                    onClick={onTaskClick}
                    onDoubleClick={onTaskDoubleClick}
                  />
                ))}
              </g>

              {/* Today marker */}
              {showToday && (
                <g className="gantt-today-layer">
                  <line
                    className="gantt-today-line"
                    x1={todayX}
                    y1={0}
                    x2={todayX}
                    y2={totalHeight}
                  />
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
