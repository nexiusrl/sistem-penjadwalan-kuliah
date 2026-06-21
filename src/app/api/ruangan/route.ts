import { NextResponse } from 'next/server';
import { readDB, writeDB, Room } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await requireRole(['admin']);
    if (!session) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { name, type, capacity } = await req.json();
    if (!name || !type || !capacity) {
      return NextResponse.json({ message: 'Nama, Tipe, dan Kapasitas wajib diisi.' }, { status: 400 });
    }

    const db = readDB();
    const newRuangan: Room = {
      id: db.ruangan.length > 0 ? Math.max(...db.ruangan.map(r => r.id)) + 1 : 1,
      name,
      type,
      capacity: parseInt(capacity)
    };
    db.ruangan.push(newRuangan);
    writeDB(db);

    return NextResponse.json(newRuangan, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
