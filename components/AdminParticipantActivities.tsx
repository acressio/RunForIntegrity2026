"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDateID, formatTimeHM, paceToDisplay } from "@/lib/utils";
import type { Activity } from "@/types/database";

export default function AdminParticipantActivities({
  activities,
}: {
  activities: Activity[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Hapus record aktivitas ini?")) return;
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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Seluruh Aktivitas ({activities.length})</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th className="table-head py-2">Tanggal</th>
              <th className="table-head py-2">Waktu Mulai</th>
              <th className="table-head py-2 text-right">Jarak</th>
              <th className="table-head py-2 text-right">Durasi</th>
              <th className="table-head py-2 text-right">Pace</th>
              <th className="table-head py-2">Bukti</th>
              <th className="table-head py-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-muted">
                  Peserta ini belum punya record aktivitas.
                </td>
              </tr>
            )}
            {activities.map((a) => (
              <tr key={a.id} className="border-b border-line/60 text-sm">
                <td className="py-3 font-medium">{formatDateID(a.tanggal_aktivitas)}</td>
                <td className="py-3 text-muted">{formatTimeHM(a.waktu_mulai)}</td>
                <td className="py-3 text-right font-semibold text-accent-light">
                  {a.jarak_km.toFixed(2)} km
                </td>
                <td className="py-3 text-right text-muted">{a.durasi.slice(0, 8)}</td>
                <td className="py-3 text-right text-muted">{paceToDisplay(a.pace)} /km</td>
                <td className="py-3">
                  {a.bukti_strava ? (
                    <a
                      href={a.bukti_strava}
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
                    onClick={() => handleDelete(a.id)}
                    disabled={busyId === a.id}
                    className="btn-ghost-danger"
                  >
                    {busyId === a.id ? "..." : "Hapus"}
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
