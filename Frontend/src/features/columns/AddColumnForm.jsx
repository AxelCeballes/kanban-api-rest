import { useState } from 'react';
import Button from '../../components/Button.jsx';
import TextInput from '../../components/TextInput.jsx';
import { createColumn } from '../../api/columnService.js';
import { showToast } from '../toasts/toastStore.js';
import './AddColumnForm.css';

/** Formulario inline para crear una columna dentro del tablero actual. */
export default function AddColumnForm({ boardId, onCreated }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(null);

  function reset() {
    setName('');
    setValidationError(null);
    setOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (typeof name !== 'string' || name.trim() === '') {
      setValidationError('El nombre de la columna es requerido (texto no vacío).');
      return;
    }

    setSubmitting(true);
    setValidationError(null);
    try {
      const column = await createColumn(boardId, name.trim());
      onCreated(column); // → 201 del contrato
      showToast('Columna creada.', 'success');
      reset();
    } catch (apiError) {
      if (apiError.status === 400) {
        setValidationError(apiError.message); // error del contrato inline
      } else {
        showToast(apiError.message, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        + Columna
      </Button>
    );
  }

  return (
    <form className="add-column-form" onSubmit={handleSubmit}>
      <TextInput
        label="Nombre de la columna"
        placeholder="P. ej. Por hacer"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={validationError}
        autoFocus
        maxLength={100}
      />
      <div className="add-column-form__actions">
        <Button variant="primary" type="submit" loading={submitting}>
          Crear columna
        </Button>
        <Button variant="ghost" onClick={reset} disabled={submitting}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
