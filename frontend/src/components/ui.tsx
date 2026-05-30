import type { ButtonHTMLAttributes, ReactNode, TextareaHTMLAttributes, InputHTMLAttributes } from 'react';

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }) {
  const cls =
    variant === 'secondary' ? 'btn btn-secondary' : variant === 'danger' ? 'btn btn-danger' : 'btn';
  return <button className={`${cls} ${className ?? ''}`} {...props} />;
}

export function Field({
  label,
  id,
  textarea,
  ...props
}: {
  label: string;
  id: string;
  textarea?: boolean;
} & InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {textarea ? (
        <textarea id={id} rows={3} {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input id={id} {...(props as InputHTMLAttributes<HTMLInputElement>)} />
      )}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <p>
        <strong>{title}</strong>
      </p>
      {children}
    </div>
  );
}
