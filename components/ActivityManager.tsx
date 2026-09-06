"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ActivityFormModal from "./ActivityFormModal";
import { formatDateID, formatTimeHM, paceToDisplay, getEditableDateRange } from "@/lib/utils";
import type { Activity } from "@/types/database";

export default function ActivityManager({
  userId,
  activities,
  raceStart,
  raceEnd,
}: {
  userId: string;
  activities: Activity[];
  raceStart: string;
  raceEnd: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const editableRange = getEditableDateRange(raceStart, raceEnd);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(activity: Activity) {
    setEditing(activity);
    setModalOpen(true);
  }

  function handleSaved() {
    setModalOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus record aktivitas ini?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("activities").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
      return;
    }
    router.refresh();
  }

  return (
    <div className="card mt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Aktivitas Saya</h2>
          <p className="text-sm text-muted">
            Catat aktivitas selama race window{" "}
            {formatDateID(raceStart)}–{formatDateID(raceEnd)}.
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          + Tambah Aktivitas
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th className="table-head py-3">Tanggal</th>
              <th className="table-head py-3">Jarak</th>
              <th className="table-head py-3">Durasi</th>
              <th className="table-head py-3">Pace</th>
              <th className="table-head py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-muted">
                  Belum ada aktivitas. Klik &ldquo;Tambah Aktivitas&rdquo; untuk mulai mencatat.
                </td>
              </tr>
            )}
            {activities.map((a) => {
              const editable =
                a.tanggal_aktivitas >= editableRange.min && a.tanggal_aktivitas <= editableRange.max;
              return (
                <tr key={a.id} className="border-b border-line/60 text-sm">
                  <td className="py-3 font-medium">{formatDateID(a.tanggal_aktivitas)}</td>
                  <td className="py-3 font-semibold">{a.jarak_km.toFixed(2)} km</td>
                  <td className="py-3 text-muted">{a.durasi.slice(0, 8)}</td>
                  <td className="py-3 text-muted">{paceToDisplay(a.pace)}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(a)}
                        disabled={!editable}
                        title={
                          editable
                            ? undefined
                            : "Sudah lewat 7 hari sejak tanggal aktivitas, tidak bisa diedit lagi."
                        }
                        className="btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id}
                        className="btn-ghost-danger"
                      >
                        {deletingId === a.id ? "..." : "Hapus"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ActivityFormModal
          userId={userId}
          raceStart={raceStart}
          raceEnd={raceEnd}
          activity={editing}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
