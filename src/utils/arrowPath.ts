// ============================================================
// @peregrinus/gantt-core — Arrow Path Computation
// ============================================================
// Generates SVG path data for typed dependency arrows.
// Supports all four dependency types: FS / SS / FF / SF.
//
// Routing anchors per type:
//   FS: source right-edge  → target left-edge   (arrowhead → right)
//   SS: source left-edge   → target left-edge   (arrowhead → right)
//   FF: source right-edge  → target right-edge  (arrowhead ← left)
//   SF: source left-edge   → target right-edge  (arrowhead ← left)
// ============================================================

import type { DependencyType } from '../types';

/** Source and target bar geometry + dependency type */
export interface ArrowEndpoints {
  /** Source bar left-edge x */
  sourceLeft: number;
  /** Source bar top y */
  sourceTop: number;
  /** Source bar width (0 for milestones) */
  sourceWidth: number;
  /** Source bar height */
  sourceHeight: number;
  /** Target bar left-edge x */
  targetLeft: number;
  /** Target bar top y */
  targetTop: number;
  /** Target bar width (0 for milestones) */
  targetWidth: number;
  /** Target bar height */
  targetHeight: number;
  /** Row height — used to size the detour offset below/above bars */
  rowHeight: number;
  /** Dependency type — selects source/target edges and routing */
  type: DependencyType;
}

/** Result: SVG path `d` attribute + arrowhead polygon `points` */
export interface ArrowPathResult {
  path: string;
  arrowHead: string;
}

const ARROW_SIZE = 5;
const H_GAP = 12;

/**
 * Compute the SVG path and arrowhead for a typed dependency arrow.
 */
export function computeArrowPath(
  ep: ArrowEndpoints,
  cornerRadius = 4,
): ArrowPathResult {
  const sourceRight = ep.sourceLeft + ep.sourceWidth;
  const targetRight = ep.targetLeft + ep.targetWidth;
  const sourceY = ep.sourceTop + ep.sourceHeight / 2;
  const targetY = ep.targetTop + ep.targetHeight / 2;

  switch (ep.type) {
    case 'FS':
      return routeFS(ep, sourceRight, sourceY, targetY, cornerRadius);
    case 'SS':
      return routeSS(ep, sourceY, targetY, cornerRadius);
    case 'FF':
      return routeFF(sourceRight, targetRight, sourceY, targetY, cornerRadius);
    case 'SF':
      return routeSF(ep, targetRight, sourceY, targetY, cornerRadius);
  }
}

// --- Arrowheads (triangle points at the tip) ---

function arrowHeadPointingRight(tipX: number, tipY: number): string {
  return [
    `${tipX - ARROW_SIZE},${tipY - ARROW_SIZE}`,
    `${tipX},${tipY}`,
    `${tipX - ARROW_SIZE},${tipY + ARROW_SIZE}`,
  ].join(' ');
}

function arrowHeadPointingLeft(tipX: number, tipY: number): string {
  return [
    `${tipX + ARROW_SIZE},${tipY - ARROW_SIZE}`,
    `${tipX},${tipY}`,
    `${tipX + ARROW_SIZE},${tipY + ARROW_SIZE}`,
  ].join(' ');
}

// --- FS: source-right → target-left, arrow points right ---

function routeFS(
  ep: ArrowEndpoints,
  sourceRight: number,
  sourceY: number,
  targetY: number,
  r: number,
): ArrowPathResult {
  const arrowHead = arrowHeadPointingRight(ep.targetLeft, targetY);
  const lineEndX = ep.targetLeft - ARROW_SIZE;

  if (ep.targetLeft - sourceRight > H_GAP * 2) {
    return sCurveForward(sourceRight, sourceY, lineEndX, targetY, sourceRight + H_GAP, r, arrowHead);
  }

  const detourY = detourYBelow(ep);
  return detourPath(
    sourceRight, sourceY, 'right',
    lineEndX, targetY, 'left',
    sourceRight + H_GAP,
    ep.targetLeft - H_GAP,
    detourY,
    r,
    arrowHead,
  );
}

// --- SS: source-left → target-left, arrow points right ---

function routeSS(
  ep: ArrowEndpoints,
  sourceY: number,
  targetY: number,
  r: number,
): ArrowPathResult {
  const arrowHead = arrowHeadPointingRight(ep.targetLeft, targetY);
  const lineEndX = ep.targetLeft - ARROW_SIZE;
  const detourX = Math.min(ep.sourceLeft, ep.targetLeft) - H_GAP;

  return sideColumnPath(
    ep.sourceLeft, sourceY, 'left',
    lineEndX, targetY, 'right',
    detourX,
    r,
    arrowHead,
  );
}

// --- FF: source-right → target-right, arrow points left ---

function routeFF(
  sourceRight: number,
  targetRight: number,
  sourceY: number,
  targetY: number,
  r: number,
): ArrowPathResult {
  const arrowHead = arrowHeadPointingLeft(targetRight, targetY);
  const lineEndX = targetRight + ARROW_SIZE;
  const detourX = Math.max(sourceRight, targetRight) + H_GAP;

  return sideColumnPath(
    sourceRight, sourceY, 'right',
    lineEndX, targetY, 'left',
    detourX,
    r,
    arrowHead,
  );
}

// --- SF: source-left → target-right, arrow points left ---

function routeSF(
  ep: ArrowEndpoints,
  targetRight: number,
  sourceY: number,
  targetY: number,
  r: number,
): ArrowPathResult {
  const arrowHead = arrowHeadPointingLeft(targetRight, targetY);
  const lineEndX = targetRight + ARROW_SIZE;

  // If target sits entirely to the left of source, a simple leftward S-curve works.
  if (ep.sourceLeft - targetRight > H_GAP * 2) {
    return sCurveBackward(ep.sourceLeft, sourceY, lineEndX, targetY, ep.sourceLeft - H_GAP, r, arrowHead);
  }

  // Otherwise route around both bars (below).
  const detourY = detourYBelow(ep);
  return detourPath(
    ep.sourceLeft, sourceY, 'left',
    lineEndX, targetY, 'right',
    ep.sourceLeft - H_GAP,
    targetRight + H_GAP,
    detourY,
    r,
    arrowHead,
  );
}

// --- Shared helpers ---

function detourYBelow(ep: ArrowEndpoints): number {
  const sourceBottom = ep.sourceTop + ep.sourceHeight;
  const targetBottom = ep.targetTop + ep.targetHeight;
  return Math.max(sourceBottom, targetBottom) + ep.rowHeight * 0.4;
}

/**
 * Horizontal → vertical → horizontal, overall-rightward motion.
 * Staged through a `midX` column between source and target.
 */
function sCurveForward(
  startX: number, startY: number,
  endX: number, endY: number,
  midX: number,
  r: number, arrowHead: string,
): ArrowPathResult {
  const dy = endY - startY;

  if (Math.abs(dy) < 1) {
    return { path: `M ${startX},${startY} L ${endX},${endY}`, arrowHead };
  }

  const maxR = Math.min(r, Math.abs(dy) / 2, H_GAP / 2);
  const dir = dy > 0 ? 1 : -1;

  const path = [
    `M ${startX},${startY}`,
    `L ${midX - maxR},${startY}`,
    `Q ${midX},${startY} ${midX},${startY + maxR * dir}`,
    `L ${midX},${endY - maxR * dir}`,
    `Q ${midX},${endY} ${midX + maxR},${endY}`,
    `L ${endX},${endY}`,
  ].join(' ');

  return { path, arrowHead };
}

/**
 * Horizontal → vertical → horizontal, overall-leftward motion.
 * Mirror of sCurveForward.
 */
function sCurveBackward(
  startX: number, startY: number,
  endX: number, endY: number,
  midX: number,
  r: number, arrowHead: string,
): ArrowPathResult {
  const dy = endY - startY;

  if (Math.abs(dy) < 1) {
    return { path: `M ${startX},${startY} L ${endX},${endY}`, arrowHead };
  }

  const maxR = Math.min(r, Math.abs(dy) / 2, H_GAP / 2);
  const dir = dy > 0 ? 1 : -1;

  const path = [
    `M ${startX},${startY}`,
    `L ${midX + maxR},${startY}`,
    `Q ${midX},${startY} ${midX},${startY + maxR * dir}`,
    `L ${midX},${endY - maxR * dir}`,
    `Q ${midX},${endY} ${midX - maxR},${endY}`,
    `L ${endX},${endY}`,
  ].join(' ');

  return { path, arrowHead };
}

/**
 * Route via a single column offset to the side of both bars.
 * Used by SS (column to the left of both) and FF (column to the right of both).
 *
 * - startSide: which side the column sits on relative to startX
 * - endSide: which side the column sits on relative to endX
 */
function sideColumnPath(
  startX: number, startY: number, startSide: 'left' | 'right',
  endX: number, endY: number, endSide: 'left' | 'right',
  colX: number,
  r: number, arrowHead: string,
): ArrowPathResult {
  const dy = endY - startY;
  const maxR = Math.min(r, Math.max(Math.abs(dy) / 2, 1), H_GAP / 2);
  const dirV = dy >= 0 ? 1 : -1;

  // Horizontal direction from start to column (negative means leftward)
  const startToColDir = startSide === 'left' ? -1 : 1;
  // Horizontal direction from column to end
  const colToEndDir = endSide === 'left' ? 1 : -1;

  const path = [
    `M ${startX},${startY}`,
    // Horizontal from start toward the column (stop short to leave room for curve)
    `L ${colX - startToColDir * maxR},${startY}`,
    // Curve into vertical
    `Q ${colX},${startY} ${colX},${startY + maxR * dirV}`,
    // Vertical segment to target row
    `L ${colX},${endY - maxR * dirV}`,
    // Curve out of vertical
    `Q ${colX},${endY} ${colX + colToEndDir * maxR},${endY}`,
    // Horizontal to end
    `L ${endX},${endY}`,
  ].join(' ');

  return { path, arrowHead };
}

/**
 * Full detour around both bars: out to startColX, down to detourY,
 * across to endColX, up to endY, in to endX.
 *
 * - startSide/endSide: which side of the respective anchor the detour column sits.
 */
function detourPath(
  startX: number, startY: number, startSide: 'left' | 'right',
  endX: number, endY: number, endSide: 'left' | 'right',
  startColX: number,
  endColX: number,
  detourY: number,
  r: number, arrowHead: string,
): ArrowPathResult {
  const maxR = Math.min(r, H_GAP / 2);

  const startToColDir = startSide === 'left' ? -1 : 1;
  const colToEndDir = endSide === 'left' ? 1 : -1;
  const horizontalDir = endColX > startColX ? 1 : -1;

  const path = [
    `M ${startX},${startY}`,
    // Horizontal from source anchor to startColX
    `L ${startColX - startToColDir * maxR},${startY}`,
    // Curve into vertical (going down toward detour)
    `Q ${startColX},${startY} ${startColX},${startY + maxR}`,
    // Vertical down to detour row
    `L ${startColX},${detourY - maxR}`,
    // Curve into horizontal toward endColX
    `Q ${startColX},${detourY} ${startColX + horizontalDir * maxR},${detourY}`,
    // Horizontal across detour row
    `L ${endColX - horizontalDir * maxR},${detourY}`,
    // Curve into vertical (going up toward target row)
    `Q ${endColX},${detourY} ${endColX},${detourY - maxR}`,
    // Vertical up to target row
    `L ${endColX},${endY + maxR}`,
    // Curve into horizontal toward target anchor
    `Q ${endColX},${endY} ${endColX + colToEndDir * maxR},${endY}`,
    // Final horizontal to arrowhead
    `L ${endX},${endY}`,
  ].join(' ');

  return { path, arrowHead };
}
