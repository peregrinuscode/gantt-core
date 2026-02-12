# @peregrinus/gantt-core

Lightweight, zero-dependency Gantt chart component for React.

<!-- TODO: Add a screenshot or GIF of the demo here -->
<!-- ![gantt-core demo](screenshot.png) -->

## Features

- **Zero runtime dependencies** — only `react` as a peer dependency
- **SVG rendering** — all chart elements (bars, arrows, grid) are crisp SVG
- **Drag interactions** — move tasks, resize edges, drag progress handle
- **Touch support** — works on iPad and touchscreen via Pointer Events API
- **CSS custom properties** — theme everything with CSS variables
- **TypeScript** — full type definitions included
- **Locale-aware** — date formatting respects any locale (e.g. `es-MX`, `en-US`)
- **Accessible** — ARIA attributes on interactive elements
- **Groups & hierarchy** — collapsible groups and parent/child task trees
- **Dependency arrows** — SVG paths between related tasks

## Installation

```bash
npm install @peregrinus/gantt-core
```

## Quick Start

```tsx
import { useState } from 'react';
import { GanttChart } from '@peregrinus/gantt-core';
import '@peregrinus/gantt-core/styles.css';
import type { GanttTask, GanttGroup, TaskChangeEvent } from '@peregrinus/gantt-core';

const groups: GanttGroup[] = [
  { id: 'dev', name: 'Development', color: '#4CAF50' },
  { id: 'design', name: 'Design', color: '#2196F3' },
];

const initialTasks: GanttTask[] = [
  { id: '1', name: 'Wireframes', start: new Date('2025-03-01'), end: new Date('2025-03-10'), progress: 100, groupId: 'design' },
  { id: '2', name: 'UI implementation', start: new Date('2025-03-10'), end: new Date('2025-03-25'), progress: 40, groupId: 'dev', dependencies: ['1'] },
  { id: '3', name: 'API integration', start: new Date('2025-03-20'), end: new Date('2025-04-05'), progress: 0, groupId: 'dev' },
];

function App() {
  const [tasks, setTasks] = useState(initialTasks);

  const handleTaskMove = (event: TaskChangeEvent) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === event.taskId ? { ...t, start: event.start, end: event.end } : t
      )
    );
  };

  return (
    <GanttChart
      tasks={tasks}
      groups={groups}
      viewMode="week"
      onTaskMove={handleTaskMove}
    />
  );
}
```

## API Reference

### `<GanttChart>` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tasks` | `GanttTask[]` | *required* | Array of tasks to display |
| `groups` | `GanttGroup[]` | `undefined` | Optional grouping categories |
| `viewMode` | `'day' \| 'week' \| 'month'` | `'day'` | Time scale for the grid |
| `taskListWidth` | `number` | `250` | Width of the left panel in px (0 to hide) |
| `rowHeight` | `number` | `40` | Height of each row in px |
| `columnWidth` | `number` | `50` | Width of each time column in px |
| `readOnly` | `boolean` | `false` | Disables all drag/resize interactions |
| `showDependencies` | `boolean` | `true` | Show dependency arrows |
| `showTodayMarker` | `boolean` | `true` | Show vertical today line |
| `theme` | `GanttTheme` | `{}` | CSS custom property overrides |
| `locale` | `string` | `undefined` | Locale for date formatting (e.g. `'es-MX'`) |
| `onTaskMove` | `(e: TaskChangeEvent) => void` | | Fired when a task bar is dragged |
| `onTaskResize` | `(e: TaskChangeEvent) => void` | | Fired when a bar edge is dragged |
| `onProgressChange` | `(e: ProgressChangeEvent) => void` | | Fired when progress handle is dragged |
| `onTaskClick` | `(taskId: string) => void` | | Fired on single click |
| `onTaskDoubleClick` | `(taskId: string) => void` | | Fired on double click |

### `GanttTask`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | yes | Unique identifier |
| `name` | `string` | yes | Display name |
| `start` | `Date` | yes | Bar start date |
| `end` | `Date` | yes | Bar end date (exclusive) |
| `progress` | `number` | yes | Completion 0-100 |
| `groupId` | `string` | no | Matches `GanttGroup.id` |
| `parentId` | `string` | no | Parent task id for hierarchy |
| `dependencies` | `string[]` | no | IDs of tasks this depends on |
| `sortOrder` | `number` | no | Sort order within group/parent |
| `disabled` | `boolean` | no | Disable drag/resize for this task |
| `color` | `string` | no | Custom bar color (overrides group) |
| `meta` | `Record<string, unknown>` | no | Arbitrary metadata for callbacks |

### `GanttGroup`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | yes | Unique identifier |
| `name` | `string` | yes | Display name |
| `color` | `string` | yes | Header and default task color |
| `sortOrder` | `number` | no | Sort order among groups |

### Event Types

```ts
interface TaskChangeEvent {
  taskId: string;
  start: Date;
  end: Date;
}

interface ProgressChangeEvent {
  taskId: string;
  progress: number;
}
```

## Theming

Pass a `theme` prop or set CSS custom properties on a parent element:

```tsx
<GanttChart
  tasks={tasks}
  theme={{
    '--gantt-bg': '#1e1e2e',
    '--gantt-grid-line': '#313244',
    '--gantt-header-bg': '#181825',
    '--gantt-header-text': '#cdd6f4',
    '--gantt-bar-text': '#ffffff',
    '--gantt-today': '#f38ba8',
  }}
/>
```

| Variable | Default | Description |
|----------|---------|-------------|
| `--gantt-bg` | `#ffffff` | Timeline background |
| `--gantt-grid-line` | `#e8e8e8` | Grid line color |
| `--gantt-today` | `#ff4444` | Today marker color |
| `--gantt-weekend-bg` | | Weekend/non-working day background |
| `--gantt-header-bg` | | Header background |
| `--gantt-header-text` | | Header text color |
| `--gantt-bar-text` | | Task bar text color |
| `--gantt-bar-radius` | `4px` | Task bar border radius |
| `--gantt-bar-height` | | Bar height as fraction of row (0-1) |
| `--gantt-bar-progress-fill` | | Progress overlay fill |
| `--gantt-arrow-color` | | Dependency arrow color |
| `--gantt-row-hover` | | Row hover background |
| `--gantt-row-selected` | | Selected row background |
| `--gantt-font` | | Font family |
| `--gantt-font-size` | | Font size |

## Advanced Usage

### External Collapse Control

Use the `useGanttTree` hook to manage expand/collapse state externally:

```tsx
import { GanttChart, useGanttTree } from '@peregrinus/gantt-core';

function App() {
  const tree = useGanttTree(['group-1']); // start with group-1 collapsed

  return (
    <>
      <button onClick={() => tree.toggleCollapse('group-1')}>
        Toggle Group 1
      </button>
      <GanttChart tasks={tasks} groups={groups} />
    </>
  );
}
```

### Color Utilities

Helper functions for working with hex colors:

```ts
import { darkenHex, lightenHex, hexToRgba } from '@peregrinus/gantt-core';

darkenHex('#4CAF50', 0.2);   // 20% darker
lightenHex('#4CAF50', 0.3);  // 30% lighter
hexToRgba('#4CAF50', 0.5);   // 'rgba(76, 175, 80, 0.5)'
```

## Roadmap

Planned for future releases:

- Milestones (diamond markers)
- Link mode (create dependencies by dragging between tasks)
- Keyboard navigation (arrow keys, Enter to select)
- Virtual scrolling for 500+ tasks
- Minimap / overview scroll indicator

## License

[MIT](LICENSE)

## Contributing

This is a personal project, but issues and pull requests are welcome. Please open an issue first to discuss any significant changes.
