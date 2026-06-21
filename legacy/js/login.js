document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorAlert = document.getElementById("login-error-alert");
  const errorMessage = document.getElementById("error-message");
  const submitBtn = document.getElementById("submit-btn");
  const forgotLink = document.getElementById("forgot-password-link");

  // Tab switching elements
  const tabLoginBtn = document.getElementById("tab-login-btn");
  const tabRegisterBtn = document.getElementById("tab-register-btn");
  const loginSection = document.getElementById("login-section");
  const registerSection = document.getElementById("register-section");

  // Register elements
  const registerForm = document.getElementById("register-form");
  const regNameInput = document.getElementById("reg-name");
  const regEmailInput = document.getElementById("reg-email");
  const regPasswordInput = document.getElementById("reg-password");
  const regRoleInput = document.getElementById("reg-role");
  const regAlert = document.getElementById("register-alert");
  const regAlertIcon = document.getElementById("register-alert-icon");
  const regAlertMsg = document.getElementById("register-alert-message");
  const regSubmitBtn = document.getElementById("reg-submit-btn");


  // Auth Tab Switchers
  tabLoginBtn.addEventListener("click", () => {
    tabLoginBtn.classList.add("active");
    tabRegisterBtn.classList.remove("active");
    loginSection.classList.remove("d-none");
    registerSection.classList.add("d-none");
  });

  tabRegisterBtn.addEventListener("click", () => {
    tabRegisterBtn.classList.add("active");
    tabLoginBtn.classList.remove("active");
    registerSection.classList.remove("d-none");
    loginSection.classList.add("d-none");
  });



  // Forgot password handler
  forgotLink.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Silakan hubungi Admin Prodi untuk reset password.");
  });

  // Login Submit Handler
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorAlert.classList.add("d-none");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError("Email dan password harus diisi.");
      return;
    }

    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span>Memproses...</span>
    `;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Kombinasi email atau password salah.");
      }

      // Save auth data to localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userName", data.name);
      
      window.location.href = "dashboard.html";
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  // Register Submit Handler
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    regAlert.classList.add("d-none");

    const name = regNameInput.value.trim();
    const email = regEmailInput.value.trim();
    const password = regPasswordInput.value;
    const role = regRoleInput.value;

    if (!name || !email || !password || !role) {
      showRegisterAlert("Semua form wajib diisi.", "danger");
      return;
    }

    regSubmitBtn.disabled = true;
    const originalText = regSubmitBtn.innerHTML;
    regSubmitBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span>Mendaftar...</span>
    `;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal membuat akun.");
      }

      showRegisterAlert("Registrasi sukses! Akun Anda siap digunakan.", "success");
      registerForm.reset();
      
      // Auto prefill login and switch tabs
      setTimeout(() => {
        tabLoginBtn.click();
        emailInput.value = email;
        passwordInput.value = password;
      }, 1500);

    } catch (err) {
      showRegisterAlert(err.message, "danger");
    } finally {
      regSubmitBtn.disabled = false;
      regSubmitBtn.innerHTML = originalText;
    }
  });

  function showError(msg) {
    errorMessage.textContent = msg;
    errorAlert.classList.remove("d-none");
    errorAlert.classList.add("d-flex");
  }

  function showRegisterAlert(msg, type) {
    regAlert.className = `alert alert-${type} d-flex align-items-center gap-2 py-2 px-3 mb-3`;
    regAlertMsg.textContent = msg;
    if (type === "success") {
      regAlertIcon.className = "bi bi-check-circle-fill";
    } else {
      regAlertIcon.className = "bi bi-exclamation-triangle-fill";
    }
    regAlert.classList.remove("d-none");
  }
});
