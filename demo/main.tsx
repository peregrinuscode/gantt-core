import React from 'react';
import ReactDOM from 'react-dom/client';
import { GanttChart } from '@peregrinus/gantt-core';
import type { GanttTask, GanttGroup } from '@peregrinus/gantt-core';

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

const tasks: GanttTask[] = [
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
  { id: 'f2', name: 'Piso cerámico', start: d(35), end: d(50), progress: 0, groupId: 'finishes', dependencies: ['f1'], sortOrder: 2 },
  { id: 'f3', name: 'Pintura', start: d(45), end: d(55), progress: 0, groupId: 'finishes', dependencies: ['f1'], sortOrder: 3 },
];

function App() {
  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'system-ui', marginBottom: 8 }}>
        @peregrinus/gantt-core — Demo
      </h1>
      <p style={{ color: '#666', fontFamily: 'system-ui', marginBottom: 24 }}>
        Construction project mock data. This page is for development testing only.
      </p>

      <GanttChart
        tasks={tasks}
        groups={groups}
        viewMode="week"
        onTaskClick={(id) => console.log('Task clicked:', id)}
        onTaskMove={(e) => console.log('Task moved:', e)}
        onTaskResize={(e) => console.log('Task resized:', e)}
        onProgressChange={(e) => console.log('Progress changed:', e)}
        onDependencyCreate={(e) => console.log('Dependency created:', e)}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
