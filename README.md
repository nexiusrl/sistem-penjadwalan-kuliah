# SISJAD — Sistem Informasi Penjadwalan Akademik

SISJAD is a web-based academic scheduling information system. It features real-time validation and a constraint solver to automatically resolve scheduling conflicts.

## Tech Stack
- **Framework**: Next.js 16.2 (App Router)
- **UI & Styling**: React 19.2, Tailwind CSS v4, Lucide React (Icons)
- **State Management**: Zustand v5 (global state, client-side store)
- **Database**: Next.js Route Handlers (API routes), File-based JSON database (`db.json` / `src/lib/db.ts`)
- **Language**: TypeScript v5

## Key Features
- **Real-Time Constraint Validation**: Evaluates schedule status immediately as changes are made.
- **Auto-Solver (Backtracking)**: Resolves conflicts using a backtracking search algorithm.
- **Three-State Schedules**:
  - `validated`: Schedule aligns with all rules.
  - `hard-conflict`: Overlapping room or lecturer bookings.
  - `soft-warning`: Booking outside of lecturer preferred days.
- **Change Requests**: Lecturers can request schedule changes, and admins can approve or reject them.
- **Role-Based Access Control**:
  - **Admin**: Full CRUD on master data (dosen, ruangan, matakuliah) and schedules, solver control, change request management.
  - **Dosen**: View schedules, submit change requests.
  - **Mahasiswa**: Read-only access to view schedules.

## Database Schema (`db.json`)
The database contains the following lists:
- `users`: User profiles with roles (`admin`, `dosen`, `mahasiswa`).
- `dosen`: Lecturers, codes, and preferred days (e.g., `"Senin, Rabu"`).
- `ruangan`: Classrooms, types, and capacities.
- `matakuliah`: Subject codes, credits, days, and time slots.
- `schedules`: Scheduled classes, assigned rooms, days, time slots, and validation status.
- `requests`: Proposed schedule changes.

## API Endpoints
- **Authentication**:
  - `POST /api/auth/login` - Set session
  - `POST /api/auth/register` - Create user
  - `POST /api/auth/logout` - Clear session
- **Database state**:
  - `GET /api/db` - Fetch the full database
  - `POST /api/schedules/bulk` - Sync solved schedules
- **CRUD Operations** (endpoints support `GET`, `POST`, `PUT`, `DELETE`):
  - `/api/ruangan`
  - `/api/dosen`
  - `/api/matakuliah`
  - `/api/schedules`
  - `/api/requests`

## Getting Started
First, install dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
