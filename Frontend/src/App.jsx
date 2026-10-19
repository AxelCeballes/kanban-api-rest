import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import BoardDetailPage from './pages/BoardDetailPage.jsx';
import Toasts from './components/Toasts.jsx';
import { useToasts } from './hooks/useToasts.js';
import { dismissToast } from './features/toasts/toastStore.js';

// Matriz de rutas (Kanban Lite: SIN login; desvío documentado en AGENTS.md §13).
// App es contenedor superior: aquí se monta la pila de toasts con los errores
// globales (400/404/500) y los éxitos (201/200) del contrato.
export default function App() {
  const toasts = useToasts();

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
