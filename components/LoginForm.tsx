"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  initialError?: string;
};

export function LoginForm({ initialError = "" }: LoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "No se pudo iniciar sesión.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="field">
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gold px-4 py-3 text-sm font-semibold tracking-[0.14em] text-white uppercase transition hover:bg-gold-dark disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs tracking-[0.12em] text-muted uppercase">
        <span className="h-px flex-1 bg-line" />
        o
        <span className="h-px flex-1 bg-line" />
      </div>

      <a
        href="/api/auth/google"
        className="flex w-full items-center justify-center rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-cream"
      >
        Continuar con Google
      </a>
    </div>
  );
}
