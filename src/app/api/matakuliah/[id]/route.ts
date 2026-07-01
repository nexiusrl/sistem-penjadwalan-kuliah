import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { requireRole } from '@/lib/auth';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await requireRole(['admin']);
    if (!session) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { id } = await params;
    const targetId = parseInt(id);
    const { name, code, sks, day, timeSlot, lecturer, room } = await req.json();

    const db = readDB();
    const index = db.matakuliah.findIndex(m => m.id === targetId);
    if (index === -1) {
      return NextResponse.json({ message: 'Mata kuliah tidak ditemukan.' }, { status: 404 });
    }

    const oldName = db.matakuliah[index].name;
    const oldCode = db.matakuliah[index].code;

    db.matakuliah[index] = {
      ...db.matakuliah[index],
      name,
      code,
      sks: parseInt(sks),
      day: day || db.matakuliah[index].day,
      timeSlot: timeSlot || db.matakuliah[index].timeSlot,
      lecturer: lecturer || '',
      room: room || ''
    };

    // Sync schedules: create, update, or delete matching schedule based on lecturer & room presence
    if (lecturer && room) {
      const schedIndex = db.schedules.findIndex(s => s.code === oldCode || s.subject === oldName);
      if (schedIndex !== -1) {
        db.schedules[schedIndex] = {
          ...db.schedules[schedIndex],
          subject: name,
          code: code,
          lecturer,
          room,
          day: day || db.schedules[schedIndex].day,
          timeSlot: timeSlot || db.schedules[schedIndex].timeSlot
        };
      } else {
        const newSchedule = {
          id: db.schedules.length > 0 ? Math.max(...db.schedules.map(s => s.id)) + 1 : 1,
          subject: name,
          code: code,
          lecturer,
          room,
          day: day || db.matakuliah[index].day,
          timeSlot: timeSlot || db.matakuliah[index].timeSlot,
          status: 'validated' as const,
          details: ''
        };
        db.schedules.push(newSchedule);
      }
    } else {
      // Remove schedule if lecturer or room is cleared
      db.schedules = db.schedules.filter(s => s.code !== oldCode && s.subject !== oldName);
    }

    writeDB(db);
    return NextResponse.json(db.matakuliah[index]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await requireRole(['admin']);
    if (!session) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { id } = await params;
    const targetId = parseInt(id);

    const db = readDB();
    const mk = db.matakuliah.find(m => m.id === targetId);
    if (!mk) {
      return NextResponse.json({ message: 'Mata kuliah tidak ditemukan.' }, { status: 404 });
    }

    db.matakuliah = db.matakuliah.filter(m => m.id !== targetId);
    // Remove related schedules
    db.schedules = db.schedules.filter(s => s.subject !== mk.name && s.code !== mk.code);

    writeDB(db);
    return NextResponse.json({ message: 'Mata kuliah berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
