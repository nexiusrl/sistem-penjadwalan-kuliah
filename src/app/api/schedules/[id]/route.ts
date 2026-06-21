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
    const { subject, code, lecturer, room, day, timeSlot, status, details } = await req.json();

    const db = readDB();
    const index = db.schedules.findIndex(s => s.id === targetId);
    if (index === -1) {
      return NextResponse.json({ message: 'Jadwal tidak ditemukan.' }, { status: 404 });
    }

    db.schedules[index] = {
      ...db.schedules[index],
      subject: subject || db.schedules[index].subject,
      code: code || db.schedules[index].code,
      lecturer: lecturer || db.schedules[index].lecturer,
      room: room || db.schedules[index].room,
      day: day || db.schedules[index].day,
      timeSlot: timeSlot || db.schedules[index].timeSlot,
      status: status !== undefined ? status : db.schedules[index].status,
      details: details !== undefined ? details : db.schedules[index].details
    };

    writeDB(db);
    return NextResponse.json(db.schedules[index]);
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
    const index = db.schedules.findIndex(s => s.id === targetId);
    if (index === -1) {
      return NextResponse.json({ message: 'Jadwal tidak ditemukan.' }, { status: 404 });
    }

    db.schedules.splice(index, 1);
    writeDB(db);
    return NextResponse.json({ message: 'Jadwal berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
