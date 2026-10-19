import './ConfirmDialog.css';

/* Presentacional puro: diálogo de confirmación accesible por teclado (R35).
 * Escape y click en el fondo cierran; autoFocus deja el foco en "Cancelar". */
export default function ConfirmDialog({
  open,
  title,
  detail,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="confirm-dialog__backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="confirm-dialog__box"
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !busy) onCancel();
        }}
      >
        <h3 id="confirm-dialog-title" className="confirm-dialog__title">
          {title}
        </h3>
        {detail && <p className="confirm-dialog__detail">{detail}</p>}
        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onCancel}
            disabled={busy}
            autoFocus
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={onConfirm}
            disabled={busy}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
