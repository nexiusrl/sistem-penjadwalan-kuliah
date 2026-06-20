const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "db.json");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve HTML, CSS, JS from this directory

// Helper functions for Database I/O
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = {
        users: [
          {
            id: 1,
            name: "Administrator",
            email: "admin@sisjad.ac.id",
            password: "admin123",
            role: "admin",
          },
        ],
        dosen: [],
        ruangan: [],
        matakuliah: [],
        schedules: [],
        requests: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database file:", error);
    return {
      users: [],
      dosen: [],
      ruangan: [],
      matakuliah: [],
      schedules: [],
      requests: [],
    };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing to database file:", error);
    return false;
  }
}

// Middleware for checking roles
function requireRole(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.headers["x-user-role"];
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({
          message:
            "Akses ditolak: Peran Anda tidak memiliki izin untuk operasi ini.",
        });
    }
    next();
  };
}

// ================= AUTH ROUTES =================

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi." });
  }

  const db = readDB();
  const user = db.users.find(
    (u) => u.email === email && u.password === password,
  );
  if (!user) {
    return res.status(401).json({ message: "Email atau password salah." });
  }

  res.json({
    email: user.email,
    name: user.name,
    role: user.role,
  });
});

// Register
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Semua data wajib diisi." });
  }

  const db = readDB();
  const exists = db.users.some((u) => u.email === email);
  if (exists) {
    return res.status(400).json({ message: "Email sudah terdaftar." });
  }

  const newUser = {
    id: db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1,
    name,
    email,
    password,
    role,
  };

  db.users.push(newUser);

  // If registered role is dosen, automatically add to the Dosen master list if not exists
  if (role === "dosen") {
    const dosenExists = db.dosen.some(
      (d) => d.name.toLowerCase() === name.toLowerCase(),
    );
    if (!dosenExists) {
      db.dosen.push({
        id:
          db.dosen.length > 0 ? Math.max(...db.dosen.map((d) => d.id)) + 1 : 1,
        name: name,
        code: name.substring(0, 2).toUpperCase(),
      });
    }
  }

  writeDB(db);
  res.status(201).json({ message: "Registrasi berhasil." });
});

// ================= MAIN STATE ROUTE =================

// Get entire database state
app.get("/api/db", (req, res) => {
  const db = readDB();
  // Exclude passwords for safety
  const safeUsers = db.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
  }));
  res.json({
    dosen: db.dosen,
    ruangan: db.ruangan,
    matakuliah: db.matakuliah,
    schedules: db.schedules,
    requests: db.requests,
    users: safeUsers,
  });
});

// ================= DOSEN CRUD =================
app.post("/api/dosen", requireRole(["admin"]), (req, res) => {
  const { name, code } = req.body;
  if (!name || !code)
    return res.status(400).json({ message: "Nama dan Kode wajib diisi." });

  const db = readDB();
  const newDosen = {
    id: db.dosen.length > 0 ? Math.max(...db.dosen.map((d) => d.id)) + 1 : 1,
    name,
    code,
  };
  db.dosen.push(newDosen);
  writeDB(db);
  res.status(201).json(newDosen);
});

app.put("/api/dosen/:id", requireRole(["admin"]), (req, res) => {
  const id = parseInt(req.params.id);
  const { name, code } = req.body;

  const db = readDB();
  const index = db.dosen.findIndex((d) => d.id === id);
  if (index === -1)
    return res.status(404).json({ message: "Dosen tidak ditemukan." });

  const oldName = db.dosen[index].name;
  db.dosen[index] = { ...db.dosen[index], name, code };

  // Sync lecturer name in schedules
  db.schedules = db.schedules.map((s) => {
    if (s.lecturer === oldName) {
      return { ...s, lecturer: name };
    }
    return s;
  });

  writeDB(db);
  res.json(db.dosen[index]);
});

app.delete("/api/dosen/:id", requireRole(["admin"]), (req, res) => {
  const id = parseInt(req.params.id);
  const db = readDB();

  const dosen = db.dosen.find((d) => d.id === id);
  if (!dosen)
    return res.status(404).json({ message: "Dosen tidak ditemukan." });

  db.dosen = db.dosen.filter((d) => d.id !== id);
  // Remove related schedules
  db.schedules = db.schedules.filter((s) => s.lecturer !== dosen.name);

  writeDB(db);
  res.json({ message: "Dosen berhasil dihapus." });
});

// ================= RUANGAN CRUD =================
app.post("/api/ruangan", requireRole(["admin"]), (req, res) => {
  const { name, type, capacity } = req.body;
  if (!name || !type || !capacity)
    return res
      .status(400)
      .json({ message: "Nama, Tipe, dan Kapasitas wajib diisi." });

  const db = readDB();
  const newRuangan = {
    id:
      db.ruangan.length > 0 ? Math.max(...db.ruangan.map((r) => r.id)) + 1 : 1,
    name,
    type,
    capacity: parseInt(capacity),
  };
  db.ruangan.push(newRuangan);
  writeDB(db);
  res.status(201).json(newRuangan);
});

app.put("/api/ruangan/:id", requireRole(["admin"]), (req, res) => {
  const id = parseInt(req.params.id);
  const { name, type, capacity } = req.body;

  const db = readDB();
  const index = db.ruangan.findIndex((r) => r.id === id);
  if (index === -1)
    return res.status(404).json({ message: "Ruangan tidak ditemukan." });

  const oldName = db.ruangan[index].name;
  db.ruangan[index] = {
    ...db.ruangan[index],
    name,
    type,
    capacity: parseInt(capacity),
  };

  // Sync room name in schedules
  db.schedules = db.schedules.map((s) => {
    if (s.room === oldName) {
      return { ...s, room: name };
    }
    return s;
  });

  writeDB(db);
  res.json(db.ruangan[index]);
});

app.delete("/api/ruangan/:id", requireRole(["admin"]), (req, res) => {
  const id = parseInt(req.params.id);
  const db = readDB();

  const ruangan = db.ruangan.find((r) => r.id === id);
  if (!ruangan)
    return res.status(404).json({ message: "Ruangan tidak ditemukan." });

  db.ruangan = db.ruangan.filter((r) => r.id !== id);
  // Remove related schedules
  db.schedules = db.schedules.filter((s) => s.room !== ruangan.name);

  writeDB(db);
  res.json({ message: "Ruangan berhasil dihapus." });
});

// ================= MATA KULIAH CRUD =================
app.post("/api/matakuliah", requireRole(["admin"]), (req, res) => {
  const { name, code, sks, day, timeSlot } = req.body;
  if (!name || !code || !sks || !day || !timeSlot)
    return res
      .status(400)
      .json({
        message: "Nama, Kode MK, SKS, Hari, dan Slot Waktu wajib diisi.",
      });

  const db = readDB();
  const newMK = {
    id:
      db.matakuliah.length > 0
        ? Math.max(...db.matakuliah.map((m) => m.id)) + 1
        : 1,
    name,
    code,
    sks: parseInt(sks),
    day,
    timeSlot,
  };
  db.matakuliah.push(newMK);
  writeDB(db);
  res.status(201).json(newMK);
});

app.put("/api/matakuliah/:id", requireRole(["admin"]), (req, res) => {
  const id = parseInt(req.params.id);
  const { name, code, sks, day, timeSlot } = req.body;

  const db = readDB();
  const index = db.matakuliah.findIndex((m) => m.id === id);
  if (index === -1)
    return res.status(404).json({ message: "Mata kuliah tidak ditemukan." });

  const oldName = db.matakuliah[index].name;
  db.matakuliah[index] = {
    ...db.matakuliah[index],
    name,
    code,
    sks: parseInt(sks),
    day: day || db.matakuliah[index].day,
    timeSlot: timeSlot || db.matakuliah[index].timeSlot,
  };

  // Sync subject name, code, day, and timeSlot in schedules
  db.schedules = db.schedules.map((s) => {
    if (s.subject === oldName) {
      return {
        ...s,
        subject: name,
        code: code,
        day: day || s.day,
        timeSlot: timeSlot || s.timeSlot,
      };
    }
    return s;
  });

  writeDB(db);
  res.json(db.matakuliah[index]);
});

app.delete("/api/matakuliah/:id", requireRole(["admin"]), (req, res) => {
  const id = parseInt(req.params.id);
  const db = readDB();

  const mk = db.matakuliah.find((m) => m.id === id);
  if (!mk)
    return res.status(404).json({ message: "Mata kuliah tidak ditemukan." });

  db.matakuliah = db.matakuliah.filter((m) => m.id !== id);
  // Remove related schedules
  db.schedules = db.schedules.filter((s) => s.subject !== mk.name);

  writeDB(db);
  res.json({ message: "Mata kuliah berhasil dihapus." });
});

// ================= SCHEDULES CRUD =================
app.post("/api/schedules", requireRole(["admin"]), (req, res) => {
  const { subject, code, lecturer, room, day, timeSlot, status, details } =
    req.body;
  if (!subject || !code || !lecturer || !room || !day || !timeSlot) {
    return res
      .status(400)
      .json({ message: "Semua detail jadwal wajib diisi." });
  }

  const db = readDB();
  const newSchedule = {
    id:
      db.schedules.length > 0
        ? Math.max(...db.schedules.map((s) => s.id)) + 1
        : 1,
    subject,
    code,
    lecturer,
    room,
    day,
    timeSlot,
    status: status || "validated",
    details: details || "",
  };

  db.schedules.push(newSchedule);
  writeDB(db);
  res.status(201).json(newSchedule);
});

app.put("/api/schedules/:id", requireRole(["admin"]), (req, res) => {
  const id = parseInt(req.params.id);
  const { subject, code, lecturer, room, day, timeSlot, status, details } =
    req.body;

  const db = readDB();
  const index = db.schedules.findIndex((s) => s.id === id);
  if (index === -1)
    return res.status(404).json({ message: "Jadwal tidak ditemukan." });

  db.schedules[index] = {
    ...db.schedules[index],
    subject: subject || db.schedules[index].subject,
    code: code || db.schedules[index].code,
    lecturer: lecturer || db.schedules[index].lecturer,
    room: room || db.schedules[index].room,
    day: day || db.schedules[index].day,
    timeSlot: timeSlot || db.schedules[index].timeSlot,
    status: status !== undefined ? status : db.schedules[index].status,
    details: details !== undefined ? details : db.schedules[index].details,
  };

  writeDB(db);
  res.json(db.schedules[index]);
});

app.delete("/api/schedules/:id", requireRole(["admin"]), (req, res) => {
  const id = parseInt(req.params.id);
  const db = readDB();

  const index = db.schedules.findIndex((s) => s.id === id);
  if (index === -1)
    return res.status(404).json({ message: "Jadwal tidak ditemukan." });

  db.schedules.splice(index, 1);
  writeDB(db);
  res.json({ message: "Jadwal berhasil dihapus." });
});

// Bulk update schedules (Genetic Algorithm optimizer)
app.post("/api/schedules/bulk", requireRole(["admin"]), (req, res) => {
  const { schedules } = req.body;
  if (!Array.isArray(schedules))
    return res.status(400).json({ message: "Jadwal harus berupa array." });

  const db = readDB();
  db.schedules = schedules;
  writeDB(db);
  res.json({ message: "Semua jadwal berhasil diperbarui." });
});

// ================= CHANGE REQUESTS =================
app.post("/api/requests", requireRole(["admin", "dosen"]), (req, res) => {
  const { lecturer, subject, fromTime, toTime, reason } = req.body;
  if (!lecturer || !subject || !fromTime || !toTime || !reason) {
    return res
      .status(400)
      .json({ message: "Semua data permohonan wajib diisi." });
  }

  const userRole = req.headers["x-user-role"];
  const userEmail = req.headers["x-user-email"];

  const db = readDB();

  // Enforce Dosen name matches their registered user account to prevent name spoofing
  let finalLecturer = lecturer;
  if (userRole === "dosen" && userEmail) {
    const matchedUser = db.users.find((u) => u.email === userEmail);
    if (matchedUser) {
      finalLecturer = matchedUser.name;
    }
  }

  const newRequest = {
    id:
      db.requests.length > 0
        ? Math.max(...db.requests.map((r) => r.id)) + 1
        : 1,
    lecturer: finalLecturer,
    subject,
    fromTime,
    toTime,
    reason,
    status: "pending",
  };

  db.requests.unshift(newRequest); // Newest first
  writeDB(db);
  res.status(201).json(newRequest);
});

app.put("/api/requests/:id", requireRole(["admin"]), (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body; // "approved" or "rejected"

  if (!status || (status !== "approved" && status !== "rejected")) {
    return res.status(400).json({ message: "Status tidak valid." });
  }

  const db = readDB();
  const reqItem = db.requests.find((r) => r.id === id);
  if (!reqItem)
    return res.status(404).json({ message: "Permohonan tidak ditemukan." });

  reqItem.status = status;
  writeDB(db);
  res.json(reqItem);
});

// Catch-all for Frontend Routing (Serve index.html as fallback)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`SISJAD server is running on http://localhost:${PORT}`);
});
