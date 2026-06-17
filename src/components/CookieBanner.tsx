"use client";

import { useEffect, useState } from "react";
import { t } from "@/i18n/ui";

const STORAGE_KEY = "ophtahealth-cookie-consent";

/** GDPR-style consent banner distinguishing essential vs analytics cookies. */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const decide = (choice: "all" | "essential") => {
    localStorage.setItem(STORAGE_KEY, choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentement aux cookies"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl animate-fadeIn rounded-lg border border-outline-variant bg-clinical-white p-5 shadow-lg md:inset-x-auto md:left-6 md:right-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-on-surface-variant">{t("cookieText")}</p>
        <div className="flex shrink-0 gap-3">
          <button onClick={() => decide("essential")} className="btn-outline whitespace-nowrap">
            {t("essentialOnly")}
          </button>
          <button onClick={() => decide("all")} className="btn-solid whitespace-nowrap">
            {t("acceptAll")}
          </button>
        </div>
      </div>
    </div>
  );
}
