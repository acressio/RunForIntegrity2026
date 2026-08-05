"use client";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export default function TimeSelect24({
  hour,
  minute,
  onChangeHour,
  onChangeMinute,
}: {
  hour: string; // "" or "00".."23"
  minute: string; // "" or "00".."59"
  onChangeHour: (h: string) => void;
  onChangeMinute: (m: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <select
        className="input-field"
        value={hour}
        onChange={(e) => onChangeHour(e.target.value)}
      >
        <option value="" disabled>
          Jam
        </option>
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <select
        className="input-field"
        value={minute}
        onChange={(e) => onChangeMinute(e.target.value)}
      >
        <option value="" disabled>
          Menit
        </option>
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
