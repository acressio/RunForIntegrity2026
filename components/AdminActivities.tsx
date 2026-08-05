"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDateID, paceToDisplay } from "@/lib/utils";

type Row = {
  id: string;
  tanggal_aktivitas: string;
  jarak_km: number;
  durasi: string;
  pace: string;
  bukti_strava: string | null;
  profiles: { nama: string; bib_number: number } | null;
};

export default function AdminActivities({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus record aktivitas ini dari sistem?")) return;
    setBusyId(id);
    const { error } = await supabase.from("activities").delete().eq("id", id);
    setBusyId(null);
    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
      return;
    }
    router.refresh();
  }

  return (
    <div className="card">
      <h2 className="text-lg font-bold">Aktivitas Terbaru</h2>
      <p className="text-sm text-muted">
        50 record terbaru dari seluruh peserta. Gunakan untuk moderasi / cek kewajaran data.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th className="table-head py-2">Tanggal</th>
              <th className="table-head py-2">Peserta</th>
              <th className="table-head py-2 text-right">Jarak</th>
              <th className="table-head py-2 text-right">Pace</th>
              <th className="table-head py-2">Bukti</th>
              <th className="table-head py-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line/60 text-sm">
                <td className="py-3">{formatDateID(r.tanggal_aktivitas)}</td>
                <td className="py-3">
                  <p className="font-medium">{r.profiles?.nama ?? "-"}</p>
                  <p className="text-xs text-muted">BIB #{r.profiles?.bib_number}</p>
                </td>
                <td className="py-3 text-right font-semibold text-accent-light">
                  {r.jarak_km.toFixed(2)} km
                </td>
                <td className="py-3 text-right text-muted">{paceToDisplay(r.pace)} /km</td>
                <td className="py-3">
                  {r.bukti_strava ? (
                    <a
                      href={r.bukti_strava}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-light hover:underline"
                    >
                      Lihat link
                    </a>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={busyId === r.id}
                    className="btn-ghost-danger"
                  >
                    {busyId === r.id ? "..." : "Hapus"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
