import './Toast.css';

/* Renderiza la pila de toasts; la lista viene de props (hook en App).
 * aria-live="polite" para accesibilidad (R35). */
export default function Toasts({ toasts = [], onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <ul className="toasts" aria-live="polite">
      {toasts.map((toast) => (
        <li key={toast.id} className={`toast toast--${toast.variant}`}>
          <span className="toast__message">{toast.message}</span>
          <button
            type="button"
            className="toast__close"
            aria-label="Cerrar aviso"
            onClick={() => onDismiss(toast.id)}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
