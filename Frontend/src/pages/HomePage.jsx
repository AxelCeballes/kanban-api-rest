import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import TextInput from '../components/TextInput.jsx';
import { createBoard } from '../api/boardService.js';
import { getRecentBoards } from '../features/boards/recentBoards.js';
import './HomePage.css';

const BOARD_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

/* Home de Kanban Lite: CERO login → la entrada es directamente por boardId.
 * "El último usado se persiste en localStorage" (concepto del usuario). */
export default function HomePage() {
  const navigate = useNavigate();
  const [recentBoards] = useState(getRecentBoards);

  const [boardId, setBoardId] = useState('');
  const [entryError, setEntryError] = useState(null);

  const [newBoardName, setNewBoardName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  function handleEntry(event) {
    event.preventDefault();
    if (!BOARD_ID_PATTERN.test(boardId)) {
      setEntryError('Formato inválido: 24 caracteres hexadecimales (ObjectId).');
      return;
    }
    navigate(`/boards/${boardId}`);
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (newBoardName.trim() === '') {
      setCreateError('El nombre del tablero es requerido (texto no vacío).');
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      const board = await createBoard(newBoardName.trim()); // 201 del contrato
      navigate(`/boards/${board._id}`); // useNavigate SOLO tras el éxito (R12)
    } catch (apiError) {
      if (apiError.status === 400) setCreateError(apiError.message);
      else setCreateError(apiError.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="home">
      <h1 className="home__title">Kanban Lite</h1>
      <p className="home__tagline">
        Tablero espartano. Sin login, sin vueltas: un boardId y a llenar líneas.
      </p>

      <section className="home__panel" aria-labelledby="entry-heading">
        <h2 id="entry-heading" className="home__panel-title">Abrir tablero</h2>
        <form onSubmit={handleEntry} className="home__entry">
          <TextInput
            label="boardId"
            placeholder="24 caracteres hexadecimales"
            value={boardId}
            onChange={(event) => setBoardId(event.target.value)}
            error={entryError}
            spellCheck={false}
          />
          <Button variant="primary" type="submit">
            Abrir
          </Button>
        </form>

        {recentBoards.length > 0 && (
          <>
            <h3 className="home__recent-title">Últimos tableros</h3>
            <ul className="home__recent">
              {recentBoards.map((board) => (
                <li key={board.id}>
                  <Link className="home__recent-link" to={`/boards/${board.id}`}>
                    {board.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="home__panel" aria-labelledby="create-heading">
        <h2 id="create-heading" className="home__panel-title">Crear tablero nuevo</h2>
        <form onSubmit={handleCreate} className="home__entry">
          <TextInput
            label="Nombre"
            placeholder="P. ej. Sprint karting"
            value={newBoardName}
            onChange={(event) => setNewBoardName(event.target.value)}
            error={createError}
            maxLength={100}
          />
          <Button variant="primary" type="submit" loading={creating}>
            Crear tablero
          </Button>
        </form>
      </section>
    </main>
  );
}
