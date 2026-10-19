import './Column.css';

/* Presentacional puro: la "línea" del tablero. Solo recibe props y slots.
 * `onDelete`/`footer` son opcionales: la página decide montarlos. */
export default function Column({ name, onDelete = null, footer = null, children }) {
  return (
    <section className="column" aria-label={`Columna ${name}`}>
      <header className="column__header">
        <h2 className="column__name">{name}</h2>
        {onDelete && (
          <button
            type="button"
            className="column__delete"
            aria-label={`Eliminar columna ${name}`}
            onClick={onDelete}
          >
            🗑
          </button>
        )}
      </header>
      <div className="column__body">
        {children}
      </div>
      {footer && <footer className="column__footer">{footer}</footer>}
    </section>
  );
}
