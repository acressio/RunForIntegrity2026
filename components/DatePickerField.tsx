"use client";

import { useEffect, useRef, useState } from "react";

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_LABELS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function parseISO(iso: string): { y: number; m: number; d: number } | null {
  const match = iso?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]) - 1, d: Number(match[3]) };
}

export default function DatePickerField({
  value,
  onChange,
  min,
  max,
  placeholder = "Pilih tanggal",
}: {
  value: string; // ISO yyyy-mm-dd
  onChange: (iso: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const parsedValue = parseISO(value);
  const parsedMin = parseISO(min ?? "");
  const parsedMax = parseISO(max ?? "");

  const initial = parsedValue ?? parsedMin ?? { y: new Date().getFullYear(), m: new Date().getMonth(), d: 1 };
  const [viewY, setViewY] = useState(initial.y);
  const [viewM, setViewM] = useState(initial.m);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function isDisabled(y: number, m: number, d: number) {
    const iso = toISO(y, m, d);
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  }

  function daysInMonth(y: number, m: number) {
    return new Date(y, m + 1, 0).getDate();
  }

  function firstWeekday(y: number, m: number) {
    return new Date(y, m, 1).getDay();
  }

  const totalDays = daysInMonth(viewY, viewM);
  const leadingBlanks = firstWeekday(viewY, viewM);
  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  function goPrevMonth() {
    if (viewM === 0) {
      setViewM(11);
      setViewY((y) => y - 1);
    } else {
      setViewM((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (viewM === 11) {
      setViewM(0);
      setViewY((y) => y + 1);
    } else {
      setViewM((m) => m + 1);
    }
  }

  const displayText = parsedValue
    ? `${String(parsedValue.d).padStart(2, "0")}/${String(parsedValue.m + 1).padStart(2, "0")}/${parsedValue.y}`
    : placeholder;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`input-field flex items-center justify-between text-left ${
          !parsedValue ? "text-muted" : ""
        }`}
      >
        <span>{displayText}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-2 w-72 rounded-xl2 border border-line bg-panel p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrevMonth}
              className="rounded-lg p-1.5 text-muted hover:bg-panel2 hover:text-white"
              aria-label="Bulan sebelumnya"
            >
              ‹
            </button>
            <p className="text-sm font-semibold">
              {MONTH_LABELS[viewM]} {viewY}
            </p>
            <button
              type="button"
              onClick={goNextMonth}
              className="rounded-lg p-1.5 text-muted hover:bg-panel2 hover:text-white"
              aria-label="Bulan berikutnya"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
            {DAY_LABELS.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (d === null) return <div key={`b${i}`} />;
              const disabled = isDisabled(viewY, viewM, d);
              const isSelected =
                parsedValue && parsedValue.y === viewY && parsedValue.m === viewM && parsedValue.d === d;
              return (
                <button
                  type="button"
                  key={d}
                  disabled={disabled}
                  onClick={() => {
                    onChange(toISO(viewY, viewM, d));
                    setOpen(false);
                  }}
                  className={`aspect-square rounded-lg text-xs font-medium transition ${
                    disabled
                      ? "cursor-not-allowed text-line"
                      : isSelected
                      ? "bg-accent text-white"
                      : "text-white hover:bg-panel2"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {(parsedMin || parsedMax) && (
            <p className="mt-2 text-center text-[11px] text-muted">
              {min && max ? `Rentang tanggal: ${min.split("-").reverse().join("/")} – ${max.split("-").reverse().join("/")}` : null}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
