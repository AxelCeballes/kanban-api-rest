import Spinner from './Spinner.jsx';
import './Button.css';

/* Presentacional puro. `loading` deshabilita el botón y muestra el spinner (R21).
 * Las variantes usan exclusivamente variables del tema global. */
export default function Button({
  variant = 'secondary',
  type = 'button',
  loading = false,
  disabled = false,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner size="sm" label="" />}
      <span>{children}</span>
    </button>
  );
}
