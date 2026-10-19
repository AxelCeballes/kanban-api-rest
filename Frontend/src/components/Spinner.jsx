import './Spinner.css';

/** Presentacional puro: aro CSS giratorio. `label` se anuncia a lectores de pantalla. */
export default function Spinner({ size = 'md', label = 'Cargando…' }) {
  return (
    <span
      className={`spinner spinner--${size}`}
      role="status"
      aria-label={label}
    />
  );
}
