import fs from 'fs';
import path from 'path';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'dosen' | 'mahasiswa';
}

export interface Lecturer {
  id: number;
  name: string;
  code: string;
  pref?: string;
}

export interface Room {
  id: number;
  name: string;
  type: string;
  capacity: number;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  sks: number;
  day: string;
  timeSlot: string;
  lecturer?: string;
  room?: string;
}

export interface Schedule {
  id: number;
  subject: string;
  code: string;
  lecturer: string;
  room: string;
  day: string;
  timeSlot: string;
  status: 'validated' | 'hard-conflict' | 'soft-warning';
  details: string;
}

export interface ChangeRequest {
  id: number;
  lecturer: string;
  subject: string;
  fromTime: string;
  toTime: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Database {
  users: User[];
  dosen: Lecturer[];
  ruangan: Room[];
  matakuliah: Subject[];
  schedules: Schedule[];
  requests: ChangeRequest[];
}

const DB_PATH = path.join(process.cwd(), 'db.json');

export function readDB(): Database {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initialData: Database = {
        users: [],
        dosen: [],
        ruangan: [],
        matakuliah: [],
        schedules: [],
        requests: []
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(raw) as Database;
    
    // Auto-migration: sync lecturer and room properties from schedules to matakuliah if missing
    let updated = false;
    if (db.matakuliah) {
      db.matakuliah = db.matakuliah.map(m => {
        let modified = false;
        if (m.lecturer === undefined) {
          const match = db.schedules?.find(s => s.code === m.code || s.subject === m.name);
          m.lecturer = match ? match.lecturer : '';
          modified = true;
        }
        if (m.room === undefined) {
          const match = db.schedules?.find(s => s.code === m.code || s.subject === m.name);
          m.room = match ? match.room : '';
          modified = true;
        }
        if (modified) {
          updated = true;
        }
        return m;
      });
      
      if (updated) {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
      }
    }
    
    return db;
  } catch (err) {
    console.error('Error reading local JSON database:', err);
    return {
      users: [],
      dosen: [],
      ruangan: [],
      matakuliah: [],
      schedules: [],
      requests: []
    };
  }
}

export function writeDB(data: Database): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local JSON database:', err);
  }
}
