import { useId } from 'react';
import './TextInput.css';

/* Presentacional puro: input (o textarea con `as="textarea"`) con label,
 * error de validación y hint. Los errores vienen de props; nunca hace fetch. */
export default function TextInput({
  label,
  error = null,
  hint = null,
  id: idProp,
  as = 'input',
  ...rest
}) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const errorId = error ? `${id}-error` : undefined;
  const FieldTag = as;

  return (
    <div className="text-input">
      <label className="text-input__label" htmlFor={id}>
        {label}
      </label>
      <FieldTag
        id={id}
        className="text-input__field"
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        {...rest}
      />
      {error && (
        <p id={errorId} className="text-input__error" role="alert">
          {error}
        </p>
      )}
      {!error && hint && <p className="text-input__hint">{hint}</p>}
    </div>
  );
}
