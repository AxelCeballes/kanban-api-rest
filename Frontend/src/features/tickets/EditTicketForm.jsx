import { useState } from 'react';
import Button from '../../components/Button.jsx';
import TextInput from '../../components/TextInput.jsx';
import { updateTicketContent } from '../../api/ticketService.js';
import { replaceCachedTicket } from './ticketStore.js';
import { showToast } from '../toasts/toastStore.js';

/** Formulario de edición inline (PATCH title/description en su misma columna).
 * El toggle lo maneja TicketItem; este componente solo edita y guarda. */
export default function EditTicketForm({ ticket, boardId, columnId, onClose }) {
  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (typeof title !== 'string' || title.trim() === '') {
      setValidationError('El título del ticket debe ser un texto no vacío.');
      return;
    }

    setSubmitting(true);
    setValidationError(null);
    try {
      const updated = await updateTicketContent(boardId, columnId, ticket._id, {
        title: title.trim(),
        // PATCH asigna valores finales; '' limpia la descripción (idempotente)
        description,
      });
      replaceCachedTicket(columnId, updated); // sincroniza con el servidor (R27)
      showToast('Ticket actualizado.', 'success'); // 200 → verde
      onClose();
    } catch (apiError) {
      if (apiError.status === 400) {
        setValidationError(apiError.message); // contrato inline en el input
      } else {
        showToast(apiError.message, 'error'); // sin cambio optimista: nada que revertir
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="edit-ticket-form" onSubmit={handleSubmit}>
      <TextInput
        label="Título"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={validationError}
        maxLength={200}
        autoFocus
      />
      <TextInput
        as="textarea"
        label="Descripción"
        rows={2}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <div className="edit-ticket-form__actions">
        <Button variant="primary" type="submit" loading={submitting}>
          Guardar
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
