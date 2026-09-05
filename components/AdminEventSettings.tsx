"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDateID, formatKm } from "@/lib/utils";
import type { EventSettings } from "@/types/database";

type Step = "form" | "review";

export default function AdminEventSettings({ settings }: { settings: EventSettings }) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("form");
  const [targetKm, setTargetKm] = useState(String(settings.target_km));
  const [raceStart, setRaceStart] = useState(settings.race_start);
  const [raceEnd, setRaceEnd] = useState(settings.race_end);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const hasChanges =
    Number(targetKm) !== settings.target_km ||
    raceStart !== settings.race_start ||
    raceEnd !== settings.race_end;

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!hasChanges) {
      setMessage("Tidak ada perubahan untuk disimpan.");
      return;
    }
    setStep("review");
  }

  async function handleConfirm() {
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
      setStep("form");
      return;
    }

    setStep("form");
    setMessage("Pengaturan event berhasil disimpan.");
    router.refresh();
  }

  if (step === "review") {
    return (
      <div className="card">
        <h2 className="text-lg font-bold">Konfirmasi Perubahan Pengaturan Event</h2>
        <p className="text-sm text-muted">
          Periksa kembali perubahan berikut. Perubahan ini berlaku untuk seluruh peserta begitu
          dikonfirmasi.
        </p>

        <div className="mt-6 space-y-3">
          <ReviewRow
            label="Target Jarak"
            oldValue={`${formatKm(settings.target_km, 0)} km`}
            newValue={`${formatKm(Number(targetKm), 0)} km`}
            changed={Number(targetKm) !== settings.target_km}
          />
          <ReviewRow
            label="Race Start"
            oldValue={formatDateID(settings.race_start)}
            newValue={formatDateID(raceStart)}
            changed={raceStart !== settings.race_start}
          />
          <ReviewRow
            label="Race End"
            oldValue={formatDateID(settings.race_end)}
            newValue={formatDateID(raceEnd)}
            changed={raceEnd !== settings.race_end}
          />
        </div>

        {message && (
          <p className="mt-4 rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-sm text-accent-light">
            {message}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setStep("form")}
            disabled={saving}
            className="btn-secondary"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? "Menyimpan..." : "Konfirmasi Perubahan"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-lg font-bold">Pengaturan Event</h2>
      <p className="text-sm text-muted">
        Target jarak dan periode race window. Perubahan berlaku untuk semua peserta.
      </p>

      <form onSubmit={handleContinue} className="mt-6 grid gap-4 sm:grid-cols-3">
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
          <button type="submit" className="btn-primary">
            Lanjutkan
          </button>
        </div>
      </form>
    </div>
  );
}

function ReviewRow({
  label,
  oldValue,
  newValue,
  changed,
}: {
  label: string;
  oldValue: string;
  newValue: string;
  changed: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl2 border border-line bg-panel2/50 px-4 py-3">
      <span className="text-sm font-semibold text-muted">{label}</span>
      {changed ? (
        <span className="text-sm">
          <span className="text-muted line-through">{oldValue}</span>
          <span className="mx-2 text-muted">&rarr;</span>
          <span className="font-bold text-accent-light">{newValue}</span>
        </span>
      ) : (
        <span className="text-sm text-muted">{oldValue} (tidak berubah)</span>
      )}
    </div>
  );
}
