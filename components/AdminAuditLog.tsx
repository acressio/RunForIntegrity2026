import type { AuditLogRow } from "@/types/database";

const AKSI_LABEL: Record<AuditLogRow["aksi"], string> = {
  hapus_aktivitas: "Hapus Aktivitas",
  hapus_peserta: "Hapus Peserta",
  ubah_role: "Ubah Role",
  ubah_pengaturan_event: "Ubah Pengaturan Event",
};

const AKSI_BADGE_CLASS: Record<AuditLogRow["aksi"], string> = {
  hapus_aktivitas: "bg-accent/20 text-accent-light",
  hapus_peserta: "bg-accent/20 text-accent-light",
  ubah_role: "bg-rank-gold/20 text-rank-gold",
  ubah_pengaturan_event: "bg-rank-gold/20 text-rank-gold",
};

function formatWaktu(iso: string): string {
  const d = new Date(iso);
  const tanggal = d.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const jam = d.toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${tanggal} ${jam} WIB`;
}

export default function AdminAuditLog({ rows }: { rows: AuditLogRow[] }) {
  return (
    <div className="card">
      <h2 className="text-lg font-bold">Log Aktivitas Admin</h2>
      <p className="text-sm text-muted">
        Riwayat perubahan yang dilakukan admin - tercatat otomatis, tidak dapat diedit atau
        dihapus. Hanya terlihat oleh Admin Utama.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th className="table-head py-2">Waktu</th>
              <th className="table-head py-2">Admin</th>
              <th className="table-head py-2">Aksi</th>
              <th className="table-head py-2">Detail</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-sm text-muted">
                  Belum ada aktivitas admin yang tercatat.
                </td>
              </tr>
            )}
            {rows.map((log) => (
              <tr key={log.id} className="border-b border-line/60 text-sm">
                <td className="whitespace-nowrap py-3 text-muted">{formatWaktu(log.created_at)}</td>
                <td className="py-3 font-medium">{log.actor_nama}</td>
                <td className="py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${AKSI_BADGE_CLASS[log.aksi]}`}
                  >
                    {AKSI_LABEL[log.aksi]}
                  </span>
                </td>
                <td className="py-3 text-muted">{log.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
