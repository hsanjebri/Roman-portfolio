"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

type Field = "name" | "email" | "subject" | "message";
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const SUBJECTS = [
  { value: "commission", label: "Commission" },
  { value: "prints", label: "Fine art prints" },
  { value: "workshop", label: "Field workshop" },
  { value: "press", label: "Press & licensing" },
  { value: "other", label: "Something else" },
] as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v: Values): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Please tell me your name.";
  if (!EMAIL.test(v.email.trim())) e.email = "That email doesn’t look complete.";
  if (!v.subject) e.subject = "Choose what this is about.";
  if (v.message.trim().length < 20) e.message = "A few more words, please — at least 20 characters.";
  return e;
}

/** Underline-only form with floating labels, inline validation and a local success state (no backend). */
export default function ContactForm() {
  const [values, setValues] = useState<Values>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // "Enquire →" links elsewhere preselect the subject.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest<HTMLElement>("[data-subject]");
      const subject = link?.dataset.subject;
      if (subject && SUBJECTS.some((s) => s.value === subject)) {
        setValues((v) => ({ ...v, subject }));
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (sent) successRef.current?.focus();
  }, [sent]);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = { ...values, [e.target.name as Field]: e.target.value };
    setValues(next);
    if (touched) setErrors(validate(next));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const found = validate(values);
    setErrors(found);
    const first = (Object.keys(found) as Field[])[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setSent(true);
  };

  if (sent) {
    const first = values.name.trim().split(/\s+/)[0];
    return (
      <div ref={successRef} className="form__success" tabIndex={-1} role="status">
        <p className="mono kicker">Message received</p>
        <h3>
          Thank you, <em>{first}</em>.
        </h3>
        <p>
          I read every message myself and reply within two days — sooner if I&rsquo;m not in a hide. This is a concept
          site, so nothing was actually sent.
        </p>
      </div>
    );
  }

  const field = (name: Field) => ({
    id: `f-${name}`,
    name,
    value: values[name],
    onChange,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `f-${name}-err` : undefined,
  });

  const error = (name: Field) =>
    errors[name] ? (
      <p id={`f-${name}-err`} className="field__error mono">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form ref={formRef} className="form" noValidate onSubmit={onSubmit} aria-label="Contact">
      <div className="field" data-invalid={Boolean(errors.name)}>
        <input {...field("name")} type="text" autoComplete="name" placeholder=" " required />
        <label htmlFor="f-name">Name</label>
        {error("name")}
      </div>
      <div className="field" data-invalid={Boolean(errors.email)}>
        <input {...field("email")} type="email" autoComplete="email" inputMode="email" placeholder=" " required />
        <label htmlFor="f-email">Email</label>
        {error("email")}
      </div>
      <div className={`field field--full${values.subject ? " is-filled" : ""}`} data-invalid={Boolean(errors.subject)}>
        <select {...field("subject")} required>
          <option value="" disabled hidden />
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <label htmlFor="f-subject">Subject</label>
        {error("subject")}
      </div>
      <div className="field field--full" data-invalid={Boolean(errors.message)}>
        <textarea {...field("message")} rows={4} placeholder=" " required />
        <label htmlFor="f-message">Message</label>
        {error("message")}
      </div>
      <div className="form__foot">
        <p className="mono">Replies within two days</p>
        <button type="submit" className="btn btn--solid">
          Send message <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
