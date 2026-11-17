import { useMutation } from "@tanstack/react-query";
import { useId, useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import {
  SERVICE_OPTIONS,
  submitEnquiry,
  validateEnquiry,
  type Enquiry,
  type FieldErrors,
} from "@/lib/enquiry";

const EMPTY: Enquiry = { name: "", mobile: "", service: "", comments: "" };

/** Ads conversion is configured against this URL. */
const THANK_YOU_PATH = "/thank-you";

const STUDIO_PHONE = "+91 90000 00000";
const STUDIO_PHONE_HREF = "tel:+919000000000";

type EnquiryModalProps = {
  open: boolean;
  onClose: () => void;
  /** Set when the visitor opened this from a project. */
  context?: string;
};

export function EnquiryModal({ open, onClose, context }: EnquiryModalProps) {
  const headingId = useId();
  const [values, setValues] = useState<Enquiry>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  /* Errors surface only after a submit attempt, so the form never scolds
     anyone about a field they have not reached yet. */
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: submitEnquiry,
    onSuccess: () => {
      setValues(EMPTY);
      setErrors({});
      setSubmitted(false);
      /* A real navigation, not a pushState: Google Ads records the
         conversion when /thank-you actually loads. */
      window.location.assign(THANK_YOU_PATH);
    },
  });

  const set = (field: keyof Enquiry, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    // Once errors are visible, correcting a field clears its message live.
    if (submitted) setErrors(validateEnquiry(next));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validateEnquiry(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstField = Object.keys(found)[0];
      document.querySelector<HTMLElement>(`[data-field="${firstField}"]`)?.focus();
      return;
    }
    mutation.mutate({ ...values, context });
  };

  const handleClose = () => {
    mutation.reset();
    onClose();
  };

  const errorFor = (field: keyof Enquiry) =>
    submitted && errors[field] ? errors[field] : undefined;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      labelledBy={headingId}
      panelClassName="modal__panel-paper enquiry"
      closeLabel="Close enquiry form"
    >
      {mutation.isSuccess ? (
        <div className="enquiry__done">
          <p className="section-label">Enquiry received</p>
          <h2 id={headingId}>Thank you — we have your details.</h2>
          <p className="enquiry__lede">
            Someone from the studio will call you within one working day. If it is
            urgent, reach us on <a href={STUDIO_PHONE_HREF}>{STUDIO_PHONE}</a>.
          </p>
          <button type="button" className="button button-dark" onClick={handleClose}>
            Close
          </button>
        </div>
      ) : (
        <>
          <header className="enquiry__head">
            <p className="section-label">Free consultation</p>
            <h2 id={headingId}>Let&apos;s design your space.</h2>
            <p className="enquiry__lede">
              Share your details and we will get back to you within 24 hours.
            </p>
          </header>

          <form className="enquiry__form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label className="field__label" htmlFor="enquiry-name">
                Name <span className="field__required" aria-hidden="true">*</span>
              </label>
              <input
                id="enquiry-name"
                data-field="name"
                className="field__control"
                type="text"
                name="name"
                autoComplete="name"
                value={values.name}
                onChange={(event) => set("name", event.target.value)}
                placeholder="Your full name"
                aria-required="true"
                aria-invalid={Boolean(errorFor("name"))}
                aria-describedby={errorFor("name") ? "enquiry-name-error" : undefined}
              />
              {errorFor("name") ? (
                <p className="field__error" id="enquiry-name-error">
                  {errorFor("name")}
                </p>
              ) : null}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="enquiry-mobile">
                Mobile number{" "}
                <span className="field__required" aria-hidden="true">*</span>
              </label>
              <input
                id="enquiry-mobile"
                data-field="mobile"
                className="field__control"
                type="tel"
                name="mobile"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                value={values.mobile}
                onChange={(event) =>
                  set("mobile", event.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="10-digit mobile number"
                aria-required="true"
                aria-invalid={Boolean(errorFor("mobile"))}
                aria-describedby={
                  errorFor("mobile") ? "enquiry-mobile-error" : undefined
                }
              />
              {errorFor("mobile") ? (
                <p className="field__error" id="enquiry-mobile-error">
                  {errorFor("mobile")}
                </p>
              ) : null}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="enquiry-service">
                Select service{" "}
                <span className="field__required" aria-hidden="true">*</span>
              </label>
              <div className="field__select">
                <select
                  id="enquiry-service"
                  data-field="service"
                  className="field__control"
                  name="service"
                  value={values.service}
                  onChange={(event) => set("service", event.target.value)}
                  aria-required="true"
                  aria-invalid={Boolean(errorFor("service"))}
                  aria-describedby={
                    errorFor("service") ? "enquiry-service-error" : undefined
                  }
                >
                  <option value="">Choose a service</option>
                  {SERVICE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <svg
                  className="field__chevron"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </div>
              {errorFor("service") ? (
                <p className="field__error" id="enquiry-service-error">
                  {errorFor("service")}
                </p>
              ) : null}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="enquiry-comments">
                Comments <span className="field__optional">(optional)</span>
              </label>
              <textarea
                id="enquiry-comments"
                data-field="comments"
                className="field__control field__control-area"
                name="comments"
                rows={3}
                value={values.comments}
                onChange={(event) => set("comments", event.target.value)}
                placeholder="Tell us about your project"
                aria-invalid={Boolean(errorFor("comments"))}
              />
              {errorFor("comments") ? (
                <p className="field__error">{errorFor("comments")}</p>
              ) : null}
            </div>

            {mutation.isError ? (
              <p className="field__error" role="alert">
                Something went wrong sending this. Please try again, or call us on{" "}
                <a href={STUDIO_PHONE_HREF}>{STUDIO_PHONE}</a>.
              </p>
            ) : null}

            <button
              type="submit"
              className="button button-dark enquiry__submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Sending" : "Get free consultation"}
            </button>

            <p className="enquiry__note">
              We use your number only to discuss this enquiry.
            </p>
          </form>
        </>
      )}
    </Modal>
  );
}
