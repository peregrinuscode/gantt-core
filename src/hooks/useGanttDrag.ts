import { useState, useRef, useCallback, type RefObject } from 'react';
import type { ViewMode } from '../types';
import type { GanttBar } from './useGanttLayout';
import type { TimeRange } from '../utils/dateUtils';
import { xToDate, snapToGrid } from '../utils/dateUtils';

// ---- Types ----

export type DragMode = 'move' | 'resize-left' | 'resize-right' | 'progress';

export interface DragState {
  taskId: string;
  mode: DragMode;
  /** Bar coordinates at the start of the drag */
  originalBar: GanttBar;
  /** Current ghost bar position (updated during drag) */
  ghostBar: GanttBar;
  /** Current ghost progress value (only meaningful in progress mode) */
  ghostProgress: number;
}

interface DragTracker {
  startClientX: number;
  originalBar: GanttBar;
  mode: DragMode;
  taskId: string;
  activated: boolean;
}

const DEAD_ZONE = 3; // pixels before drag activates
const MIN_BAR_WIDTH = 10; // minimum bar width in pixels

interface UseGanttDragOptions {
  /** Ref to the SVG element — used for coordinate conversion */
  svgRef: RefObject<SVGSVGElement | null>;
  bars: GanttBar[];
  timeRange: TimeRange;
  columnWidth: number;
  viewMode: ViewMode;
  readOnly?: boolean;
  disabledTaskIds?: Set<string>;
  onTaskMove?: (event: { taskId: string; start: Date; end: Date }) => void;
  onTaskResize?: (event: { taskId: string; start: Date; end: Date }) => void;
  onProgressChange?: (event: { taskId: string; progress: number }) => void;
}

export interface UseGanttDragResult {
  dragState: DragState | null;
  isDragging: boolean;
  /** Whether a drag occurred (used for click suppression) */
  didDrag: boolean;
  /** Clear the didDrag flag after click handling */
  clearDidDrag: () => void;
  handleMoveStart: (taskId: string, e: React.PointerEvent) => void;
  handleResizeLeftStart: (taskId: string, e: React.PointerEvent) => void;
  handleResizeRightStart: (taskId: string, e: React.PointerEvent) => void;
  handleProgressStart: (taskId: string, e: React.PointerEvent) => void;
  /** Attach to SVG container's onPointerMove */
  handlePointerMove: (e: React.PointerEvent) => void;
  /** Attach to SVG container's onPointerUp */
  handlePointerUp: (e: React.PointerEvent) => void;
}

export function useGanttDrag(options: UseGanttDragOptions): UseGanttDragResult {
  const {
    svgRef,
    bars,
    timeRange,
    columnWidth,
    viewMode,
    readOnly = false,
    disabledTaskIds,
    onTaskMove,
    onTaskResize,
    onProgressChange,
  } = options;

  const [dragState, setDragState] = useState<DragState | null>(null);
  const trackerRef = useRef<DragTracker | null>(null);
  const didDragRef = useRef(false);
  // Stores the final drag result so we can fire callbacks outside setState
  const pendingResultRef = useRef<DragState | null>(null);

  const findBar = useCallback(
    (taskId: string) => bars.find((b) => b.taskId === taskId),
    [bars],
  );

  /**
   * Convert a clientX value to an x-coordinate in SVG space.
   * Uses the SVG ref's bounding rect (accounts for scroll, offset, etc.)
   */
  const clientXToSvgX = useCallback(
    (clientX: number): number => {
      const svgLeft = svgRef.current?.getBoundingClientRect().left ?? 0;
      return clientX - svgLeft;
    },
    [svgRef],
  );

  const startDrag = useCallback(
    (taskId: string, mode: DragMode, e: React.PointerEvent) => {
      if (readOnly || disabledTaskIds?.has(taskId)) return;

      const bar = findBar(taskId);
      if (!bar) return;

      // Capture pointer for reliable tracking even outside the element
      (e.target as Element).setPointerCapture(e.pointerId);
      e.preventDefault();

      trackerRef.current = {
        startClientX: e.clientX,
        originalBar: { ...bar },
        mode,
        taskId,
        activated: false,
      };
      didDragRef.current = false;
    },
    [readOnly, disabledTaskIds, findBar],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const tracker = trackerRef.current;
      if (!tracker) return;

      const deltaX = e.clientX - tracker.startClientX;
      const { originalBar, mode, taskId } = tracker;

      // Dead zone: don't activate drag until pointer moves > DEAD_ZONE pixels
      if (!tracker.activated) {
        if (Math.abs(deltaX) < DEAD_ZONE) return;
        tracker.activated = true;
        didDragRef.current = true;

        // Initialize drag state
        setDragState({
          taskId,
          mode,
          originalBar,
          ghostBar: { ...originalBar },
          ghostProgress: originalBar.progress,
        });
      }

      // For progress mode, compute SVG x-coordinate from the live pointer position.
      // Must be done synchronously before setDragState (event properties may go stale).
      let progressValue: number | undefined;
      if (mode === 'progress') {
        const svgX = clientXToSvgX(e.clientX);
        const pointerXInBar = svgX - originalBar.x;
        const rawProgress = (pointerXInBar / originalBar.width) * 100;
        progressValue = Math.round(Math.max(0, Math.min(100, rawProgress)));
      }

      // Update ghost based on mode
      setDragState((prev) => {
        if (!prev) return null;

        const ghost = { ...prev.originalBar };
        let ghostProgress = prev.originalBar.progress;

        switch (mode) {
          case 'move':
            ghost.x = originalBar.x + deltaX;
            break;

          case 'resize-left': {
            const newX = originalBar.x + deltaX;
            const newWidth = originalBar.width - deltaX;
            if (newWidth >= MIN_BAR_WIDTH) {
              ghost.x = newX;
              ghost.width = newWidth;
            } else {
              ghost.x = originalBar.x + originalBar.width - MIN_BAR_WIDTH;
              ghost.width = MIN_BAR_WIDTH;
            }
            break;
          }

          case 'resize-right': {
            const newWidth = originalBar.width + deltaX;
            ghost.width = Math.max(newWidth, MIN_BAR_WIDTH);
            break;
          }

          case 'progress':
            ghostProgress = progressValue!;
            break;
        }

        return {
          ...prev,
          ghostBar: ghost,
          ghostProgress,
        };
      });
    },
    [clientXToSvgX],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const tracker = trackerRef.current;
      if (!tracker) return;

      (e.target as Element).releasePointerCapture(e.pointerId);
      trackerRef.current = null;

      // If drag never activated, just clean up
      if (!tracker.activated) {
        setDragState(null);
        return;
      }

      // Read the final drag state, store it in a ref, then clear dragState.
      // We fire callbacks AFTER clearing state to avoid "setState during render".
      setDragState((prev) => {
        pendingResultRef.current = prev;
        return null;
      });

      // Fire callbacks outside the setState updater (deferred to next microtask)
      queueMicrotask(() => {
        const result = pendingResultRef.current;
        pendingResultRef.current = null;
        if (!result) return;

        const { mode, taskId, ghostBar, ghostProgress } = result;

        if (mode === 'progress') {
          onProgressChange?.({ taskId, progress: ghostProgress });
        } else {
          const newStart = snapToGrid(
            xToDate(ghostBar.x, timeRange, columnWidth, viewMode),
            viewMode,
          );
          const newEnd = snapToGrid(
            xToDate(ghostBar.x + ghostBar.width, timeRange, columnWidth, viewMode),
            viewMode,
          );

          if (mode === 'move') {
            onTaskMove?.({ taskId, start: newStart, end: newEnd });
          } else {
            onTaskResize?.({ taskId, start: newStart, end: newEnd });
          }
        }
      });
    },
    [timeRange, columnWidth, viewMode, onTaskMove, onTaskResize, onProgressChange],
  );

  const handleMoveStart = useCallback(
    (taskId: string, e: React.PointerEvent) => startDrag(taskId, 'move', e),
    [startDrag],
  );

  const handleResizeLeftStart = useCallback(
    (taskId: string, e: React.PointerEvent) => startDrag(taskId, 'resize-left', e),
    [startDrag],
  );

  const handleResizeRightStart = useCallback(
    (taskId: string, e: React.PointerEvent) => startDrag(taskId, 'resize-right', e),
    [startDrag],
  );

  const handleProgressStart = useCallback(
    (taskId: string, e: React.PointerEvent) => startDrag(taskId, 'progress', e),
    [startDrag],
  );

  const clearDidDrag = useCallback(() => {
    didDragRef.current = false;
  }, []);

  return {
    dragState,
    isDragging: dragState !== null,
    didDrag: didDragRef.current,
    clearDidDrag,
    handleMoveStart,
    handleResizeLeftStart,
    handleResizeRightStart,
    handleProgressStart,
    handlePointerMove,
    handlePointerUp,
  };
}
