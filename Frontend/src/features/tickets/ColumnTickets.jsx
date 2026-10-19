import { useColumnTickets } from '../../hooks/useColumnTickets.js';
import TicketItem from './TicketItem.jsx';
import './ColumnTickets.css';

/** Contenedor de la zona de tickets de una columna: lee el rehydrator (caché
 * por columnId alimentada por las manipulaciones de la sesión). */
export default function ColumnTickets({ boardId, columnId, columns, onMove }) {
  const tickets = useColumnTickets(columnId);

  if (tickets.length === 0) {
    return (
      <p className="column-tickets__empty">
        Sin tickets en esta sesión. Creá uno con "+ Ticket" (el backend no lista
        los existentes).
      </p>
    );
  }

  return (
    <ul className="column-tickets">
      {tickets.map((ticket) => (
        <TicketItem
          key={ticket._id}
          ticket={ticket}
          boardId={boardId}
          columnId={columnId}
          columns={columns}
          onMove={onMove}
        />
      ))}
    </ul>
  );
}
