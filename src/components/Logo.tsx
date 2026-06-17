import Link from "next/link";
import Image from "next/image";

/**
 * OphtaHealth brand mark.
 * The official logo is a horizontal eye icon on a transparent background. It is
 * trimmed and uploaded oversized, then rendered object-contain at a fixed height
 * (width auto) so its aspect ratio is preserved, followed by the wordmark.
 */
export function Logo({ className = "", showText = true }: { className?: string; showText?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`} aria-label="OphtaHealth — Accueil">
      <Image
        src="/brand/ophtahealth-logo.webp"
        alt="OphtaHealth"
        width={426}
        height={267}
        priority
        className="h-11 w-auto object-contain"
      />
      {showText && (
        <span className="font-display text-[26px] font-bold leading-none text-primary-container">
          Ophta<span className="text-primary">Health</span>
        </span>
      )}
    </Link>
  );
}
