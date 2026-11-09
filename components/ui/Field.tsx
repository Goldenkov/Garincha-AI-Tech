import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";

type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  optional?: boolean;
  className?: string;
  children: ReactElement<Record<string, unknown>>;
};

/** Label, hint and error wired to the control through ids so screen readers announce all three. */
export function Field({ label, hint, error, optional, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: (children.props.id as string | undefined) ?? id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })
    : children;
  const controlId = (children.props.id as string | undefined) ?? id;
  return (
    <div className={className}>
      <label htmlFor={controlId} className="field-label">
        {label}
        {optional ? <span className="ml-1.5 font-normal text-muted">— необязательно</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className="field-hint mt-1">
          {hint}
        </p>
      ) : null}
      <div className="mt-2">{control}</div>
      {error ? (
        <p id={errorId} className="field-error mt-1.5" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
