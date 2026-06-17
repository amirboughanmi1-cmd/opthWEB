"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const { authed, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authed === true) router.replace("/admin");
  }, [authed, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = await login(email, password);
    setBusy(false);
    if (err) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.replace("/admin");
    }
  };

  return (
    <div className="container-max flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-lg border border-outline-variant bg-clinical-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <Logo showText={false} />
          <div>
            <h1 className="font-display text-headline-md text-primary-container">Espace administrateur</h1>
            <p className="mt-1 text-sm text-on-surface-variant">Connectez-vous pour gérer le catalogue.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block font-mono text-label-caps uppercase text-on-surface-variant">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              className="w-full rounded border border-outline-variant bg-clinical-white px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block font-mono text-label-caps uppercase text-on-surface-variant">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className="w-full rounded border border-outline-variant bg-clinical-white px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {error && (
            <p className="rounded bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
          )}

          <button type="submit" disabled={busy} className="btn-solid mt-2 w-full disabled:opacity-60">
            {busy ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
