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
    const { name, code, sks, day, timeSlot } = await req.json();

    const db = readDB();
    const index = db.matakuliah.findIndex(m => m.id === targetId);
    if (index === -1) {
      return NextResponse.json({ message: 'Mata kuliah tidak ditemukan.' }, { status: 404 });
    }

    const oldName = db.matakuliah[index].name;
    db.matakuliah[index] = {
      ...db.matakuliah[index],
      name,
      code,
      sks: parseInt(sks),
      day: day || db.matakuliah[index].day,
      timeSlot: timeSlot || db.matakuliah[index].timeSlot
    };

    // Sync subject name, code, day, and timeSlot in schedules
    db.schedules = db.schedules.map(s => {
      if (s.subject === oldName) {
        return {
          ...s,
          subject: name,
          code: code,
          day: day || s.day,
          timeSlot: timeSlot || s.timeSlot
        };
      }
      return s;
    });

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
    db.schedules = db.schedules.filter(s => s.subject !== mk.name);

    writeDB(db);
    return NextResponse.json({ message: 'Mata kuliah berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
