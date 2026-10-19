import './TicketCard.css';

/* Presentacional puro: la tarjeta del ticket. Solo title/description del contrato
 * (R18: no existen priority, asignados ni fechas). `actions` es un slot de la página. */
export default function TicketCard({ ticket, actions = null }) {
  return (
    <article className="ticket-card">
      <header className="ticket-card__header">
        <h3 className="ticket-card__title">{ticket.title}</h3>
        {actions && <div className="ticket-card__actions">{actions}</div>}
      </header>
      {ticket.description !== '' && (
        <p className="ticket-card__description">{ticket.description}</p>
      )}
    </article>
  );
}
