// ============================================================
// @peregrinus/gantt-core — Arrow Path Computation
// ============================================================
// Generates SVG path data for dependency arrows between task bars.
// Uses horizontal-first polyline routing with rounded corners.
// ============================================================

/** Input endpoints for an arrow from source bar to target bar */
export interface ArrowEndpoints {
  /** Source bar right edge x */
  sourceX: number;
  /** Source bar vertical center y */
  sourceY: number;
  /** Target bar left edge x */
  targetX: number;
  /** Target bar vertical center y */
  targetY: number;
  /** Row height — used for detour routing when bars overlap */
  rowHeight: number;
  /** Source bar width — used for backward routing */
  sourceWidth: number;
  /** Source bar top y */
  sourceTop: number;
  /** Target bar top y */
  targetTop: number;
  /** Source bar height */
  sourceHeight: number;
  /** Target bar height */
  targetHeight: number;
}

/** Result: SVG path `d` attribute + arrowhead polygon `points` */
export interface ArrowPathResult {
  /** SVG path d attribute for the connecting line */
  path: string;
  /** SVG polygon points for the arrowhead triangle */
  arrowHead: string;
}

const ARROW_SIZE = 5;
const H_GAP = 12; // horizontal gap from bar edge before turning

/**
 * Compute the SVG path and arrowhead for a dependency arrow.
 *
 * Two routing cases:
 * 1. **Normal**: target is to the right of source — route right → vertical → right to target
 * 2. **Backward**: target overlaps or is left of source — route around via detour
 */
export function computeArrowPath(
  ep: ArrowEndpoints,
  cornerRadius = 4,
): ArrowPathResult {
  const r = cornerRadius;

  // Arrowhead always points right into the target bar's left edge
  const arrowHead = [
    `${ep.targetX - ARROW_SIZE},${ep.targetY - ARROW_SIZE}`,
    `${ep.targetX},${ep.targetY}`,
    `${ep.targetX - ARROW_SIZE},${ep.targetY + ARROW_SIZE}`,
  ].join(' ');

  // Stop the line just before the arrowhead
  const endX = ep.targetX - ARROW_SIZE;

  if (ep.targetX - ep.sourceX > H_GAP * 2) {
    // Normal case: target is well to the right of source
    return normalPath(ep, endX, r, arrowHead);
  }

  // Backward/overlapping case: route around
  return backwardPath(ep, endX, r, arrowHead);
}

function normalPath(
  ep: ArrowEndpoints,
  endX: number,
  r: number,
  arrowHead: string,
): ArrowPathResult {
  const midX = ep.sourceX + H_GAP;
  const dy = ep.targetY - ep.sourceY;

  if (Math.abs(dy) < 1) {
    // Same row — straight horizontal line
    return {
      path: `M ${ep.sourceX},${ep.sourceY} L ${endX},${ep.targetY}`,
      arrowHead,
    };
  }

  // Clamp corner radius to half the available vertical distance
  const maxR = Math.min(r, Math.abs(dy) / 2, H_GAP / 2);
  const dir = dy > 0 ? 1 : -1;

  // Route: right from source → turn vertical → vertical → turn horizontal → right to target
  const path = [
    `M ${ep.sourceX},${ep.sourceY}`,
    // Horizontal to first turn
    `L ${midX - maxR},${ep.sourceY}`,
    // Round corner: turn from horizontal to vertical
    `Q ${midX},${ep.sourceY} ${midX},${ep.sourceY + maxR * dir}`,
    // Vertical segment
    `L ${midX},${ep.targetY - maxR * dir}`,
    // Round corner: turn from vertical to horizontal
    `Q ${midX},${ep.targetY} ${midX + maxR},${ep.targetY}`,
    // Horizontal to arrowhead
    `L ${endX},${ep.targetY}`,
  ].join(' ');

  return { path, arrowHead };
}

function backwardPath(
  ep: ArrowEndpoints,
  endX: number,
  r: number,
  arrowHead: string,
): ArrowPathResult {
  // Detour: go right from source, then down/up below/above both bars,
  // then left past target, then up/down to target row, then right to target.
  const rightX = ep.sourceX + H_GAP;
  const leftX = ep.targetX - H_GAP - ARROW_SIZE;

  // Detour vertically: go below both bars (or above if target is below source)
  const sourceBottom = ep.sourceTop + ep.sourceHeight;
  const targetBottom = ep.targetTop + ep.targetHeight;
  const detourY = Math.max(sourceBottom, targetBottom) + ep.rowHeight * 0.4;

  const maxR = Math.min(r, H_GAP / 2);

  const path = [
    `M ${ep.sourceX},${ep.sourceY}`,
    // Right from source
    `L ${rightX - maxR},${ep.sourceY}`,
    `Q ${rightX},${ep.sourceY} ${rightX},${ep.sourceY + maxR}`,
    // Down to detour level
    `L ${rightX},${detourY - maxR}`,
    `Q ${rightX},${detourY} ${rightX - maxR},${detourY}`,
    // Left to target column
    `L ${leftX + maxR},${detourY}`,
    `Q ${leftX},${detourY} ${leftX},${detourY - maxR}`,
    // Up to target row
    `L ${leftX},${ep.targetY + maxR}`,
    `Q ${leftX},${ep.targetY} ${leftX + maxR},${ep.targetY}`,
    // Right to arrowhead
    `L ${endX},${ep.targetY}`,
  ].join(' ');

  return { path, arrowHead };
}
