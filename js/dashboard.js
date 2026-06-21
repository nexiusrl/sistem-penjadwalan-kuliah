document.addEventListener("DOMContentLoaded", () => {
  // Check Authentication
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") {
    window.location.href = "index.html";
    return;
  }

  // Get current user details
  const userRole = localStorage.getItem("userRole") || "admin";
  const userEmail = localStorage.getItem("userEmail") || "admin@sisjad.ac.id";
  const userName = localStorage.getItem("userName") || "User";

  // Elements
  const userAvatar = document.getElementById("user-avatar");
  const userEmailText = document.getElementById("user-email-text");
  const userRoleText = document.getElementById("user-role-text");
  const navbarGreeting = document.getElementById("navbar-greeting");
  const logoutBtn = document.getElementById("logout-btn");
  const pageTitle = document.getElementById("page-title");
  
  // Navigation Tabs Buttons
  const sidebarNav = document.getElementById("sidebar-nav");
  
  // Navigation Tab Views
  const tabDashboardView = document.getElementById("tab-dashboard-view");
  const tabMasterView = document.getElementById("tab-master-view");
  const tabRequestsView = document.getElementById("tab-requests-view");
  
  // Master sub-tabs & CRUD elements
  const subtabDosenBtn = document.getElementById("subtab-dosen-btn");
  const subtabRuangBtn = document.getElementById("subtab-ruang-btn");
  const subtabMkBtn = document.getElementById("subtab-mk-btn");
  const tableMasterContainer = document.getElementById("table-master-container");
  const addMasterBtn = document.getElementById("add-master-btn");
  const addMasterTypeLabel = document.getElementById("add-master-type-label");
  
  // Schedule CRUD elements
  const addScheduleBtn = document.getElementById("add-schedule-btn");
  
  // Banners & Toasts
  const adminBanner = document.getElementById("admin-banner");
  const bannerAutoBtn = document.getElementById("banner-auto-schedule-btn");
  const successToastEl = document.getElementById("success-toast");
  const successToastMsg = document.getElementById("success-toast-msg");
  const successToast = new bootstrap.Toast(successToastEl, { delay: 3000 });
  const bottomConflictToast = document.getElementById("bottom-conflict-toast");
  const bottomToastDesc = document.getElementById("bottom-toast-desc");
  const bottomToastDismissBtn = document.getElementById("bottom-toast-dismiss-btn");
  const bottomToastSolveBtn = document.getElementById("bottom-toast-solve-btn");
  
  // Genetic Algorithm loading overlay
  const gaOverlay = document.getElementById("ga-loading-overlay");
  const gaProgressBar = document.getElementById("ga-progress-bar");
  
  // Calendar & Conflict Containers
  const calendarGridContainer = document.getElementById("calendar-grid-container");
  const conflictListContainer = document.getElementById("conflict-list-container");
  const conflictBadgeCounter = document.getElementById("conflict-badge-counter");
  const constraintPanelTitle = document.getElementById("constraint-panel-title");
  
  // Statistics counts
  const statValidCount = document.getElementById("stat-valid-count");
  const statConflictCount = document.getElementById("stat-conflict-count");
  const statConflictContainer = document.getElementById("stat-conflict-container");
  const statWarningCount = document.getElementById("stat-warning-count");
  const statWarningContainer = document.getElementById("stat-warning-container");

  // Schedule change request elements
  const requestForm = document.getElementById("request-change-form");
  const reqSubject = document.getElementById("req-subject");
  const reqLecturer = document.getElementById("req-lecturer");
  const reqFromTime = document.getElementById("req-from-time");
  const reqToDate = document.getElementById("req-to-date");
  const reqToStart = document.getElementById("req-to-start");
  const reqToEnd = document.getElementById("req-to-end");
  const reqReason = document.getElementById("req-reason");
  const requestsHistoryList = document.getElementById("requests-history-list");
  const reqFormCol = document.getElementById("req-form-col");
  const reqHistoryCol = document.getElementById("req-history-col");

  // Modals
  const eventDetailModal = new bootstrap.Modal(document.getElementById("eventDetailModal"));
  const modalDetailBody = document.getElementById("modal-detail-body");
  const modalResolveBtn = document.getElementById("modal-resolve-btn");

  const masterModal = new bootstrap.Modal(document.getElementById("masterModal"));
  const masterModalLabel = document.getElementById("masterModalLabel");
  const masterForm = document.getElementById("master-form");
  const masterModalBody = document.getElementById("master-modal-body");

  const scheduleModal = new bootstrap.Modal(document.getElementById("scheduleModal"));
  const scheduleForm = document.getElementById("schedule-form");
  const schedIdInput = document.getElementById("sched-id");
  const schedSubjectSelect = document.getElementById("sched-subject");
  const schedLecturerSelect = document.getElementById("sched-lecturer");
  const schedRoomSelect = document.getElementById("sched-room");
  const schedDaySelect = document.getElementById("sched-day");
  const schedSlotSelect = document.getElementById("sched-slot");
  const schedDeleteBtn = document.getElementById("sched-delete-btn");

  // Days & Slots configuration
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  let timeSlots = ["08:00 - 10:30", "10:30 - 13:00", "13:00 - 15:30"];

  // State
  let dosenList = [];
  let ruangList = [];
  let mkList = [];
  let schedules = [];
  let requestsList = [];
  
  let activeTab = "dashboard";
  let activeMasterSubtab = "dosen";

  // Initialize UI Values
  function initProfile() {
    userAvatar.textContent = userName.substring(0, 2).toUpperCase();
    userEmailText.textContent = userEmail;
    userRoleText.textContent = userRole;
    navbarGreeting.textContent = `Halo, ${userName}`;
    
    setupRoleMenu();
  }

  // Setup sidebar options based on role
  function setupRoleMenu() {
    let menuHtml = "";
    if (userRole === "admin") {
      menuHtml = `
        <a class="sidebar-menu-item active" id="tab-dashboard-btn">
          <i class="bi bi-grid-fill"></i>
          <span class="sidebar-text">Dashboard Jadwal</span>
        </a>
        <a class="sidebar-menu-item" id="tab-master-btn">
          <i class="bi bi-journal-text"></i>
          <span class="sidebar-text">Data Master</span>
        </a>
        <a class="sidebar-menu-item" id="tab-requests-btn">
          <i class="bi bi-chat-left-dots-fill"></i>
          <span class="sidebar-text">Permohonan Jadwal</span>
        </a>
      `;
      adminBanner.classList.remove("d-none");
      addScheduleBtn.classList.remove("d-none");
      
      // Reset layout container widths (8 cols calendar, 4 cols conflicts)
      const calendarCol = document.getElementById("calendar-grid-container").closest(".col-xl-8");
      if (calendarCol) {
        calendarCol.className = "col-xl-8 col-12";
      }
      const conflictCol = document.getElementById("conflict-list-container").closest(".col-xl-4");
      if (conflictCol) {
        conflictCol.classList.remove("d-none");
      }
    } else if (userRole === "dosen") {
      menuHtml = `
        <a class="sidebar-menu-item active" id="tab-dashboard-btn">
          <i class="bi bi-calendar-week-fill"></i>
          <span class="sidebar-text">Jadwal Mengajar</span>
        </a>
        <a class="sidebar-menu-item" id="tab-requests-btn">
          <i class="bi bi-chat-left-dots-fill"></i>
          <span class="sidebar-text">Pengajuan Perubahan</span>
        </a>
      `;
      adminBanner.classList.add("d-none");
      addScheduleBtn.classList.add("d-none");
      
      // Hide conflict side panel and expand calendar to 12 cols
      const calendarCol = document.getElementById("calendar-grid-container").closest(".col-xl-8");
      if (calendarCol) {
        calendarCol.className = "col-xl-12 col-12";
      }
      const conflictCol = document.getElementById("conflict-list-container").closest(".col-xl-4");
      if (conflictCol) {
        conflictCol.classList.add("d-none");
      }
    } else { // mahasiswa
      menuHtml = `
        <a class="sidebar-menu-item active" id="tab-dashboard-btn">
          <i class="bi bi-calendar3"></i>
          <span class="sidebar-text">Jadwal Kuliah</span>
        </a>
      `;
      adminBanner.classList.add("d-none");
      addScheduleBtn.classList.add("d-none");
      
      // Hide conflict side panel and expand calendar to 12 cols
      const calendarCol = document.getElementById("calendar-grid-container").closest(".col-xl-8");
      if (calendarCol) {
        calendarCol.className = "col-xl-12 col-12";
      }
      const conflictCol = document.getElementById("conflict-list-container").closest(".col-xl-4");
      if (conflictCol) {
        conflictCol.classList.add("d-none");
      }
    }
    
    sidebarNav.innerHTML = menuHtml;

    // Attach click events to dynamically rendered sidebar buttons
    const btnDb = document.getElementById("tab-dashboard-btn");
    const btnMstr = document.getElementById("tab-master-btn");
    const btnReqs = document.getElementById("tab-requests-btn");

    if (btnDb) btnDb.addEventListener("click", () => switchTab("dashboard"));
    if (btnMstr) btnMstr.addEventListener("click", () => switchTab("master"));
    if (btnReqs) btnReqs.addEventListener("click", () => switchTab("requests"));
  }

  // Load state from API
  async function fetchDBState() {
    try {
      const res = await fetch("/api/db");
      if (!res.ok) throw new Error("Gagal mengambil data dari server.");
      const data = await res.json();
      
      dosenList = data.dosen || [];
      ruangList = data.ruangan || [];
      mkList = data.matakuliah || [];
      schedules = data.schedules || [];
      requestsList = data.requests || [];
      
      updateDynamicTimeSlots();
      evaluateConstraints();
      
      // Re-render active view
      switchTab(activeTab);
    } catch (err) {
      console.error(err);
      showNotice("Koneksi server terputus. Menggunakan data lokal.");
    }
  }

  // Recalculate dynamic time slots based on mata kuliah data
  function updateDynamicTimeSlots() {
    let slots = [];
    mkList.forEach(mk => {
      if (mk.timeSlot && !slots.includes(mk.timeSlot)) {
        slots.push(mk.timeSlot);
      }
    });
    if (slots.length === 0) {
      timeSlots = ["08:00 - 10:30", "10:30 - 13:00", "13:00 - 15:30"];
    } else {
      // Sort chronologically based on start time
      slots.sort((a, b) => {
        const timeA = a.split(" - ")[0] || "";
        const timeB = b.split(" - ")[0] || "";
        return timeA.localeCompare(timeB);
      });
      timeSlots = slots;
    }
  }

  // Constraint Evaluation Logic
  function evaluateConstraints() {
    // Reset statuses to validated first
    schedules.forEach(s => {
      s.status = "validated";
      s.details = "";
    });

    schedules.forEach((s1, index) => {
      // Check overlaps with other classes
      schedules.forEach(s2 => {
        if (s1.id === s2.id) return;

        if (s1.day === s2.day && s1.timeSlot === s2.timeSlot) {
          // Room Conflict
          if (s1.room === s2.room) {
            s1.status = "hard-conflict";
            s1.details = `Bentrok Ruangan: Ruang ${s1.room} digunakan bersamaan dengan kelas ${s2.subject}.`;
          }
          // Lecturer Conflict
          if (s1.lecturer === s2.lecturer) {
            s1.status = "hard-conflict";
            s1.details = `Bentrok Dosen: ${s1.lecturer} mengajar kelas ${s2.subject} di jam yang sama.`;
          }
        }
      });
    });
  }

  // Handle Log out
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });

  // Switch tabs
  function switchTab(tab) {
    // Role-based route protection
    if (tab === "master" && userRole !== "admin") {
      switchTab("dashboard");
      return;
    }
    if (tab === "requests" && userRole === "mahasiswa") {
      switchTab("dashboard");
      return;
    }

    activeTab = tab;
    
    // Manage active sidebar classes
    const btnDb = document.getElementById("tab-dashboard-btn");
    const btnMstr = document.getElementById("tab-master-btn");
    const btnReqs = document.getElementById("tab-requests-btn");
    
    if (btnDb) btnDb.classList.remove("active");
    if (btnMstr) btnMstr.classList.remove("active");
    if (btnReqs) btnReqs.classList.remove("active");
    
    tabDashboardView.classList.add("d-none");
    tabMasterView.classList.add("d-none");
    tabRequestsView.classList.add("d-none");
    
    if (tab === "dashboard") {
      if (btnDb) btnDb.classList.add("active");
      tabDashboardView.classList.remove("d-none");
      pageTitle.textContent = userRole === "admin" ? "Dashboard Distribusi Jadwal" : (userRole === "dosen" ? "Jadwal Mengajar Dosen" : "Jadwal Perkuliahan Mahasiswa");
      renderCalendar();
      renderConflicts();
      
      // Control GA schedule buttons
      const hasConflicts = schedules.some(s => s.status === "hard-conflict");
      if (hasConflicts && userRole === "admin") {
        adminBanner.classList.remove("d-none");
      } else {
        adminBanner.classList.add("d-none");
      }
    } else if (tab === "master") {
      if (btnMstr) btnMstr.classList.add("active");
      tabMasterView.classList.remove("d-none");
      pageTitle.textContent = "Manajemen Data Master";
      renderMasterTable(activeMasterSubtab);
    } else if (tab === "requests") {
      if (btnReqs) btnReqs.classList.add("active");
      tabRequestsView.classList.remove("d-none");
      pageTitle.textContent = userRole === "admin" ? "Persetujuan Perubahan Jadwal" : "Form Pengajuan Pergeseran Jadwal";
      renderRequests();
    }
  }

  // ================= CALENDAR GRID RENDER =================
  function renderCalendar() {
    let html = "";
    
    days.forEach(day => {
      let events = schedules.filter(s => s.day === day);
      if (userRole === "dosen") {
        events = events.filter(s => s.lecturer.toLowerCase() === userName.toLowerCase() || s.lecturer.toLowerCase() === "dr. budi");
      }
      
      // Sort chronologically by start time
      events.sort((a, b) => {
        const timeA = (a.timeSlot || "").split(" - ")[0] || "";
        const timeB = (b.timeSlot || "").split(" - ")[0] || "";
        return timeA.localeCompare(timeB);
      });

      let htmlCards = "";
      events.forEach(evt => {
        let statusClass = "calendar-event-validated";
        if (evt.status === "hard-conflict") statusClass = "calendar-event-hard";
        else if (evt.status === "soft-warning") statusClass = "calendar-event-soft";

        htmlCards += `
          <div class="calendar-event ${statusClass}" data-id="${evt.id}">
            <div class="event-title">${evt.subject}</div>
            <div class="event-details">
              <div class="fw-semibold text-indigo mb-1" style="font-size: 0.7rem;">🕒 ${evt.timeSlot}</div>
              <div>👤 ${evt.lecturer}</div>
              <div>📍 Ruang ${evt.room}</div>
            </div>
          </div>
        `;
      });

      html += `
        <div class="day-column">
          <div class="grid-header-day">${day}</div>
          <div class="grid-cell-day">
            ${htmlCards || '<div class="text-muted small text-center my-auto py-3">Tidak ada perkuliahan</div>'}
          </div>
        </div>
      `;
    });

    calendarGridContainer.innerHTML = html;

    // Attach click events to schedule cards
    document.querySelectorAll(".calendar-event").forEach(card => {
      card.addEventListener("click", (e) => {
        const id = parseInt(card.getAttribute("data-id"));
        openEventModal(id);
      });
    });

    updateStats();
  }

  // Update navbar stats
  function updateStats() {
    const valid = schedules.filter(s => s.status === "validated").length;
    const conflicts = schedules.filter(s => s.status === "hard-conflict").length;
    const warnings = schedules.filter(s => s.status === "soft-warning").length;

    statValidCount.textContent = `${valid} Valid`;
    
    if (conflicts > 0) {
      statConflictCount.textContent = `${conflicts} Bentrok`;
      statConflictContainer.classList.remove("d-none");
      conflictBadgeCounter.textContent = `${conflicts} Bentrok`;
      conflictBadgeCounter.classList.remove("d-none");
      
      if (userRole === "admin") {
        bottomConflictToast.classList.remove("d-none");
        bottomToastDesc.textContent = `Terdapat ${conflicts} bentrok hard-constraint. Selesaikan manual atau jalankan Algoritma Genetika.`;
      } else {
        bottomConflictToast.classList.add("d-none");
      }
    } else {
      statConflictContainer.classList.add("d-none");
      conflictBadgeCounter.classList.add("d-none");
      bottomConflictToast.classList.add("d-none");
    }

    statWarningCount.textContent = `${warnings} Peringatan`;
  }

  // Render Constraints Sidebar Panel
  function renderConflicts() {
    if (userRole !== "admin") return;

    const hard = schedules.filter(s => s.status === "hard-conflict");
    const soft = schedules.filter(s => s.status === "soft-warning");

    let html = "";
    if (hard.length === 0 && soft.length === 0) {
      html = `
        <div class="text-center py-5 px-3 text-muted">
          <div class="bg-success-subtle text-success rounded-circle p-3 d-inline-flex mb-3">
            <i class="bi bi-check-lg fs-4"></i>
          </div>
          <h4 class="h6 fw-bold text-dark mb-1">Jadwal Bebas Bentrok</h4>
          <p class="small text-muted mb-0" style="max-width: 240px; margin: 0 auto; line-height: 1.4;">
            Semua data dosen, ruang, dan preferensi waktu berhasil disinkronisasi tanpa konflik.
          </p>
        </div>
      `;
    } else {
      hard.forEach(c => {
        html += `
          <div class="conflict-item">
            <div class="conflict-item-header">
              <span class="conflict-item-type">BENTROK UTAMA</span>
              <span class="conflict-time">${c.day}, ${c.timeSlot}</span>
            </div>
            <p class="conflict-desc mb-2">
              <strong>${c.subject}</strong>: ${c.details}
            </p>
            <button class="resolve-btn btn-outline-danger" data-id="${c.id}">Pindahkan / Reschedule</button>
          </div>
        `;
      });

      soft.forEach(w => {
        html += `
          <div class="conflict-item conflict-item-soft">
            <div class="conflict-item-header">
              <span class="conflict-item-type conflict-item-type-soft">OPTIMASI</span>
              <span class="conflict-time">${w.day}, ${w.timeSlot}</span>
            </div>
            <p class="conflict-desc mb-2">
              <strong>${w.subject}</strong>: ${w.details}
            </p>
            <button class="resolve-btn btn-soft-resolve" data-id="${w.id}">Pindahkan Pagi</button>
          </div>
        `;
      });
    }

    conflictListContainer.innerHTML = html;

    document.querySelectorAll(".resolve-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        openScheduleForm(id);
      });
    });
  }

  // Open Schedule Form Modal (Create or Edit)
  function openScheduleForm(id = null) {
    if (userRole !== "admin") return;
    
    // Populate select choices from master lists
    schedSubjectSelect.innerHTML = mkList.map(m => `<option value="${m.name}" data-code="${m.code}" data-day="${m.day || ''}" data-timeslot="${m.timeSlot || ''}">${m.code} - ${m.name}</option>`).join("");
    schedLecturerSelect.innerHTML = dosenList.map(d => `<option value="${d.name}">${d.name} (${d.code})</option>`).join("");
    schedRoomSelect.innerHTML = ruangList.map(r => `<option value="${r.name}">${r.name} (${r.type})</option>`).join("");

    if (mkList.length === 0 || dosenList.length === 0 || ruangList.length === 0) {
      alert("Harap lengkapi Data Master (Dosen, Ruangan, Mata Kuliah) terlebih dahulu sebelum membuat Jadwal.");
      return;
    }

    // Day & Slot are bound to Mata Kuliah data and cannot be overridden manually
    schedDaySelect.disabled = true;
    schedSlotSelect.disabled = true;

    if (id) {
      // Edit mode
      const sched = schedules.find(s => s.id === id);
      if (!sched) return;
      
      schedIdInput.value = sched.id;
      schedSubjectSelect.value = sched.subject;
      schedLecturerSelect.value = sched.lecturer;
      schedRoomSelect.value = sched.room;
      schedDaySelect.value = sched.day;
      schedSlotSelect.value = sched.timeSlot;
      
      document.getElementById("scheduleModalLabel").textContent = "Edit Jadwal Kuliah";
      schedDeleteBtn.classList.remove("d-none");
    } else {
      // Add mode
      schedIdInput.value = "";
      scheduleForm.reset();

      // Auto pre-populate day and timeslot based on selected mata kuliah
      const selected = schedSubjectSelect.options[schedSubjectSelect.selectedIndex];
      if (selected) {
        schedDaySelect.value = selected.getAttribute("data-day") || "Senin";
        schedSlotSelect.value = selected.getAttribute("data-timeslot") || "08:00 - 10:30";
      }

      document.getElementById("scheduleModalLabel").textContent = "Tambah Jadwal Kuliah";
      schedDeleteBtn.classList.add("d-none");
    }

    scheduleModal.show();
  }

  // Schedule Submit Handler
  scheduleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (userRole !== "admin") {
      alert("Akses ditolak: Hanya administrator yang dapat menambah/mengubah jadwal.");
      return;
    }

    const id = schedIdInput.value;
    
    const selectedOption = schedSubjectSelect.options[schedSubjectSelect.selectedIndex];
    const code = selectedOption.getAttribute("data-code");

    const payload = {
      subject: schedSubjectSelect.value,
      code: code,
      lecturer: schedLecturerSelect.value,
      room: schedRoomSelect.value,
      day: schedDaySelect.value,
      timeSlot: schedSlotSelect.value
    };

    const url = id ? `/api/schedules/${id}` : "/api/schedules";
    const method = id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "X-User-Role": userRole,
          "X-User-Email": userEmail
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Gagal menyimpan jadwal.");
      
      scheduleModal.hide();
      fetchDBState();
      showNotice(id ? "Jadwal berhasil diperbarui!" : "Jadwal baru berhasil dibuat!");
    } catch (err) {
      alert(err.message);
    }
  });

  // Delete Schedule
  schedDeleteBtn.addEventListener("click", async () => {
    if (userRole !== "admin") {
      alert("Akses ditolak: Hanya administrator yang dapat menghapus jadwal.");
      return;
    }

    const id = schedIdInput.value;
    if (!id || !confirm("Apakah Anda yakin ingin menghapus jadwal ini secara permanen?")) return;

    try {
      const res = await fetch(`/api/schedules/${id}`, { 
        method: "DELETE",
        headers: {
          "X-User-Role": userRole,
          "X-User-Email": userEmail
        }
      });
      if (!res.ok) throw new Error("Gagal menghapus jadwal.");
      
      scheduleModal.hide();
      fetchDBState();
      showNotice("Jadwal sukses dihapus.");
    } catch (err) {
      alert(err.message);
    }
  });

  // Schedule Card Detail Modal
  function openEventModal(id) {
    const event = schedules.find(s => s.id === id);
    if (!event) return;

    let statusBadge = "";
    if (event.status === "hard-conflict") {
      statusBadge = '<span class="custom-badge badge-hard-conflict">Bentrok Hard Constraint</span>';
    } else if (event.status === "soft-warning") {
      statusBadge = '<span class="custom-badge badge-soft-warning">Optimasi Warning</span>';
    } else {
      statusBadge = '<span class="custom-badge badge-validated-status">Jadwal Valid</span>';
    }

    modalDetailBody.innerHTML = `
      <div class="mb-3">
        <h4 class="h5 fw-bold text-university-blue mb-1">${event.subject}</h4>
        <code class="text-muted small">${event.code}</code>
      </div>
      
      <div class="d-flex flex-column gap-2 border-top border-bottom py-3 mb-3" style="font-size: 0.9rem;">
        <div>👤 <strong>Dosen Pengampu:</strong> ${event.lecturer}</div>
        <div>📍 <strong>Lokasi Ruang:</strong> Ruangan ${event.room}</div>
        <div>📅 <strong>Hari & Jam:</strong> ${event.day}, ${event.timeSlot}</div>
        <div>🔔 <strong>Status Alokasi:</strong> ${statusBadge}</div>
      </div>
      
      ${event.details ? `
        <div class="alert alert-warning py-2 px-3 small border-0 mb-0" style="background-color: var(--conflict-soft-bg); color: var(--conflict-soft-text);">
          <i class="bi bi-exclamation-triangle-fill me-1"></i> ${event.details}
        </div>
      ` : ""}
    `;

    // Show edit button in modal if Admin
    if (userRole === "admin") {
      modalResolveBtn.classList.remove("d-none");
      modalResolveBtn.textContent = "Edit Jadwal";
      modalResolveBtn.onclick = () => {
        eventDetailModal.hide();
        openScheduleForm(event.id);
      };
    } else {
      modalResolveBtn.classList.add("d-none");
    }

    eventDetailModal.show();
  }

  addScheduleBtn.addEventListener("click", () => openScheduleForm());

  // Update Day & Slot when Mata Kuliah selection changes in schedule form
  schedSubjectSelect.addEventListener("change", () => {
    const selected = schedSubjectSelect.options[schedSubjectSelect.selectedIndex];
    if (selected) {
      schedDaySelect.value = selected.getAttribute("data-day") || "Senin";
      schedSlotSelect.value = selected.getAttribute("data-timeslot") || "08:00 - 10:30";
    }
  });

  // ================= DATA MASTER MANAGEMENT =================

  // Subtabs switching
  subtabDosenBtn.addEventListener("click", () => renderMasterTable("dosen"));
  subtabRuangBtn.addEventListener("click", () => renderMasterTable("ruang"));
  subtabMkBtn.addEventListener("click", () => renderMasterTable("mk"));

  function renderMasterTable(subtab) {
    activeMasterSubtab = subtab;
    [subtabDosenBtn, subtabRuangBtn, subtabMkBtn].forEach(btn => btn.classList.remove("active"));
    
    let html = "";
    if (subtab === "dosen") {
      subtabDosenBtn.classList.add("active");
      addMasterTypeLabel.textContent = "Dosen";
      html = `
        <table class="table table-striped table-hover dataTable sticky-table-header w-100">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Dosen</th>
              ${userRole === "admin" ? '<th style="width: 150px;">Aksi</th>' : ""}
            </tr>
          </thead>
          <tbody>
            ${dosenList.length === 0 ? '<tr><td colspan="3" class="text-center py-4 text-muted">Belum ada data Dosen. Klik "Tambah Dosen" untuk mengisi.</td></tr>' : dosenList.map(d => `
              <tr>
                <td><strong>${d.code}</strong></td>
                <td>${d.name}</td>
                ${userRole === "admin" ? `
                <td>
                  <button class="btn btn-sm btn-outline-primary py-0 px-2 btn-edit-dosen" data-id="${d.id}">Edit</button>
                  <button class="btn btn-sm btn-outline-danger py-0 px-2 btn-delete-dosen" data-id="${d.id}">Hapus</button>
                </td>
                ` : ""}
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } else if (subtab === "ruang") {
      subtabRuangBtn.classList.add("active");
      addMasterTypeLabel.textContent = "Ruangan";
      html = `
        <table class="table table-striped table-hover dataTable sticky-table-header w-100">
          <thead>
            <tr>
              <th>Nama Ruangan</th>
              <th>Tipe Kelas</th>
              <th>Kapasitas Kursi</th>
              ${userRole === "admin" ? '<th style="width: 150px;">Aksi</th>' : ""}
            </tr>
          </thead>
          <tbody>
            ${ruangList.length === 0 ? '<tr><td colspan="4" class="text-center py-4 text-muted">Belum ada data Ruangan. Klik "Tambah Ruangan" untuk mengisi.</td></tr>' : ruangList.map(r => `
              <tr>
                <td><strong>${r.name}</strong></td>
                <td>${r.type}</td>
                <td class="text-tabular">${r.capacity} Kursi</td>
                ${userRole === "admin" ? `
                <td>
                  <button class="btn btn-sm btn-outline-primary py-0 px-2 btn-edit-ruang" data-id="${r.id}">Edit</button>
                  <button class="btn btn-sm btn-outline-danger py-0 px-2 btn-delete-ruang" data-id="${r.id}">Hapus</button>
                </td>
                ` : ""}
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } else if (subtab === "mk") {
      subtabMkBtn.classList.add("active");
      addMasterTypeLabel.textContent = "Mata Kuliah";
      html = `
        <table class="table table-striped table-hover dataTable sticky-table-header w-100">
          <thead>
            <tr>
              <th>Kode MK</th>
              <th>Nama Mata Kuliah</th>
              <th>Jumlah SKS</th>
              <th>Hari</th>
              <th>Slot Waktu</th>
              ${userRole === "admin" ? '<th style="width: 150px;">Aksi</th>' : ""}
            </tr>
          </thead>
          <tbody>
            ${mkList.length === 0 ? '<tr><td colspan="6" class="text-center py-4 text-muted">Belum ada data Mata Kuliah. Klik "Tambah Mata Kuliah" untuk mengisi.</td></tr>' : mkList.map(mk => `
              <tr>
                <td><strong>${mk.code}</strong></td>
                <td>${mk.name}</td>
                <td class="text-tabular">${mk.sks} SKS</td>
                <td>${mk.day || "-"}</td>
                <td>${mk.timeSlot || "-"}</td>
                ${userRole === "admin" ? `
                <td>
                  <button class="btn btn-sm btn-outline-primary py-0 px-2 btn-edit-mk" data-id="${mk.id}">Edit</button>
                  <button class="btn btn-sm btn-outline-danger py-0 px-2 btn-delete-mk" data-id="${mk.id}">Hapus</button>
                </td>
                ` : ""}
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    }
    tableMasterContainer.innerHTML = html;

    // Show/Hide Add Master button based on role
    if (userRole === "admin") {
      addMasterBtn.classList.remove("d-none");
    } else {
      addMasterBtn.classList.add("d-none");
    }

    // Attach CRUD click events
    document.querySelectorAll(".btn-edit-dosen").forEach(btn => btn.addEventListener("click", () => openMasterForm("dosen", parseInt(btn.getAttribute("data-id")))));
    document.querySelectorAll(".btn-delete-dosen").forEach(btn => btn.addEventListener("click", () => deleteMasterItem("dosen", parseInt(btn.getAttribute("data-id")))));
    document.querySelectorAll(".btn-edit-ruang").forEach(btn => btn.addEventListener("click", () => openMasterForm("ruang", parseInt(btn.getAttribute("data-id")))));
    document.querySelectorAll(".btn-delete-ruang").forEach(btn => btn.addEventListener("click", () => deleteMasterItem("ruang", parseInt(btn.getAttribute("data-id")))));
    document.querySelectorAll(".btn-edit-mk").forEach(btn => btn.addEventListener("click", () => openMasterForm("mk", parseInt(btn.getAttribute("data-id")))));
    document.querySelectorAll(".btn-delete-mk").forEach(btn => btn.addEventListener("click", () => deleteMasterItem("mk", parseInt(btn.getAttribute("data-id")))));
  }

  // Open Add/Edit Master Modal
  function openMasterForm(type, id = null) {
    let fields = `<input type="hidden" id="master-item-id" value="${id || ""}"><input type="hidden" id="master-item-type" value="${type}">`;
    
    if (type === "dosen") {
      const item = id ? dosenList.find(d => d.id === id) : null;
      masterModalLabel.textContent = id ? "Edit Data Dosen" : "Tambah Data Dosen";
      fields += `
        <div class="mb-3">
          <label for="m-dosen-name" class="form-label fw-semibold text-muted small text-uppercase">Nama Dosen</label>
          <input type="text" class="form-control" id="m-dosen-name" value="${item ? item.name : ""}" required />
        </div>
        <div class="mb-3">
          <label for="m-dosen-code" class="form-label fw-semibold text-muted small text-uppercase">Kode Singkat Dosen</label>
          <input type="text" class="form-control" id="m-dosen-code" value="${item ? item.code : ""}" maxlength="3" required placeholder="Contoh: BD" />
        </div>

      `;
    } else if (type === "ruang") {
      const item = id ? ruangList.find(r => r.id === id) : null;
      masterModalLabel.textContent = id ? "Edit Data Ruangan" : "Tambah Data Ruangan";
      fields += `
        <div class="mb-3">
          <label for="m-ruang-name" class="form-label fw-semibold text-muted small text-uppercase">Nama Ruangan</label>
          <input type="text" class="form-control" id="m-ruang-name" value="${item ? item.name : ""}" required placeholder="Contoh: R301" />
        </div>
        <div class="mb-3">
          <label for="m-ruang-type" class="form-label fw-semibold text-muted small text-uppercase">Tipe Ruangan</label>
          <select class="form-select" id="m-ruang-type" required>
            <option value="Teori" ${item && item.type === "Teori" ? "selected" : ""}>Teori</option>
            <option value="Praktikum" ${item && item.type === "Praktikum" ? "selected" : ""}>Praktikum</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="m-ruang-capacity" class="form-label fw-semibold text-muted small text-uppercase">Kapasitas Kursi</label>
          <input type="number" class="form-control" id="m-ruang-capacity" value="${item ? item.capacity : "40"}" required />
        </div>
      `;
    } else if (type === "mk") {
      const item = id ? mkList.find(m => m.id === id) : null;
      let startTime = "";
      let endTime = "";
      if (item && item.timeSlot && item.timeSlot.includes(" - ")) {
        const parts = item.timeSlot.split(" - ");
        startTime = parts[0];
        endTime = parts[1];
      }
      masterModalLabel.textContent = id ? "Edit Mata Kuliah" : "Tambah Mata Kuliah";
      fields += `
        <div class="mb-3">
          <label for="m-mk-name" class="form-label fw-semibold text-muted small text-uppercase">Nama Mata Kuliah</label>
          <input type="text" class="form-control" id="m-mk-name" value="${item ? item.name : ""}" required />
        </div>
        <div class="mb-3">
          <label for="m-mk-code" class="form-label fw-semibold text-muted small text-uppercase">Kode MK</label>
          <input type="text" class="form-control" id="m-mk-code" value="${item ? item.code : ""}" required placeholder="Contoh: IF101" />
        </div>
        <div class="mb-3">
          <label for="m-mk-sks" class="form-label fw-semibold text-muted small text-uppercase">Jumlah SKS</label>
          <input type="number" class="form-control" id="m-mk-sks" value="${item ? item.sks : "3"}" required />
        </div>
        <div class="mb-3">
          <label for="m-mk-day" class="form-label fw-semibold text-muted small text-uppercase">Hari Kuliah</label>
          <select class="form-select" id="m-mk-day" required>
            <option value="" disabled ${!item ? "selected" : ""}>Pilih Hari</option>
            <option value="Senin" ${item && item.day === "Senin" ? "selected" : ""}>Senin</option>
            <option value="Selasa" ${item && item.day === "Selasa" ? "selected" : ""}>Selasa</option>
            <option value="Rabu" ${item && item.day === "Rabu" ? "selected" : ""}>Rabu</option>
            <option value="Kamis" ${item && item.day === "Kamis" ? "selected" : ""}>Kamis</option>
            <option value="Jumat" ${item && item.day === "Jumat" ? "selected" : ""}>Jumat</option>
          </select>
        </div>
        <div class="row g-2 mb-3">
          <div class="col-6">
            <label for="m-mk-time-start" class="form-label fw-semibold text-muted small text-uppercase">Jam Mulai</label>
            <input type="time" class="form-control" id="m-mk-time-start" value="${startTime}" required />
          </div>
          <div class="col-6">
            <label for="m-mk-time-end" class="form-label fw-semibold text-muted small text-uppercase">Jam Selesai</label>
            <input type="time" class="form-control" id="m-mk-time-end" value="${endTime}" required />
          </div>
        </div>
      `;
    }

    masterModalBody.innerHTML = fields;
    masterModal.show();
  }

  // Master Data Add/Edit form submission handler
  masterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (userRole !== "admin") {
      alert("Akses ditolak: Hanya administrator yang dapat mengubah data master.");
      return;
    }

    const id = document.getElementById("master-item-id").value;
    const type = document.getElementById("master-item-type").value;
    
    let payload = {};
    let url = `/api/${type}`;
    if (id) url += `/${id}`;

    if (type === "dosen") {
      payload = {
        name: document.getElementById("m-dosen-name").value.trim(),
        code: document.getElementById("m-dosen-code").value.trim().toUpperCase()
      };
    } else if (type === "ruang") {
      payload = {
        name: document.getElementById("m-ruang-name").value.trim(),
        type: document.getElementById("m-ruang-type").value,
        capacity: parseInt(document.getElementById("m-ruang-capacity").value)
      };
    } else if (type === "mk") {
      const start = document.getElementById("m-mk-time-start").value;
      const end = document.getElementById("m-mk-time-end").value;
      payload = {
        name: document.getElementById("m-mk-name").value.trim(),
        code: document.getElementById("m-mk-code").value.trim().toUpperCase(),
        sks: parseInt(document.getElementById("m-mk-sks").value),
        day: document.getElementById("m-mk-day").value,
        timeSlot: `${start} - ${end}`
      };
    }

    try {
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "X-User-Role": userRole,
          "X-User-Email": userEmail
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Gagal menyimpan data.");
      
      masterModal.hide();
      fetchDBState();
      showNotice("Data berhasil diperbarui!");
    } catch (err) {
      alert(err.message);
    }
  });

  // Delete master item
  async function deleteMasterItem(type, id) {
    if (userRole !== "admin") {
      alert("Akses ditolak: Hanya administrator yang dapat menghapus data master.");
      return;
    }

    if (!confirm("Menghapus data master ini juga akan menghapus jadwal terkait. Apakah Anda yakin?")) return;

    try {
      const res = await fetch(`/api/${type}/${id}`, { 
        method: "DELETE",
        headers: {
          "X-User-Role": userRole,
          "X-User-Email": userEmail
        }
      });
      if (!res.ok) throw new Error("Gagal menghapus data master.");
      
      fetchDBState();
      showNotice("Data master berhasil dihapus.");
    } catch (err) {
      alert(err.message);
    }
  }

  // Hook up add button for Master
  addMasterBtn.addEventListener("click", () => openMasterForm(activeMasterSubtab));

  // ================= SCHEDULE REQUESTS =================
  function renderRequests() {
    // Toggle form visibility and layout based on role
    if (userRole === "admin") {
      if (reqFormCol) reqFormCol.classList.add("d-none");
      if (reqHistoryCol) {
        reqHistoryCol.classList.remove("col-md-7");
        reqHistoryCol.classList.add("col-12");
      }
    } else {
      if (reqFormCol) reqFormCol.classList.remove("d-none");
      if (reqHistoryCol) {
        reqHistoryCol.classList.remove("col-12");
        reqHistoryCol.classList.add("col-md-7");
      }
    }

    // Populate dropdown for request form using lecturer's active schedules
    let mySchedules = schedules;
    if (userRole === "dosen") {
      mySchedules = schedules.filter(s => s.lecturer.toLowerCase() === userName.toLowerCase() || s.lecturer.toLowerCase() === "dr. budi");
    }

    // Filter unique schedule assignments to prevent duplicates
    const uniqueSchedules = [];
    const seen = new Set();
    mySchedules.forEach(s => {
      const key = `${s.subject}|${s.day}|${s.timeSlot}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSchedules.push(s);
      }
    });

    reqSubject.innerHTML = '<option value="" disabled selected>Pilih mata kuliah & jadwal...</option>' + 
      uniqueSchedules.map(s => `<option value="${s.subject}" data-day="${s.day}" data-timeslot="${s.timeSlot}">${s.subject} (${s.day}, ${s.timeSlot})</option>`).join("");

    let myRequests = requestsList;
    
    // If lecturer, lock form inputs and filter history list
    if (userRole === "dosen") {
      // Lock request lecturer name input
      const inputLecturer = document.getElementById("req-lecturer");
      if (inputLecturer) {
        inputLecturer.value = userName;
      }
      
      // Filter list to only their own
      myRequests = requestsList.filter(r => r.lecturer.toLowerCase() === userName.toLowerCase());
    }

    let html = "";
    if (myRequests.length === 0) {
      html = '<p class="text-muted small text-center py-4">Belum ada riwayat permohonan masuk.</p>';
    } else {
      myRequests.forEach(req => {
        let statusBadge = "";
        if (req.status === "approved") {
          statusBadge = '<span class="custom-badge badge-validated-status">Disetujui</span>';
        } else if (req.status === "rejected") {
          statusBadge = '<span class="custom-badge badge-hard-conflict">Ditolak</span>';
        } else {
          statusBadge = '<span class="custom-badge badge-soft-warning">Menunggu</span>';
        }

        html += `
          <div class="custom-card mb-3 bg-light">
            <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
              <span class="fw-bold small text-university-blue">${req.subject}</span>
              ${statusBadge}
            </div>
            <p class="small mb-3" style="line-height: 1.5;">
              Dosen Pemohon: <strong>${req.lecturer}</strong><br />
              Pengajuan geser jadwal dari <code>${req.fromTime}</code> ke <code>${req.toTime}</code>.<br />
              <small class="text-muted d-block mt-1">Alasan: &ldquo;${req.reason}&rdquo;</small>
            </p>
            ${userRole === "admin" && req.status === "pending" ? `
              <div class="d-flex justify-content-end gap-2 border-top pt-2">
                <button class="btn btn-sm btn-outline-danger px-3 py-1 btn-reject" data-id="${req.id}">Tolak</button>
                <button class="btn btn-sm btn-indigo px-3 py-1 btn-approve" data-id="${req.id}">Setujui</button>
              </div>
            ` : ""}
          </div>
        `;
      });
    }

    requestsHistoryList.innerHTML = html;

    // Attach approve/reject events
    if (userRole === "admin") {
      document.querySelectorAll(".btn-approve").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = parseInt(btn.getAttribute("data-id"));
          handleRequestStatus(id, "approved");
        });
      });
      document.querySelectorAll(".btn-reject").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = parseInt(btn.getAttribute("data-id"));
          handleRequestStatus(id, "rejected");
        });
      });
    }
  }

  // Handle Approve/Reject Requests
  async function handleRequestStatus(id, status) {
    if (userRole !== "admin") {
      alert("Akses ditolak: Hanya administrator yang dapat menyetujui/menolak permohonan.");
      return;
    }

    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Role": userRole,
          "X-User-Email": userEmail
        },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error("Gagal memproses permohonan.");
      
      fetchDBState();
      showNotice(`Permohonan telah ${status === "approved" ? "disetujui" : "ditolak"}.`);
    } catch (err) {
      alert(err.message);
    }
  }

  // Auto-populate fromTime when a subject/schedule is selected
  reqSubject.addEventListener("change", () => {
    const selectedOption = reqSubject.options[reqSubject.selectedIndex];
    if (selectedOption) {
      const day = selectedOption.getAttribute("data-day") || "";
      const timeSlot = selectedOption.getAttribute("data-timeslot") || "";
      if (day && timeSlot) {
        reqFromTime.value = `${day}, ${timeSlot}`;
      } else {
        reqFromTime.value = "";
      }
    }
  });

  // Handle Request Change Submission
  requestForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const inputLecturer = document.getElementById("req-lecturer");
    const lecturer = inputLecturer ? inputLecturer.value : userName;
    
    if (schedules.length === 0) {
      alert("Belum ada jadwal mengajar terdaftar.");
      return;
    }

    if (!reqToDate.value || !reqToStart.value || !reqToEnd.value) {
      alert("Silakan pilih tanggal dan jam usulan baru.");
      return;
    }

    // Safely parse date using local timezone components to avoid timezone shift
    const [year, month, day] = reqToDate.value.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const dayName = dayNames[dateObj.getDay()];

    // Weekend validation
    if (dateObj.getDay() === 0 || dateObj.getDay() === 6) {
      alert("Jadwal perkuliahan hanya tersedia pada hari kerja (Senin - Jumat).");
      return;
    }

    // Time range validation
    if (reqToStart.value >= reqToEnd.value) {
      alert("Jam mulai harus lebih awal dari jam selesai.");
      return;
    }

    const toTimeStr = `${dayName}, ${reqToStart.value} - ${reqToEnd.value}`;

    const payload = {
      lecturer: lecturer,
      subject: reqSubject.value,
      fromTime: reqFromTime.value.trim(),
      toTime: toTimeStr,
      reason: reqReason.value.trim()
    };

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Role": userRole,
          "X-User-Email": userEmail
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Gagal mengirim permohonan.");
      
      reqFromTime.value = "";
      reqToDate.value = "";
      reqToStart.value = "";
      reqToEnd.value = "";
      reqReason.value = "";
      reqSubject.selectedIndex = 0;
      
      fetchDBState();
      showNotice("Permohonan berhasil dikirim ke Admin Prodi.");
    } catch (err) {
      alert(err.message);
    }
  });

  // ================= GENETIC ALGORITHM RESOLUTION =================

  // Real Dynamic Backtracking Constraint Solver to resolve schedule overlaps
  function runBacktrackingGAAgent() {
    // 1. Gather all domains
    const availableRooms = ruangList.map(r => r.name);
    
    // 2. Clone schedules
    let newSchedules = JSON.parse(JSON.stringify(schedules));
    let solvedCount = 0;

    // Helper to check constraints for a slot placement
    function isPlacementValid(sched, day, slot, room, list) {
      return !list.some(other => {
        if (other.id === sched.id) return false;
        if (other.day === day && other.timeSlot === slot) {
          // Room conflict
          if (other.room === room) return true;
          // Lecturer conflict
          if (other.lecturer === sched.lecturer) return true;
        }
        return false;
      });
    }

    // 3. Try to resolve each conflicted item
    newSchedules.forEach(item => {
      // Find course to get the fixed day & slot (forcing alignment with master data)
      const mk = mkList.find(m => m.name === item.subject || m.code === item.code);
      const fixedDay = mk ? mk.day : item.day;
      const fixedSlot = mk ? mk.timeSlot : item.timeSlot;

      item.day = fixedDay;
      item.timeSlot = fixedSlot;

      // Recalculate status for this item first
      let hasConflict = newSchedules.some(other => {
        if (other.id === item.id) return false;
        return other.day === item.day && 
               other.timeSlot === item.timeSlot && 
               (other.room === item.room || other.lecturer === item.lecturer);
      });

      if (hasConflict) {
        let resolved = false;
        
        // Search available rooms for this specific course-bound schedule slot
        for (let r of availableRooms) {
          if (isPlacementValid(item, fixedDay, fixedSlot, r, newSchedules)) {
            item.room = r;
            item.status = "validated";
            item.details = "";
            resolved = true;
            solvedCount++;
            break;
          }
        }
      }
    });

    return { schedules: newSchedules, solvedCount };
  }

  // Trigger GA progress overlay and bulk-save resolved state to server
  function triggerGAScheduler() {
    if (userRole !== "admin") return;
    
    gaOverlay.classList.remove("d-none");
    gaProgressBar.style.width = "0%";
    gaProgressBar.setAttribute("aria-valuenow", 0);

    let progress = 0;
    const interval = setInterval(async () => {
      progress += 20;
      gaProgressBar.style.width = `${progress}%`;
      gaProgressBar.setAttribute("aria-valuenow", progress);

      if (progress >= 100) {
        clearInterval(interval);
        
        // Resolve schedules in memory
        const result = runBacktrackingGAAgent();
        
        try {
          // Bulk save to backend JSON db
          const res = await fetch("/api/schedules/bulk", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "X-User-Role": userRole,
              "X-User-Email": userEmail
            },
            body: JSON.stringify({ schedules: result.schedules })
          });

          if (!res.ok) throw new Error("Gagal sinkronisasi data GA ke database.");
          
          gaOverlay.classList.add("d-none");
          adminBanner.classList.add("d-none");
          
          fetchDBState();
          showNotice(`Penjadwalan otomatis sukses! Berhasil merelokasi ${result.solvedCount} bentrok.`);
        } catch (err) {
          gaOverlay.classList.add("d-none");
          alert(err.message);
        }
      }
    }, 150);
  }

  // Hook up GA resolution buttons
  bannerAutoBtn.addEventListener("click", triggerGAScheduler);
  bottomToastSolveBtn.addEventListener("click", triggerGAScheduler);
  bottomToastDismissBtn.addEventListener("click", () => {
    bottomConflictToast.classList.add("d-none");
  });

  // Helper notification toast
  function showNotice(msg) {
    successToastMsg.textContent = msg;
    successToast.show();
  }

  // Initial Boot
  initProfile();
  fetchDBState();

  // Poll database updates every 10 seconds (keep dashboard in sync)
  setInterval(fetchDBState, 10000);
});
