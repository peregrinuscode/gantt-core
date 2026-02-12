import { useMemo } from 'react';
import type { GanttTask } from '../types';
import type { GanttBar } from '../hooks/useGanttLayout';
import { computeArrowPath } from '../utils/arrowPath';

interface GanttDependenciesProps {
  tasks: GanttTask[];
  bars: GanttBar[];
  rowHeight: number;
}

export function GanttDependencies({ tasks, bars, rowHeight }: GanttDependenciesProps) {
  const arrows = useMemo(() => {
    // Build O(1) lookup: taskId → bar
    const barMap = new Map<string, GanttBar>();
    for (const bar of bars) {
      barMap.set(bar.taskId, bar);
    }

    const result: { key: string; path: string; arrowHead: string }[] = [];

    for (const task of tasks) {
      if (!task.dependencies?.length) continue;

      const targetBar = barMap.get(task.id);
      if (!targetBar) continue; // target is hidden (collapsed)

      for (const depId of task.dependencies) {
        const sourceBar = barMap.get(depId);
        if (!sourceBar) continue; // source is hidden (collapsed)

        const arrow = computeArrowPath({
          sourceX: sourceBar.x + sourceBar.width,
          sourceY: sourceBar.y + sourceBar.height / 2,
          targetX: targetBar.x,
          targetY: targetBar.y + targetBar.height / 2,
          rowHeight,
          sourceWidth: sourceBar.width,
          sourceTop: sourceBar.y,
          targetTop: targetBar.y,
          sourceHeight: sourceBar.height,
          targetHeight: targetBar.height,
        });

        result.push({
          key: `${depId}->${task.id}`,
          path: arrow.path,
          arrowHead: arrow.arrowHead,
        });
      }
    }

    return result;
  }, [tasks, bars, rowHeight]);

  if (arrows.length === 0) return null;

  return (
    <g className="gantt-dependencies-layer">
      {arrows.map((arrow) => (
        <g key={arrow.key}>
          <path className="gantt-arrow-path" d={arrow.path} />
          <polygon className="gantt-arrow-head" points={arrow.arrowHead} />
        </g>
      ))}
    </g>
  );
}
