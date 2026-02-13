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
  /** Ref to the persistent ghost <rect> element — positioned directly during drag */
  ghostRectRef: RefObject<SVGRectElement | null>;
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
  /** True while a drag is active (toggles at start/end — only 2 renders per drag) */
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
    ghostRectRef,
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

  // Only boolean state — toggles at drag start/end (2 renders per drag cycle)
  const [isDragging, setIsDragging] = useState(false);

  // All mutable drag state lives in refs — no React re-renders during drag
  const dragStateRef = useRef<DragState | null>(null);
  const trackerRef = useRef<DragTracker | null>(null);
  const didDragRef = useRef(false);

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

        // Single React render to set isDragging (adds CSS class, cursor)
        setIsDragging(true);

        // Initialize drag state in ref (no render)
        dragStateRef.current = {
          taskId,
          mode,
          originalBar,
          ghostBar: { ...originalBar },
          ghostProgress: originalBar.progress,
        };

        // Show ghost rect for move/resize modes
        if (mode !== 'progress' && ghostRectRef.current) {
          const g = ghostRectRef.current;
          g.style.display = '';
          g.setAttribute('x', String(originalBar.x));
          g.setAttribute('y', String(originalBar.y));
          g.setAttribute('width', String(originalBar.width));
          g.setAttribute('height', String(originalBar.height));
          g.setAttribute('fill', originalBar.color);
        }
      }

      const state = dragStateRef.current;
      if (!state) return;

      // Compute new ghost position based on drag mode
      const ghost = { ...state.originalBar };
      let ghostProgress = state.originalBar.progress;

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

        case 'progress': {
          const svgX = clientXToSvgX(e.clientX);
          const pointerXInBar = svgX - originalBar.x;
          const rawProgress = (pointerXInBar / originalBar.width) * 100;
          ghostProgress = Math.round(Math.max(0, Math.min(100, rawProgress)));
          break;
        }
      }

      // Update ref (no React render)
      dragStateRef.current = { ...state, ghostBar: ghost, ghostProgress };

      // ---- Direct DOM updates (bypass React for 60fps) ----

      if (mode !== 'progress' && ghostRectRef.current) {
        const g = ghostRectRef.current;
        g.setAttribute('x', String(ghost.x));
        g.setAttribute('y', String(ghost.y));
        g.setAttribute('width', String(ghost.width));
        g.setAttribute('height', String(ghost.height));
      }

      if (mode === 'progress' && svgRef.current) {
        const progressRect = svgRef.current.querySelector(
          `[data-progress-task="${taskId}"]`,
        ) as SVGRectElement | null;
        const progressHandle = svgRef.current.querySelector(
          `[data-progress-handle="${taskId}"]`,
        ) as SVGCircleElement | null;
        const progressWidth = originalBar.width * (ghostProgress / 100);

        if (progressRect) {
          const clipRight = originalBar.width - progressWidth;
          progressRect.setAttribute(
            'clip-path',
            `inset(0 ${clipRight}px 0 0)`,
          );
          progressRect.style.display = ghostProgress > 0 ? '' : 'none';
        }
        if (progressHandle) {
          progressHandle.setAttribute(
            'cx',
            String(originalBar.x + progressWidth),
          );
        }
      }
    },
    [clientXToSvgX, ghostRectRef, svgRef],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const tracker = trackerRef.current;
      if (!tracker) return;

      (e.target as Element).releasePointerCapture(e.pointerId);
      trackerRef.current = null;

      // If drag never activated, just clean up
      if (!tracker.activated) {
        return;
      }

      // Read final drag state from ref
      const result = dragStateRef.current;
      dragStateRef.current = null;

      // Hide ghost rect
      if (ghostRectRef.current) {
        ghostRectRef.current.style.display = 'none';
      }

      // Single React render to clear isDragging
      setIsDragging(false);

      if (!result) return;

      const { mode, taskId, ghostBar, ghostProgress } = result;

      // Fire callbacks outside the render cycle (deferred to next microtask)
      queueMicrotask(() => {
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
    [timeRange, columnWidth, viewMode, onTaskMove, onTaskResize, onProgressChange, ghostRectRef],
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
    isDragging,
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
