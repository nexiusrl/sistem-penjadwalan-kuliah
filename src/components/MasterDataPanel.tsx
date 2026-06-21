import React, { useState } from 'react';
import { Lecturer, Room, Subject } from '@/lib/db';
import { PlusCircle, Edit, Trash2, X, Users, BookOpen, Layers, Check, Loader2, RefreshCw } from 'lucide-react';

interface MasterDataPanelProps {
  dosen: Lecturer[];
  ruangan: Room[];
  matakuliah: Subject[];
  userRole: 'admin' | 'dosen' | 'mahasiswa';
  onRefresh: () => void;
}

type SubTab = 'dosen' | 'ruang' | 'mk';

export default function MasterDataPanel({
  dosen,
  ruangan,
  matakuliah,
  userRole,
  onRefresh,
}: MasterDataPanelProps) {
  const [activeTab, setActiveTab] = useState<SubTab>('dosen');
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Form input states
  // Dosen inputs
  const [dosenName, setDosenName] = useState('');
  const [dosenCode, setDosenCode] = useState('');
  const [dosenPref, setDosenPref] = useState('Bebas');

  // Ruangan inputs
  const [ruangName, setRuangName] = useState('');
  const [ruangType, setRuangType] = useState('Teori');
  const [ruangCapacity, setRuangCapacity] = useState(40);

  // Mata Kuliah inputs
  const [mkName, setMkName] = useState('');
  const [mkCode, setMkCode] = useState('');
  const [mkSks, setMkSks] = useState(3);
  const [mkDay, setMkDay] = useState('Senin');
  const [mkTimeStart, setMkTimeStart] = useState('08:00');
  const [mkTimeEnd, setMkTimeEnd] = useState('10:30');

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
    
    // Determine endpoint based on active tab
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
      payload = {
        name: mkName.trim(),
        code: mkCode.trim().toUpperCase(),
        sks: Number(mkSks),
        day: mkDay,
        timeSlot: `${mkTimeStart} - ${mkTimeEnd}`
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

      const data = await res.json();
      if (!res.ok) {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start">
          <button
            onClick={() => setActiveTab('dosen')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === 'dosen'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Data Dosen</span>
          </button>
          <button
            onClick={() => setActiveTab('ruang')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === 'ruang'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Data Ruangan</span>
          </button>
          <button
            onClick={() => setActiveTab('mk')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === 'mk'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Mata Kuliah</span>
          </button>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-700 transition-all dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:shadow-none"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>
              Tambah {activeTab === 'dosen' ? 'Dosen' : activeTab === 'ruang' ? 'Ruangan' : 'Mata Kuliah'}
            </span>
          </button>
        )}
      </div>

      {/* Main Table Panel */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'dosen' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50">
                  <th className="px-5 py-3 font-semibold w-24">Kode</th>
                  <th className="px-5 py-3 font-semibold">Nama Dosen</th>
                  <th className="px-5 py-3 font-semibold">Preferensi Hari</th>
                  {userRole === 'admin' && <th className="px-5 py-3 font-semibold w-28 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dosen.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400">
                      Belum ada data Dosen.
                    </td>
                  </tr>
                ) : (
                  dosen.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="px-5 py-3 font-bold text-slate-800 dark:text-slate-200">{d.code}</td>
                      <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">{d.name}</td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          d.pref && d.pref !== 'Bebas' 
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {d.pref || 'Bebas'}
                        </span>
                      </td>
                      {userRole === 'admin' && (
                        <td className="px-5 py-3 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(d)}
                            className="inline-flex p-1 rounded-md text-slate-400 hover:text-indigo-650 hover:bg-slate-100 dark:hover:bg-slate-850"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="inline-flex p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-850"
                          >
                            <Trash2 className="h-4 w-4" />
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
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50">
                  <th className="px-5 py-3 font-semibold">Nama Ruangan</th>
                  <th className="px-5 py-3 font-semibold w-36">Tipe Ruangan</th>
                  <th className="px-5 py-3 font-semibold w-36">Kapasitas Kursi</th>
                  {userRole === 'admin' && <th className="px-5 py-3 font-semibold w-28 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ruangan.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400">
                      Belum ada data Ruangan.
                    </td>
                  </tr>
                ) : (
                  ruangan.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="px-5 py-3 font-bold text-slate-800 dark:text-slate-200">{r.name}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          r.type === 'Praktikum' 
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450' 
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450'
                        }`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-650 dark:text-slate-350">{r.capacity} Kursi</td>
                      {userRole === 'admin' && (
                        <td className="px-5 py-3 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(r)}
                            className="inline-flex p-1 rounded-md text-slate-400 hover:text-indigo-650 hover:bg-slate-100 dark:hover:bg-slate-850"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="inline-flex p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-850"
                          >
                            <Trash2 className="h-4 w-4" />
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
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50">
                  <th className="px-5 py-3 font-semibold w-24">Kode</th>
                  <th className="px-5 py-3 font-semibold">Nama Mata Kuliah</th>
                  <th className="px-5 py-3 font-semibold w-20">SKS</th>
                  <th className="px-5 py-3 font-semibold w-28">Hari</th>
                  <th className="px-5 py-3 font-semibold w-32">Waktu Asal</th>
                  {userRole === 'admin' && <th className="px-5 py-3 font-semibold w-28 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {matakuliah.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      Belum ada data Mata Kuliah.
                    </td>
                  </tr>
                ) : (
                  matakuliah.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="px-5 py-3 font-bold text-slate-800 dark:text-slate-200">{m.code}</td>
                      <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">{m.name}</td>
                      <td className="px-5 py-3 text-slate-650 dark:text-slate-350">{m.sks} SKS</td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{m.day}</td>
                      <td className="px-5 py-3 font-medium text-slate-600 dark:text-slate-400">{m.timeSlot}</td>
                      {userRole === 'admin' && (
                        <td className="px-5 py-3 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(m)}
                            className="inline-flex p-1 rounded-md text-slate-400 hover:text-indigo-650 hover:bg-slate-100 dark:hover:bg-slate-850"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="inline-flex p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-850"
                          >
                            <Trash2 className="h-4 w-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 dark:border-slate-800 dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editId
                  ? `Edit Data ${activeTab === 'dosen' ? 'Dosen' : activeTab === 'ruang' ? 'Ruangan' : 'Mata Kuliah'}`
                  : `Tambah Data ${activeTab === 'dosen' ? 'Dosen' : activeTab === 'ruang' ? 'Ruangan' : 'Mata Kuliah'}`}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {activeTab === 'dosen' && (
                <>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Nama Dosen
                    </label>
                    <input
                      type="text"
                      value={dosenName}
                      onChange={(e) => setDosenName(e.target.value)}
                      required
                      placeholder="Nama Lengkap Beserta Gelar"
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Kode Singkat Dosen
                    </label>
                    <input
                      type="text"
                      value={dosenCode}
                      onChange={(e) => setDosenCode(e.target.value)}
                      required
                      maxLength={3}
                      placeholder="Contoh: BD"
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Preferensi Hari Mengajar
                    </label>
                    <select
                      value={dosenPref}
                      onChange={(e) => setDosenPref(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950"
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
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Nama Ruangan
                    </label>
                    <input
                      type="text"
                      value={ruangName}
                      onChange={(e) => setRuangName(e.target.value)}
                      required
                      placeholder="Contoh: R301"
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Tipe Ruangan
                    </label>
                    <select
                      value={ruangType}
                      onChange={(e) => setRuangType(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                    >
                      <option value="Teori">Teori</option>
                      <option value="Praktikum">Praktikum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Kapasitas Kursi
                    </label>
                    <input
                      type="number"
                      value={ruangCapacity}
                      onChange={(e) => setRuangCapacity(Number(e.target.value))}
                      required
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                </>
              )}

              {activeTab === 'mk' && (
                <>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Nama Mata Kuliah
                    </label>
                    <input
                      type="text"
                      value={mkName}
                      onChange={(e) => setMkName(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Kode MK
                    </label>
                    <input
                      type="text"
                      value={mkCode}
                      onChange={(e) => setMkCode(e.target.value)}
                      required
                      placeholder="Contoh: SI-101"
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Jumlah SKS
                    </label>
                    <input
                      type="number"
                      value={mkSks}
                      onChange={(e) => setMkSks(Number(e.target.value))}
                      required
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Hari Kuliah
                    </label>
                    <select
                      value={mkDay}
                      onChange={(e) => setMkDay(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                    >
                      <option value="Senin">Senin</option>
                      <option value="Selasa">Selasa</option>
                      <option value="Rabu">Rabu</option>
                      <option value="Kamis">Kamis</option>
                      <option value="Jumat">Jumat</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Jam Mulai
                      </label>
                      <input
                        type="time"
                        value={mkTimeStart}
                        onChange={(e) => setMkTimeStart(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Jam Selesai
                      </label>
                      <input
                        type="time"
                        value={mkTimeEnd}
                        onChange={(e) => setMkTimeEnd(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-650 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-75 dark:bg-indigo-50 dark:hover:bg-indigo-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan</span>
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
