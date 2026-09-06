"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hmsInputToInterval, getEditableDateRange } from "@/lib/utils";
import DatePickerField from "./DatePickerField";
import TimeSelect24 from "./TimeSelect24";
import type { Activity } from "@/types/database";

type Props = {
  userId: string;
  raceStart: string;
  raceEnd: string;
  activity?: Activity | null;
  onClose: () => void;
  onSaved: () => void;
};

function secondsPartsFromInterval(interval?: string) {
  if (!interval) return { h: 0, m: 0, s: 0 };
  const match = interval.match(/(\d{1,3}):(\d{2}):(\d{2})/);
  if (!match) return { h: 0, m: 0, s: 0 };
  return { h: Number(match[1]), m: Number(match[2]), s: Number(match[3]) };
}

export default function ActivityFormModal({
  userId,
  raceStart,
  raceEnd,
  activity,
  onClose,
  onSaved,
}: Props) {
  const supabase = createClient();
  const isEdit = Boolean(activity);
  const durasiParts = secondsPartsFromInterval(activity?.durasi);
  const editableRange = getEditableDateRange(raceStart, raceEnd);

  const [tanggal, setTanggal] = useState(activity?.tanggal_aktivitas ?? "");
  const [jamMulai, setJamMulai] = useState(activity?.waktu_mulai?.slice(0, 2) ?? "");
  const [menitMulai, setMenitMulai] = useState(activity?.waktu_mulai?.slice(3, 5) ?? "");
  const [jarak, setJarak] = useState(activity ? String(activity.jarak_km) : "");
  const [jamH, setJamH] = useState(String(durasiParts.h));
  const [jamM, setJamM] = useState(String(durasiParts.m));
  const [jamS, setJamS] = useState(String(durasiParts.s));
  const [heartRate, setHeartRate] = useState(
    activity?.heart_rate ? String(activity.heart_rate) : ""
  );
  const [elevation, setElevation] = useState(
    activity?.elevation_gain ? String(activity.elevation_gain) : ""
  );
  const [buktiStrava, setBuktiStrava] = useState(activity?.bukti_strava ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Semua field wajib kecuali heart rate & elevation gain
    if (!tanggal) {
      setError("Lengkapi data: tanggal aktivitas wajib diisi.");
      return;
    }
    if (!jamMulai || !menitMulai) {
      setError("Lengkapi data: waktu mulai wajib diisi.");
      return;
    }
    if (!jarak || Number(jarak) < 1) {
      setError("Jarak minimal 1.00 km.");
      return;
    }
    if (Number(jarak) > 10) {
      setError("Jarak maksimal 10.00 km per aktivitas.");
      return;
    }
    if (!buktiStrava.trim()) {
      setError("Lengkapi data: bukti aktivitas wajib diisi.");
      return;
    }

    const durasi = hmsInputToInterval(
      Number(jamH) || 0,
      Number(jamM) || 0,
      Number(jamS) || 0
    );

    if (durasi === "00:00:00") {
      setError("Lengkapi data: durasi wajib diisi dan harus lebih dari 0.");
      return;
    }

    setLoading(true);

    const payload = {
      user_id: userId,
      tanggal_aktivitas: tanggal,
      waktu_mulai: `${jamMulai}:${menitMulai}:00`,
      jarak_km: Number(jarak),
      durasi,
      heart_rate: heartRate ? Number(heartRate) : null,
      elevation_gain: elevation ? Number(elevation) : null,
      bukti_strava: buktiStrava.trim(),
    };

    const { error } = isEdit
      ? await supabase.from("activities").update(payload).eq("id", activity!.id)
      : await supabase.from("activities").insert(payload);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl2 border border-line bg-panel p-6 text-white">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {isEdit ? "Edit Aktivitas" : "Tambah Aktivitas"}
          </h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-white"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-sm text-accent-light">
              {error}
            </div>
          )}

          <div>
            <label className="label-field">Tanggal Aktivitas</label>
            <DatePickerField
              value={tanggal}
              onChange={setTanggal}
              min={editableRange.min}
              max={editableRange.max}
            />
            <p className="mt-1 text-[11px] text-muted">
              Aktivitas maksimal diupload 7 hari setelah tanggal kejadian.
            </p>
          </div>

          <div>
            <label className="label-field">Waktu Mulai (24 jam)</label>
            <TimeSelect24
              hour={jamMulai}
              minute={menitMulai}
              onChangeHour={setJamMulai}
              onChangeMinute={setMenitMulai}
            />
          </div>

          <div>
            <label className="label-field">Jarak (km)</label>
            <input
              type="number"
              step="0.01"
              min="1"
              max="10"
              required
              className="input-field"
              value={jarak}
              onChange={(e) => setJarak(e.target.value)}
            />
            <p className="mt-1 text-[11px] text-muted">
              Jarak minimal 1.00 km, maksimal 10.00 km per aktivitas.
            </p>
          </div>

          <div>
            <label className="label-field">Durasi</label>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                min="0"
                className="input-field"
                value={jamH}
                onChange={(e) => setJamH(e.target.value)}
                placeholder="Jam"
              />
              <input
                type="number"
                min="0"
                max="59"
                className="input-field"
                value={jamM}
                onChange={(e) => setJamM(e.target.value)}
                placeholder="Menit"
              />
              <input
                type="number"
                min="0"
                max="59"
                className="input-field"
                value={jamS}
                onChange={(e) => setJamS(e.target.value)}
                placeholder="Detik"
              />
            </div>
            <p className="mt-1 text-[11px] text-muted">
              Jam / Menit / Detik. Waktu selesai &amp; pace dihitung otomatis.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Heart Rate (opsional)</label>
              <input
                type="number"
                min="30"
                max="250"
                className="input-field"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="bpm"
              />
            </div>
            <div>
              <label className="label-field">Elevation Gain (opsional)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={elevation}
                onChange={(e) => setElevation(e.target.value)}
                placeholder="meter"
              />
            </div>
          </div>

          <div>
            <label className="label-field">Bukti Aktivitas</label>
            <input
              type="url"
              required
              className="input-field"
              value={buktiStrava}
              onChange={(e) => setBuktiStrava(e.target.value)}
              placeholder="https://strava.app.link/..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Batal
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
