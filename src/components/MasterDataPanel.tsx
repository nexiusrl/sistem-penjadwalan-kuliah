import React, { useState } from 'react';
import { Lecturer, Room, Subject } from '@/lib/db';
import { PlusCircle, Edit, Trash2, X, Users, BookOpen, Layers, Loader2 } from 'lucide-react';

interface MasterDataPanelProps {
  dosen: Lecturer[];
  ruangan: Room[];
  matakuliah: Subject[];
  userRole: 'admin' | 'dosen' | 'mahasiswa';
  onRefresh: () => void;
  initialSubTab?: SubTab;
  initialEditSubjectId?: number | null;
  onClearInitialState?: () => void;
}

type SubTab = 'dosen' | 'ruang' | 'mk';

export default function MasterDataPanel(props: MasterDataPanelProps) {
  const { dosen, ruangan, matakuliah, userRole, onRefresh } = props;
  const [activeTab, setActiveTab] = useState<SubTab>('dosen');
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Form inputs
  const [dosenName, setDosenName] = useState('');
  const [dosenCode, setDosenCode] = useState('');
  const [dosenPref, setDosenPref] = useState('Bebas');

  const [ruangName, setRuangName] = useState('');
  const [ruangType, setRuangType] = useState('Teori');
  const [ruangCapacity, setRuangCapacity] = useState(40);

  const [mkName, setMkName] = useState('');
  const [mkCode, setMkCode] = useState('');
  const [mkSks, setMkSks] = useState(3);
  const [mkDay, setMkDay] = useState('Senin');
  const [mkTimeStart, setMkTimeStart] = useState('08:00');
  const [mkTimeEnd, setMkTimeEnd] = useState('10:30');
  const [mkLecturer, setMkLecturer] = useState('');
  const [mkRoom, setMkRoom] = useState('');

  // Handle external redirect from dashboard
  React.useEffect(() => {
    if (props.initialSubTab) {
      setActiveTab(props.initialSubTab);
    }
    if (props.initialEditSubjectId) {
      const item = matakuliah.find(m => m.id === props.initialEditSubjectId);
      if (item) {
        openEditModal(item);
      }
      if (props.onClearInitialState) {
        props.onClearInitialState();
      }
    }
  }, [props.initialSubTab, props.initialEditSubjectId, matakuliah]);

  const openAddModal = () => {
    setEditId(null);
    setDosenName('');
    setDosenCode('');
    setDosenPref('Bebas');
    setRuangName('');
    setRuangType('Teori');
    setRuangCapacity(40);
    setMkName('');
    setMkCode('');
    setMkSks(3);
    setMkDay('Senin');
    setMkTimeStart('08:00');
    setMkTimeEnd('10:30');
    setMkLecturer('');
    setMkRoom('');
    setIsOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditId(item.id);
    if (activeTab === 'dosen') {
      const d = item as Lecturer;
      setDosenName(d.name);
      setDosenCode(d.code);
      setDosenPref(d.pref || 'Bebas');
    } else if (activeTab === 'ruang') {
      const r = item as Room;
      setRuangName(r.name);
      setRuangType(r.type);
      setRuangCapacity(r.capacity);
    } else if (activeTab === 'mk') {
      const m = item as Subject;
      setMkName(m.name);
      setMkCode(m.code);
      setMkSks(m.sks);
      setMkDay(m.day);
      setMkLecturer(m.lecturer || '');
      setMkRoom(m.room || '');
      if (m.timeSlot && m.timeSlot.includes(' - ')) {
        const parts = m.timeSlot.split(' - ');
        setMkTimeStart(parts[0]);
        setMkTimeEnd(parts[1]);
      } else {
        setMkTimeStart('08:00');
        setMkTimeEnd('10:30');
      }
    }
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini secara permanen?')) return;
    const endpoint = activeTab === 'dosen' ? 'dosen' : activeTab === 'ruang' ? 'ruangan' : 'matakuliah';
    try {
      const res = await fetch(`/api/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Role': userRole,
          'X-User-Email': localStorage.getItem('userEmail') || '',
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal menghapus data.');
      }

      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = activeTab === 'dosen' ? 'dosen' : activeTab === 'ruang' ? 'ruangan' : 'matakuliah';
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/${endpoint}/${editId}` : `/api/${endpoint}`;

    let payload: any = {};
    if (activeTab === 'dosen') {
      payload = {
        name: dosenName.trim(),
        code: dosenCode.trim().toUpperCase(),
        pref: dosenPref.trim()
      };
    } else if (activeTab === 'ruang') {
      payload = {
        name: ruangName.trim(),
        type: ruangType,
        capacity: Number(ruangCapacity)
      };
    } else if (activeTab === 'mk') {
      // Client-side conflict warning check
      if (mkLecturer && mkRoom) {
        const timeSlotStr = `${mkTimeStart} - ${mkTimeEnd}`;
        const hasConflict = matakuliah.some(m => {
          // Skip itself when editing
          if (editId && m.id === editId) return false;
          
          if (m.day === mkDay && m.timeSlot === timeSlotStr) {
            if (m.room && m.room === mkRoom) return true;
            if (m.lecturer && m.lecturer === mkLecturer) return true;
          }
          return false;
        });

        if (hasConflict) {
          const confirmSave = window.confirm(
            'Peringatan: Jadwal baru ini bentrok dengan mata kuliah lain (Dosen atau Ruangan sama pada hari & jam tersebut).\n\nTetap simpan?'
          );
          if (!confirmSave) {
            setLoading(false);
            return;
          }
        }
      }

      payload = {
        name: mkName.trim(),
        code: mkCode.trim().toUpperCase(),
        sks: Number(mkSks),
        day: mkDay,
        timeSlot: `${mkTimeStart} - ${mkTimeEnd}`,
        lecturer: mkLecturer,
        room: mkRoom
      };
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': userRole,
          'X-User-Email': localStorage.getItem('userEmail') || '',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal menyimpan data.');
      }

      setIsOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 border border-slate-200/40">
          <button
            onClick={() => setActiveTab('dosen')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all duration-300 active:scale-[0.98] cursor-pointer ${
              activeTab === 'dosen'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-blue-600 hover:bg-white/40'
            }`}
          >
            <Users className="h-4 w-4" strokeWidth={1.5} />
            <span>DATA DOSEN</span>
          </button>
          <button
            onClick={() => setActiveTab('ruang')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all duration-300 active:scale-[0.98] cursor-pointer ${
              activeTab === 'ruang'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-blue-600 hover:bg-white/40'
            }`}
          >
            <Layers className="h-4 w-4" strokeWidth={1.5} />
            <span>DATA RUANGAN</span>
          </button>
          <button
            onClick={() => setActiveTab('mk')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all duration-300 active:scale-[0.98] cursor-pointer ${
              activeTab === 'mk'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-blue-600 hover:bg-white/40'
            }`}
          >
            <BookOpen className="h-4 w-4" strokeWidth={1.5} />
            <span>MATA KULIAH</span>
          </button>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.15)] active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" strokeWidth={1.5} />
            <span>
              Tambah {activeTab === 'dosen' ? 'Dosen' : activeTab === 'ruang' ? 'Ruangan' : 'Mata Kuliah'}
            </span>
          </button>
        )}
      </div>

      {/* Main Table Panel */}
      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'dosen' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-800 uppercase font-bold tracking-wider">
                  <th className="px-5 py-4 w-24">Kode</th>
                  <th className="px-5 py-4 text-slate-900 font-bold text-sm">Nama Dosen</th>
                  <th className="px-5 py-4">Preferensi Hari</th>
                  {userRole === 'admin' && <th className="px-5 py-4 w-28 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dosen.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400 font-semibold">
                      Belum ada data Dosen.
                    </td>
                  </tr>
                ) : (
                  dosen.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">{d.code}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900 text-sm">{d.name}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-lg border px-2.5 py-0.5 text-[10px] font-semibold tracking-tight ${
                          d.pref && d.pref !== 'Bebas' 
                            ? 'bg-indigo-50 border-indigo-150 text-indigo-700' 
                            : 'bg-slate-50 border-slate-150 text-slate-500'
                        }`}>
                          {d.pref || 'Bebas'}
                        </span>
                      </td>
                      {userRole === 'admin' && (
                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(d)}
                            className="inline-flex p-1.5 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-350 text-slate-655 active:scale-95 transition-all cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="inline-flex p-1.5 rounded-lg border border-slate-200/85 bg-white hover:bg-rose-50 hover:border-rose-200 text-rose-600 active:scale-95 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'ruang' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-800 uppercase font-bold tracking-wider">
                  <th className="px-5 py-4">Nama Ruangan</th>
                  <th className="px-5 py-4 w-36">Tipe Ruangan</th>
                  <th className="px-5 py-4 w-36">Kapasitas Kursi</th>
                  {userRole === 'admin' && <th className="px-5 py-4 w-28 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ruangan.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400 font-semibold">
                      Belum ada data Ruangan.
                    </td>
                  </tr>
                ) : (
                  ruangan.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-900">{r.name}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-lg border px-2.5 py-0.5 text-[10px] font-semibold ${
                          r.type === 'Praktikum' 
                            ? 'bg-amber-50 border-amber-150 text-amber-700' 
                            : 'bg-emerald-50 border-emerald-150 text-emerald-700'
                        }`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-655 font-medium font-mono">{r.capacity} Kursi</td>
                      {userRole === 'admin' && (
                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(r)}
                            className="inline-flex p-1.5 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-355 text-slate-655 active:scale-95 transition-all cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="inline-flex p-1.5 rounded-lg border border-slate-200/85 bg-white hover:bg-rose-50 hover:border-rose-200 text-rose-600 active:scale-95 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'mk' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-800 uppercase font-bold tracking-wider">
                  <th className="px-5 py-4 w-24">Kode</th>
                  <th className="px-5 py-4 text-slate-900 font-bold text-sm">Nama Mata Kuliah</th>
                  <th className="px-5 py-4 w-20">SKS</th>
                  <th className="px-5 py-4 w-28">Hari</th>
                  <th className="px-5 py-4 w-32">Waktu</th>
                  <th className="px-5 py-4">Dosen Pengampu</th>
                  <th className="px-5 py-4 w-24">Ruang</th>
                  {userRole === 'admin' && <th className="px-5 py-4 w-28 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matakuliah.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-semibold">
                      Belum ada data Mata Kuliah.
                    </td>
                  </tr>
                ) : (
                  matakuliah.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">{m.code}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900 text-sm">{m.name}</td>
                      <td className="px-5 py-4 text-slate-655 font-medium font-mono">{m.sks} SKS</td>
                      <td className="px-5 py-4 text-slate-500 font-semibold">{m.day}</td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-700">{m.timeSlot}</td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {m.lecturer ? m.lecturer : <span className="text-slate-400 italic">Belum dialokasi</span>}
                      </td>
                      <td className="px-5 py-4">
                        {m.room ? (
                          <span className="font-bold text-blue-600">{m.room}</span>
                        ) : (
                          <span className="text-slate-400 italic">Belum dialokasi</span>
                        )}
                      </td>
                      {userRole === 'admin' && (
                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(m)}
                            className="inline-flex p-1.5 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-355 text-slate-655 active:scale-95 transition-all cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="inline-flex p-1.5 rounded-lg border border-slate-200/85 bg-white hover:bg-rose-50 hover:border-rose-200 text-rose-600 active:scale-95 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CRUD Modal Form */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editId
                  ? `Edit Data ${activeTab === 'dosen' ? 'Dosen' : activeTab === 'ruang' ? 'Ruangan' : 'Mata Kuliah'}`
                  : `Tambah Data ${activeTab === 'dosen' ? 'Dosen' : activeTab === 'ruang' ? 'Ruangan' : 'Mata Kuliah'}`}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-slate-250 p-1.5 hover:bg-slate-50 text-slate-500 active:scale-95 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs font-semibold">
              {activeTab === 'dosen' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Nama Dosen
                    </label>
                    <input
                      type="text"
                      value={dosenName}
                      onChange={(e) => setDosenName(e.target.value)}
                      required
                      placeholder="Nama Lengkap Beserta Gelar"
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-slate-400/20 transition-all font-sans font-medium text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Kode Singkat Dosen
                    </label>
                    <input
                      type="text"
                      value={dosenCode}
                      onChange={(e) => setDosenCode(e.target.value)}
                      required
                      maxLength={3}
                      placeholder="Contoh: BD"
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-slate-400/20 transition-all font-mono font-medium text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Preferensi Hari Mengajar
                    </label>
                    <select
                      value={dosenPref}
                      onChange={(e) => setDosenPref(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3 bg-white outline-none focus:border-blue-500 transition-all font-sans font-medium text-slate-800"
                    >
                      <option value="Bebas">Bebas</option>
                      <option value="Senin">Senin</option>
                      <option value="Selasa">Selasa</option>
                      <option value="Rabu">Rabu</option>
                      <option value="Kamis">Kamis</option>
                      <option value="Jumat">Jumat</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'ruang' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Nama Ruangan
                    </label>
                    <input
                      type="text"
                      value={ruangName}
                      onChange={(e) => setRuangName(e.target.value)}
                      required
                      placeholder="Contoh: R301"
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-slate-400/20 transition-all font-sans font-medium text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tipe Ruangan
                    </label>
                    <select
                      value={ruangType}
                      onChange={(e) => setRuangType(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3 bg-white outline-none focus:border-blue-500 transition-all font-sans font-medium text-slate-800"
                    >
                      <option value="Teori">Teori</option>
                      <option value="Praktikum">Praktikum</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Kapasitas Kursi
                    </label>
                    <input
                      type="number"
                      value={ruangCapacity}
                      onChange={(e) => setRuangCapacity(Number(e.target.value))}
                      required
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-slate-400/20 transition-all font-mono font-medium text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </>
              )}

              {activeTab === 'mk' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Nama Mata Kuliah
                    </label>
                    <input
                      type="text"
                      value={mkName}
                      onChange={(e) => setMkName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-slate-400/20 transition-all font-sans font-medium text-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Kode MK
                    </label>
                    <input
                      type="text"
                      value={mkCode}
                      onChange={(e) => setMkCode(e.target.value)}
                      required
                      placeholder="Contoh: SI-101"
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-slate-400/20 transition-all font-mono font-medium text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Jumlah SKS
                    </label>
                    <input
                      type="number"
                      value={mkSks}
                      onChange={(e) => setMkSks(Number(e.target.value))}
                      required
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-slate-400/20 transition-all font-mono font-medium text-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Hari Kuliah
                    </label>
                    <select
                      value={mkDay}
                      onChange={(e) => setMkDay(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3 bg-white outline-none focus:border-blue-500 transition-all font-sans font-medium text-slate-800"
                    >
                      <option value="Senin">Senin</option>
                      <option value="Selasa">Selasa</option>
                      <option value="Rabu">Rabu</option>
                      <option value="Kamis">Kamis</option>
                      <option value="Jumat">Jumat</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Jam Mulai
                      </label>
                      <input
                        type="time"
                        value={mkTimeStart}
                        onChange={(e) => setMkTimeStart(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-white outline-none focus:border-blue-500 transition-all font-mono font-medium text-slate-800"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Jam Selesai
                      </label>
                      <input
                        type="time"
                        value={mkTimeEnd}
                        onChange={(e) => setMkTimeEnd(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-white outline-none focus:border-blue-500 transition-all font-mono font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Dosen Pengampu (Opsional)
                    </label>
                    <select
                      value={mkLecturer}
                      onChange={(e) => setMkLecturer(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3 bg-white outline-none focus:border-blue-500 transition-all font-sans font-medium text-slate-800"
                    >
                      <option value="">-- Pilih Dosen (Belum Dialokasikan) --</option>
                      {dosen.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Ruangan Kelas (Opsional)
                    </label>
                    <select
                      value={mkRoom}
                      onChange={(e) => setMkRoom(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3 bg-white outline-none focus:border-blue-500 transition-all font-sans font-medium text-slate-800"
                    >
                      <option value="">-- Pilih Ruangan (Belum Dialokasikan) --</option>
                      {ruangan.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name} ({r.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-650 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs active:scale-[0.98] transition-all duration-300 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>MENYIMPAN...</span>
                    </>
                  ) : (
                    <span>SIMPAN</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
