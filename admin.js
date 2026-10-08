// Zawiyah Admin Portal - Verification, Faculty Governance & Multi-Admin Engine

let currentSelectedAppId = null;
let currentFilterStatus = 'ALL';
let currentTeacherFilterStatus = 'ALL';
let currentSelectedTeacherId = null;

function getAdminAvatarMarkup(photo, name, sizeClasses = 'w-10 h-10 rounded-xl', fontClasses = 'text-xs') {
  if (photo && (photo.startsWith('data:image/') || photo.startsWith('http') || photo.startsWith('/'))) {
    return `<img src="${photo}" alt="${name || 'Avatar'}" class="${sizeClasses} object-cover border border-white/20 flex-shrink-0" />`;
  }
  const initials = (photo && photo.length <= 4) ? photo : (name ? name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() : 'TC');
  return `<div class="${sizeClasses} bg-accent-lavender text-tealbg-950 font-display font-bold ${fontClasses} flex items-center justify-center flex-shrink-0">${initials || 'TC'}</div>`;
}

function setAdminAvatarElement(el, photo, name) {
  if (!el) return;
  if (photo && (photo.startsWith('data:image/') || photo.startsWith('http') || photo.startsWith('/'))) {
    el.innerHTML = `<img src="${photo}" alt="${name || 'Profile'}" class="w-full h-full object-cover rounded-2xl" />`;
  } else {
    const initials = (photo && photo.length <= 4) ? photo : (name ? name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() : 'TC');
    el.textContent = initials || 'TC';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initAdminAuth();
  initAdminTabs();
  initAppFilters();
  initAppSearch();
  initTeacherSearchAndFilters();
  initStudentSearch();
  if (window.ZawiyahAuth && window.ZawiyahAuth.syncFromBackend) {
    await window.ZawiyahAuth.syncFromBackend();
  }
  renderAdminDashboard();
  renderApplicationsList();
  renderTeachersTable();
  renderStudentsRoster();
  renderStudentApplicationsList();
  renderClassesGrid();
  renderScheduleGrid();
  renderAdminUsersList();
  renderAuditLogs();
  renderAdminReviews();
});

// 1. Admin Authentication & Session Guard
function initAdminAuth() {
  const session = window.ZawiyahAuth ? window.ZawiyahAuth.getSession() : null;
  const isAdminLoggedIn = localStorage.getItem('zawiyah_admin_logged_in') === 'true' || sessionStorage.getItem('zawiyah_admin_logged_in') === 'true';

  if (!isAdminLoggedIn || !session || session.role !== 'ADMIN') {
    window.location.replace('admin-login.html');
    return;
  }

  // Update navbar with logged-in admin's initials and name
  const navAvatar = document.getElementById('adminNavAvatar');
  const navName = document.getElementById('adminNavName');
  if (navAvatar && session.name) {
    navAvatar.textContent = session.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD';
  }
  if (navName && session.name) {
    navName.textContent = session.name;
  }

  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out of the Admin Portal?')) {
        if (window.ZawiyahAuth) window.ZawiyahAuth.logout();
        window.location.replace('admin-login.html');
      }
    });
  }
}

// 2. Navigation Tabs Logic
function initAdminTabs() {
  const tabBtns = document.querySelectorAll('.admin-nav-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchAdminTab(tab);
    });
  });
}

function switchAdminTab(tabId, subFilter = null) {
  const tabBtns = document.querySelectorAll('.admin-nav-btn');
  const tabContents = document.querySelectorAll('.admin-tab-content');

  tabBtns.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  tabContents.forEach(content => {
    if (content.id === `admin-tab-${tabId}`) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });

  if (subFilter && tabId === 'applications') {
    setAppFilter(subFilter);
  }

  if (tabId === 'teachers') {
    if (subFilter) {
      setTeacherFilter(subFilter);
    } else {
      renderTeachersTable();
    }
  }

  if (tabId === 'students') {
    renderStudentsRoster();
  }

  if (tabId === 'classes') {
    renderClassesGrid();
  }

  if (tabId === 'schedule') {
    renderScheduleGrid();
  }

  if (tabId === 'admin-users') {
    renderAdminUsersList();
  }

  if (tabId === 'reviews') {
    renderAdminReviews();
  }

  if (window.lucide) window.lucide.createIcons();
}

// 3. Application Filters & Search
function initAppFilters() {
  const filterBtns = document.querySelectorAll('.app-filter-tab');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const status = btn.getAttribute('data-status');
      setAppFilter(status);
    });
  });
}

function setAppFilter(status) {
  currentFilterStatus = status;
  const filterBtns = document.querySelectorAll('.app-filter-tab');
  filterBtns.forEach(btn => {
    if (btn.getAttribute('data-status') === status) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderApplicationsList();
}

function initAppSearch() {
  const searchInput = document.getElementById('appSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderApplicationsList();
    });
  }
}

// 4. Render Dashboard Metrics & Recent Queue (Real Database Numbers)
function renderAdminDashboard() {
  const apps = window.ZawiyahAuth ? window.ZawiyahAuth.getApplications('ALL') : [];
  const teachers = window.ZawiyahAuth ? window.ZawiyahAuth.getTeachers() : [];
  const students = window.ZawiyahAuth ? window.ZawiyahAuth.getStudents() : [];
  const classes = window.ZawiyahAuth ? window.ZawiyahAuth.getClasses() : [];

  const pendingApps = apps.filter(a => a.status === 'PENDING');
  const approvedApps = apps.filter(a => a.status === 'ACTIVE' || a.status === 'APPROVED');
  const rejectedApps = apps.filter(a => a.status === 'REJECTED');
  const activeTeachers = teachers.filter(t => t.status === 'ACTIVE');

  const pendingEl = document.getElementById('metricPendingCount');
  const bannerPendingEl = document.getElementById('bannerPendingBadge');
  const tabPendingBadge = document.getElementById('tabPendingBadge');
  const teachersCountEl = document.getElementById('metricTeachersCount');
  const studentsCountEl = document.getElementById('metricStudentsCount');
  const classesCountEl = document.getElementById('metricClassesCount');
  const facultyCountEl = document.getElementById('facultyDirectoryCount');

  const countAllEl = document.getElementById('countAllApps');
  const countPendingEl = document.getElementById('countPendingApps');
  const countApprovedEl = document.getElementById('countApprovedApps');
  const countRejectedEl = document.getElementById('countRejectedApps');

  if (pendingEl) pendingEl.textContent = pendingApps.length;
  if (bannerPendingEl) bannerPendingEl.textContent = pendingApps.length;
  if (teachersCountEl) teachersCountEl.textContent = activeTeachers.length;
  if (studentsCountEl) studentsCountEl.textContent = students.length;
  if (classesCountEl) classesCountEl.textContent = classes.length;
  if (facultyCountEl) facultyCountEl.textContent = teachers.length;

  if (tabPendingBadge) {
    if (pendingApps.length > 0) {
      tabPendingBadge.textContent = pendingApps.length;
      tabPendingBadge.classList.remove('hidden');
    } else {
      tabPendingBadge.classList.add('hidden');
    }
  }

  if (countAllEl) countAllEl.textContent = apps.length;
  if (countPendingEl) countPendingEl.textContent = pendingApps.length;
  if (countApprovedEl) countApprovedEl.textContent = approvedApps.length;
  if (countRejectedEl) countRejectedEl.textContent = rejectedApps.length;

  // Real Database Website Visitor Count (Admin Only Protected Endpoint)
  const visitorsCountEl = document.getElementById('metricVisitorsCount');
  if (visitorsCountEl) {
    if (window.ZawiyahAuth && window.ZawiyahAuth.getVisitorCount) {
      window.ZawiyahAuth.getVisitorCount().then(res => {
        if (res && res.success && res.formattedCount) {
          visitorsCountEl.textContent = res.formattedCount;
        } else if (res && res.success && res.totalVisitors) {
          visitorsCountEl.textContent = Number(res.totalVisitors).toLocaleString();
        }
      }).catch(err => {
        console.warn('Could not load visitor count:', err);
      });
    }
  }

  // Render Recent Dashboard Applications
  const recentList = document.getElementById('dashboardRecentAppsList');
  if (recentList) {
    if (apps.length === 0) {
      recentList.innerHTML = `
        <div class="bg-tealbg-900/60 border border-white/10 rounded-2xl p-6 text-center space-y-1">
          <p class="text-sm font-semibold text-white">No teacher applications yet.</p>
          <p class="text-xs text-tealtext-300">Submitted teacher applications will appear here for verification.</p>
        </div>
      `;
      return;
    }

    const recentItems = apps.slice(0, 4);
    recentList.innerHTML = recentItems.map(app => {
      let badgeClass = 'bg-amber-400/20 text-amber-300 border border-amber-400/30';
      if (app.status === 'ACTIVE' || app.status === 'APPROVED') badgeClass = 'bg-accent-lime/20 text-accent-lime border border-accent-lime/30';
      if (app.status === 'REJECTED') badgeClass = 'bg-red-500/20 text-red-300 border border-red-400/30';

      const avatarMarkup = getAdminAvatarMarkup(app.photo, app.name, 'w-10 h-10 rounded-xl', 'text-sm');

      return `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-tealbg-900/80 border border-white/10 hover:border-white/20 transition-all">
          <div class="flex items-center gap-3.5">
            ${avatarMarkup}
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-sm font-semibold text-white">${app.name}</h4>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}">
                  ${app.status === 'ACTIVE' ? 'APPROVED' : app.status}
                </span>
                ${app.teacherId ? `<span class="text-[10px] font-mono text-accent-lime font-bold">(${app.teacherId})</span>` : ''}
              </div>
              <p class="text-xs text-tealtext-300">
                ${Array.isArray(app.subjects) ? app.subjects.join(', ') : app.subjects} • ${app.country || 'N/A'} • ${app.monthlyHours || '20 Hours/Month'} • Applied: ${app.appliedDate || 'Recent'}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 self-end sm:self-center">
            <button type="button" onclick="openAppDossierModal('${app.id}')" class="px-3.5 py-1.5 rounded-full text-xs font-semibold text-tealbg-950 bg-white hover:bg-tealtext-100 transition-all shadow-sm flex items-center gap-1">
              <i data-lucide="file-search" class="w-3.5 h-3.5"></i>
              <span>Review Details</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  if (window.lucide) window.lucide.createIcons();
}

// 5. Render Applications List
function renderApplicationsList() {
  const grid = document.getElementById('applicationsGrid');
  if (!grid) return;

  const apps = window.ZawiyahAuth ? window.ZawiyahAuth.getApplications('ALL') : [];
  const searchVal = (document.getElementById('appSearchInput')?.value || '').toLowerCase().trim();

  let filtered = apps;

  if (currentFilterStatus !== 'ALL') {
    if (currentFilterStatus === 'APPROVED') {
      filtered = filtered.filter(a => a.status === 'ACTIVE' || a.status === 'APPROVED');
    } else {
      filtered = filtered.filter(a => a.status === currentFilterStatus);
    }
  }

  if (searchVal) {
    filtered = filtered.filter(a => 
      a.name.toLowerCase().includes(searchVal) ||
      (a.phone && a.phone.toLowerCase().includes(searchVal)) ||
      (a.place && a.place.toLowerCase().includes(searchVal)) ||
      (a.country && a.country.toLowerCase().includes(searchVal)) ||
      (Array.isArray(a.subjects) ? a.subjects.join(' ').toLowerCase().includes(searchVal) : (a.subjects || '').toLowerCase().includes(searchVal)) ||
      (a.teacherId && a.teacherId.toLowerCase().includes(searchVal)) ||
      a.id.toLowerCase().includes(searchVal)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="bg-tealbg-800/60 border border-white/10 rounded-3xl p-10 text-center space-y-2">
        <i data-lucide="inbox" class="w-10 h-10 text-tealtext-400 mx-auto"></i>
        <h4 class="text-sm font-semibold text-white">No teacher applications yet.</h4>
        <p class="text-xs text-tealtext-300">Submitted registrations will appear here for verification and approval.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(app => {
    let badgeClass = 'bg-amber-400/20 text-amber-300 border border-amber-400/30';
    let statusIcon = 'clock';
    if (app.status === 'ACTIVE' || app.status === 'APPROVED') {
      badgeClass = 'bg-accent-lime/20 text-accent-lime border border-accent-lime/30';
      statusIcon = 'check-circle';
    } else if (app.status === 'REJECTED') {
      badgeClass = 'bg-red-500/20 text-red-300 border border-red-400/30';
      statusIcon = 'x-circle';
    }

    const avatarMarkup = getAdminAvatarMarkup(app.photo, app.name, 'w-12 h-12 rounded-2xl', 'text-base');
    const subjectsList = Array.isArray(app.subjects) ? app.subjects : [app.subjects];
    const daysList = Array.isArray(app.availableDays) ? app.availableDays.join(', ') : (app.availableDays || 'Flexible');

    return `
      <div class="bg-tealbg-800/90 border border-white/20 hover:border-white/30 rounded-3xl p-5 sm:p-6 transition-all shadow-md space-y-4">
        
        <!-- Header Row -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div class="flex items-center gap-3.5">
            ${avatarMarkup}
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-semibold text-white">${app.name}</h3>
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}">
                  <i data-lucide="${statusIcon}" class="w-3 h-3"></i>
                  <span>${app.status === 'ACTIVE' ? 'APPROVED' : app.status}</span>
                </span>
                ${app.teacherId ? `<span class="px-2 py-0.5 rounded-full bg-accent-lime/20 text-accent-lime font-mono text-[11px] font-bold">ID: ${app.teacherId}</span>` : ''}
              </div>
              <p class="text-xs text-tealtext-300 mt-0.5">
                App ID: <span class="font-mono text-white">${app.id}</span> • Applied: ${app.appliedDate || 'Recent'}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 self-end sm:self-center">
            <button type="button" onclick="openAppDossierModal('${app.id}')" class="px-4 py-1.5 rounded-full text-xs font-semibold text-tealbg-950 bg-white hover:bg-tealtext-100 transition-all shadow-sm flex items-center gap-1.5">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              <span>View Details</span>
            </button>
            ${app.status === 'PENDING' ? `
              <button type="button" onclick="confirmAndApproveTeacher('${app.id}')" class="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-tealbg-950 bg-accent-lime hover:bg-white transition-all shadow-sm flex items-center gap-1">
                <i data-lucide="check" class="w-3.5 h-3.5"></i>
                <span>Approve</span>
              </button>
              <button type="button" onclick="openQuickReject('${app.id}')" class="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-red-200 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 transition-all">
                <span>Reject</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span class="text-[10px] text-tealtext-400 uppercase font-semibold">Contact & Location</span>
            <p class="text-white font-medium truncate">${app.phone}</p>
            <p class="text-tealtext-200">${app.place || 'N/A'}, ${app.country || 'N/A'}</p>
          </div>

          <div>
            <span class="text-[10px] text-tealtext-400 uppercase font-semibold">Teaching Format & Duration</span>
            <p class="text-white font-medium">${app.classType || 'Group Class'} • ${app.dailyDuration || '60 Mins'}</p>
            <p class="text-accent-lime font-semibold">${app.monthlyHours || '20 Hours / Month'}</p>
          </div>

          <div>
            <span class="text-[10px] text-tealtext-400 uppercase font-semibold">Schedule & Days</span>
            <p class="text-white font-medium">${app.startTime || '17:00'} – ${app.endTime || '18:00'}</p>
            <p class="text-tealtext-200 truncate" title="${daysList}">${daysList}</p>
          </div>

          <div>
            <span class="text-[10px] text-tealtext-400 uppercase font-semibold">Subjects</span>
            <div class="flex flex-wrap gap-1 mt-1">
              ${subjectsList.map(s => `<span class="px-2 py-0.5 rounded-md bg-white/10 text-[10px] text-tealtext-100 font-medium">${s}</span>`).join('')}
            </div>
          </div>
        </div>

        ${app.studentName ? `
          <div class="flex items-center gap-2 flex-wrap text-xs bg-accent-lime/10 border border-accent-lime/30 p-3 rounded-2xl">
            <span class="px-2 py-0.5 rounded-md bg-accent-lime text-tealbg-950 font-bold text-[10px] uppercase">Learner</span>
            <span class="text-white font-semibold">${app.studentName}</span>
            <span class="text-tealtext-300">• Age: ${app.studentAge || 'N/A'}</span>
            <span class="text-tealtext-300">• ${app.studentPlace || ''}</span>
            <span class="px-2 py-0.5 rounded-full bg-white/10 text-accent-lime font-bold text-[10px] uppercase">${app.studentLevel || 'Foundation'}</span>
          </div>
        ` : ''}

        <!-- Experience Snippet -->
        <div class="text-xs text-tealtext-200 bg-tealbg-900/60 p-3 rounded-2xl border border-white/10">
          <span class="text-[10px] font-bold uppercase tracking-wider text-tealtext-400">Experience:</span>
          <span class="text-white font-normal ml-1">${app.experience || 'Not provided.'}</span>
          ${app.rejectionReason ? `<p class="mt-1.5 text-xs text-red-300 font-semibold"><span class="text-red-400 font-bold uppercase">Rejection Reason:</span> ${app.rejectionReason}</p>` : ''}
        </div>

      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

// 6. Application Dossier Modal
function openAppDossierModal(appId) {
  const app = window.ZawiyahAuth ? window.ZawiyahAuth.getApplicationById(appId) : null;
  if (!app) return;

  currentSelectedAppId = appId;
  const modal = document.getElementById('appDossierModal');
  if (!modal) return;

  setAdminAvatarElement(document.getElementById('modalApplicantInitials'), app.photo, app.name);
  document.getElementById('modalApplicantName').textContent = app.name;
  document.getElementById('modalAppMeta').textContent = `Application ID: ${app.id} • Applied on ${app.appliedDate || 'Recent'}`;
  
  const statusBadge = document.getElementById('modalAppStatusBadge');
  statusBadge.textContent = app.status === 'ACTIVE' ? 'APPROVED' : app.status;
  if (app.status === 'ACTIVE' || app.status === 'APPROVED') {
    statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-lime/20 text-accent-lime';
  } else if (app.status === 'REJECTED') {
    statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300';
  } else {
    statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300';
  }

  const phoneEl = document.getElementById('modalPhone');
  if (phoneEl) phoneEl.textContent = app.phone;

  const locEl = document.getElementById('modalLocation');
  if (locEl) locEl.textContent = `${app.place || 'N/A'}, ${app.country || 'N/A'}`;

  const appIdBadge = document.getElementById('modalAppIdBadge');
  if (appIdBadge) appIdBadge.textContent = app.id;

  document.getElementById('modalClassType').textContent = app.classType || 'Group Class';
  document.getElementById('modalDays').textContent = Array.isArray(app.availableDays) ? app.availableDays.join(', ') : (app.availableDays || 'Flexible');
  document.getElementById('modalTime').textContent = `${app.startTime || '17:00'} – ${app.endTime || '18:00'}`;
  document.getElementById('modalDailyDuration').textContent = app.dailyDuration || '60 Minutes (1.0 hr)';
  document.getElementById('modalWeeklyHours').textContent = app.weeklyHours || '5.0 Hours / Week';
  document.getElementById('modalMonthlyHours').textContent = app.monthlyHours || '20 Hours / Month';

  // Helper safe escaper
  const esc = (t) => t ? String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '';

  // Student details in dossier (Support Group Students list & One-to-One details)
  const studentSection = document.getElementById('modalStudentSection');
  if (studentSection) {
    const isGroup = (app.classType === 'Group Class' || app.classType === 'Both' || app.classType === 'Both Formats');
    const groupStus = Array.isArray(app.groupStudents) ? app.groupStudents.filter(s => s && s.name) : [];
    const otoStu = app.oneToOneStudent && app.oneToOneStudent.name ? app.oneToOneStudent : null;

    if (groupStus.length > 0 || otoStu) {
      let contentHtml = `
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-accent-lime flex items-center gap-1.5">
            <i data-lucide="users" class="w-3.5 h-3.5"></i>
            <span>${isGroup ? 'Group Class & Assigned Students' : 'Assigned Student Details'}</span>
          </span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-lime/20 text-accent-lime">
            ${app.classType || 'Group Class'}
          </span>
        </div>
      `;

      if (groupStus.length > 0) {
        contentHtml += `
          <div class="space-y-2 pt-1">
            <p class="text-[11px] font-semibold text-tealtext-200">Group Batch Cohort (${groupStus.length} / 8 Students):</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              ${groupStus.map((s, idx) => `
                <div class="p-2.5 rounded-xl bg-tealbg-950/80 border border-white/10 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-white text-xs">${idx + 1}. ${esc(s.name)}</span>
                    <span class="text-[10px] text-accent-lime font-mono">${esc(s.level || 'Foundation')}</span>
                  </div>
                  <p class="text-[11px] text-tealtext-300">
                    Age: <span class="text-white font-medium">${esc(s.age || 'N/A')}</span> | 
                    Phone: <span class="text-white font-mono">${esc(s.contact || 'N/A')}</span>
                  </p>
                  ${s.parentName || s.parentContact ? `
                    <p class="text-[10px] text-tealtext-400">
                      Parent: <span class="text-tealtext-100">${esc(s.parentName || 'N/A')}</span> (${esc(s.parentContact || 'N/A')})
                    </p>
                  ` : ''}
                  ${s.place ? `<p class="text-[10px] text-tealtext-400">Location: <span class="text-tealtext-100">${esc(s.place)}</span></p>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      if (otoStu) {
        contentHtml += `
          <div class="space-y-1.5 pt-2 border-t border-white/10">
            <p class="text-[11px] font-semibold text-accent-lime">One-to-One Mentorship Student:</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-tealbg-950/80 p-2.5 rounded-xl border border-white/10">
              <div><span class="text-[10px] text-tealtext-400 block">Name</span><p class="text-white font-medium">${esc(otoStu.name)}</p></div>
              <div><span class="text-[10px] text-tealtext-400 block">Age</span><p class="text-white font-medium">${esc(otoStu.age || 'N/A')}</p></div>
              <div><span class="text-[10px] text-tealtext-400 block">Parent</span><p class="text-tealtext-100 font-medium">${esc(otoStu.parentName || 'N/A')}</p></div>
              <div><span class="text-[10px] text-tealtext-400 block">Parent Phone</span><p class="text-accent-lime font-mono">${esc(otoStu.parentContact || 'N/A')}</p></div>
            </div>
          </div>
        `;
      }

      studentSection.innerHTML = contentHtml;
    } else {
      const sName = app.studentName || 'None specified';
      studentSection.innerHTML = `
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-accent-lime flex items-center gap-1.5">
            <i data-lucide="user-check" class="w-3.5 h-3.5"></i>
            <span>Assigned Student / Learner Details</span>
          </span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-lime/20 text-accent-lime">
            ${app.studentLevel || 'Foundation'}
          </span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div><span class="text-[10px] text-tealtext-400 uppercase font-semibold block">Student Name</span><p class="text-white font-medium">${esc(sName)}</p></div>
          <div><span class="text-[10px] text-tealtext-400 uppercase font-semibold block">Age</span><p class="text-white font-medium">${esc(app.studentAge || 'N/A')}</p></div>
          <div><span class="text-[10px] text-tealtext-400 uppercase font-semibold block">Place</span><p class="text-white font-medium">${esc(app.studentPlace || app.place || 'N/A')}</p></div>
          <div><span class="text-[10px] text-tealtext-400 uppercase font-semibold block">Learning Level</span><p class="text-accent-lime font-bold">${esc(app.studentLevel || 'Foundation')}</p></div>
        </div>
      `;
    }
  }

  const subjectsContainer = document.getElementById('modalSubjectsList');
  const subjectsList = Array.isArray(app.subjects) ? app.subjects : [app.subjects];
  subjectsContainer.innerHTML = subjectsList.map(s => `
    <span class="px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-xs text-white font-medium">
      ${s}
    </span>
  `).join('');

  document.getElementById('modalExperience').textContent = app.experience || 'None provided.';
  document.getElementById('modalNotes').textContent = app.notes || 'None provided.';

  // Banners
  const approvedBanner = document.getElementById('modalApprovedBanner');
  const rejectedBanner = document.getElementById('modalRejectedBanner');
  const assignedIdEl = document.getElementById('modalAssignedTeacherId');
  const rejectionReasonEl = document.getElementById('modalRejectionReason');
  const pendingActionBtns = document.getElementById('pendingActionBtns');
  const rejectionInputArea = document.getElementById('rejectionInputArea');

  rejectionInputArea.classList.add('hidden');

  if (app.status === 'ACTIVE' || app.status === 'APPROVED') {
    approvedBanner.classList.remove('hidden');
    rejectedBanner.classList.add('hidden');
    if (assignedIdEl) assignedIdEl.textContent = app.teacherId || 'Active';
    if (pendingActionBtns) pendingActionBtns.classList.add('hidden');
  } else if (app.status === 'REJECTED') {
    approvedBanner.classList.add('hidden');
    rejectedBanner.classList.remove('hidden');
    if (rejectionReasonEl) rejectionReasonEl.textContent = `Reason: ${app.rejectionReason || 'Criteria not met.'}`;
    if (pendingActionBtns) pendingActionBtns.classList.add('hidden');
  } else {
    approvedBanner.classList.add('hidden');
    rejectedBanner.classList.add('hidden');
    if (pendingActionBtns) pendingActionBtns.classList.remove('hidden');
  }

  // Setup Button Handlers
  const approveBtn = document.getElementById('approveTeacherBtn');
  const openRejectBtn = document.getElementById('openRejectBtn');
  const confirmRejectBtn = document.getElementById('confirmRejectBtn');

  if (approveBtn) {
    approveBtn.onclick = () => {
      confirmAndApproveTeacher(app.id);
    };
  }

  if (openRejectBtn) {
    openRejectBtn.onclick = () => {
      rejectionInputArea.classList.remove('hidden');
      document.getElementById('rejectionReasonInput').focus();
    };
  }

  if (confirmRejectBtn) {
    confirmRejectBtn.onclick = () => {
      const reason = document.getElementById('rejectionReasonInput').value.trim();
      handleRejectApplication(app.id, reason);
    };
  }

  modal.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeDossierModal() {
  const modal = document.getElementById('appDossierModal');
  if (modal) modal.classList.add('hidden');
  cancelRejectMode();
}

function cancelRejectMode() {
  const rejectionArea = document.getElementById('rejectionInputArea');
  if (rejectionArea) rejectionArea.classList.add('hidden');
}

// 7. Approve Application
async function confirmAndApproveTeacher(appId) {
  if (confirm('Approve this teacher application?')) {
    if (!window.ZawiyahAuth) return;
    const result = await window.ZawiyahAuth.approveTeacher(appId);

    if (result.success) {
      alert(`Teacher approved successfully.\n\nAssigned Teacher ID: ${result.teacher_id || result.teacherId}\nStatus: ACTIVE\n\nThe teacher can now log in via /teacher-login.`);
      closeDossierModal();
      renderAdminDashboard();
      renderApplicationsList();
      renderTeachersTable();
      renderClassesGrid();
      renderScheduleGrid();
      renderAuditLogs();
    } else {
      alert(result.message || 'Error approving application.');
    }
  }
}

// 8. Reject Application
function openQuickReject(appId) {
  const reason = prompt('Reason for rejection:');
  if (reason !== null && reason.trim()) {
    handleRejectApplication(appId, reason.trim());
  }
}

async function handleRejectApplication(appId, reason) {
  if (!window.ZawiyahAuth) return;
  const result = await window.ZawiyahAuth.rejectTeacher(appId, reason);

  if (result.success) {
    alert('Application status changed to REJECTED.');
    closeDossierModal();
    renderAdminDashboard();
    renderApplicationsList();
    renderAuditLogs();
  } else {
    alert(result.message || 'Error rejecting application.');
  }
}

// =============================================================================
// 9. TEACHERS DIRECTORY, STATUS MANAGEMENT & DOSSIER ENGINE
// =============================================================================

function initTeacherSearchAndFilters() {
  const searchInput = document.getElementById('teacherSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderTeachersTable();
    });
  }

  const filterTabs = document.querySelectorAll('.teacher-filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const status = tab.getAttribute('data-tstatus');
      setTeacherFilter(status);
    });
  });
}

function setTeacherFilter(status) {
  currentTeacherFilterStatus = status;
  const filterTabs = document.querySelectorAll('.teacher-filter-tab');
  filterTabs.forEach(tab => {
    if (tab.getAttribute('data-tstatus') === status) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  renderTeachersTable();
}

function getStatusBadgeMarkup(status) {
  switch (status) {
    case 'ACTIVE':
      return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-lime/20 text-accent-lime border border-accent-lime/30"><span class="w-1.5 h-1.5 rounded-full bg-accent-lime"></span>ACTIVE</span>`;
    case 'INACTIVE':
      return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>INACTIVE</span>`;
    case 'LEFT':
      return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-tealbg-950 text-tealtext-300 border border-white/20"><span class="w-1.5 h-1.5 rounded-full bg-tealtext-400"></span>LEFT</span>`;
    case 'SUSPENDED':
      return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-400/30"><span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>SUSPENDED</span>`;
    case 'PENDING':
      return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>PENDING</span>`;
    default:
      return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white">${status}</span>`;
  }
}

// Render Teachers Table
function renderTeachersTable() {
  const tbody = document.getElementById('teachersTableBody');
  if (!tbody) return;

  const allTeachers = window.ZawiyahAuth ? window.ZawiyahAuth.getTeachers() : [];
  const searchVal = (document.getElementById('teacherSearchInput')?.value || '').toLowerCase().trim();

  // Update filter counts
  const cAll = document.getElementById('countTAll');
  const cActive = document.getElementById('countTActive');
  const cInactive = document.getElementById('countTInactive');
  const cLeft = document.getElementById('countTLeft');
  const cSuspended = document.getElementById('countTSuspended');
  const facultyCountEl = document.getElementById('facultyDirectoryCount');

  if (cAll) cAll.textContent = allTeachers.length;
  if (cActive) cActive.textContent = allTeachers.filter(t => t.status === 'ACTIVE').length;
  if (cInactive) cInactive.textContent = allTeachers.filter(t => t.status === 'INACTIVE').length;
  if (cLeft) cLeft.textContent = allTeachers.filter(t => t.status === 'LEFT').length;
  if (cSuspended) cSuspended.textContent = allTeachers.filter(t => t.status === 'SUSPENDED').length;
  if (facultyCountEl) facultyCountEl.textContent = allTeachers.length;

  let filtered = allTeachers;

  if (currentTeacherFilterStatus !== 'ALL') {
    filtered = filtered.filter(t => t.status === currentTeacherFilterStatus);
  }

  if (searchVal) {
    filtered = filtered.filter(t => {
      const subjectsStr = Array.isArray(t.subjects) ? t.subjects.join(' ').toLowerCase() : (t.subjects || '').toLowerCase();
      const classesStr = Array.isArray(t.assignedClasses) ? t.assignedClasses.join(' ').toLowerCase() : (t.assignedClasses || '').toLowerCase();
      return (
        t.name.toLowerCase().includes(searchVal) ||
        t.id.toLowerCase().includes(searchVal) ||
        t.email.toLowerCase().includes(searchVal) ||
        (t.phone && t.phone.toLowerCase().includes(searchVal)) ||
        (t.place && t.place.toLowerCase().includes(searchVal)) ||
        (t.country && t.country.toLowerCase().includes(searchVal)) ||
        subjectsStr.includes(searchVal) ||
        classesStr.includes(searchVal)
      );
    });
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="py-12 text-center text-tealtext-300 space-y-2">
          <i data-lucide="graduation-cap" class="w-8 h-8 text-tealtext-400 mx-auto"></i>
          <p class="text-sm font-semibold text-white">No teachers added yet.</p>
          <p class="text-xs text-tealtext-300">Approved teachers will appear here once verified.</p>
        </td>
      </tr>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  tbody.innerHTML = filtered.map(t => {
    const avatarMarkup = getAdminAvatarMarkup(t.photo, t.name, 'w-9 h-9 rounded-xl', 'text-xs');
    const subjects = Array.isArray(t.subjects) && t.subjects.length > 0 ? t.subjects.slice(0, 2).join(', ') + (t.subjects.length > 2 ? ` +${t.subjects.length - 2}` : '') : (t.subjects || 'General');
    const assignedClasses = Array.isArray(t.assignedClasses) && t.assignedClasses.length > 0 ? t.assignedClasses.slice(0, 2).join(' • ') + (t.assignedClasses.length > 2 ? ` +${t.assignedClasses.length - 2}` : '') : 'None Assigned';
    const activeSt = t.activeStudents !== undefined ? t.activeStudents : 0;
    const totalSt = (t.activeStudents || 0) + (t.previousStudents || 0);
    const joinedDate = t.joinedDate || t.startDate || 'Recent';

    return `
      <tr class="hover:bg-tealbg-900/60 transition-colors">
        <td class="py-3.5 px-3">
          ${avatarMarkup}
        </td>
        <td class="py-3.5 px-3 font-mono font-bold text-accent-lime whitespace-nowrap">
          ${t.id}
        </td>
        <td class="py-3.5 px-4">
          <button type="button" onclick="openTeacherFullProfileModal('${t.id}')" class="text-left group">
            <span class="font-semibold text-white group-hover:text-accent-lime group-hover:underline transition-colors block text-xs">
              ${t.name}
            </span>
            <span class="text-[11px] text-tealtext-400 block truncate max-w-[170px]">${t.phone || 'Faculty'} • ${t.place || t.country || ''}</span>
          </button>
        </td>
        <td class="py-3.5 px-4 text-white font-medium whitespace-nowrap">
          ${subjects}
        </td>
        <td class="py-3.5 px-4 text-tealtext-200 whitespace-nowrap">
          ${assignedClasses}
        </td>
        <td class="py-3.5 px-3 whitespace-nowrap">
          <span class="font-semibold text-accent-lime">${activeSt}</span>
          <span class="text-tealtext-400 text-[11px]">/ ${totalSt}</span>
        </td>
        <td class="py-3.5 px-3 whitespace-nowrap">
          ${getStatusBadgeMarkup(t.status)}
        </td>
        <td class="py-3.5 px-3 text-tealtext-300 whitespace-nowrap">
          ${joinedDate}
        </td>
        <td class="py-3.5 px-4 text-right whitespace-nowrap">
          <div class="inline-flex items-center gap-1.5">
            <button 
              type="button" 
              onclick="openTeacherFullProfileModal('${t.id}')" 
              class="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1"
              title="View full teacher dossier"
            >
              <i data-lucide="eye" class="w-3 h-3"></i>
              <span>Profile</span>
            </button>
            <button 
              type="button" 
              onclick="openManageStatusModal('${t.id}')" 
              class="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-tealbg-950 bg-accent-lime hover:bg-white transition-all shadow-sm flex items-center gap-1"
              title="Change teacher status"
            >
              <i data-lucide="shield-alert" class="w-3 h-3"></i>
              <span>Status</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

// 10. Teacher Profile Modal
function openTeacherFullProfileModal(teacherId) {
  const teacher = window.ZawiyahAuth ? window.ZawiyahAuth.getTeacherById(teacherId) : null;
  if (!teacher) return;

  currentSelectedTeacherId = teacherId;
  const modal = document.getElementById('teacherFullProfileModal');
  if (!modal) return;

  setAdminAvatarElement(document.getElementById('tProfAvatar'), teacher.photo, teacher.name);
  document.getElementById('tProfFullName').textContent = teacher.name;
  
  const statusBadge = document.getElementById('tProfStatusBadge');
  statusBadge.textContent = teacher.status;
  if (teacher.status === 'ACTIVE') {
    statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-lime/20 text-accent-lime border border-accent-lime/30';
  } else if (teacher.status === 'INACTIVE') {
    statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30';
  } else if (teacher.status === 'LEFT') {
    statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-tealbg-950 text-tealtext-300 border border-white/20';
  } else if (teacher.status === 'SUSPENDED') {
    statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-400/30';
  }

  document.getElementById('tProfSubMeta').textContent = `Faculty ID: ${teacher.id} • Joined: ${teacher.joinedDate || teacher.startDate || 'Recent'}`;

  document.getElementById('tProfNameVal').textContent = teacher.name;
  document.getElementById('tProfIdVal').textContent = teacher.id;
  document.getElementById('tProfPhoneVal').textContent = teacher.phone || 'N/A';
  document.getElementById('tProfLocVal').textContent = `${teacher.place || 'N/A'}, ${teacher.country || 'N/A'}`;

  document.getElementById('tProfSubjectsVal').textContent = Array.isArray(teacher.subjects) && teacher.subjects.length > 0 ? teacher.subjects.join(', ') : (teacher.subjects || 'General');
  document.getElementById('tProfClassTypeVal').textContent = teacher.classType || 'Group Class';
  document.getElementById('tProfTeachingStatusVal').textContent = teacher.status;
  document.getElementById('tProfTeachingStatusVal').className = teacher.status === 'ACTIVE' ? 'text-accent-lime font-bold' : (teacher.status === 'LEFT' ? 'text-tealtext-300 font-bold' : 'text-amber-300 font-bold');
  document.getElementById('tProfStartDateVal').textContent = teacher.startDate || teacher.joinedDate || 'Recent';
  document.getElementById('tProfExpVal').textContent = teacher.experience || 'Experienced Educator';

  const daysStr = Array.isArray(teacher.availableDays) ? teacher.availableDays.join(', ') : (teacher.availableDays || 'Flexible');
  document.getElementById('tProfDaysVal').textContent = daysStr;
  document.getElementById('tProfTimeVal').textContent = `${teacher.startTime || '17:00'} – ${teacher.endTime || '18:00'}`;
  document.getElementById('tProfDailyDurVal').textContent = teacher.dailyDuration || '60 Minutes';
  document.getElementById('tProfWeeklyHoursVal').textContent = teacher.weeklyHours || '5.0 Hours / Week';
  document.getElementById('tProfMonthlyHoursVal').textContent = teacher.monthlyHours || '20 Hours / Month';

  const classesStr = Array.isArray(teacher.assignedClasses) && teacher.assignedClasses.length > 0 ? teacher.assignedClasses.join(', ') : 'None assigned yet';
  document.getElementById('tProfAssignedClassesVal').textContent = classesStr;
  document.getElementById('tProfActiveStudentsVal').textContent = `${teacher.activeStudents || 0} Active`;
  document.getElementById('tProfPrevStudentsVal').textContent = `${teacher.previousStudents || 0} Historical Students`;
  document.getElementById('tProfAttRatingVal').textContent = teacher.attendanceRate || '100%';

  const historyContainer = document.getElementById('tProfStatusHistoryList');
  if (historyContainer) {
    const history = teacher.statusHistory || [];
    if (history.length === 0) {
      historyContainer.innerHTML = `<p class="text-xs text-tealtext-300">Initial active faculty registration.</p>`;
    } else {
      historyContainer.innerHTML = history.map(item => `
        <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-tealbg-950/70 border border-white/10 text-xs">
          <div class="mt-0.5 w-2 h-2 rounded-full ${item.to === 'ACTIVE' ? 'bg-accent-lime' : (item.to === 'LEFT' ? 'bg-tealtext-400' : (item.to === 'SUSPENDED' ? 'bg-red-400' : 'bg-amber-400'))}"></div>
          <div class="flex-1">
            <div class="flex items-center justify-between gap-2">
              <span class="font-semibold text-white text-[11px]">${item.from} → <span class="text-accent-lime">${item.to}</span></span>
              <span class="text-[10px] text-tealtext-400 font-mono">${item.date} by ${item.by || 'Admin'}</span>
            </div>
            <p class="text-tealtext-200 text-[11px] mt-0.5">${item.reason}</p>
          </div>
        </div>
      `).join('');
    }
  }

  const manageBtn = document.getElementById('tProfManageStatusBtn');
  const editBtn = document.getElementById('tProfEditBtn');

  if (manageBtn) {
    manageBtn.onclick = () => {
      openManageStatusModal(teacher.id);
    };
  }

  if (editBtn) {
    editBtn.onclick = () => {
      openEditTeacherModal(teacher.id);
    };
  }

  modal.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeTeacherFullProfileModal() {
  const modal = document.getElementById('teacherFullProfileModal');
  if (modal) modal.classList.add('hidden');
}

// 11. Manage Status Modal
function openManageStatusModal(teacherId) {
  const teacher = window.ZawiyahAuth ? window.ZawiyahAuth.getTeacherById(teacherId) : null;
  if (!teacher) return;

  currentSelectedTeacherId = teacherId;
  const modal = document.getElementById('manageStatusModal');
  if (!modal) return;

  document.getElementById('manageStatusTargetTeacher').innerHTML = `
    Teacher: <strong class="text-white">${teacher.name}</strong> (<span class="font-mono text-accent-lime">${teacher.id}</span>)<br/>
    Current Status: <span class="font-bold text-accent-lime">${teacher.status}</span>
  `;

  document.getElementById('statusReasonInput').value = '';

  const buttonsContainer = document.getElementById('statusButtonsGrid');
  if (!buttonsContainer) return;

  let actionButtons = [];

  if (teacher.status === 'ACTIVE') {
    actionButtons = [
      {
        label: 'Mark as INACTIVE (Temporary Leave)',
        desc: 'Temporarily pause teaching duties. Login access disabled until reactivated.',
        targetStatus: 'INACTIVE',
        btnClass: 'bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-tealbg-950 border border-amber-400/40'
      },
      {
        label: 'Mark as LEFT (Stopped Teaching)',
        desc: 'Teacher has stopped teaching at Zawiyah. Preserves historical records and disables portal access.',
        targetStatus: 'LEFT',
        btnClass: 'bg-tealbg-950 text-tealtext-200 hover:bg-white hover:text-tealbg-950 border border-white/20'
      },
      {
        label: 'SUSPEND Teacher Access',
        desc: 'Immediately revoke portal login access for disciplinary review.',
        targetStatus: 'SUSPENDED',
        btnClass: 'bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white border border-red-400/40'
      }
    ];
  } else if (teacher.status === 'INACTIVE') {
    actionButtons = [
      {
        label: 'Reactivate Teacher (Set to ACTIVE)',
        desc: 'Restore teaching status and immediately enable Teacher Portal access.',
        targetStatus: 'ACTIVE',
        btnClass: 'bg-accent-lime text-tealbg-950 hover:bg-white font-bold'
      },
      {
        label: 'Mark as LEFT (Stopped Teaching)',
        desc: 'Record that the faculty member has departed Zawiyah.',
        targetStatus: 'LEFT',
        btnClass: 'bg-tealbg-950 text-tealtext-200 hover:bg-white hover:text-tealbg-950 border border-white/20'
      },
      {
        label: 'SUSPEND Teacher Access',
        desc: 'Disciplinary suspension.',
        targetStatus: 'SUSPENDED',
        btnClass: 'bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white border border-red-400/40'
      }
    ];
  } else if (teacher.status === 'LEFT') {
    actionButtons = [
      {
        label: 'Reactivate Teacher (Restore to ACTIVE)',
        desc: 'Teacher is returning to Zawiyah. Restores active status and unlocks portal access.',
        targetStatus: 'ACTIVE',
        btnClass: 'bg-accent-lime text-tealbg-950 hover:bg-white font-bold'
      },
      {
        label: 'Change to INACTIVE',
        desc: 'Mark as on leave.',
        targetStatus: 'INACTIVE',
        btnClass: 'bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-tealbg-950 border border-amber-400/40'
      }
    ];
  } else if (teacher.status === 'SUSPENDED') {
    actionButtons = [
      {
        label: 'Reactivate Teacher (Restore to ACTIVE)',
        desc: 'Lift suspension and re-enable Teacher Portal access.',
        targetStatus: 'ACTIVE',
        btnClass: 'bg-accent-lime text-tealbg-950 hover:bg-white font-bold'
      },
      {
        label: 'Mark as LEFT',
        desc: 'Conclude engagement and mark as departed.',
        targetStatus: 'LEFT',
        btnClass: 'bg-tealbg-950 text-tealtext-200 hover:bg-white hover:text-tealbg-950 border border-white/20'
      }
    ];
  }

  buttonsContainer.innerHTML = actionButtons.map((btn, idx) => `
    <button 
      type="button" 
      onclick="executeTeacherStatusChange('${teacher.id}', '${btn.targetStatus}', ${idx})" 
      class="w-full text-left p-3.5 rounded-2xl ${btn.btnClass} transition-all space-y-1 block shadow-sm"
    >
      <div class="flex items-center justify-between">
        <span class="font-bold text-xs uppercase tracking-wider">${btn.label}</span>
        <i data-lucide="arrow-right" class="w-4 h-4"></i>
      </div>
      <p class="text-[11px] opacity-80 leading-snug font-normal">${btn.desc}</p>
    </button>
  `).join('');

  modal.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function executeTeacherStatusChange(teacherId, targetStatus, btnIndex) {
  const teacher = window.ZawiyahAuth ? window.ZawiyahAuth.getTeacherById(teacherId) : null;
  if (!teacher) return;

  const reason = document.getElementById('statusReasonInput').value.trim();

  let confirmMsg = `Are you sure you want to change status of ${teacher.name} (${teacher.id}) to ${targetStatus}?`;
  if (targetStatus === 'LEFT') {
    confirmMsg = `Are you sure you want to mark ${teacher.name} (${teacher.id}) as LEFT?\n\nThis will immediately disable their Teacher Portal login access while retaining all historical records.`;
  } else if (targetStatus === 'ACTIVE') {
    confirmMsg = `Reactivate ${teacher.name} (${teacher.id}) as ACTIVE?\n\nTheir Teacher Portal access will be restored immediately.`;
  } else if (targetStatus === 'SUSPENDED') {
    confirmMsg = `Suspend ${teacher.name} (${teacher.id})?\n\nPortal access will be blocked immediately.`;
  }

  if (!confirm(confirmMsg)) return;

  const defaultNotes = reason || (targetStatus === 'LEFT' ? 'Faculty member concluded teaching at Zawiyah' : (targetStatus === 'ACTIVE' ? 'Reactivated by administration' : 'Status updated by administrator'));

  const result = window.ZawiyahAuth.updateTeacherStatus(teacherId, targetStatus, defaultNotes);

  if (result.success) {
    alert(`Status updated successfully.\n\nTeacher: ${teacher.name} (${teacher.id})\nNew Status: ${targetStatus}\n\n${targetStatus === 'ACTIVE' ? 'Portal access: ACTIVE' : 'Portal access: DISABLED'}`);
    closeManageStatusModal();
    renderTeachersTable();
    renderAdminDashboard();
    renderClassesGrid();
    renderScheduleGrid();
    renderAuditLogs();

    const profileModal = document.getElementById('teacherFullProfileModal');
    if (profileModal && !profileModal.classList.contains('hidden')) {
      openTeacherFullProfileModal(teacherId);
    }
  } else {
    alert(result.message || 'Error updating teacher status.');
  }
}

function closeManageStatusModal() {
  const modal = document.getElementById('manageStatusModal');
  if (modal) modal.classList.add('hidden');
}

// 12. Edit Teacher Modal
function openEditTeacherModal(teacherId) {
  const teacher = window.ZawiyahAuth ? window.ZawiyahAuth.getTeacherById(teacherId) : null;
  if (!teacher) return;

  currentSelectedTeacherId = teacherId;
  const modal = document.getElementById('editTeacherModal');
  if (!modal) return;

  document.getElementById('editTeacherIdTitle').textContent = `Editing: ${teacher.name} (${teacher.id})`;
  document.getElementById('editTeacherName').value = teacher.name || '';
  document.getElementById('editTeacherPhone').value = teacher.phone || '';
  document.getElementById('editTeacherCountry').value = teacher.country || '';
  document.getElementById('editTeacherPlace').value = teacher.place || '';
  document.getElementById('editTeacherSubjects').value = Array.isArray(teacher.subjects) ? teacher.subjects.join(', ') : (teacher.subjects || '');
  document.getElementById('editTeacherExperience').value = teacher.experience || '';

  const form = document.getElementById('editTeacherForm');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const updatedData = {
        name: document.getElementById('editTeacherName').value.trim(),
        phone: document.getElementById('editTeacherPhone').value.trim(),
        country: document.getElementById('editTeacherCountry').value.trim(),
        place: document.getElementById('editTeacherPlace').value.trim(),
        subjects: document.getElementById('editTeacherSubjects').value.split(',').map(s => s.trim()).filter(Boolean),
        experience: document.getElementById('editTeacherExperience').value.trim()
      };

      const res = window.ZawiyahAuth.updateTeacherDetails(teacherId, updatedData);
      if (res.success) {
        alert('Teacher profile updated successfully.');
        closeEditTeacherModal();
        renderTeachersTable();
        if (currentSelectedTeacherId === teacherId) {
          openTeacherFullProfileModal(teacherId);
        }
      } else {
        alert(res.message || 'Error updating teacher.');
      }
    };
  }

  modal.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeEditTeacherModal() {
  const modal = document.getElementById('editTeacherModal');
  if (modal) modal.classList.add('hidden');
}

// 13. Student Search & Filtering
let currentStudentSearchQuery = '';

function initStudentSearch() {
  const searchInput = document.getElementById('studentSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentStudentSearchQuery = searchInput.value.trim().toLowerCase();
      renderStudentsRoster();
    });
  }
}

// 13a. Render Students Roster (Approved & Active Enrolled Students)
function renderStudentsRoster() {
  const tbody = document.getElementById('adminStudentsTableBody');
  if (!tbody) return;

  const rawStudents = window.ZawiyahAuth ? window.ZawiyahAuth.getStudents() : [];
  
  // Filter by search query if any
  const students = rawStudents.filter(s => {
    if (!currentStudentSearchQuery) return true;
    const q = currentStudentSearchQuery;
    const daysStr = Array.isArray(s.classDays) ? s.classDays.join(' ').toLowerCase() : (s.classDays || '').toLowerCase();
    return (
      (s.id && s.id.toLowerCase().includes(q)) ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      (s.course && s.course.toLowerCase().includes(q)) ||
      (s.level && s.level.toLowerCase().includes(q)) ||
      (s.place && s.place.toLowerCase().includes(q)) ||
      daysStr.includes(q)
    );
  });

  if (students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="py-12 text-center text-tealtext-300 space-y-2">
          <i data-lucide="users" class="w-8 h-8 text-tealtext-400 mx-auto"></i>
          <p class="text-sm font-semibold text-white">No enrolled students found.</p>
          <p class="text-xs text-tealtext-300">Enrolled student records will appear here once applications are approved.</p>
        </td>
      </tr>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  tbody.innerHTML = students.map(s => {
    const courseName = s.course || s.level || 'Quran & Tajweed';
    const daysArray = Array.isArray(s.classDays) ? s.classDays : (s.classDays ? [s.classDays] : ['Mon', 'Wed', 'Fri']);
    const daysBadges = daysArray.map(d => `<span class="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-tealtext-100 font-mono">${d}</span>`).join(' ');
    const duration = s.dailyDuration || '60 Minutes';
    const classType = s.classType || 'Group Class';
    const status = s.status || 'ACTIVE';

    return `
      <tr class="hover:bg-tealbg-900/60 transition-colors">
        <td class="py-3.5 px-3 font-mono font-bold text-accent-lime whitespace-nowrap">
          ${s.id}
        </td>
        <td class="py-3.5 px-4">
          <button type="button" onclick="openStudentFullProfileModal('${s.id}')" class="text-left group">
            <span class="font-semibold text-white group-hover:text-accent-lime group-hover:underline transition-colors block text-xs">
              ${s.name}
            </span>
            <span class="text-[11px] text-tealtext-400 block truncate max-w-[150px]">${s.place || 'Student'}</span>
          </button>
        </td>
        <td class="py-3.5 px-4 text-tealtext-200 font-mono text-[11px] whitespace-nowrap">
          ${s.phone || 'N/A'}
        </td>
        <td class="py-3.5 px-4 text-white font-medium whitespace-nowrap">
          ${courseName}
        </td>
        <td class="py-3.5 px-3 whitespace-nowrap">
          <div class="flex items-center gap-1">${daysBadges}</div>
        </td>
        <td class="py-3.5 px-3 text-tealtext-200 whitespace-nowrap text-[11px]">
          ${duration}
        </td>
        <td class="py-3.5 px-3 text-tealtext-200 whitespace-nowrap text-[11px]">
          ${classType}
        </td>
        <td class="py-3.5 px-3 whitespace-nowrap">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === 'ACTIVE' ? 'bg-accent-lime/20 text-accent-lime border border-accent-lime/30' : (status.includes('PENDING') ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-rose-500/20 text-rose-300 border border-rose-400/30')}">
            <span class="w-1.5 h-1.5 rounded-full ${status === 'ACTIVE' ? 'bg-accent-lime' : (status.includes('PENDING') ? 'bg-amber-300' : 'bg-rose-400')}"></span>
            <span>${status}</span>
          </span>
        </td>
        <td class="py-3.5 px-4 text-right whitespace-nowrap">
          <div class="inline-flex items-center gap-1.5">
            <button 
              type="button" 
              onclick="openStudentFullProfileModal('${s.id}')" 
              class="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1"
              title="View student profile"
            >
              <i data-lucide="eye" class="w-3 h-3"></i>
              <span>Profile</span>
            </button>
            <button 
              type="button" 
              onclick="openEditStudentModal('${s.id}')" 
              class="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-tealbg-950 bg-accent-lime hover:bg-white transition-all shadow-sm flex items-center gap-1"
              title="Edit student details"
            >
              <i data-lucide="edit" class="w-3 h-3"></i>
              <span>Edit</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

// 13b. Render Student Admissions Approval Queue
function renderStudentApplicationsList() {
  const tbody = document.getElementById('adminStudentAppsTableBody');
  const badge = document.getElementById('studentPendingBadge');
  if (!tbody) return;

  const rawApps = window.ZawiyahAuth ? window.ZawiyahAuth.getStudentApplications('ALL') : [];
  const apps = rawApps.filter(a => a.status === 'PENDING' || a.status === 'PENDING APPROVAL' || !a.status);
  
  if (badge) badge.textContent = apps.length;

  if (apps.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="py-8 text-center text-tealtext-300 space-y-1">
          <p class="text-xs font-semibold text-white">No pending student registration requests.</p>
          <p class="text-[11px] text-tealtext-400">New student registrations from the Student Portal will appear here for verification and 1-click activation.</p>
        </td>
      </tr>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  tbody.innerHTML = apps.map(app => {
    const studentId = app.studentId || app.id || 'Pending';
    const courseName = app.course || app.level || 'Quran & Tajweed';
    const daysArray = Array.isArray(app.classDays) ? app.classDays : (app.classDays ? [app.classDays] : ['Mon', 'Wed', 'Fri']);
    const daysBadges = daysArray.map(d => `<span class="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-tealtext-100 font-mono">${d}</span>`).join(' ');
    const duration = app.dailyDuration || '60 Minutes';
    const classType = app.classType || 'Group Class';

    return `
      <tr class="hover:bg-white/5 transition-colors">
        <td class="py-3.5 px-3 font-mono font-bold text-accent-lime whitespace-nowrap">${studentId}</td>
        <td class="py-3.5 px-4 font-semibold text-white text-xs">${app.name}</td>
        <td class="py-3.5 px-4 font-mono text-xs text-white">${app.phone || 'N/A'}</td>
        <td class="py-3.5 px-4 text-xs font-medium text-white whitespace-nowrap">${courseName}</td>
        <td class="py-3.5 px-3 whitespace-nowrap"><div class="flex items-center gap-1">${daysBadges}</div></td>
        <td class="py-3.5 px-3 text-tealtext-200 text-xs whitespace-nowrap">${duration}</td>
        <td class="py-3.5 px-3 text-tealtext-200 text-xs whitespace-nowrap">${classType}</td>
        <td class="py-3.5 px-3 whitespace-nowrap">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
            Pending
          </span>
        </td>
        <td class="py-3.5 px-3 text-tealtext-300 text-xs font-mono whitespace-nowrap">${app.appliedDate || 'Recent'}</td>
        <td class="py-3.5 px-4 text-center whitespace-nowrap">
          <div class="inline-flex items-center gap-2">
            <button type="button" onclick="confirmAndApproveStudent('${app.id || app.studentId}')" class="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-accent-lime text-tealbg-950 hover:bg-white transition-all shadow-sm flex items-center gap-1">
              <i data-lucide="check" class="w-3.5 h-3.5"></i>
              <span>Approve</span>
            </button>
            <button type="button" onclick="handleRejectStudent('${app.id || app.studentId}')" class="px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-red-300 hover:bg-red-500/20 border border-red-400/30 transition-all">
              Reject
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

async function confirmAndApproveStudent(appId) {
  if (confirm('Approve this student admission application and activate account?')) {
    if (!window.ZawiyahAuth) return;
    const res = await window.ZawiyahAuth.approveStudent(appId);
    if (res.success) {
      alert(`Student account activated successfully!\n\nAssigned Student ID: ${res.student_id}\nStatus: ACTIVE\n\nThe student can now log in directly via the Student Portal.`);
      if (window.ZawiyahAuth.syncFromBackend) await window.ZawiyahAuth.syncFromBackend();
      renderStudentApplicationsList();
      renderStudentsRoster();
      renderAdminDashboard();
    } else {
      alert(res.message || 'Error approving student.');
    }
  }
}

async function handleRejectStudent(appId) {
  if (confirm('Reject this student registration application?')) {
    if (!window.ZawiyahAuth) return;
    const res = await window.ZawiyahAuth.rejectStudent(appId);
    if (res.success) {
      alert('Student registration application marked as rejected.');
      if (window.ZawiyahAuth.syncFromBackend) await window.ZawiyahAuth.syncFromBackend();
      renderStudentApplicationsList();
      renderStudentsRoster();
      renderAdminDashboard();
    } else {
      alert(res.message || 'Error rejecting student.');
    }
  }
}

async function refreshStudentData() {
  if (window.ZawiyahAuth && window.ZawiyahAuth.syncFromBackend) {
    await window.ZawiyahAuth.syncFromBackend();
  }
  renderStudentApplicationsList();
  renderStudentsRoster();
  renderAdminDashboard();
}

// 13c. Student Full Profile Modal
let currentSelectedStudentId = null;

function openStudentFullProfileModal(studentId) {
  const students = window.ZawiyahAuth ? window.ZawiyahAuth.getStudents() : [];
  const s = students.find(item => item.id === studentId);
  if (!s) return;

  currentSelectedStudentId = studentId;
  const modal = document.getElementById('studentFullProfileModal');
  if (!modal) return;

  const initials = s.name ? s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST';
  document.getElementById('sProfInitials').textContent = initials;
  document.getElementById('sProfFullName').textContent = s.name;
  document.getElementById('sProfMeta').textContent = `Student ID: ${s.id}`;
  
  const statusBadge = document.getElementById('sProfStatusBadge');
  statusBadge.textContent = s.status || 'ACTIVE';
  if ((s.status || 'ACTIVE') === 'ACTIVE') {
    statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-lime/20 text-accent-lime border border-accent-lime/30';
  } else {
    statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30';
  }

  document.getElementById('sProfIdVal').textContent = s.id;
  document.getElementById('sProfPhoneVal').textContent = s.phone || 'N/A';
  document.getElementById('sProfCourseVal').textContent = s.course || s.level || 'Quran & Tajweed';
  document.getElementById('sProfClassTypeVal').textContent = s.classType || 'Group Class';
  const daysStr = Array.isArray(s.classDays) ? s.classDays.join(', ') : (s.classDays || 'Monday, Wednesday, Friday');
  document.getElementById('sProfDaysVal').textContent = daysStr;
  document.getElementById('sProfDurationVal').textContent = s.dailyDuration || '60 Minutes';

  const editBtn = document.getElementById('sProfEditBtn');
  if (editBtn) {
    editBtn.onclick = () => {
      closeStudentFullProfileModal();
      openEditStudentModal(s.id);
    };
  }

  modal.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeStudentFullProfileModal() {
  const modal = document.getElementById('studentFullProfileModal');
  if (modal) modal.classList.add('hidden');
}

// 13d. Edit Student Modal
function openEditStudentModal(studentId) {
  const students = window.ZawiyahAuth ? window.ZawiyahAuth.getStudents() : [];
  const s = students.find(item => item.id === studentId);
  if (!s) return;

  currentSelectedStudentId = studentId;
  const modal = document.getElementById('editStudentModal');
  if (!modal) return;

  document.getElementById('editStudentTitle').textContent = `Editing: ${s.name} (${s.id})`;
  document.getElementById('editStudentName').value = s.name || '';
  document.getElementById('editStudentPhone').value = s.phone || '';
  document.getElementById('editStudentStatus').value = s.status || 'ACTIVE';
  document.getElementById('editStudentCourse').value = s.course || s.level || 'Quran & Tajweed';
  document.getElementById('editStudentDuration').value = s.dailyDuration || '60 Minutes';
  document.getElementById('editStudentClassType').value = s.classType || 'Group Class';

  const form = document.getElementById('editStudentForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const updatedData = {
        student_name: document.getElementById('editStudentName').value.trim(),
        contact_number: document.getElementById('editStudentPhone').value.trim(),
        status: document.getElementById('editStudentStatus').value,
        class_course: document.getElementById('editStudentCourse').value,
        daily_duration: document.getElementById('editStudentDuration').value,
        class_type: document.getElementById('editStudentClassType').value
      };

      const btn = document.getElementById('saveStudentEditBtn');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="animate-spin mr-1">◌</span> Saving...`;
      }

      try {
        if (window.ZawiyahAuth && typeof window.ZawiyahAuth.updateStudentDetails === 'function') {
          const res = await window.ZawiyahAuth.updateStudentDetails(studentId, updatedData);
          if (res.success) {
            alert('Student record updated successfully.');
            closeEditStudentModal();
            renderStudentsRoster();
            if (currentSelectedStudentId === studentId) {
              openStudentFullProfileModal(studentId);
            }
          } else {
            alert(res.message || 'Error updating student record.');
          }
        }
      } catch (err) {
        alert('Server communication error.');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span>Save Changes</span>`;
        }
      }
    };
  }

  modal.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeEditStudentModal() {
  const modal = document.getElementById('editStudentModal');
  if (modal) modal.classList.add('hidden');
}

// 14. Render Classes Grid (Real database only)
function renderClassesGrid() {
  const container = document.getElementById('adminClassesContainer');
  if (!container) return;

  const classes = window.ZawiyahAuth ? window.ZawiyahAuth.getClasses() : [];

  if (classes.length === 0) {
    container.innerHTML = `
      <div class="bg-tealbg-900/60 border border-white/10 rounded-2xl p-8 text-center space-y-2 col-span-3">
        <i data-lucide="book-open" class="w-8 h-8 text-tealtext-400 mx-auto"></i>
        <p class="text-sm font-semibold text-white">No classes available yet.</p>
        <p class="text-xs text-tealtext-300">Active batches and learning tracks will be listed here once assigned to faculty.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = classes.map(c => `
    <div class="bg-tealbg-900/80 border border-white/15 rounded-2xl p-5 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-lime/20 text-accent-lime">${c.type || 'Class'}</span>
        <span class="text-xs font-mono text-tealtext-300">Cap: ${c.capacity}</span>
      </div>
      <h4 class="text-base font-semibold text-white">${c.name}</h4>
      <p class="text-xs text-tealtext-200">Instructor: <span class="text-white font-medium">${c.instructor} (${c.instructorId})</span></p>
      <div class="text-[11px] text-tealtext-300 space-y-1 pt-2 border-t border-white/10">
        <p>Schedule: ${c.schedule}</p>
        <p>Subject: ${c.subject}</p>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

// 15. Render Schedule Grid (Real database only)
function renderScheduleGrid() {
  const container = document.getElementById('adminScheduleContainer');
  if (!container) return;

  const schedules = window.ZawiyahAuth ? window.ZawiyahAuth.getSchedule() : [];

  if (schedules.length === 0) {
    container.innerHTML = `
      <div class="bg-tealbg-900/60 border border-white/10 rounded-2xl p-8 text-center space-y-2 col-span-4">
        <i data-lucide="calendar" class="w-8 h-8 text-tealtext-400 mx-auto"></i>
        <p class="text-sm font-semibold text-white">No schedule available yet.</p>
        <p class="text-xs text-tealtext-300">Class timetables will be displayed once teaching hours are scheduled.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = schedules.map(s => `
    <div class="bg-tealbg-900/80 p-4 rounded-2xl border border-white/10 space-y-2">
      <span class="font-bold text-accent-lime uppercase tracking-wider text-[10px]">${s.days}</span>
      <p class="text-white font-medium">${s.time}</p>
      <p class="text-tealtext-200">${s.subject} (${s.details})</p>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

// 16. Render Admin Users
function renderAdminUsersList() {
  const container = document.getElementById('adminUsersListContainer');
  if (!container) return;

  const admins = window.ZawiyahAuth ? window.ZawiyahAuth.getAdmins() : [];

  if (admins.length === 0) {
    container.innerHTML = `<p class="text-xs text-tealtext-300 py-4">No admin accounts found.</p>`;
    return;
  }

  container.innerHTML = admins.map(adm => {
    const initials = adm.name ? adm.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD';

    return `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-tealbg-900/80 border border-white/10 hover:border-amber-400/30 transition-all">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-amber-400 text-tealbg-950 font-display font-bold text-sm flex items-center justify-center flex-shrink-0">
            ${initials}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-semibold text-white">${adm.name}</h4>
              <span class="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold">${adm.id}</span>
              <span class="px-2 py-0.5 rounded-full bg-accent-lime/20 text-accent-lime text-[10px] font-bold uppercase">${adm.status || 'ACTIVE'}</span>
            </div>
            <p class="text-xs text-tealtext-300">
              ${adm.email} • Role: <span class="text-white font-medium">${adm.role}</span> • Created: ${adm.createdDate || '2026-01-01'}
            </p>
          </div>
        </div>
        <div class="text-[11px] text-tealtext-400 font-mono self-end sm:self-center">
          Authorized Full Access
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

// Modal: Create Additional Admin User
function openCreateAdminModal() {
  const modal = document.getElementById('createAdminModal');
  const genIdInput = document.getElementById('newAdminGeneratedId');
  if (!modal) return;

  if (genIdInput && window.ZawiyahAuth) {
    genIdInput.value = window.ZawiyahAuth.getNextAdminId();
  }

  const form = document.getElementById('createAdminForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('newAdminName').value.trim();
      const email = document.getElementById('newAdminEmail').value.trim();
      const pass = document.getElementById('newAdminPassword').value;
      const confirmPass = document.getElementById('newAdminConfirmPassword').value;

      if (!name || !email || !pass) {
        alert('Please fill out all required fields.');
        return;
      }

      const activeSession = window.ZawiyahAuth.getSession();
      const result = await window.ZawiyahAuth.createAdditionalAdmin({
        name,
        email,
        password: pass,
        confirmPassword: confirmPass
      }, activeSession);

      if (result.success) {
        alert(result.message);
        form.reset();
        closeCreateAdminModal();
        renderAdminUsersList();
      } else {
        alert(result.message || 'Error creating admin account.');
      }
    };
  }

  modal.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeCreateAdminModal() {
  const modal = document.getElementById('createAdminModal');
  if (modal) modal.classList.add('hidden');
}

// 17. Render Audit Logs
function renderAuditLogs() {
  const logContainer = document.getElementById('auditLogList');
  if (!logContainer) return;

  const apps = window.ZawiyahAuth ? window.ZawiyahAuth.getApplications('ALL') : [];
  const teachers = window.ZawiyahAuth ? window.ZawiyahAuth.getTeachers() : [];
  
  const logs = [
    ...teachers.flatMap(t => {
      return (t.statusHistory || []).map(sh => ({
        text: `Faculty Status Change: ${t.name} (${t.id}) transitioned to ${sh.to}. Reason: ${sh.reason}`,
        time: sh.date,
        icon: sh.to === 'ACTIVE' ? 'check-circle' : (sh.to === 'LEFT' ? 'user-minus' : 'shield-alert'),
        color: sh.to === 'ACTIVE' ? 'text-accent-lime' : (sh.to === 'LEFT' ? 'text-tealtext-300' : 'text-amber-300')
      }));
    }),
    ...apps.map(a => {
      if (a.status === 'ACTIVE' || a.status === 'APPROVED') {
        return { text: `Teacher Approved: ${a.name} issued credentials (${a.teacherId || 'Active'}).`, time: a.reviewedDate || 'Recent', icon: 'check-circle', color: 'text-accent-lime' };
      }
      if (a.status === 'REJECTED') {
        return { text: `Application Rejected: ${a.name} (${a.phone || a.id}) - Reason: ${a.rejectionReason || 'Criteria not met'}.`, time: a.reviewedDate || 'Recent', icon: 'x-circle', color: 'text-red-400' };
      }
      return { text: `New Teacher Application: ${a.name} (${a.phone || a.id}) awaiting admin verification.`, time: a.appliedDate || 'Pending', icon: 'clock', color: 'text-amber-300' };
    })
  ];

  if (logs.length === 0) {
    logContainer.innerHTML = `<p class="text-xs text-tealtext-300 py-4">No recent administrative activity recorded yet.</p>`;
    return;
  }

  logContainer.innerHTML = logs.slice(0, 15).map(log => `
    <div class="flex items-center gap-3 p-3.5 rounded-2xl bg-tealbg-900/70 border border-white/10 text-xs">
      <i data-lucide="${log.icon}" class="w-4 h-4 ${log.color} flex-shrink-0"></i>
      <div class="flex-1">
        <p class="text-white font-medium">${log.text}</p>
        <span class="text-[10px] text-tealtext-400">${log.time}</span>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

// -----------------------------------------------------------------------------
// 12. Reviews & Testimonials Admin Management Engine
// -----------------------------------------------------------------------------
let adminReviewsCache = [];
let currentAdminReviewFilter = 'ALL';
let currentAdminReviewSearch = '';

async function renderAdminReviews() {
  try {
    const res = await fetch('/api/admin/reviews');
    const data = await res.json();
    if (data && data.success && Array.isArray(data.reviews)) {
      adminReviewsCache = data.reviews;
    }
  } catch (e) {
    console.error('Error fetching admin reviews:', e);
  }

  // Update Stats
  const total = adminReviewsCache.length;
  const approved = adminReviewsCache.filter(r => (r.status || '').toUpperCase() === 'APPROVED').length;
  const hidden = total - approved;

  const statTotal = document.getElementById('statTotalReviews');
  const statApproved = document.getElementById('statApprovedReviews');
  const statHidden = document.getElementById('statHiddenReviews');
  if (statTotal) statTotal.textContent = total;
  if (statApproved) statApproved.textContent = approved;
  if (statHidden) statHidden.textContent = hidden;

  const container = document.getElementById('adminReviewsList');
  if (!container) return;

  // Filter & Search
  let filtered = adminReviewsCache;
  if (currentAdminReviewFilter !== 'ALL') {
    filtered = filtered.filter(r => (r.status || '').toUpperCase() === currentAdminReviewFilter);
  }

  if (currentAdminReviewSearch.trim()) {
    const q = currentAdminReviewSearch.toLowerCase().trim();
    filtered = filtered.filter(r => 
      (r.reviewerName || '').toLowerCase().includes(q) || 
      (r.reviewText || '').toLowerCase().includes(q) ||
      (r.course || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="sm:col-span-2 text-center py-12 bg-tealbg-800/40 rounded-3xl border border-white/10 p-6 space-y-2">
        <i data-lucide="star" class="w-8 h-8 text-tealtext-400 mx-auto"></i>
        <h4 class="text-sm font-semibold text-white">No reviews found</h4>
        <p class="text-xs text-tealtext-300">Add a new review or change the filter to view existing reviews.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const renderStarsMarkup = (rating = 5) => {
    let stars = '';
    const r = Math.max(1, Math.min(5, parseInt(rating) || 5));
    for (let i = 0; i < r; i++) {
      stars += `<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 fill-accent-lime text-accent-lime inline" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
    return stars;
  };

  container.innerHTML = filtered.map(rev => {
    const isApproved = (rev.status || '').toUpperCase() === 'APPROVED';
    const statusBadge = isApproved 
      ? `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-lime/20 text-accent-lime border border-accent-lime/30">APPROVED</span>`
      : `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">HIDDEN</span>`;

    const typeBadge = rev.reviewerType === 'Student'
      ? `<span class="px-2 py-0.5 rounded-full bg-accent-lavender/20 text-accent-lavender text-[10px] font-bold uppercase tracking-wider">Student</span>`
      : `<span class="px-2 py-0.5 rounded-full bg-white/10 text-tealtext-200 text-[10px] font-bold uppercase tracking-wider">Parent</span>`;

    const courseBadge = rev.course ? `<span class="text-[11px] text-tealtext-300">• ${escapeHtml(rev.course)}</span>` : '';

    return `
      <div class="bg-tealbg-800/80 p-5 sm:p-6 rounded-3xl border border-white/15 shadow-lg space-y-4 flex flex-col justify-between hover:border-white/30 transition-all">
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-0.5">
                ${renderStarsMarkup(rev.rating)}
              </div>
              ${typeBadge}
              ${courseBadge}
            </div>
            ${statusBadge}
          </div>

          <p class="text-white text-xs sm:text-sm leading-relaxed font-normal italic bg-tealbg-900/60 p-3.5 rounded-2xl border border-white/10">
            "${escapeHtml(rev.reviewText)}"
          </p>
        </div>

        <div class="pt-3 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div>
            <h4 class="font-display font-bold text-white text-xs sm:text-sm">— ${escapeHtml(rev.reviewerName)}</h4>
            <p class="text-[10px] text-tealtext-400">${rev.createdAt ? rev.createdAt.split(' ')[0] : ''}</p>
          </div>

          <div class="flex items-center gap-1.5">
            <button 
              type="button" 
              onclick="toggleReviewStatus('${rev.id}', '${rev.status || 'APPROVED'}')"
              class="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${isApproved ? 'text-amber-300 bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30' : 'text-accent-lime bg-accent-lime/15 hover:bg-accent-lime/25 border border-accent-lime/30'}"
            >
              ${isApproved ? 'Hide' : 'Approve'}
            </button>
            <button 
              type="button" 
              onclick="openEditReviewModal('${rev.id}')"
              class="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Edit Review"
            >
              <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
            </button>
            <button 
              type="button" 
              onclick="deleteAdminReview('${rev.id}')"
              class="p-2 rounded-full bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-400/20 transition-all"
              title="Delete Review"
            >
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function filterAdminReviews(status) {
  currentAdminReviewFilter = status;
  const btns = document.querySelectorAll('.review-filter-btn');
  btns.forEach(btn => {
    if (btn.getAttribute('data-filter') === status) {
      btn.className = 'review-filter-btn active px-3.5 py-1.5 rounded-full bg-accent-lime text-tealbg-950 font-bold transition-all';
    } else {
      btn.className = 'review-filter-btn px-3.5 py-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all';
    }
  });
  renderAdminReviews();
}

function handleAdminReviewSearch(query) {
  currentAdminReviewSearch = query || '';
  renderAdminReviews();
}

function openAddReviewModal() {
  const modal = document.getElementById('reviewModal');
  const title = document.getElementById('reviewModalTitle');
  const form = document.getElementById('reviewForm');
  const editId = document.getElementById('reviewEditId');

  if (form) form.reset();
  if (editId) editId.value = '';
  if (title) title.textContent = 'Add New Review / Testimonial';

  const statusSel = document.getElementById('reviewInputStatus');
  if (statusSel) statusSel.value = 'APPROVED';

  const ratingSel = document.getElementById('reviewInputRating');
  if (ratingSel) ratingSel.value = '5';

  if (modal) modal.classList.remove('hidden');
}

function openEditReviewModal(reviewId) {
  const rev = adminReviewsCache.find(r => r.id === reviewId);
  if (!rev) return;

  const modal = document.getElementById('reviewModal');
  const title = document.getElementById('reviewModalTitle');
  const editId = document.getElementById('reviewEditId');
  const nameInput = document.getElementById('reviewInputName');
  const typeInput = document.getElementById('reviewInputType');
  const ratingInput = document.getElementById('reviewInputRating');
  const courseInput = document.getElementById('reviewInputCourse');
  const statusInput = document.getElementById('reviewInputStatus');
  const textInput = document.getElementById('reviewInputText');

  if (title) title.textContent = 'Edit Review';
  if (editId) editId.value = rev.id;
  if (nameInput) nameInput.value = rev.reviewerName || '';
  if (typeInput) typeInput.value = rev.reviewerType || 'Parent';
  if (ratingInput) ratingInput.value = String(rev.rating || 5);
  if (courseInput) courseInput.value = rev.course || '';
  if (statusInput) statusInput.value = rev.status || 'APPROVED';
  if (textInput) textInput.value = rev.reviewText || '';

  if (modal) modal.classList.remove('hidden');
}

function closeReviewModal() {
  const modal = document.getElementById('reviewModal');
  if (modal) modal.classList.add('hidden');
}

async function handleReviewFormSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('reviewEditId').value.trim();
  const name = document.getElementById('reviewInputName').value.trim();
  const type = document.getElementById('reviewInputType').value;
  const rating = parseInt(document.getElementById('reviewInputRating').value) || 5;
  const course = document.getElementById('reviewInputCourse').value.trim();
  const status = document.getElementById('reviewInputStatus').value;
  const text = document.getElementById('reviewInputText').value.trim();

  if (!name || !text) {
    alert('Please provide reviewer name and review text.');
    return;
  }

  const saveBtn = document.getElementById('saveReviewBtn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
  }

  try {
    const endpoint = editId ? '/api/admin/update-review' : '/api/admin/add-review';
    const payload = editId ? {
      id: editId,
      reviewer_name: name,
      reviewer_type: type,
      rating: rating,
      course: course,
      status: status,
      review_text: text
    } : {
      reviewer_name: name,
      reviewer_type: type,
      rating: rating,
      course: course,
      status: status,
      review_text: text
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result && result.success) {
      closeReviewModal();
      await renderAdminReviews();
    } else {
      alert(result.message || 'Failed to save review.');
    }
  } catch (err) {
    alert('Network error while saving review.');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Review';
    }
  }
}

async function toggleReviewStatus(reviewId, currentStatus) {
  const newStatus = currentStatus.toUpperCase() === 'APPROVED' ? 'HIDDEN' : 'APPROVED';
  try {
    const res = await fetch('/api/admin/update-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: reviewId,
        status: newStatus
      })
    });
    const result = await res.json();
    if (result && result.success) {
      await renderAdminReviews();
    } else {
      alert(result.message || 'Failed to update review status.');
    }
  } catch (e) {
    alert('Network error while updating status.');
  }
}

async function deleteAdminReview(reviewId) {
  if (!confirm('Are you sure you want to permanently delete this review?')) return;
  try {
    const res = await fetch('/api/admin/delete-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reviewId })
    });
    const result = await res.json();
    if (result && result.success) {
      await renderAdminReviews();
    } else {
      alert(result.message || 'Failed to delete review.');
    }
  } catch (e) {
    alert('Network error while deleting review.');
  }
}

// Global exposes for HTML onclick attributes
window.switchAdminTab = switchAdminTab;
window.openAppDossierModal = openAppDossierModal;
window.closeDossierModal = closeDossierModal;
window.cancelRejectMode = cancelRejectMode;
window.confirmAndApproveTeacher = confirmAndApproveTeacher;
window.openQuickReject = openQuickReject;
window.openCreateAdminModal = openCreateAdminModal;
window.closeCreateAdminModal = closeCreateAdminModal;
window.openTeacherFullProfileModal = openTeacherFullProfileModal;
window.closeTeacherFullProfileModal = closeTeacherFullProfileModal;
window.openManageStatusModal = openManageStatusModal;
window.closeManageStatusModal = closeManageStatusModal;
window.executeTeacherStatusChange = executeTeacherStatusChange;
window.openEditTeacherModal = openEditTeacherModal;
window.closeEditTeacherModal = closeEditTeacherModal;
window.confirmAndApproveStudent = confirmAndApproveStudent;
window.handleRejectStudent = handleRejectStudent;
window.refreshStudentData = refreshStudentData;
window.openStudentFullProfileModal = openStudentFullProfileModal;
window.closeStudentFullProfileModal = closeStudentFullProfileModal;
window.openEditStudentModal = openEditStudentModal;
window.closeEditStudentModal = closeEditStudentModal;
window.renderAdminReviews = renderAdminReviews;
window.filterAdminReviews = filterAdminReviews;
window.handleAdminReviewSearch = handleAdminReviewSearch;
window.openAddReviewModal = openAddReviewModal;
window.openEditReviewModal = openEditReviewModal;
window.closeReviewModal = closeReviewModal;
window.handleReviewFormSubmit = handleReviewFormSubmit;
window.toggleReviewStatus = toggleReviewStatus;
window.deleteAdminReview = deleteAdminReview;
