"use client";

import { useState } from "react";
import { CloseIcon, CheckIcon, DownloadIcon } from "./Icons";
import { addLead } from "@/lib/store";
import { t } from "@/i18n/ui";

interface Props {
  productName: string;
  productSlug: string;
  /** Optional brochure path/dataURL; falls back to the default placeholder. */
  brochure?: string;
  open: boolean;
  onClose: () => void;
}

const DEFAULT_BROCHURE = "/brochures/placeholder.pdf";

/**
 * Lead-capture modal. On submit it records the lead (visible in the admin Leads panel)
 * and AUTO-DOWNLOADS the brochure immediately — no email is sent.
 */
export function BrochureModal({ productName, productSlug, brochure, open, onClose }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", organization: "" });
  // Honeypot: a field hidden from humans. Bots auto-fill every input, so a
  // non-empty value means "robot" → we drop the submission silently.
  const [website, setWebsite] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Spam bot detected — pretend success, record nothing.
    if (website) {
      setSubmitted(true);
      return;
    }

    // 1. Record the lead in Supabase (anonymous insert allowed by RLS).
    //    Fire-and-forget: a lead failure must never block the download.
    void addLead({ ...form, productSlug, productName }).catch((err) =>
      console.error("[lead] insert failed:", err)
    );

    // 2. Trigger the automatic download of the brochure.
    const href = brochure || DEFAULT_BROCHURE;
    const a = document.createElement("a");
    a.href = href;
    a.download = `Brochure-${productName.replace(/\s+/g, "-")}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setSubmitted(true);
  };

  const field = (id: keyof typeof form, label: string, type = "text", required = true) => (
    <div>
      <label htmlFor={id} className="mb-1 block font-mono text-label-caps uppercase text-on-surface-variant">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={form[id]}
        onChange={(e) => setForm({ ...form, [id]: e.target.value })}
        className="w-full rounded border border-outline-variant bg-clinical-white px-3 py-2.5 text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Télécharger la brochure ${productName}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-fadeIn rounded-lg border border-outline-variant bg-clinical-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="font-display text-headline-md text-primary-container">
            {submitted ? t("downloadStarted") : t("downloadBrochure")}
          </h2>
          <button onClick={onClose} aria-label="Fermer" className="text-on-surface-variant hover:text-primary">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-status-success/10 text-status-success">
              <CheckIcon className="h-8 w-8" />
            </span>
            <p className="text-on-surface-variant">
              {t("brochureSuccess")} {t("ifNothing")}{" "}
              <a
                href={brochure || DEFAULT_BROCHURE}
                download={`Brochure-${productName.replace(/\s+/g, "-")}.pdf`}
                className="text-primary-container underline hover:text-primary"
              >
                {t("clickHere")}
              </a>
              .
            </p>
            <button className="btn-solid mt-2 w-full" onClick={onClose}>
              {t("close")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-on-surface-variant">
              {t("brochureIntro")} <strong>{productName}</strong>.
            </p>
            {field("name", t("fullName"))}
            {field("email", t("email"), "email")}
            {field("phone", t("phone"), "tel")}
            {field("organization", t("organization"))}
            {/* Honeypot — off-screen, skipped by humans, filled by bots. */}
            <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden" tabIndex={-1}>
              <label htmlFor="website">Ne pas remplir ce champ</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-solid mt-2 w-full">
              <DownloadIcon className="h-5 w-5" />
              {t("downloadBrochure")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
