import type { GanttBar } from '../hooks/useGanttLayout';

interface GanttTaskBarProps {
  bar: GanttBar;
  onClick?: (taskId: string) => void;
  onDoubleClick?: (taskId: string) => void;
}

const MIN_LABEL_WIDTH = 60;

export function GanttTaskBar({ bar, onClick, onDoubleClick }: GanttTaskBarProps) {
  const radius = 4; // matches --gantt-bar-radius default
  const progressWidth = bar.width * (bar.progress / 100);

  return (
    <g
      className="gantt-bar-group"
      onClick={() => onClick?.(bar.taskId)}
      onDoubleClick={() => onDoubleClick?.(bar.taskId)}
    >
      {/* Background bar */}
      <rect
        className="gantt-bar-bg"
        x={bar.x}
        y={bar.y}
        width={bar.width}
        height={bar.height}
        rx={radius}
        ry={radius}
        fill={bar.color}
      />

      {/* Progress overlay */}
      {bar.progress > 0 && (
        <rect
          className="gantt-bar-progress"
          x={bar.x}
          y={bar.y}
          width={progressWidth}
          height={bar.height}
          rx={radius}
          ry={radius}
          fill="rgba(0, 0, 0, 0.2)"
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
    </g>
  );
}
