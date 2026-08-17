"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-callback`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="card w-full max-w-md text-center">
          <h1 className="text-xl font-bold">Cek email kamu</h1>
          <p className="mt-2 text-sm text-muted">
            Kalau <span className="text-white">{email}</span> terdaftar, kami sudah
            mengirim link untuk mengatur ulang password. Klik link tersebut, lalu
            kamu akan diarahkan untuk membuat password baru.
          </p>
          <Link href="/login" className="btn-primary mt-6 inline-flex">
            Kembali ke halaman login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black tracking-tight">Lupa Password</h1>
          <p className="mt-1 text-sm text-muted">
            Masukkan email yang kamu pakai untuk daftar. Kami akan kirim link
            untuk membuat password baru.
          </p>
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

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Mengirim..." : "Kirim Link Reset Password"}
          </button>

          <p className="text-center text-sm text-muted">
            Sudah ingat password?{" "}
            <Link href="/login" className="font-semibold text-accent-light hover:underline">
              Kembali ke login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
