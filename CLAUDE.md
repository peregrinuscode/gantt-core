saa# CLAUDE.md — @peregrinus/gantt-core

## What This Is

A lightweight, zero-runtime-dependency Gantt chart component for React. Built to replace `gantt-task-react` in the Andamio construction project management app, but designed as a generic, reusable library.

## Design Principles

1. **Zero runtime dependencies** — Only `react` as a peer dependency. No MUI, no dnd-kit, no date-fns.
2. **SVG rendering** — All chart elements (bars, arrows, grid) are SVG. The task list panel is HTML/CSS.
3. **CSS custom properties for theming** — No design system baked in. Consumers style via CSS variables.
4. **Generic types** — No Andamio-specific types. The public API uses `GanttTask`, `GanttGroup`, etc.
5. **Pointer Events API** — For all drag interactions (move, resize, progress). Works on mouse and touch.
6. **Accessible** — Keyboard navigation, ARIA attributes on interactive elements.
7. **Performant** — Virtual rendering for task lists with 200+ items. Memoized layout calculations.

## Project Structure

```
gantt-core/
├── src/
│   ├── index.ts                    # Public API exports
│   ├── types.ts                    # All TypeScript types
│   ├── components/
│   │   ├── GanttChart.tsx          # Main orchestrator component
│   │   ├── GanttTimeline.tsx       # SVG timeline grid (dates, columns, today marker)
│   │   ├── GanttTaskList.tsx       # HTML left panel (groups, tree, task names)
│   │   ├── GanttTaskBar.tsx        # SVG task bar (drag-to-move, resize handles, progress)
│   │   ├── GanttDependencies.tsx   # SVG dependency arrows between tasks
│   │   └── GanttHeader.tsx         # Timeline header row (date labels)
│   ├── hooks/
│   │   ├── useGanttLayout.ts       # Computes row positions, bar coordinates from tasks+groups
│   │   ├── useGanttDrag.ts         # Pointer event handling for move/resize/progress
│   │   ├── useGanttScroll.ts       # Synchronized scrolling between task list and timeline
│   │   ├── useGanttZoom.ts         # Ctrl+scroll zoom, pinch zoom on touch
│   │   └── useGanttTree.ts         # Expand/collapse state for groups and parent tasks
│   └── utils/
│       ├── dateUtils.ts            # Date arithmetic, column calculations, formatting
│       ├── arrowPath.ts            # SVG path generation for dependency arrows
│       └── colors.ts               # Color manipulation (darken, lighten, opacity)
├── demo/
│   ├── index.html                  # Dev server entry
│   └── main.tsx                    # Demo app with construction project mock data
├── package.json
├── tsconfig.json
├── vite.config.ts                  # Library build (production) + dev server (development)
└── CLAUDE.md                       # This file
```

## Commands

```bash
npm install          # Install dev dependencies
npm run dev          # Start demo dev server (serves demo/ folder)
npm run build        # Build library to dist/ (ESM + types + CSS)
npm run typecheck    # Type-check without emitting
npm run lint         # ESLint
```

## V1 Feature Scope

### Must Have (v1.0)
- [ ] Timeline grid rendering (day/week/month views)
- [ ] Date header with proper labels per view mode
- [ ] Task bars positioned by start/end dates
- [ ] Task bar colors (per-task or inherited from group)
- [ ] Progress indicator within task bars
- [ ] Task list panel (left side) with task names
- [ ] Group headers with expand/collapse
- [ ] Parent/child task hierarchy with tree indentation and expand/collapse
- [ ] Synchronized vertical scrolling between task list and timeline
- [ ] Horizontal scrolling of timeline
- [ ] Today marker (vertical line)
- [ ] Drag-to-move task bars (changes start+end, preserves duration)
- [ ] Drag bar edges to resize (changes start OR end independently)
- [ ] Drag progress handle
- [ ] Dependency arrows (SVG paths from source task to dependent task)
- [ ] Single-click and double-click events on tasks
- [ ] Read-only mode (disables all drag interactions)
- [ ] CSS custom property theming
- [ ] Touch/pointer support (iPad, touchscreen)
- [ ] Locale-aware date formatting

### Not in V1
- Resource/assignment views
- Critical path calculation
- Baseline comparison
- Export/print
- Undo/redo
- Inline editing of task names
- Drag to create new tasks
- Milestones (diamond markers)
- Link mode UI (creating dependencies by dragging between tasks)

### V1.1 Candidates (after Andamio integration)
- Link mode for creating dependencies
- Milestones
- Keyboard navigation (arrow keys to move between tasks, Enter to select)
- Virtual scrolling for 200+ tasks
- Minimap / overview scroll indicator

## Architecture Notes

### Layout Calculation (useGanttLayout)
The core layout hook takes `tasks`, `groups`, `viewMode`, `columnWidth`, and expand/collapse state as inputs and produces:
- `rows[]` — ordered list of visible rows (group headers + tasks), each with a y-position
- `bars[]` — each task bar's x, y, width, height in SVG coordinates
- `timeRange` — the visible start/end dates of the timeline
- `columns[]` — date columns with x-positions and labels

This is the single source of truth. All rendering components read from this layout.

### Drag Handling (useGanttDrag)
Uses the Pointer Events API (pointerdown → pointermove → pointerup) with `setPointerCapture` for reliable tracking. Three drag modes:
- **Move**: pointerdown on bar body → move entire bar horizontally
- **Resize**: pointerdown on left/right edge handles → change start or end date
- **Progress**: pointerdown on progress handle → change progress percentage

During drag, a "ghost" preview shows the new position. On pointerup, the final date/progress is calculated and the appropriate callback fires.

### Scroll Synchronization (useGanttScroll)
The task list and the SVG timeline are separate DOM elements. Vertical scroll is synchronized via a shared scroll handler. Horizontal scroll only applies to the timeline SVG.

### Date Utilities (dateUtils)
Pure functions for:
- `dateToX(date, timeRange, columnWidth, viewMode)` — convert a date to an x-coordinate
- `xToDate(x, timeRange, columnWidth, viewMode)` — convert x-coordinate back to date (for drag)
- `getColumns(timeRange, viewMode)` — generate column definitions for the timeline
- `snapToGrid(date, viewMode)` — snap a date to the nearest day/week/month boundary

### Theming
The root `<div>` of GanttChart sets CSS custom properties from the `theme` prop. All internal styles reference these variables with sensible defaults:
```css
.gantt-core {
  --gantt-bg: #ffffff;
  --gantt-grid-line: #e8e8e8;
  --gantt-today: #ff4444;
  --gantt-bar-radius: 4px;
  /* ... */
}
```
Consumers override by passing `theme` prop or by setting CSS variables on a parent element.

## Integration with Andamio

When ready to integrate:
1. In Andamio's `Frontend/package.json`, add: `"@peregrinus/gantt-core": "file:../../gantt-core"`
2. Create an adapter: map Andamio's `Task` type to `GanttTask`, `EstimationCategory` to `GanttGroup`
3. Replace the `<Gantt>` component from `gantt-task-react` with `<GanttChart>` from this library
4. Remove `gantt-task-react` dependency and `GanttChartOverrides.css`

## Implementation Order

### Session 1: Core Rendering
1. `dateUtils.ts` — date math foundation
2. `useGanttLayout.ts` — layout calculations
3. `GanttHeader.tsx` — date labels
4. `GanttTimeline.tsx` — grid + today marker
5. `GanttTaskBar.tsx` — static bar rendering (no drag yet)
6. `GanttChart.tsx` — assemble everything
7. Verify with demo page: bars render at correct positions

### Session 2: Task List + Groups
1. `useGanttTree.ts` — expand/collapse state management
2. `GanttTaskList.tsx` — group headers, task rows, tree indentation
3. `useGanttScroll.ts` — synchronized scrolling
4. `GanttChart.tsx` — integrate task list panel alongside timeline

### Session 3: Interactions
1. `useGanttDrag.ts` — pointer event handling
2. `GanttTaskBar.tsx` — add drag-to-move, resize handles, progress handle
3. Touch support testing
4. Read-only mode

### Session 4: Dependencies + Polish
1. `arrowPath.ts` — SVG path calculation for arrows
2. `GanttDependencies.tsx` — render arrows
3. `colors.ts` — color utilities
4. CSS custom property theming
5. Locale support
6. Performance testing with 100+ tasks
7. Prepare for Andamio integration

## Testing Strategy

For now, manual testing via the demo page. When complexity warrants it:
- Vitest for unit tests on `dateUtils.ts`, `arrowPath.ts`, `colors.ts`
- Vitest + React Testing Library for component behavior
- No E2E tests in v1

## Consumer of This Library

Primary consumer: **Andamio** (`~/Projects/peregrinus-code/andamio/`)
- Construction project management SaaS
- Uses React 18, TypeScript, MUI, Vite
- Current Gantt: `gantt-task-react` v0.3.9 with ~1150 lines of workaround code
- Needs: category grouping, parent/child hierarchy, drag-to-move/resize, dependency arrows, touch support, read-only mode, Spanish locale
- Planning page: `Frontend/src/features/planning/PlanningPage.tsx`
- Current chart: `Frontend/src/features/planning/GanttChart.tsx`
