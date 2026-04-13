import { useMemo } from 'react';
import type { GanttDependency } from '../types';
import type { GanttBar } from '../hooks/useGanttLayout';
import { computeArrowPath } from '../utils/arrowPath';

interface GanttDependenciesProps {
  dependencies: GanttDependency[];
  bars: GanttBar[];
  rowHeight: number;
}

export function GanttDependencies({ dependencies, bars, rowHeight }: GanttDependenciesProps) {
  const arrows = useMemo(() => {
    const barMap = new Map<string, GanttBar>();
    for (const bar of bars) {
      barMap.set(bar.taskId, bar);
    }

    const result: { key: string; path: string; arrowHead: string }[] = [];

    for (const dep of dependencies) {
      const sourceBar = barMap.get(dep.fromTaskId);
      const targetBar = barMap.get(dep.toTaskId);
      if (!sourceBar || !targetBar) continue; // one endpoint is hidden (collapsed)

      const arrow = computeArrowPath({
        sourceLeft: sourceBar.x,
        sourceTop: sourceBar.y,
        sourceWidth: sourceBar.width,
        sourceHeight: sourceBar.height,
        targetLeft: targetBar.x,
        targetTop: targetBar.y,
        targetWidth: targetBar.width,
        targetHeight: targetBar.height,
        rowHeight,
        type: dep.type,
      });

      result.push({
        key: `${dep.fromTaskId}->${dep.toTaskId}:${dep.type}`,
        path: arrow.path,
        arrowHead: arrow.arrowHead,
      });
    }

    return result;
  }, [dependencies, bars, rowHeight]);

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
