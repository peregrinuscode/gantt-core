import { describe, expect, it } from 'vitest';
import { computeArrowPath, type ArrowEndpoints } from './arrowPath';
import type { DependencyType } from '../types';

const baseEp: Omit<ArrowEndpoints, 'type'> = {
  sourceLeft: 100,
  sourceTop: 20,
  sourceWidth: 80,
  sourceHeight: 20,
  targetLeft: 300,
  targetTop: 80,
  targetWidth: 80,
  targetHeight: 20,
  rowHeight: 40,
};

// Derived for readability:
// sourceRight = 180, targetRight = 380
// sourceY (mid) = 30, targetY (mid) = 90

function tipOf(arrowHead: string): { x: number; y: number } {
  // Polygon points come space-separated as "x,y x,y x,y" — middle vertex is the tip.
  const points = arrowHead.trim().split(/\s+/);
  const [x, y] = points[1].split(',').map(Number);
  return { x, y };
}

describe('computeArrowPath', () => {
  const cases: Array<{
    type: DependencyType;
    pathStart: string;
    tip: { x: number; y: number };
  }> = [
    { type: 'FS', pathStart: 'M 180,30', tip: { x: 300, y: 90 } },
    { type: 'SS', pathStart: 'M 100,30', tip: { x: 300, y: 90 } },
    { type: 'FF', pathStart: 'M 180,30', tip: { x: 380, y: 90 } },
    { type: 'SF', pathStart: 'M 100,30', tip: { x: 380, y: 90 } },
  ];

  for (const { type, pathStart, tip } of cases) {
    it(`${type}: path starts at the correct anchor and arrowhead tip lands on the target anchor`, () => {
      const result = computeArrowPath({ ...baseEp, type });

      expect(result.path.startsWith(pathStart)).toBe(true);
      expect(tipOf(result.arrowHead)).toEqual(tip);
    });
  }
});
