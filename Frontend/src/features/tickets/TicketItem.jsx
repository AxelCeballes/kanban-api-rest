import { useState } from 'react';
import Button from '../../components/Button.jsx';
import TicketCard from '../../components/TicketCard.jsx';
import EditTicketForm from './EditTicketForm.jsx';
import MoveTicketSelect from './MoveTicketSelect.jsx';

/** Ítem de ticket: tarjeta + acciones (editar inline y mover con select). */
export default function TicketItem({ ticket, boardId, columnId, columns, onMove }) {
  const [editing, setEditing] = useState(false);

  return (
    <li className="ticket-item">
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
