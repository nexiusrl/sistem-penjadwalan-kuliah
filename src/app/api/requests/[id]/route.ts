import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { requireRole } from '@/lib/auth';

type RouteParams = {
  params: Promise<{ id: string }>;
};

function parseTimeString(timeStr: string) {
  if (!timeStr || !timeStr.includes(',')) {
    return { day: '', timeSlot: '' };
  }
  const parts = timeStr.split(',');
  return {
    day: parts[0].trim(),
    timeSlot: parts.slice(1).join(',').trim()
  };
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await requireRole(['admin']);
    if (!session) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { id } = await params;
    const targetId = parseInt(id);
    const { status } = await req.json();

    if (!status || (status !== 'approved' && status !== 'rejected')) {
      return NextResponse.json({ message: 'Status tidak valid.' }, { status: 400 });
    }

    const db = readDB();
    const reqItem = db.requests.find(r => r.id === targetId);
    if (!reqItem) {
      return NextResponse.json({ message: 'Permohonan tidak ditemukan.' }, { status: 404 });
    }

    let scheduleUpdated = false;
    const isTransitionToApproved = status === 'approved' && reqItem.status !== 'approved';

    if (isTransitionToApproved) {
      const fromParts = parseTimeString(reqItem.fromTime);
      const toParts = parseTimeString(reqItem.toTime);

      if (fromParts.day && fromParts.timeSlot && toParts.day && toParts.timeSlot) {
        // Find matching schedule
        const targetSchedule = db.schedules.find(s => 
          s.lecturer.trim().toLowerCase() === reqItem.lecturer.trim().toLowerCase() &&
          s.subject.trim().toLowerCase() === reqItem.subject.trim().toLowerCase() &&
          s.day.trim().toLowerCase() === fromParts.day.toLowerCase() &&
          s.timeSlot.trim().toLowerCase() === fromParts.timeSlot.toLowerCase()
        );

        if (targetSchedule) {
          targetSchedule.day = toParts.day;
          targetSchedule.timeSlot = toParts.timeSlot;
          scheduleUpdated = true;

          // Sync to matakuliah
          const matchingMK = db.matakuliah.find(m => m.code === targetSchedule.code || m.name === targetSchedule.subject);
          if (matchingMK) {
            matchingMK.day = toParts.day;
            matchingMK.timeSlot = toParts.timeSlot;
          }
        }
      }
    }

    reqItem.status = status;
    writeDB(db);

    interface ApproveResponse {
      id: number;
      lecturer: string;
      subject: string;
      fromTime: string;
      toTime: string;
      reason: string;
      status: 'pending' | 'approved' | 'rejected';
      warning?: string;
    }

    const responseData: ApproveResponse = { ...reqItem };
    if (isTransitionToApproved && !scheduleUpdated) {
      responseData.warning = 'Jadwal kuliah asal tidak ditemukan di database. Status permohonan tetap disetujui.';
    }

    return NextResponse.json(responseData);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
