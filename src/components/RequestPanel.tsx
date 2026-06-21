import React, { useState } from 'react';
import { Schedule, ChangeRequest } from '@/lib/db';
import { Clock, User, AlertTriangle, CheckCircle, FileText, Send, Loader2 } from 'lucide-react';

interface RequestPanelProps {
  schedules: Schedule[];
  requests: ChangeRequest[];
  userRole: 'admin' | 'dosen' | 'mahasiswa';
  userName: string;
  onRefresh: () => void;
}

const HOURS = Array.from({ length: 16 }, (_, i) => String(i + 7).padStart(2, '0')); // 07 to 22
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')); // 00 to 55

export default function RequestPanel({
  schedules,
  requests,
  userRole,
  userName,
  onRefresh,
}: RequestPanelProps) {
  const [subject, setSubject] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toDate, setToDate] = useState('');
  const [startHour, setStartHour] = useState('');
  const [startMinute, setStartMinute] = useState('');
  const [endHour, setEndHour] = useState('');
  const [endMinute, setEndMinute] = useState('');
  const [reason, setReason] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const uniqueSchedules = React.useMemo(() => {
    let list = schedules;
    if (userRole === 'dosen') {
      list = schedules.filter(
        (s) => s.lecturer.trim().toLowerCase() === userName.trim().toLowerCase()
      );
    }
    const seen = new Set();
    return list.filter((s) => {
      const key = `${s.subject}|${s.day}|${s.timeSlot}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [schedules, userRole, userName]);

  const handleSubjectChange = (subjectName: string) => {
    setSubject(subjectName);
    const selected = uniqueSchedules.find((s) => s.subject === subjectName);
    if (selected) {
      setFromTime(`${selected.day}, ${selected.timeSlot}`);
    } else {
      setFromTime('');
    }
  };

  const filteredRequests = React.useMemo(() => {
    if (userRole === 'dosen') {
      return requests.filter(
        (r) => r.lecturer.trim().toLowerCase() === userName.trim().toLowerCase()
      );
    }
    return requests;
  }, [requests, userRole, userName]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!subject || !fromTime || !toDate || !startHour || !startMinute || !endHour || !endMinute || !reason.trim()) {
      setError('Semua form wajib diisi.');
      return;
    }

    const [year, month, day] = toDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = dayNames[dateObj.getDay()];

    if (dateObj.getDay() === 0 || dateObj.getDay() === 6) {
      setError('Jadwal perkuliahan hanya tersedia pada hari kerja (Senin - Jumat).');
      return;
    }

    const startTimeVal = `${startHour}:${startMinute}`;
    const endTimeVal = `${endHour}:${endMinute}`;

    if (startTimeVal >= endTimeVal) {
      setError('Jam mulai harus lebih awal dari jam selesai.');
      return;
    }

    const toTimeStr = `${dayName}, ${startTimeVal} - ${endTimeVal}`;

    setLoading(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': userRole,
          'X-User-Email': localStorage.getItem('userEmail') || '',
        },
        body: JSON.stringify({
          lecturer: userName,
          subject,
          fromTime,
          toTime: toTimeStr,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal mengirim permohonan.');
      }

      setSuccess('Permohonan perpindahan jadwal berhasil dikirim.');
      setSubject('');
      setFromTime('');
      setToDate('');
      setStartHour('');
      setStartMinute('');
      setEndHour('');
      setEndMinute('');
      setReason('');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestStatus = async (id: number, status: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': userRole,
          'X-User-Email': localStorage.getItem('userEmail') || '',
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal memproses permohonan.');
      }

      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      {/* Form Section (Only for Dosen) */}
      {userRole === 'dosen' && (
        <div className="xl:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <h3 className="font-bold text-sm text-slate-800 pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
            <Send className="h-4.5 w-4.5 text-indigo-650" strokeWidth={1.5} />
            <span>Ajukan Perubahan Jadwal</span>
          </h3>
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
            Dosen dapat mengajukan relokasi jam kuliah mandiri di sini.
          </p>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-xs text-rose-700 animate-in fade-in">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-rose-600" strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-105 bg-emerald-50/50 p-3 text-xs text-emerald-700 animate-in fade-in">
              <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-emerald-600" strokeWidth={1.5} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Mata Kuliah
              </label>
              <select
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none bg-white focus:border-indigo-500"
              >
                <option value="" disabled>
                  Pilih mata kuliah & jadwal...
                </option>
                {uniqueSchedules.map((s) => (
                  <option key={s.id} value={s.subject}>
                    {s.subject} ({s.day}, {s.timeSlot})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Dosen Pemohon
              </label>
              <div className="relative">
                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userName}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9 text-xs font-mono font-bold text-slate-650"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Jadwal Asal
              </label>
              <div className="relative">
                <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={fromTime}
                  readOnly
                  disabled
                  placeholder="Pilih mata kuliah untuk memuat jadwal asal"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9 text-xs font-mono font-bold text-slate-650"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Tanggal Usulan Baru
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none bg-white focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Jam Mulai Baru
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    required
                    className="w-1/2 rounded-xl border border-slate-200 py-2.5 px-1.5 text-xs bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>
                      Jam
                    </option>
                    {HOURS.map((h) => (
                      <option key={`sh-${h}`} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <select
                    value={startMinute}
                    onChange={(e) => setStartMinute(e.target.value)}
                    required
                    className="w-1/2 rounded-xl border border-slate-200 py-2.5 px-1.5 text-xs bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>
                      Mnt
                    </option>
                    {MINUTES.map((m) => (
                      <option key={`sm-${m}`} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Jam Selesai Baru
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    required
                    className="w-1/2 rounded-xl border border-slate-200 py-2.5 px-1.5 text-xs bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>
                      Jam
                    </option>
                    {HOURS.map((h) => (
                      <option key={`eh-${h}`} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <select
                    value={endMinute}
                    onChange={(e) => setEndMinute(e.target.value)}
                    required
                    className="w-1/2 rounded-xl border border-slate-200 py-2.5 px-1.5 text-xs bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>
                      Mnt
                    </option>
                    {MINUTES.map((m) => (
                      <option key={`em-${m}`} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Alasan Perubahan
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
                placeholder="Alasan pemindahan jadwal..."
                className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none bg-white focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-md shadow-slate-900/10 hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <span>Kirim Permohonan</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* History Section */}
      <div
        className={`${
          userRole === 'dosen' ? 'xl:col-span-7' : 'xl:col-span-12'
        } rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)]`}
      >
        <h3 className="font-bold text-sm text-slate-800 pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-indigo-650" strokeWidth={1.5} />
          <span>Riwayat Pengajuan Pergeseran Jadwal</span>
        </h3>

        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <Clock className="h-9 w-9 stroke-[1.2] mb-2 opacity-50 text-slate-500" />
            <p className="text-xs font-bold text-slate-400">Belum ada riwayat permohonan masuk.</p>
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-slate-50"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2">
                  <span className="font-bold text-xs text-indigo-750">
                    {req.subject}
                  </span>
                  <div>
                    {req.status === 'approved' ? (
                      <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-mono font-bold uppercase text-emerald-600">
                        Disetujui
                      </span>
                    ) : req.status === 'rejected' ? (
                      <span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-mono font-bold uppercase text-rose-600">
                        Ditolak
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-mono font-bold uppercase text-amber-600">
                        Menunggu
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[11px] font-mono font-semibold text-slate-500 space-y-1.5 mt-3">
                  <div>
                    Dosen Pemohon: <span className="font-bold text-slate-800">{req.lecturer}</span>
                  </div>
                  <div className="leading-relaxed">
                    Pengajuan geser jadwal dari <code className="bg-slate-100 px-1 py-0.5 rounded-sm">{req.fromTime}</code> ke <code className="bg-indigo-50 px-1 py-0.5 rounded-sm text-indigo-750">{req.toTime}</code>.
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-100/50 pt-2 mt-2 leading-relaxed">
                    Alasan: &ldquo;{req.reason}&rdquo;
                  </div>
                </div>

                {userRole === 'admin' && req.status === 'pending' && (
                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-3">
                    <button
                      onClick={() => handleRequestStatus(req.id, 'rejected')}
                      disabled={actionLoading !== null}
                      className="rounded-lg border border-slate-200 text-slate-650 font-bold px-3 py-1.5 text-[10px] hover:bg-rose-50 hover:text-rose-700 transition-colors disabled:opacity-50 active:scale-95 cursor-pointer"
                    >
                      {actionLoading === req.id ? 'Memproses' : 'Tolak'}
                    </button>
                    <button
                      onClick={() => handleRequestStatus(req.id, 'approved')}
                      disabled={actionLoading !== null}
                      className="rounded-lg bg-slate-900 text-white font-bold px-3.5 py-1.5 text-[10px] hover:bg-slate-800 transition-colors disabled:opacity-50 active:scale-95 cursor-pointer"
                    >
                      {actionLoading === req.id ? 'Memproses' : 'Setujui'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
