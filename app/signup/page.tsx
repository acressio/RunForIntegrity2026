"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UNIT_KERJA_OPTIONS } from "@/lib/unitKerja";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [unitKerja, setUnitKerja] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!unitKerja) {
      setError("Silakan pilih unit kerja.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nama, unit_kerja: unitKerja },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (!data.session) {
      // Konfirmasi email masih aktif di project Supabase
      setNeedsConfirmation(true);
      return;
    }

    router.push("/dashboard/input-activity");
    router.refresh();
  }

  if (needsConfirmation) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="card w-full max-w-md text-center">
          <h1 className="text-xl font-bold">Cek email kamu</h1>
          <p className="mt-2 text-sm text-muted">
            Kami sudah mengirim link konfirmasi ke <span className="text-white">{email}</span>.
            Klik link tersebut untuk mengaktifkan akun, lalu masuk ke dashboard.
          </p>
          <Link href="/login" className="btn-primary mt-6 inline-flex">
            Ke halaman login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src="/logo-run-for-integrity.png"
            alt="Run For Integrity"
            className="mx-auto mb-4 h-28 w-28 rounded-xl2 object-contain"
          />
          <h1 className="text-2xl font-black tracking-tight">Daftar Peserta</h1>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-sm text-accent-light">
              {error}
            </div>
          )}

          <div>
            <label className="label-field" htmlFor="nama">
              Nama Lengkap
            </label>
            <input
              id="nama"
              type="text"
              required
              className="input-field"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>

          <div>
            <label className="label-field" htmlFor="unit_kerja">
              Unit Kerja
            </label>
            <select
              id="unit_kerja"
              required
              className="input-field"
              value={unitKerja}
              onChange={(e) => setUnitKerja(e.target.value)}
            >
              <option value="" disabled>
                Pilih unit kerja
              </option>
              {UNIT_KERJA_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

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
              minLength={6}
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Memproses..." : "Daftar"}
          </button>

          <p className="text-center text-sm text-muted">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-accent-light hover:underline">
              Masuk
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
