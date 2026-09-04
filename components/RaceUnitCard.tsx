"use client";

import { useState } from "react";
import { formatKm, secondsToHMS, secondsToPaceDisplay } from "@/lib/utils";

export type UnitRow = {
  unitKerja: string;
  totalKm: number;
  totalEntry: number;
  totalDurasiSeconds: number;
  avgPaceSeconds: number | null;
  activeMemberCount: number;
};

export type MemberRow = {
  userId: string;
  nama: string;
  totalKm: number;
};

const RANK_CLASS = [
  "bg-rank-gold text-ink",
  "bg-rank-silver text-ink",
  "bg-rank-bronze text-ink",
];

export default function RaceUnitCard({
  units,
  membersByUnit,
  targetKm,
}: {
  units: UnitRow[];
  membersByUnit: Record<string, MemberRow[]>;
  targetKm: number;
}) {
  const [openUnits, setOpenUnits] = useState<Set<string>>(() => new Set());

  function toggle(unitKerja: string) {
    setOpenUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitKerja)) next.delete(unitKerja);
      else next.add(unitKerja);
      return next;
    });
  }

  return (
    <div className="card-dark mt-5">
      <div className="mb-1 flex items-center gap-2.5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent/15 text-lg">
          🤝
        </div>
        <p className="text-[15px] font-extrabold">Si Paling Kompak</p>
      </div>
      <p className="mb-4 text-xs text-muted">Unit kerja dengan total jarak tempuh terjauh</p>

      {units.length === 0 ? (
        <p className="rounded-xl2 border border-line bg-white/[0.02] px-4 py-6 text-center text-xs text-muted">
          Belum ada data untuk kategori ini.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-2.5 border-b border-line px-3.5 pb-2.5 text-[11px] font-bold uppercase tracking-wide text-muted">
            <span className="w-[42px] flex-none">Rank</span>
            <span className="min-w-0 flex-[2.3_1_0]">Nama Unit</span>
            <span className="flex-[1.1_1_0]">Total KM</span>
            <span className="flex-[0.6_1_0]">Entry</span>
            <span className="flex-[1_1_0]">Durasi Total</span>
            <span className="flex-[0.9_1_0]">Pace Avg</span>
            <span className="w-[18px] flex-none" />
          </div>

          <div className="flex flex-col">
            {units.map((u, i) => {
              const isOpen = openUnits.has(u.unitKerja);
              const members = membersByUnit[u.unitKerja] ?? [];
              return (
                <div key={u.unitKerja} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    onClick={() => toggle(u.unitKerja)}
                    className={`flex w-full items-center gap-2.5 px-3.5 py-3.5 text-left transition ${
                      isOpen ? "bg-accent/[0.06]" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="w-[42px] flex-none">
                      <span
                        className={`flex h-[26px] w-[26px] items-center justify-center rounded-full text-xs font-extrabold ${
                          i < 3 ? RANK_CLASS[i] : "bg-panel2 text-white"
                        }`}
                      >
                        {i + 1}
                      </span>
                    </span>
                    <span className="min-w-0 flex-[2.3_1_0]">
                      <p className="truncate text-[13.5px] font-bold">{u.unitKerja}</p>
                      <p className="text-[10.5px] text-muted">
                        {u.activeMemberCount} anggota aktif
                      </p>
                    </span>
                    <span className="flex-[1.1_1_0] text-[13.5px] font-extrabold text-accent-light">
                      {formatKm(u.totalKm)} KM
                    </span>
                    <span className="flex-[0.6_1_0] text-[12.5px] font-semibold text-gray-200">
                      {u.totalEntry}
                    </span>
                    <span className="flex-[1_1_0] text-[12.5px] font-semibold text-gray-200">
                      {secondsToHMS(u.totalDurasiSeconds)}
                    </span>
                    <span className="flex-[0.9_1_0] text-[12.5px] font-semibold text-gray-200">
                      {secondsToPaceDisplay(u.avgPaceSeconds)} /km
                    </span>
                    <span
                      className={`w-[18px] flex-none text-center text-muted transition-transform ${
                        isOpen ? "rotate-180 text-accent-light" : ""
                      }`}
                    >
                      ▾
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-3.5 py-1 pb-4 pl-[58px]">
                      {members.length === 0 ? (
                        <p className="py-2 text-xs text-muted">
                          Belum ada anggota unit ini yang input aktivitas.
                        </p>
                      ) : (
                        members.map((m) => {
                          const pct = targetKm > 0 ? Math.min(100, (m.totalKm / targetKm) * 100) : 0;
                          return (
                            <div key={m.userId} className="py-2.5">
                              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                                <span className="flex-shrink-0 text-[12.5px] font-bold">
                                  {m.nama}
                                </span>
                                <span className="text-right text-[11px] text-muted">
                                  {formatKm(m.totalKm)} / {formatKm(targetKm, 0)} km &middot;{" "}
                                  {pct.toFixed(1).replace(".", ",")}%
                                  {pct >= 100 ? " \u00b7 Target tercapai" : ""}
                                </span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-panel2">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-accent-dark to-accent-light"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
