import React from 'react';
import type { GanttBar } from '../hooks/useGanttLayout';

interface GanttTaskBarProps {
  bar: GanttBar;
  readOnly?: boolean;
  disabled?: boolean;
  /** Live progress override during drag (0-100). When set, the overlay and handle use this instead of bar.progress. */
  progressOverride?: number;
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

export function GanttTaskBar({
  bar,
  readOnly,
  disabled,
  progressOverride,
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
  const effectiveProgress = progressOverride ?? bar.progress;
  const progressWidth = bar.width * (effectiveProgress / 100);
  const interactive = !readOnly && !disabled;

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

  const className = [
    'gantt-bar-group',
    interactive && 'gantt-bar-group--interactive',
    disabled && 'gantt-bar-group--disabled',
  ]
    .filter(Boolean)
    .join(' ');

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
      {effectiveProgress > 0 && (
        <rect
          className="gantt-bar-progress"
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
    </g>
  );
}
