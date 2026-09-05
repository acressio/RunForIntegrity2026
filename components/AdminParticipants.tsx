"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatKm } from "@/lib/utils";

type Role = "peserta" | "admin" | "admin_utama";

type Row = {
  id: string;
  nama: string;
  email: string;
  unit_kerja: string;
  bib_number: number;
  role: Role;
  total_km: number;
};

const ROLE_LABEL: Record<Role, string> = {
  peserta: "Peserta",
  admin: "Admin",
  admin_utama: "Admin Utama",
};

const ROLE_BADGE_CLASS: Record<Role, string> = {
  peserta: "bg-panel2 text-muted",
  admin: "bg-accent/20 text-accent-light",
  admin_utama: "bg-rank-gold/20 text-rank-gold",
};

export default function AdminParticipants({
  rows,
  isAdminUtama,
  currentUserId,
}: {
  rows: Row[];
  isAdminUtama: boolean;
  currentUserId: string;
}) {
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

  async function changeRole(row: Row, nextRole: Role) {
    if (nextRole === row.role) return;

    if (
      !confirm(
        `Ubah role ${row.nama} dari "${ROLE_LABEL[row.role]}" menjadi "${ROLE_LABEL[nextRole]}"?`
      )
    )
      return;

    setBusyId(row.id);
    const { error } = await supabase.from("profiles").update({ role: nextRole }).eq("id", row.id);
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
          <p className="text-sm text-muted">
            {isAdminUtama
              ? "Kelola akun, akses admin, dan data peserta."
              : "Kelola data peserta."}
          </p>
        </div>
        <input
          className="input-field max-w-xs"
          placeholder="Cari nama / email / BIB..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
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
                  {isAdminUtama ? (
                    <select
                      value={r.role}
                      disabled={busyId === r.id || r.id === currentUserId}
                      onChange={(e) => changeRole(r, e.target.value as Role)}
                      className={`rounded-full border-none px-2 py-1 text-xs font-semibold ${ROLE_BADGE_CLASS[r.role]}`}
                      title={r.id === currentUserId ? "Tidak bisa mengubah role akun sendiri" : undefined}
                    >
                      <option value="peserta">Peserta</option>
                      <option value="admin">Admin</option>
                      <option value="admin_utama">Admin Utama</option>
                    </select>
                  ) : (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_BADGE_CLASS[r.role]}`}
                    >
                      {ROLE_LABEL[r.role]}
                    </span>
                  )}
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
