// src/components/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  multiline?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  multiline = false,
  id,
  className = '',
  ...rest
}) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const inputClassName = ['form-input', className].filter(Boolean).join(' ');

  return (
    <div className="form-group">
      <label htmlFor={inputId} className="form-label">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={inputId}
          className={inputClassName}
          rows={4}
          value={rest.value as string}
          onChange={rest.onChange as unknown as React.ChangeEventHandler<HTMLTextAreaElement>}
          placeholder={rest.placeholder}
          required={rest.required}
          disabled={rest.disabled}
        />
      ) : (
        <input id={inputId} className={inputClassName} {...rest} />
      )}
    </div>
  );
};
