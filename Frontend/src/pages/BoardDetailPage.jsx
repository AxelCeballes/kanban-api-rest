import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Spinner from '../components/Spinner.jsx';
import Column from '../components/Column.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { getBoard } from '../api/boardService.js';
import { deleteColumn } from '../api/columnService.js';
import { moveTicket } from '../api/ticketService.js';
import {
  cacheTicket,
  dropColumnCache,
  getCachedTickets,
  moveCachedTicket,
  removeCachedTicket,
  replaceCachedTicket,
  hasCachedTicket,
} from '../features/tickets/ticketStore.js';
import ColumnTickets from '../features/tickets/ColumnTickets.jsx';
import AddTicketForm from '../features/tickets/AddTicketForm.jsx';
import AddColumnForm from '../features/columns/AddColumnForm.jsx';
import { rememberBoard } from '../features/boards/recentBoards.js';
import { showError, showSuccess } from '../features/toasts/toastStore.js';
import './BoardDetailPage.css';

/* Contenedor de la vista Kanban: lógica, API y estado (R8). La UI se arma con
 * los componentes atómicos de src/components y los formularios de src/features. */
export default function BoardDetailPage() {
  const { boardId } = useParams();
  const [state, setState] = useState({
    status: 'loading', // 'loading' | 'error' | 'ready' (R22)
    board: null,
    columns: [],
    error: null,
  });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadBoard = useCallback(async () => {
    setState({ status: 'loading', board: null, columns: [], error: null });
    try {
      const board = await getBoard(boardId); // board + columns SIN tickets
      rememberBoard(board._id, board.name);
      setState({
        status: 'ready',
        board: { _id: board._id, name: board.name },
        columns: board.columns,
        error: null,
      });
    } catch (apiError) {
      setState({ status: 'error', board: null, columns: [], error: apiError });
    }
  }, [boardId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  /* R25: movimiento optimista + R26: reversión ante 400/404 + caso especial
   * del PATCH repetido (404: el ticket ya vive en la columna destino, AGENTS §4.1). */
  async function handleMove(ticket, fromColumnId, toColumnId) {
    if (fromColumnId === toColumnId) return;
    moveCachedTicket(fromColumnId, toColumnId, ticket);
    try {
      const updated = await moveTicket(boardId, fromColumnId, ticket._id, toColumnId);
      replaceCachedTicket(toColumnId, updated); // R27: documento final del servidor
    } catch (apiError) {
      if (apiError.status === 404 && hasCachedTicket(toColumnId, ticket._id)) {
        removeCachedTicket(fromColumnId, ticket._id); // estado final consistente, silencioso
        return;
      }
      moveCachedTicket(toColumnId, fromColumnId, ticket); // rollback a la columna original
      showError(apiError.message);
    }
  }

  async function handleConfirmDelete() {
    const column = pendingDelete;
    setDeleting(true);
    try {
      await deleteColumn(boardId, column._id); // 204; el backend borra sus tickets en cascada
      setState((previous) => ({
        ...previous,
        columns: previous.columns.filter((c) => c._id !== column._id),
      }));
      dropColumnCache(column._id);
      showSuccess('Columna eliminada.');
      setPendingDelete(null);
    } catch (apiError) {
      showError(apiError.message);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="board-page">
      <header className="board-page__header">
        <Link className="board-page__back" to="/">
          ← Inicio
        </Link>
        <h1 className="board-page__name">
          {state.board ? state.board.name : boardId}
        </h1>
      </header>

      {state.status === 'loading' && (
        <div className="board-page__center">
          <Spinner size="lg" label="Cargando tablero…" />
        </div>
      )}

      {state.status === 'error' && (
        <div className="board-page__center board-page__error" role="alert">
          <p>{state.error.message}</p>
          {state.error.status === 404 ? (
            <Link to="/">← Volver al inicio</Link>
          ) : (
            <button type="button" className="btn" onClick={loadBoard}>
              Reintentar
            </button>
          )}
        </div>
      )}

      {state.status === 'ready' && (
        <>
          <div className="board-page__toolbar">
            <AddColumnForm
              boardId={boardId}
              onCreated={(column) =>
                setState((previous) => ({
                  ...previous,
                  columns: [...previous.columns, column],
                }))
              }
            />
          </div>

          {state.columns.length === 0 ? (
            <div className="board-page__center board-page__empty">
              Este tablero no tiene columnas todavía. Creá la primera con
              «+ Columna».
            </div>
          ) : (
            <div className="board-page__columns">
              {state.columns.map((column) => (
                <Column
                  key={column._id}
                  name={column.name}
                  onDelete={() => setPendingDelete(column)}
                  footer={
                    <AddTicketForm
                      boardId={boardId}
                      columnId={column._id}
                      onCreated={(ticket) => cacheTicket(column._id, ticket)}
                    />
                  }
                >
                  <ColumnTickets
                    boardId={boardId}
                    columnId={column._id}
                    columns={state.columns}
                    onMove={handleMove}
                  />
                </Column>
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`¿Eliminar la columna «${pendingDelete?.name ?? ''}»?`}
        detail={
          pendingDelete
            ? `Esto borrará la columna y TODOS sus tickets (cascada en el backend).${
                getCachedTickets(pendingDelete._id).length > 0
                  ? ` En esta sesión hay ${getCachedTickets(pendingDelete._id).length} tickets en caché.`
                  : ''
              }`
            : ''
        }
        confirmLabel="Eliminar"
        busy={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </main>
  );
}
