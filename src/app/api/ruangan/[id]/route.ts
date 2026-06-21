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
    const { name, type, capacity } = await req.json();

    const db = readDB();
    const index = db.ruangan.findIndex(r => r.id === targetId);
    if (index === -1) {
      return NextResponse.json({ message: 'Ruangan tidak ditemukan.' }, { status: 404 });
    }

    const oldName = db.ruangan[index].name;
    db.ruangan[index] = {
      ...db.ruangan[index],
      name,
      type,
      capacity: parseInt(capacity)
    };

    // Sync room name in schedules
    db.schedules = db.schedules.map(s => {
      if (s.room === oldName) {
        return { ...s, room: name };
      }
      return s;
    });

    writeDB(db);
    return NextResponse.json(db.ruangan[index]);
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
    const ruangan = db.ruangan.find(r => r.id === targetId);
    if (!ruangan) {
      return NextResponse.json({ message: 'Ruangan tidak ditemukan.' }, { status: 404 });
    }

    db.ruangan = db.ruangan.filter(r => r.id !== targetId);
    // Remove related schedules
    db.schedules = db.schedules.filter(s => s.room !== ruangan.name);

    writeDB(db);
    return NextResponse.json({ message: 'Ruangan berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
