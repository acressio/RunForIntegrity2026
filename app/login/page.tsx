"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email atau password salah."
          : error.message
      );
      return;
    }

    router.push("/dashboard/input-activity");
    router.refresh();
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center px-4"
      style={{
        backgroundImage: "url('/login-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-ink/70" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src="/logo-run-for-integrity.png"
            alt="Run For Integrity"
            className="mx-auto mb-4 h-20 w-20 rounded-xl2 object-contain"
          />
          <h1 className="text-2xl font-black tracking-tight">DBI Virtual Run 2026</h1>
          <p className="mt-1 text-sm text-muted">Masuk ke dashboard runner kamu</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-sm text-accent-light">
              {error}
            </div>
          )}

          <div>
            <label className="label-field" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@bpkp.go.id"
            />
          </div>

          <div>
            <label className="label-field" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <div className="mt-1.5 text-right">
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-accent-light hover:underline"
              >
                Lupa password?
              </Link>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Memproses..." : "Masuk"}
          </button>

          <p className="text-center text-sm text-muted">
            Belum punya akun?{" "}
            <Link href="/signup" className="font-semibold text-accent-light hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
