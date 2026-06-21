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
    const { name, code } = await req.json();

    const db = readDB();
    const index = db.dosen.findIndex(d => d.id === targetId);
    if (index === -1) {
      return NextResponse.json({ message: 'Dosen tidak ditemukan.' }, { status: 404 });
    }

    const oldName = db.dosen[index].name;
    db.dosen[index] = { ...db.dosen[index], name, code };

    // Sync lecturer name in schedules
    db.schedules = db.schedules.map(s => {
      if (s.lecturer === oldName) {
        return { ...s, lecturer: name };
      }
      return s;
    });

    writeDB(db);
    return NextResponse.json(db.dosen[index]);
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
    const dosen = db.dosen.find(d => d.id === targetId);
    if (!dosen) {
      return NextResponse.json({ message: 'Dosen tidak ditemukan.' }, { status: 404 });
    }

    db.dosen = db.dosen.filter(d => d.id !== targetId);
    // Remove related schedules
    db.schedules = db.schedules.filter(s => s.lecturer !== dosen.name);

    writeDB(db);
    return NextResponse.json({ message: 'Dosen berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
