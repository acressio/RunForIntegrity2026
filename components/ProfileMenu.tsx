"use client";

import { useState, useRef, useEffect } from "react";
import LogoutButton from "./LogoutButton";

export default function ProfileMenu({
  nama,
  bibNumber,
}: {
  nama: string;
  bibNumber: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const initial = nama?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-line bg-panel2 py-1 pl-1 pr-3 text-sm font-medium hover:border-accent"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold">
          {initial}
        </span>
        <span className="hidden sm:inline">{nama}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-panel shadow-xl">
          <div className="border-b border-line px-3 py-3">
            <p className="text-sm font-semibold">{nama}</p>
            <p className="text-xs text-muted">BIB #{bibNumber}</p>
          </div>
          <div className="p-1">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
