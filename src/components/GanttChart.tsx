import { useMemo, useRef } from 'react';
import type { GanttChartProps, GanttTask, ViewMode } from '../types';
import { useGanttLayout } from '../hooks/useGanttLayout';
import { useGanttTree } from '../hooks/useGanttTree';
import { useGanttScroll } from '../hooks/useGanttScroll';
import { useGanttDrag } from '../hooks/useGanttDrag';
import { dateToX } from '../utils/dateUtils';
import { GanttHeader } from './GanttHeader';
import { GanttTaskBar } from './GanttTaskBar';
import { GanttTaskList } from './GanttTaskList';
import { GanttDependencies } from './GanttDependencies';

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
    readOnly = false,
    showDependencies = true,
    showTodayMarker = true,
    theme,
    locale,
    initialCollapsed,
    onTaskClick,
    onTaskDoubleClick,
    onTaskMove,
    onTaskResize,
    onProgressChange,
  } = props;

  const columnWidth = columnWidthProp ?? DEFAULT_COLUMN_WIDTH[viewMode];

  // Expand/collapse state
  const { collapsedIds, toggleCollapse } = useGanttTree(initialCollapsed);

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

  // Handle clicks on task bars — summary bars expand their group
  const handleBarClick = (taskId: string) => {
    if (taskId.startsWith('group-summary-')) {
      const groupId = taskId.replace('group-summary-', '');
      toggleCollapse(groupId);
    } else {
      onTaskClick?.(taskId);
    }
  };

  // SVG element ref — needed for coordinate conversion in drag
  const svgRef = useRef<SVGSVGElement | null>(null);
  // Persistent ghost rect — positioned directly by drag hook (no React renders)
  const ghostRectRef = useRef<SVGRectElement | null>(null);

  // Build disabled task IDs set
  const disabledTaskIds = useMemo(
    () => new Set(tasks.filter((t: GanttTask) => t.disabled).map((t: GanttTask) => t.id)),
    [tasks],
  );

  // Drag interactions
  const drag = useGanttDrag({
    svgRef,
    ghostRectRef,
    bars,
    timeRange,
    columnWidth,
    viewMode,
    readOnly,
    disabledTaskIds,
    onTaskMove,
    onTaskResize,
    onProgressChange,
  });

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

  const rootClassName = [
    'gantt-core',
    drag.isDragging && 'gantt-core--dragging',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName} style={themeStyle}>
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
              ref={svgRef}
              className={`gantt-svg${!readOnly ? ' gantt-svg--interactive' : ''}`}
              width={totalWidth}
              height={totalHeight}
              onPointerMove={drag.handlePointerMove}
              onPointerUp={drag.handlePointerUp}
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

              {/* Dependency arrows layer (behind bars) */}
              {showDependencies && (
                <GanttDependencies
                  tasks={tasks}
                  bars={bars}
                  rowHeight={rowHeight}
                />
              )}

              {/* Bars layer */}
              <g className="gantt-bars-layer">
                {bars.map((bar) => (
                  <GanttTaskBar
                    key={bar.taskId}
                    bar={bar}
                    readOnly={readOnly}
                    disabled={disabledTaskIds.has(bar.taskId)}
                    onClick={handleBarClick}
                    onDoubleClick={onTaskDoubleClick}
                    onMoveStart={drag.handleMoveStart}
                    onResizeLeftStart={drag.handleResizeLeftStart}
                    onResizeRightStart={drag.handleResizeRightStart}
                    onProgressStart={drag.handleProgressStart}
                    didDrag={drag.didDrag}
                    clearDidDrag={drag.clearDidDrag}
                  />
                ))}
              </g>

              {/* Persistent ghost rect — positioned directly by drag hook via ref */}
              <g className="gantt-ghost-layer">
                <rect
                  ref={ghostRectRef}
                  className="gantt-bar-ghost"
                  rx={4}
                  ry={4}
                  style={{ display: 'none' }}
                />
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
