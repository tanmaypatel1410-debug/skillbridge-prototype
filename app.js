document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "/api/v1";
  const recruiterGrid = document.getElementById("recruiterGrid");
  const apiBadgeText = document.getElementById("apiStatusText");
  const apiBadge = document.getElementById("apiStatusBadge");

  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const toastNotification = document.getElementById("toastNotification");
  const toastMessage = document.getElementById("toastMessage");

  // Sidebar Items & Panels
  const sidebarItems = document.querySelectorAll(".sidebar-link, .nav-link, .dropdown-item");
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const leftSidebar = document.getElementById('leftSidebar');
if (sidebarToggleBtn && leftSidebar) {
  sidebarToggleBtn.addEventListener('click', () => {
    leftSidebar.classList.toggle('collapsed');
  });
}
  const viewPanels = document.querySelectorAll(".view-panel");

  // Open Access View Switcher
  function switchView(targetViewId) {
    sidebarItems.forEach(i => i.classList.remove("active"));
    viewPanels.forEach(p => p.classList.remove("active"));

    const activeItem = Array.from(sidebarItems).find(i => i.getAttribute("data-view") === targetViewId);
    if (activeItem) activeItem.classList.add("active");

    const activePanel = document.getElementById(targetViewId);
    if (activePanel) activePanel.classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });

    // Load View Specific Data
    if (targetViewId === "panel-admin-dashboard") fetchAdminDashboardData();
    if (targetViewId === "panel-hr-dashboard") fetchHrDashboardData();
  }

  sidebarItems.forEach(item => {
    item.addEventListener("click", () => {
      const targetView = item.getAttribute("data-view");
      if (targetView) switchView(targetView);
    });
  });

  // Auth Tabs (Login / Register Toggle)
  const authTabLoginBtn = document.getElementById("authTabLoginBtn");
  const authTabRegisterBtn = document.getElementById("authTabRegisterBtn");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (authTabLoginBtn && authTabRegisterBtn) {
    authTabLoginBtn.addEventListener("click", () => {
      authTabLoginBtn.classList.add("active");
      authTabRegisterBtn.classList.remove("active");
      authTabLoginBtn.style.background = "var(--primary-cyan)";
      authTabRegisterBtn.style.background = "transparent";
      loginForm.style.display = "block";
      registerForm.style.display = "none";
    });

    authTabRegisterBtn.addEventListener("click", () => {
      authTabRegisterBtn.classList.add("active");
      authTabLoginBtn.classList.remove("active");
      authTabRegisterBtn.style.background = "var(--accent-green)";
      authTabLoginBtn.style.background = "transparent";
      registerForm.style.display = "block";
      loginForm.style.display = "none";
    });
  }

  // Demo Login Shortcuts
  const btnStudentDemoLogin = document.getElementById("btnStudentDemoLogin");
  const btnAdminDemoLogin = document.getElementById("btnAdminDemoLogin");
  const loginEmailInput = document.getElementById("loginEmail");
  const loginPasswordInput = document.getElementById("loginPassword");

  if (btnStudentDemoLogin) {
    btnStudentDemoLogin.addEventListener("click", () => {
      loginEmailInput.value = "tanmay.patel@campusconnect.edu";
      loginPasswordInput.value = "Password123";
      submitLogin("tanmay.patel@campusconnect.edu", "Password123", "panel-student-dashboard");
    });
  }

  if (btnAdminDemoLogin) {
    btnAdminDemoLogin.addEventListener("click", () => {
      loginEmailInput.value = "admin@campusconnect.edu";
      loginPasswordInput.value = "AdminPass123";
      submitLogin("admin@campusconnect.edu", "AdminPass123", "panel-admin-dashboard");
    });
  }

  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitLogin(loginEmailInput.value.trim(), loginPasswordInput.value.trim(), "panel-student-dashboard");
    });
  }

  // Hero Floating Login Form (Landing Page Image Design)
  const heroLoginForm = document.getElementById("heroLoginForm");
  if (heroLoginForm) {
    heroLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("heroEmail").value.trim();
      const pass = document.getElementById("heroPassword").value.trim();
      const targetPanel = email.includes("admin") ? "panel-admin-dashboard" : "panel-student-dashboard";
      submitLogin(email, pass, targetPanel);
    });
  }

  async function submitLogin(email, password, redirectPanel) {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Invalid credentials");
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      showToast(`🔓 Authenticated as ${email}!`);
      switchView(redirectPanel);
    } catch (err) {
      showToast(`Login Error: ${err.message}`, true);
    }
  }

  // Register Form Submission
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const payload = {
          full_name: document.getElementById("regFullName").value.trim(),
          email: document.getElementById("regEmail").value.trim(),
          password: document.getElementById("regPassword").value.trim(),
          branch: document.getElementById("regBranch").value.trim() || "CSE",
          cgpa: parseFloat(document.getElementById("regCgpa").value) || 8.0,
          college: "XYZ College of Engineering",
          skills: "Java, Python, SQL"
        };

        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Registration failed");
        }

        showToast("🎉 Account created in SQLite! You can now log in.");
        authTabLoginBtn.click();
        loginEmailInput.value = payload.email;
        loginPasswordInput.value = payload.password;
      } catch (err) {
        showToast(`Registration Error: ${err.message}`, true);
      }
    });
  }

  // Helper Toast Notification
  function showToast(msg, isError = false) {
    if (!toastNotification) return;
    toastMessage.textContent = msg;
    const icon = document.getElementById("toastIcon");
    if (icon) {
      icon.className = isError ? "fa-solid fa-circle-xmark" : "fa-solid fa-circle-check";
      icon.style.color = isError ? "#f87171" : "#34d399";
    }
    toastNotification.classList.add("show");
    setTimeout(() => {
      toastNotification.classList.remove("show");
    }, 3500);
  }

  // Modal Controllers
  function openModal(title, contentHtml) {
    if (!modalOverlay) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = contentHtml;
    modalOverlay.classList.add("active");
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove("active");
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Check Backend Status
  async function checkBackendStatus() {
    try {
      const res = await fetch('/health');
      if (res.ok) {
        const compRes = await fetch(`${API_BASE}/companies`);
        const companies = await compRes.json();
        if (apiBadgeText && apiBadge) {
          apiBadgeText.textContent = `Online`;
          apiBadge.classList.remove("offline");
        }
      }
    } catch (err) {
      if (apiBadgeText && apiBadge) {
        apiBadgeText.textContent = `Offline`;
        apiBadge.classList.add("offline");
      }
    }
  }

  // Render company card
  function renderCompanyCard(company) {
    const deadlineDate = company.application_deadline
      ? new Date(company.application_deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "Soon";
    return `
      <div class="company-card" data-company-id="${company.id}">
        <div>
          <div class="card-top">
            <div class="company-logo-wrap">
              <img src="${company.logo_url || 'logo.jpeg'}" alt="${company.name} Logo" onerror="this.src='logo.jpeg'">
            </div>
            <div class="company-info">
              <h3>${company.name}</h3>
              <div class="ctc-package">₹${company.ctc_min} - ₹${company.ctc_max} LPA</div>
            </div>
          </div>

          <div class="card-tags">
            <span class="tag tag-eligibility"><i class="fa-solid fa-check"></i> ${company.eligibility_percent}%+ Eligible</span>
            <span class="tag tag-match"><i class="fa-solid fa-shield-halved"></i> ${company.match_percent || company.base_match_percent}% Match</span>
            <span class="tag tag-role">${company.roles}</span>
          </div>

          <div class="card-deadline">
            <i class="fa-regular fa-clock"></i> Deadline: ${deadlineDate}
          </div>
        </div>

        <button class="btn-card-apply" style="width:100%; border:none; cursor:pointer;" onclick="openCompanyModal(${company.id})">Explore & Apply <i class="fa-solid fa-chevron-right"></i></button>
      </div>
    `;
  }

  // Fetch Companies
  async function fetchCompanies() {
    if (!recruiterGrid) return;
    try {
      recruiterGrid.style.opacity = "0.5";
      const res = await fetch(`${API_BASE}/companies`);
      if (!res.ok) throw new Error("Failed to fetch API data");
      const companies = await res.json();
      recruiterGrid.style.opacity = "1";

      if (companies.length === 0) {
        recruiterGrid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted, #94a3b8);">
            <i class="fa-solid fa-building-circle-xmark" style="font-size: 3rem; margin-bottom: 15px;"></i>
            <h3>No companies match your search</h3>
          </div>
        `;
        return;
      }
      recruiterGrid.innerHTML = companies.map(renderCompanyCard).join("");
    } catch (err) {
      console.error("API error:", err);
      recruiterGrid.style.opacity = "1";
    }
  }

  // Modal: Company Drive
  window.openCompanyModal = async function(companyId) {
    try {
      const res = await fetch(`${API_BASE}/companies/${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch company");
      const company = await res.json();

      const html = `
        <div style="text-align: left;">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <img src="${company.logo_url || 'logo.jpeg'}" alt="${company.name}" style="width: 50px; height: 50px; object-fit: contain; background: #fff; border-radius: 8px; padding: 4px;">
            <div>
              <h4 style="font-size: 1.3rem; color: #fff; margin: 0;">${company.name} Drive</h4>
              <span style="color: var(--primary-cyan); font-weight: 600;">Package: ₹${company.ctc_min} - ₹${company.ctc_max} LPA</span>
            </div>
          </div>
          <p style="margin-bottom: 15px; color: #cbd5e1;">${company.description || 'Verified campus placement drive.'}</p>
          <button id="confirmApplyBtn" style="width:100%; background: linear-gradient(135deg, var(--primary-cyan), var(--primary-blue)); color:#fff; border:none; padding: 12px; border-radius: 8px; font-weight: 700; cursor: pointer;">
            <i class="fa-solid fa-paper-plane"></i> Submit Application via Backend API
          </button>
        </div>
      `;
      openModal(`${company.name} Placement Drive`, html);

      document.getElementById("confirmApplyBtn").addEventListener("click", () => {
        closeModal();
        showToast(`🎉 Application successfully submitted to ${company.name}!`);
      });
    } catch (err) {
      showToast("Could not load company details from backend API", true);
    }
  };

  // Fetch Admin Dashboard Data
  async function fetchAdminDashboardData() {
    try {
      const res = await fetch(`${API_BASE}/dashboard/admin`);
      if (res.ok) {
        const data = await res.json();
        console.log("Admin Dashboard Data:", data);
      }
    } catch (e) {
      console.log("Admin API error");
    }
  }

  // Fetch HR Dashboard Data
  async function fetchHrDashboardData() {
    try {
      const res = await fetch(`${API_BASE}/dashboard/hr`);
      if (res.ok) {
        const data = await res.json();
        console.log("HR Dashboard Data:", data);
      }
    } catch (e) {
      console.log("HR API error");
    }
  }

  // Initial Execution
  checkBackendStatus();
  fetchCompanies();
});
