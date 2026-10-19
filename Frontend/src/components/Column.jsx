import './Column.css';

/* Presentacional puro: la "línea" del tablero. Solo recibe props y slots.
 * Los handlers de drag & drop (opcional) vienen de la página, que es la
 * dueña de la lógica del movimiento: el componente solo los adjunta al DOM. */
export default function Column({
  name,
  onDelete = null,
  footer = null,
  children,
  isDropTarget = false,
  onDragOverTicket = null,
  onDragEnterTicket = null,
  onDragLeaveTicket = null,
  onDropTicket = null,
}) {
  const dragHandlers =
    onDropTicket || onDragEnterTicket || onDragLeaveTicket || onDragOverTicket
      ? {
          onDragOver: onDragOverTicket ?? undefined,
          onDragEnter: onDragEnterTicket ?? undefined,
          onDragLeave: onDragLeaveTicket ?? undefined,
          onDrop: onDropTicket ?? undefined,
        }
      : {};

  return (
    <section
      className={`column${isDropTarget ? ' column--dropping' : ''}`}
      aria-label={`Columna ${name}`}
      {...dragHandlers}
    >
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
      <div className="column__body">{children}</div>
      {footer && <footer className="column__footer">{footer}</footer>}
    </section>
  );
}
