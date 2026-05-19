import React from 'react';
import type { GanttBar } from '../hooks/useGanttLayout';
import type { GanttBarIndicator } from '../types';

interface GanttTaskBarProps {
  bar: GanttBar;
  readOnly?: boolean;
  disabled?: boolean;
  onClick?: (taskId: string) => void;
  onDoubleClick?: (taskId: string) => void;
  onMoveStart?: (taskId: string, e: React.PointerEvent) => void;
  onResizeLeftStart?: (taskId: string, e: React.PointerEvent) => void;
  onResizeRightStart?: (taskId: string, e: React.PointerEvent) => void;
  onProgressStart?: (taskId: string, e: React.PointerEvent) => void;
  /** Whether a drag just occurred (suppresses click) */
  didDrag?: boolean;
  clearDidDrag?: () => void;
}

const MIN_LABEL_WIDTH = 60;
const HANDLE_WIDTH = 8;
const PROGRESS_HANDLE_RADIUS = 5;
const INDICATOR_DOT_RADIUS = 4;
const INDICATOR_DOT_INSET = 6;

function indicatorCenter(
  bar: { x: number; y: number; width: number; height: number },
  indicator: GanttBarIndicator,
): { cx: number; cy: number } {
  const left = bar.x + INDICATOR_DOT_INSET;
  const right = bar.x + bar.width - INDICATOR_DOT_INSET;
  const top = bar.y + INDICATOR_DOT_INSET;
  const bottom = bar.y + bar.height - INDICATOR_DOT_INSET;
  switch (indicator.position) {
    case 'top-left':     return { cx: left,  cy: top };
    case 'bottom-right': return { cx: right, cy: bottom };
    case 'bottom-left':  return { cx: left,  cy: bottom };
    case 'top-right':
    default:             return { cx: right, cy: top };
  }
}

export function GanttTaskBar({
  bar,
  readOnly,
  disabled,
  onClick,
  onDoubleClick,
  onMoveStart,
  onResizeLeftStart,
  onResizeRightStart,
  onProgressStart,
  didDrag,
  clearDidDrag,
}: GanttTaskBarProps) {
  const radius = 4;
  const interactive = !readOnly && !disabled && !bar.isSummary;

  const handleClick = (e: React.MouseEvent) => {
    if (didDrag) {
      clearDidDrag?.();
      e.stopPropagation();
      return;
    }
    onClick?.(bar.taskId);
  };

  const handleDoubleClick = () => {
    if (didDrag) return;
    onDoubleClick?.(bar.taskId);
  };

  const severityClass =
    bar.severity === 'warning'
      ? 'gantt-bar-group--warning'
      : bar.severity === 'critical' || bar.critical
        ? 'gantt-bar-group--critical'
        : null;

  const className = [
    'gantt-bar-group',
    interactive && 'gantt-bar-group--interactive',
    disabled && 'gantt-bar-group--disabled',
    bar.isSummary && 'gantt-bar-group--summary',
    severityClass,
    bar.kind === 'milestone' && 'gantt-bar-group--milestone',
  ]
    .filter(Boolean)
    .join(' ');

  const indicators = bar.indicators ?? [];

  if (bar.kind === 'milestone') {
    const cx = bar.x + bar.width / 2;
    const cy = bar.y + bar.height / 2;
    const points = [
      `${cx},${bar.y}`,
      `${bar.x + bar.width},${cy}`,
      `${cx},${bar.y + bar.height}`,
      `${bar.x},${cy}`,
    ].join(' ');

    return (
      <g
        className={className}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <polygon
          className="gantt-milestone"
          points={points}
          fill={bar.color}
          onPointerDown={
            interactive ? (e) => onMoveStart?.(bar.taskId, e) : undefined
          }
        />
        <text
          className="gantt-milestone-label"
          x={bar.x + bar.width + 6}
          y={cy}
        >
          {bar.name}
        </text>
        {indicators.map((ind, i) => {
          const { cx: ix, cy: iy } = indicatorCenter(bar, ind);
          return (
            <circle
              key={`ind-${i}`}
              className="gantt-bar-indicator"
              cx={ix}
              cy={iy}
              r={INDICATOR_DOT_RADIUS}
              fill={ind.color}
            >
              {ind.label && <title>{ind.label}</title>}
            </circle>
          );
        })}
      </g>
    );
  }

  const progressWidth = bar.width * (bar.progress / 100);

  return (
    <g
      className={className}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Background bar — also the move drag target */}
      <rect
        className="gantt-bar-bg"
        x={bar.x}
        y={bar.y}
        width={bar.width}
        height={bar.height}
        rx={radius}
        ry={radius}
        fill={bar.color}
        onPointerDown={
          interactive
            ? (e) => onMoveStart?.(bar.taskId, e)
            : undefined
        }
      />

      {/* Progress overlay — full-width rect clipped to progressWidth.
           Using full width so left corners match the background bar's rounding,
           while the clipPath gives a clean straight edge on the right. */}
      {bar.progress > 0 && (
        <rect
          className="gantt-bar-progress"
          data-progress-task={bar.taskId}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          rx={radius}
          ry={radius}
          fill="var(--gantt-bar-progress-fill)"
          clipPath={`inset(0 ${bar.width - progressWidth}px 0 0)`}
        />
      )}

      {/* Task name label */}
      {bar.width > MIN_LABEL_WIDTH && (
        <text
          className="gantt-bar-label"
          x={bar.x + bar.width / 2}
          y={bar.y + bar.height / 2}
        >
          {bar.name}
        </text>
      )}

      {/* Interactive handles — only rendered when not readOnly/disabled */}
      {interactive && (
        <>
          {/* Left resize handle */}
          <rect
            className="gantt-bar-resize-handle"
            x={bar.x}
            y={bar.y}
            width={HANDLE_WIDTH}
            height={bar.height}
            rx={radius}
            ry={radius}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeLeftStart?.(bar.taskId, e);
            }}
          />

          {/* Right resize handle */}
          <rect
            className="gantt-bar-resize-handle"
            x={bar.x + bar.width - HANDLE_WIDTH}
            y={bar.y}
            width={HANDLE_WIDTH}
            height={bar.height}
            rx={radius}
            ry={radius}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeRightStart?.(bar.taskId, e);
            }}
          />

          {/* Progress handle — circle at progress boundary */}
          <circle
            className="gantt-bar-progress-handle"
            data-progress-handle={bar.taskId}
            cx={bar.x + progressWidth}
            cy={bar.y + bar.height / 2}
            r={PROGRESS_HANDLE_RADIUS}
            onPointerDown={(e) => {
              e.stopPropagation();
              onProgressStart?.(bar.taskId, e);
            }}
          />
        </>
      )}

      {/* Per-bar indicator badges (e.g., overdue dot) — rendered last so they sit on top */}
      {indicators.map((ind, i) => {
        const { cx: ix, cy: iy } = indicatorCenter(bar, ind);
        return (
          <circle
            key={`ind-${i}`}
            className="gantt-bar-indicator"
            cx={ix}
            cy={iy}
            r={INDICATOR_DOT_RADIUS}
            fill={ind.color}
          >
            {ind.label && <title>{ind.label}</title>}
          </circle>
        );
      })}
    </g>
  );
}
