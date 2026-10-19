import { useState } from 'react';
import './MoveTicketSelect.css';

/** Fallback humble del drag & drop: `<select>` con las columnas del mismo tablero. */
export default function MoveTicketSelect({ ticket, columnId, columns, onMove }) {
  const [moving, setMoving] = useState(false);

  const options = columns.filter((column) => column._id !== columnId);

  return (
    <>
      <label className="visually-hidden" htmlFor={`move-${ticket._id}`}>
        Mover el ticket {ticket.title} a…
      </label>
      <select
        id={`move-${ticket._id}`}
        className="move-ticket-select"
        value={columnId}
        disabled={moving || options.length === 0}
        onChange={async (event) => {
          const targetColumnId = event.target.value;
          if (targetColumnId === columnId) return;
          setMoving(true);
          try {
            await onMove(ticket, columnId, targetColumnId);
          } finally {
            setMoving(false);
          }
        }}
      >
        <option value={columnId}>Mover a…</option>
        {options.map((column) => (
          <option key={column._id} value={column._id}>
            {column.name}
          </option>
        ))}
      </select>
    </>
  );
}
