"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { EventSettings } from "@/types/database";

export default function AdminEventSettings({ settings }: { settings: EventSettings }) {
  const router = useRouter();
  const supabase = createClient();

  const [targetKm, setTargetKm] = useState(String(settings.target_km));
  const [raceStart, setRaceStart] = useState(settings.race_start);
  const [raceEnd, setRaceEnd] = useState(settings.race_end);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("event_settings")
      .update({
        target_km: Number(targetKm),
        race_start: raceStart,
        race_end: raceEnd,
      })
      .eq("id", true);

    setSaving(false);

    if (error) {
      setMessage(`Gagal menyimpan: ${error.message}`);
      return;
    }

    setMessage("Pengaturan event berhasil disimpan.");
    router.refresh();
  }

  return (
    <div className="card">
      <h2 className="text-lg font-bold">Pengaturan Event</h2>
      <p className="text-sm text-muted">
        Target jarak dan periode race window. Perubahan berlaku untuk semua peserta.
      </p>

      <form onSubmit={handleSave} className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label-field">Target Jarak (km)</label>
          <input
            type="number"
            step="0.01"
            min="1"
            required
            className="input-field"
            value={targetKm}
            onChange={(e) => setTargetKm(e.target.value)}
          />
        </div>
        <div>
          <label className="label-field">Race Start</label>
          <input
            type="date"
            required
            className="input-field"
            value={raceStart}
            onChange={(e) => setRaceStart(e.target.value)}
          />
        </div>
        <div>
          <label className="label-field">Race End</label>
          <input
            type="date"
            required
            className="input-field"
            value={raceEnd}
            onChange={(e) => setRaceEnd(e.target.value)}
          />
        </div>

        <div className="sm:col-span-3">
          {message && <p className="mb-3 text-sm text-muted">{message}</p>}
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}
