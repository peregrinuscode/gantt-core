import { useCallback, useState } from 'react';

export interface UseGanttTreeResult {
  /** Set of currently collapsed IDs (group or task IDs) */
  collapsedIds: Set<string>;
  /** Toggle the collapsed state of a group or parent task */
  toggleCollapse: (id: string) => void;
  /** Check if a given ID is collapsed */
  isCollapsed: (id: string) => boolean;
}

/**
 * Manage expand/collapse state for groups and parent tasks.
 *
 * All items start expanded (empty Set) unless `initialCollapsed` is provided.
 */
export function useGanttTree(
  initialCollapsed?: Iterable<string>,
): UseGanttTreeResult {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => new Set(initialCollapsed),
  );

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isCollapsed = useCallback(
    (id: string) => collapsedIds.has(id),
    [collapsedIds],
  );

  return { collapsedIds, toggleCollapse, isCollapsed };
}
