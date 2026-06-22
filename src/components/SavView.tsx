"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { addReclamation } from "@/lib/store";
import { site, whatsappLink } from "@/lib/site";
import { CheckIcon, PhoneIcon, WhatsAppIcon } from "@/components/Icons";

const inputCls =
  "w-full rounded border border-outline-variant bg-clinical-white px-3 py-2.5 text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

/**
 * Service Après-Vente — public réclamation form. On submit it records the
 * claim in Supabase (anonymous insert allowed by RLS); the admin reads them
 * in the dashboard "Réclamations" panel. No email is sent.
 */
export function SavView({ products }: { products: string[] }) {
  const [form, setForm] = useState({ name: "", phone: "", product: "", serial: "", message: "" });
  // Honeypot: hidden from humans, auto-filled by bots → drop the submission.
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (website) {
      setStatus("sent"); // spam bot — pretend success, record nothing
      return;
    }
    setStatus("sending");
    try {
      await addReclamation({
        name: form.name.trim(),
        phone: form.phone.trim(),
        product: form.product.trim(),
        serial: form.serial.trim(),
        message: form.message.trim(),
      });
      setStatus("sent");
    } catch (err) {
      console.error("[sav] submission failed:", err);
      setStatus("error");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Service Après-Vente"
        title="SAV — Service Après-Vente"
        subtitle="Une panne, un dysfonctionnement ou une demande de réparation ? Envoyez votre réclamation : notre équipe technique vous recontacte dans les meilleurs délais."
      />

      <div className="container-max grid grid-cols-1 gap-10 py-12 lg:grid-cols-[1fr_320px]">
        {/* Réclamation form */}
        <div className="rounded-lg border border-outline-variant bg-clinical-white p-6 sm:p-8">
          {status === "sent" ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-status-success/10 text-status-success">
                <CheckIcon className="h-9 w-9" />
              </span>
              <h2 className="font-display text-headline-md text-primary-container">Réclamation envoyée</h2>
              <p className="max-w-md text-on-surface-variant">
                Merci ! Votre réclamation a bien été transmise à notre service technique.
                Nous vous recontacterons via le numéro indiqué.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nom complet" required>
                  <input
                    className={inputCls}
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </Field>
                <Field label="Téléphone" required>
                  <input
                    type="tel"
                    className={inputCls}
                    required
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </Field>
                <Field label="Produit concerné">
                  <input
                    className={inputCls}
                    list="sav-products"
                    placeholder="Nom de l'appareil"
                    value={form.product}
                    onChange={(e) => set("product", e.target.value)}
                  />
                  <datalist id="sav-products">
                    {products.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </Field>
                <Field label="Numéro de série">
                  <input
                    className={inputCls}
                    placeholder="Optionnel"
                    value={form.serial}
                    onChange={(e) => set("serial", e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Message de réclamation" required>
                <textarea
                  className={inputCls}
                  rows={6}
                  required
                  placeholder="Décrivez le problème rencontré…"
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                />
              </Field>

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

              {status === "error" && (
                <p className="rounded bg-error/10 px-3 py-2 text-sm text-error">
                  Une erreur est survenue. Réessayez ou contactez-nous par téléphone.
                </p>
              )}

              <button type="submit" disabled={status === "sending"} className="btn-solid mt-2 w-full disabled:opacity-60">
                {status === "sending" ? "Envoi…" : "Envoyer la réclamation"}
              </button>
            </form>
          )}
        </div>

        {/* Alternative contact */}
        <aside className="h-fit rounded-lg border border-outline-variant bg-surface-gray p-6">
          <h2 className="mb-3 font-display text-lg font-semibold text-primary-container">Besoin d&apos;une aide urgente ?</h2>
          <p className="mb-4 text-sm text-on-surface-variant">
            Pour une intervention urgente, contactez directement notre support technique.
          </p>
          <a href={`tel:${site.phoneSecondary}`} className="flex items-center gap-2 text-primary-container hover:text-primary">
            <PhoneIcon className="h-5 w-5" /> {site.phoneSecondary}
          </a>
          <a
            href={whatsappLink("Bonjour OphtaHealth, j'ai une réclamation")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded bg-whatsapp-dark px-4 py-2 text-sm font-medium text-white hover:brightness-110"
          >
            <WhatsAppIcon className="h-4 w-4" /> Écrire sur WhatsApp
          </a>
        </aside>
      </div>
    </>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-label-caps uppercase text-on-surface-variant">
        {label}
        {required && <span className="text-error"> *</span>}
      </label>
      {children}
    </div>
  );
}
