import { useState } from 'react';
import Button from '../../components/Button.jsx';
import TextInput from '../../components/TextInput.jsx';
import { createTicket } from '../../api/ticketService.js';
import { showToast } from '../toasts/toastStore.js';
import './AddTicketForm.css';

/** Formulario inline en el pie de una columna: crea ticket (POST, 201 del contrato). */
export default function AddTicketForm({ boardId, columnId, onCreated }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(null);

  function reset() {
    setTitle('');
    setDescription('');
    setValidationError(null);
    setOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (typeof title !== 'string' || title.trim() === '') {
      setValidationError('El título del ticket es requerido (texto no vacío).');
      return;
    }

    setSubmitting(true);
    setValidationError(null);
    try {
      const ticket = await createTicket(boardId, columnId, {
        title: title.trim(),
        description: description === '' ? undefined : description,
      });
      onCreated(ticket);
      showToast('Ticket creado.', 'success'); // 201 → verde
      reset();
    } catch (apiError) {
      if (apiError.status === 400) {
        setValidationError(apiError.message); // mapeado a las alertas del input (R20)
      } else {
        showToast(apiError.message, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} aria-expanded={false}>
        + Ticket
      </Button>
    );
  }

  return (
    <form className="add-ticket-form" onSubmit={handleSubmit}>
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
        label="Descripción (opcional)"
        rows={2}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <div className="add-ticket-form__actions">
        <Button variant="primary" type="submit" loading={submitting}>
          Crear ticket
        </Button>
        <Button variant="ghost" onClick={reset} disabled={submitting}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
