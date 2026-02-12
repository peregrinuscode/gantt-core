import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { GanttChart } from '@peregrinus/gantt-core';
import type { GanttTask, GanttGroup, ViewMode, TaskChangeEvent, ProgressChangeEvent } from '@peregrinus/gantt-core';

// --- Mock data simulating a construction project ---

const groups: GanttGroup[] = [
  { id: 'structural', name: 'Estructura', color: '#4CAF50', sortOrder: 1 },
  { id: 'electrical', name: 'Instalaciones Eléctricas', color: '#2196F3', sortOrder: 2 },
  { id: 'finishes', name: 'Acabados', color: '#FF9800', sortOrder: 3 },
];

const today = new Date();
const d = (offset: number): Date => {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return date;
};

const initialTasks: GanttTask[] = [
  // Structural
  { id: 's1', name: 'Cimentación', start: d(-10), end: d(5), progress: 80, groupId: 'structural', sortOrder: 1 },
  { id: 's2', name: 'Columnas planta baja', start: d(5), end: d(20), progress: 30, groupId: 'structural', dependencies: ['s1'], sortOrder: 2 },
  { id: 's2a', name: 'Armado', start: d(5), end: d(12), progress: 50, groupId: 'structural', parentId: 's2', sortOrder: 1 },
  { id: 's2b', name: 'Colado', start: d(12), end: d(20), progress: 0, groupId: 'structural', parentId: 's2', dependencies: ['s2a'], sortOrder: 2 },
  { id: 's3', name: 'Losa nivel 1', start: d(20), end: d(35), progress: 0, groupId: 'structural', dependencies: ['s2'], sortOrder: 3 },

  // Electrical
  { id: 'e1', name: 'Acometida eléctrica', start: d(0), end: d(10), progress: 60, groupId: 'electrical', sortOrder: 1 },
  { id: 'e2', name: 'Canalización PB', start: d(10), end: d(25), progress: 10, groupId: 'electrical', dependencies: ['e1', 's2'], sortOrder: 2 },

  // Finishes
  { id: 'f1', name: 'Aplanados muros', start: d(25), end: d(40), progress: 0, groupId: 'finishes', dependencies: ['s3'], sortOrder: 1 },
  { id: 'f2', name: 'Piso cerámico', start: d(35), end: d(50), progress: 0, groupId: 'finishes', dependencies: ['f1'], sortOrder: 2, disabled: true },
  { id: 'f3', name: 'Pintura', start: d(45), end: d(55), progress: 0, groupId: 'finishes', dependencies: ['f1'], sortOrder: 3 },
];

/** Generate a large set of tasks for performance testing */
function generateManyTasks(count: number): GanttTask[] {
  const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];
  const result: GanttTask[] = [];
  for (let i = 0; i < count; i++) {
    const startOffset = Math.floor(Math.random() * 60) - 10;
    const duration = Math.floor(Math.random() * 20) + 3;
    result.push({
      id: `perf-${i}`,
      name: `Task ${i + 1}`,
      start: d(startOffset),
      end: d(startOffset + duration),
      progress: Math.floor(Math.random() * 100),
      groupId: groups[i % groups.length].id,
      color: colors[i % colors.length],
      sortOrder: i,
      dependencies: i > 0 && Math.random() > 0.6 ? [`perf-${i - 1}`] : undefined,
    });
  }
  return result;
}

const controlStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontFamily: 'system-ui',
  cursor: 'pointer',
};

function App() {
  const [tasks, setTasks] = useState<GanttTask[]>(initialTasks);
  const [readOnly, setReadOnly] = useState(false);
  const [showDependencies, setShowDependencies] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [perfMode, setPerfMode] = useState(false);

  const handleTaskMove = (event: TaskChangeEvent) => {
    console.log('Task moved:', event);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === event.taskId
          ? { ...t, start: event.start, end: event.end }
          : t,
      ),
    );
  };

  const handleTaskResize = (event: TaskChangeEvent) => {
    console.log('Task resized:', event);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === event.taskId
          ? { ...t, start: event.start, end: event.end }
          : t,
      ),
    );
  };

  const handleProgressChange = (event: ProgressChangeEvent) => {
    console.log('Progress changed:', event);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === event.taskId
          ? { ...t, progress: event.progress }
          : t,
      ),
    );
  };

  const togglePerfMode = () => {
    if (perfMode) {
      setTasks(initialTasks);
      setPerfMode(false);
    } else {
      setTasks(generateManyTasks(200));
      setPerfMode(true);
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'system-ui', marginBottom: 8 }}>
        @peregrinus/gantt-core — Demo
      </h1>
      <p style={{ color: '#666', fontFamily: 'system-ui', marginBottom: 16 }}>
        Construction project mock data. Drag bars to move, edges to resize, progress handle to update progress.
        <br />
        "Piso cerámico" is disabled (dimmed, not draggable).
      </p>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <label style={controlStyle}>
          <input
            type="checkbox"
            checked={readOnly}
            onChange={(e) => setReadOnly(e.target.checked)}
          />
          Read-only mode
        </label>

        <label style={controlStyle}>
          <input
            type="checkbox"
            checked={showDependencies}
            onChange={(e) => setShowDependencies(e.target.checked)}
          />
          Show dependencies
        </label>

        <label style={controlStyle}>
          View mode:
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            style={{ fontFamily: 'system-ui', padding: '4px 8px' }}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </label>

        <button
          onClick={togglePerfMode}
          style={{
            fontFamily: 'system-ui',
            padding: '6px 12px',
            cursor: 'pointer',
            background: perfMode ? '#f44336' : '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
          }}
        >
          {perfMode ? 'Reset to demo data' : 'Generate 200 tasks'}
        </button>
      </div>

      <GanttChart
        tasks={tasks}
        groups={groups}
        viewMode={viewMode}
        taskListWidth={250}
        readOnly={readOnly}
        showDependencies={showDependencies}
        locale="es-MX"
        onTaskClick={(id) => console.log('Task clicked:', id)}
        onTaskDoubleClick={(id) => console.log('Task double-clicked:', id)}
        onTaskMove={handleTaskMove}
        onTaskResize={handleTaskResize}
        onProgressChange={handleProgressChange}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
