import { useState } from 'react';
import Button from '../../components/Button.jsx';
import TicketCard from '../../components/TicketCard.jsx';
import EditTicketForm from './EditTicketForm.jsx';
import MoveTicketSelect from './MoveTicketSelect.jsx';

/** Ítem de ticket: tarjeta arrastrable (HTML5 drag nativo, sin librería)
 * + acciones (editar inline y mover con select, el fallback para touch/teclado).
 * Los handlers del drag se pasan tal cual desde la página (dueña del estado). */
export default function TicketItem({
  ticket,
  boardId,
  columnId,
  columns,
  onMove,
  isDragging = false,
  onDragStart = null,
  onDragEnd = null,
}) {
  const [editing, setEditing] = useState(false);

  return (
    <li
      className={`ticket-item${isDragging ? ' ticket-item--dragging' : ''}`}
    >
      <div
        className="ticket-item__draggable"
        draggable={Boolean(onDragStart)}
        onDragStart={(event) => onDragStart?.(ticket, columnId, event)}
        onDragEnd={onDragEnd ?? undefined}
      >
        <TicketCard
          ticket={ticket}
          actions={
            <>
              <Button
                variant="ghost"
                aria-label={`Editar ticket ${ticket.title}`}
                onClick={() => setEditing(true)}
                disabled={editing}
              >
                ✏️
              </Button>
              <MoveTicketSelect
                ticket={ticket}
                columnId={columnId}
                columns={columns}
                onMove={onMove}
              />
            </>
          }
        />
      </div>
      {editing && (
        <EditTicketForm
          ticket={ticket}
          boardId={boardId}
          columnId={columnId}
          onClose={() => setEditing(false)}
        />
      )}
    </li>
  );
}
