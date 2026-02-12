import { useCallback, useRef, useState } from 'react';

export interface UseGanttScrollResult {
  /** Ref to attach to the scrollable container */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Current horizontal scroll position (for syncing the header) */
  scrollLeft: number;
  /** Scroll event handler to attach to the container */
  handleScroll: () => void;
}

/**
 * Track horizontal scroll position of the timeline container.
 *
 * Attach `containerRef` and `handleScroll` to the scrollable div.
 * Read `scrollLeft` to offset the header by the same amount.
 */
export function useGanttScroll(): UseGanttScrollResult {
  const containerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollLeft(containerRef.current.scrollLeft);
    }
  }, []);

  return { containerRef, scrollLeft, handleScroll };
}
