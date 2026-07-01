import Link from "next/link";
import { Logo } from "./Logo";
import { site } from "@/lib/site";
import { t } from "@/i18n/ui";

const footerLinks = [
  { href: "/confidentialite", label: t("privacyPolicy") },
  { href: "/faq", label: t("faq") },
  { href: "/support", label: t("contact") },
  { href: "/support", label: t("support") },
];

export function Footer() {
  return (
    <footer className="border-t border-outline-variant bg-surface-gray px-margin-edge py-12">
      <div className="mx-auto max-w-container-max">
        <div className="mb-8 flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Logo />
            <p className="text-center text-sm text-on-surface-variant md:text-left">
              © {new Date().getFullYear()} {site.name}. {t("rightsReserved")}
              <br /> {site.taglineFr}.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-on-surface-variant">
            {footerLinks.map((l, i) => (
              <Link key={i} href={l.href} className="transition-colors hover:text-primary-container">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col items-center justify-between gap-2 border-t border-outline-variant pt-6 text-sm text-on-surface-variant md:flex-row">
          <p>
            {site.phonePrimary} · {site.email}
          </p>
          <div className="flex items-center gap-4">
            <p>
              {t("developedBy")}{" "}
              <a
                href="https://www.instagram.com/nerovex_company/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-on-surface-variant underline decoration-dotted underline-offset-2 transition-colors hover:text-primary-container"
              >
                {site.developer}
              </a>
            </p>
            <Link
              href="/admin"
              aria-label="Espace gestion"
              className="text-on-surface-variant transition-colors hover:text-primary-container"
            >
              Espace gestion
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
