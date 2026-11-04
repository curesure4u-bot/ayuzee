import { useId, type ReactNode } from "react";

export function PreviewForm({ children, className, fieldsClassName }: {
  children: ReactNode;
  className?: string;
  fieldsClassName?: string;
}) {
  const noticeId = useId();
  return (
    <form className={className} aria-describedby={noticeId} onSubmit={(event) => event.preventDefault()}>
      <p id={noticeId} className="mb-4 text-base leading-relaxed">
        <strong>Preview.</strong> This form is not available yet. No information is submitted.
      </p>
      <fieldset disabled className={fieldsClassName}>
        {children}
      </fieldset>
    </form>
  );
}
