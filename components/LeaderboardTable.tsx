"use client";

import { useMemo, useState } from "react";
import { formatKm, secondsToHMS, intervalToSeconds, paceToDisplay } from "@/lib/utils";
import type { LeaderboardRow } from "@/types/database";

export default function LeaderboardTable({
  rows,
  currentUserId,
}: {
  rows: LeaderboardRow[];
  currentUserId: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.nama.toLowerCase().includes(q) ||
        r.unit_kerja.toLowerCase().includes(q) ||
        String(r.bib_number).includes(q)
    );
  }, [rows, query]);

  return (
    <div className="card mt-8 overflow-x-auto">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold">Leaderboard</h3>
        <input
          className="input-field max-w-xs"
          placeholder="Cari nama / unit kerja / BIB..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b border-line bg-panel2">
            <th className="table-head px-3 py-3">Rank</th>
            <th className="table-head px-3 py-3">Nama</th>
            <th className="table-head px-3 py-3 text-right">Total KM</th>
            <th className="table-head px-3 py-3 text-right">Total Entry</th>
            <th className="table-head px-3 py-3 text-right">Durasi Total</th>
            <th className="table-head px-3 py-3 text-right">Pace Avg</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} className="py-10 text-center text-sm text-muted">
                Tidak ada peserta yang cocok dengan pencarian "{query}".
              </td>
            </tr>
          )}
          {filtered.map((r) => (
            <tr
              key={r.user_id}
              className={`border-b border-line/60 text-sm ${
                r.user_id === currentUserId ? "bg-accent/10" : ""
              }`}
            >
              <td className="px-3 py-3 font-semibold">{r.rank}</td>
              <td className="px-3 py-3">
                <p className="font-medium">{r.nama}</p>
                <p className="text-xs text-muted">{r.unit_kerja}</p>
              </td>
              <td className="px-3 py-3 text-right font-semibold text-accent-light">
                {formatKm(r.total_km)} KM
              </td>
              <td className="px-3 py-3 text-right text-muted">{r.total_entry}</td>
              <td className="px-3 py-3 text-right text-muted">
                {secondsToHMS(intervalToSeconds(r.total_durasi))}
              </td>
              <td className="px-3 py-3 text-right text-muted">
                {paceToDisplay(r.avg_pace)} /km
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
