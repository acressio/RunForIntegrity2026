"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatKm } from "@/lib/utils";

type Row = {
  id: string;
  nama: string;
  email: string;
  unit_kerja: string;
  bib_number: number;
  role: "peserta" | "admin";
  total_km: number;
};

export default function AdminParticipants({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.nama.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.unit_kerja.toLowerCase().includes(q) ||
        String(r.bib_number).includes(q)
    );
  }, [rows, query]);

  async function toggleAdmin(row: Row) {
    const nextRole = row.role === "admin" ? "peserta" : "admin";
    if (
      !confirm(
        nextRole === "admin"
          ? `Jadikan ${row.nama} sebagai admin?`
          : `Cabut akses admin dari ${row.nama}?`
      )
    )
      return;

    setBusyId(row.id);
    const { error } = await supabase
      .from("profiles")
      .update({ role: nextRole })
      .eq("id", row.id);
    setBusyId(null);

    if (error) {
      alert(`Gagal: ${error.message}`);
      return;
    }
    router.refresh();
  }

  async function deleteParticipant(row: Row) {
    if (
      !confirm(
        `Hapus peserta ${row.nama} (BIB #${row.bib_number})? Semua record aktivitasnya akan ikut terhapus.`
      )
    )
      return;

    setBusyId(row.id);
    const { error } = await supabase.from("profiles").delete().eq("id", row.id);
    setBusyId(null);

    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
      return;
    }
    router.refresh();
  }

  return (
    <div className="card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Peserta ({rows.length})</h2>
          <p className="text-sm text-muted">Kelola akun, akses admin, dan data peserta.</p>
        </div>
        <input
          className="input-field max-w-xs"
          placeholder="Cari nama / email / BIB..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th className="table-head py-2">BIB</th>
              <th className="table-head py-2">Nama</th>
              <th className="table-head py-2">Unit Kerja</th>
              <th className="table-head py-2 text-right">Total KM</th>
              <th className="table-head py-2">Role</th>
              <th className="table-head py-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-line/60 text-sm">
                <td className="py-3 font-semibold">#{r.bib_number}</td>
                <td className="py-3">
                  <p className="font-medium">{r.nama}</p>
                  <p className="text-xs text-muted">{r.email}</p>
                </td>
                <td className="py-3 text-muted">{r.unit_kerja}</td>
                <td className="py-3 text-right font-semibold text-accent-light">
                  {formatKm(r.total_km)} KM
                </td>
                <td className="py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      r.role === "admin"
                        ? "bg-accent/20 text-accent-light"
                        : "bg-panel2 text-muted"
                    }`}
                  >
                    {r.role}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/dashboard/admin/participants/${r.id}`}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Lihat Aktivitas
                    </Link>
                    <button
                      onClick={() => toggleAdmin(r)}
                      disabled={busyId === r.id}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      {r.role === "admin" ? "Cabut Admin" : "Jadikan Admin"}
                    </button>
                    <button
                      onClick={() => deleteParticipant(r)}
                      disabled={busyId === r.id}
                      className="btn-ghost-danger"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
