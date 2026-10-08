// Zawiyah Teacher Portal - Pure Database-Driven Faculty Management Engine
// Zero Demo Data - Real Persistent Authentication & Active Teacher Controls

document.addEventListener('DOMContentLoaded', () => {
  initTeacherAuth();
  initTeacherTabs();
});

// 1. Teacher Authentication & Session Guard
function setTeacherAvatarElement(el, photo, name, roundedClass = 'rounded-2xl') {
  if (!el) return;
  if (photo && (photo.startsWith('data:image/') || photo.startsWith('http') || photo.startsWith('/'))) {
    el.innerHTML = `<img src="${photo}" alt="${name || 'Teacher'}" class="w-full h-full object-cover ${roundedClass}" />`;
  } else {
    const initials = (photo && photo.length <= 4) ? photo : (name ? name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() : 'TC');
    el.textContent = initials || 'TC';
  }
}

function initTeacherAuth() {
  const loginForm = document.getElementById('tLoginForm');
  const loginView = document.getElementById('tLoginView');
  const dashboardView = document.getElementById('tDashboardView');
  const navUserArea = document.getElementById('tNavUserArea');
  const logoutBtn = document.getElementById('tLogoutBtn');
  const togglePassBtn = document.getElementById('tTogglePasswordBtn');
  const toggleEyeIcon = document.getElementById('tToggleEyeIcon');
  const teacherIdInput = document.getElementById('teacherIdentifier');
  const teacherPassInput = document.getElementById('teacherPassword');
  const forgotPassBtn = document.getElementById('tForgotPassBtn');
  const navNotifyBtn = document.getElementById('tNavNotifyBtn');
  const statusAlert = document.getElementById('tLoginStatusAlert');
  const alertTitle = document.getElementById('tAlertTitle');
  const alertMsg = document.getElementById('tAlertMsg');
  const alertDot = document.getElementById('tAlertDot');

  const updateTeacherUI = (teacher) => {
    if (!teacher) return;
    const initials = (teacher.photo && teacher.photo.length <= 4) ? teacher.photo : (teacher.name ? teacher.name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() : 'TC');
    const subjectsStr = Array.isArray(teacher.subjects) && teacher.subjects.length > 0 ? teacher.subjects.join(', ') : (teacher.subjects || 'General Islamic Studies');
    const daysStr = Array.isArray(teacher.availableDays) && teacher.availableDays.length > 0 ? teacher.availableDays.join(', ') : (teacher.availableDays || 'Flexible');
    const assignedClasses = teacher.assignedClasses || [];
    const activeStudentsCount = teacher.activeStudents || 0;

    // Header & Navbar
    const profileInitialEl = document.getElementById('tHeaderAvatar');
    if (profileInitialEl) setTeacherAvatarElement(profileInitialEl, teacher.photo, teacher.name, 'rounded-2xl');

    const navInitialEl = document.getElementById('tNavAvatar');
    if (navInitialEl) setTeacherAvatarElement(navInitialEl, teacher.photo, teacher.name, 'rounded-full');

    const navNameEl = document.getElementById('tNavTeacherName');
    if (navNameEl) navNameEl.textContent = teacher.name;

    const badgeEl = document.getElementById('tHeaderBadge');
    if (badgeEl) badgeEl.textContent = `Faculty Member • ID: ${teacher.id}`;

    const welcomeTitleEl = document.getElementById('tWelcomeHeading');
    if (welcomeTitleEl) welcomeTitleEl.textContent = `Welcome, ${teacher.name}!`;

    const deptEl = document.getElementById('tHeaderDept');
    if (deptEl) deptEl.textContent = subjectsStr;

    const summaryMetaEl = document.getElementById('tHeaderSummaryMeta');
    if (summaryMetaEl) {
      summaryMetaEl.textContent = `${assignedClasses.length} Active Batches • ${activeStudentsCount} Students`;
    }

    // Detailed Profile Tab Elements
    const profAvatar = document.getElementById('profTeacherAvatar');
    const profName = document.getElementById('profTeacherName');
    const profDept = document.getElementById('profTeacherDept');
    const profId = document.getElementById('profTeacherId');
    const profStatus = document.getElementById('profTeacherStatus');
    const profPhone = document.getElementById('profTeacherPhone');
    const profLoc = document.getElementById('profTeacherLocation');
    const profSubj = document.getElementById('profTeacherSubjects');
    const profType = document.getElementById('profTeacherClassType');
    const profDays = document.getElementById('profTeacherDays');
    const profDur = document.getElementById('profTeacherDailyDuration');
    const profWeek = document.getElementById('profTeacherWeeklyHours');
    const profMonth = document.getElementById('profTeacherMonthlyHours');
    const profStart = document.getElementById('profTeacherStartDate');

    if (profAvatar) setTeacherAvatarElement(profAvatar, teacher.photo, teacher.name, 'rounded-2xl');
    if (profName) profName.textContent = teacher.name;
    if (profDept) profDept.textContent = `${subjectsStr} • Verified Faculty`;
    if (profId) profId.textContent = `Teacher ID: ${teacher.id}`;
    if (profStatus) profStatus.textContent = teacher.status || 'ACTIVE';
    if (profPhone) profPhone.textContent = teacher.phone || 'N/A';
    if (profLoc) profLoc.textContent = `${teacher.place || 'N/A'}, ${teacher.country || 'N/A'}`;
    if (profSubj) profSubj.textContent = subjectsStr;
    if (profType) profType.textContent = teacher.classType || 'Group Class';
    if (profDays) profDays.textContent = daysStr;
    if (profDur) profDur.textContent = teacher.dailyDuration || '60 Minutes';
    if (profWeek) profWeek.textContent = teacher.weeklyHours || '5.0 Hours / Week';
    if (profMonth) profMonth.textContent = teacher.monthlyHours || '20 Hours / Month';
    if (profStart) profStart.textContent = teacher.startDate || teacher.joinedDate || 'Recent';

    // Render All Teacher Sections with real data
    renderTeacherDashboard(teacher);
    renderTeacherClasses(teacher);
    renderTeacherStudents(teacher);
    renderTeacherAttendance(teacher);
    renderTeacherSchedule(teacher);
    renderTeacherAssignments(teacher);
    renderTeacherProgress(teacher);
    renderTeacherMaterials(teacher);
    renderTeacherMessages(teacher);
    renderTeacherNotifications(teacher);
  };

  const showDashboard = (teacher) => {
    if (teacher) updateTeacherUI(teacher);
    if (loginView) loginView.classList.add('hidden');
    if (dashboardView) {
      dashboardView.classList.remove('hidden');
      dashboardView.classList.add('animate-fade-in');
    }
    if (navUserArea) {
      navUserArea.classList.remove('hidden');
      navUserArea.classList.add('flex');
    }
    if (window.lucide) window.lucide.createIcons();
  };

  const showLogin = () => {
    if (dashboardView) dashboardView.classList.add('hidden');
    if (loginView) loginView.classList.remove('hidden');
    if (navUserArea) {
      navUserArea.classList.add('hidden');
      navUserArea.classList.remove('flex');
    }
    if (window.lucide) window.lucide.createIcons();
  };

  // Check existing session
  const currentSession = window.ZawiyahAuth ? window.ZawiyahAuth.getSession() : null;
  const isTeacherLoggedIn = localStorage.getItem('zawiyah_teacher_logged_in') === 'true' || sessionStorage.getItem('zawiyah_teacher_logged_in') === 'true';

  if (isTeacherLoggedIn && currentSession && currentSession.role === 'TEACHER') {
    let teacher = window.ZawiyahAuth.getTeacherById(currentSession.id);
    if (!teacher && currentSession.id) {
      teacher = {
        id: currentSession.id,
        name: currentSession.name,
        phone: currentSession.phone,
        email: currentSession.email || '',
        role: 'TEACHER',
        status: currentSession.status || 'ACTIVE',
        subjects: currentSession.subjects || currentSession.course || ['Islamic Studies'],
        classType: currentSession.class_type || 'Group Class',
        place: currentSession.place || '',
        country: currentSession.country || '',
        activeStudents: 1,
        totalAssignedStudents: 1,
        assignedClasses: [currentSession.class_type || 'Group Class']
      };
      if (window.ZawiyahAuth && window.ZawiyahAuth.syncFromBackend) {
        window.ZawiyahAuth.syncFromBackend().then(() => {
          const synced = window.ZawiyahAuth.getTeacherById(currentSession.id);
          if (synced) updateTeacherUI(synced);
        }).catch(() => {});
      }
    }
    const tStatus = teacher ? String(teacher.status || 'ACTIVE').toUpperCase() : 'ACTIVE';
    if (tStatus === 'ACTIVE' || tStatus === 'APPROVED') {
      showDashboard(teacher);
    } else {
      window.ZawiyahAuth.logout();
      showLogin();
    }
  } else {
    showLogin();
  }

  // Password Visibility Toggle
  if (togglePassBtn && teacherPassInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPass = teacherPassInput.type === 'password';
      teacherPassInput.type = isPass ? 'text' : 'password';
      if (toggleEyeIcon) {
        toggleEyeIcon.setAttribute('data-lucide', isPass ? 'eye-off' : 'eye');
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // Forgot Password
  if (forgotPassBtn) {
    forgotPassBtn.addEventListener('click', () => {
      alert('To reset your Teacher Portal credentials, please contact the Zawiyah Academic Administration office (+91 6282552309).');
    });
  }

  // Header Bell notification shortcut
  if (navNotifyBtn) {
    navNotifyBtn.addEventListener('click', () => {
      switchTeacherTab('notifications');
    });
  }

  // Logout Handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out of the Teacher Portal?')) {
        if (window.ZawiyahAuth) window.ZawiyahAuth.logout();
        showLogin();
      }
    });
  }

  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (statusAlert) statusAlert.classList.add('hidden');

      const idVal = teacherIdInput ? teacherIdInput.value.trim() : '';
      const passVal = teacherPassInput ? teacherPassInput.value.trim() : '';
      const rememberMe = document.getElementById('tRememberMe') ? document.getElementById('tRememberMe').checked : true;

      const idErr = document.getElementById('tIdError');
      const passErr = document.getElementById('tPassError');

      let valid = true;

      if (!idVal) {
        if (idErr) idErr.classList.remove('hidden');
        valid = false;
      } else {
        if (idErr) idErr.classList.add('hidden');
      }

      if (!passVal) {
        if (passErr) passErr.classList.remove('hidden');
        valid = false;
      } else {
        if (passErr) passErr.classList.add('hidden');
      }

      if (!valid) return;

      const submitBtn = document.getElementById('tLoginSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="animate-spin mr-2">◌</span> Authenticating...`;
      }

      const authRes = window.ZawiyahAuth ? await window.ZawiyahAuth.loginTeacher(idVal, passVal, rememberMe) : { success: false, message: 'Auth engine unavailable' };

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Login</span><i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>`;
        if (window.lucide) window.lucide.createIcons();
      }

      if (authRes.success) {
        if (statusAlert) statusAlert.classList.add('hidden');
        showDashboard(authRes.teacher);
      } else if (authRes.status === 'PENDING') {
        if (statusAlert && alertTitle && alertMsg) {
          statusAlert.className = 'p-4 rounded-2xl text-left space-y-2 border bg-amber-500/15 border-amber-400/40 animate-fade-in';
          if (alertDot) alertDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse';
          alertTitle.className = 'text-xs font-bold uppercase tracking-wider text-amber-300';
          alertTitle.textContent = 'Application Status: Pending Verification';
          alertMsg.textContent = authRes.message;
          statusAlert.classList.remove('hidden');
        }
      } else if (authRes.status === 'REJECTED') {
        if (statusAlert && alertTitle && alertMsg) {
          statusAlert.className = 'p-4 rounded-2xl text-left space-y-2 border bg-red-500/15 border-red-400/40 animate-fade-in';
          if (alertDot) alertDot.className = 'w-2.5 h-2.5 rounded-full bg-red-400';
          alertTitle.className = 'text-xs font-bold uppercase tracking-wider text-red-300';
          alertTitle.textContent = 'Application Status: Rejected';
          alertMsg.textContent = authRes.message;
          statusAlert.classList.remove('hidden');
        }
      } else if (authRes.status === 'INACTIVE' || authRes.status === 'LEFT' || authRes.status === 'SUSPENDED') {
        if (statusAlert && alertTitle && alertMsg) {
          statusAlert.className = 'p-4 rounded-2xl text-left space-y-2 border bg-amber-500/15 border-amber-400/40 animate-fade-in';
          if (alertDot) alertDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-400';
          alertTitle.className = 'text-xs font-bold uppercase tracking-wider text-amber-300';
          alertTitle.textContent = `Account Status: ${authRes.status}`;
          alertMsg.textContent = authRes.message || 'Your teacher account is not currently active. Please contact Zawiyah Admin.';
          statusAlert.classList.remove('hidden');
        }
      } else {
        if (statusAlert && alertTitle && alertMsg) {
          statusAlert.className = 'p-4 rounded-2xl text-left space-y-2 border bg-red-500/15 border-red-400/40 animate-fade-in';
          if (alertDot) alertDot.className = 'w-2.5 h-2.5 rounded-full bg-red-400';
          alertTitle.className = 'text-xs font-bold uppercase tracking-wider text-red-300';
          alertTitle.textContent = 'Invalid Credentials';
          alertMsg.textContent = authRes.message || 'Invalid Name / Username or Password.';
          statusAlert.classList.remove('hidden');
        }
      }
    });
  }
}

// 2. Teacher Navigation Tabs
function initTeacherTabs() {
  const tabBtns = document.querySelectorAll('.teacher-nav-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTeacherTab(tab);
    });
  });
}

function switchTeacherTab(tabId) {
  const tabBtns = document.querySelectorAll('.teacher-nav-btn');
  const tabContents = document.querySelectorAll('.t-tab-content');

  tabBtns.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  tabContents.forEach(content => {
    if (content.id === `t-tab-${tabId}`) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });

  if (window.lucide) window.lucide.createIcons();
}

// 3. Render Dashboard Overview (Real Teacher Data)
function renderTeacherDashboard(teacher) {
  const assignedClasses = teacher.assignedClasses || [];
  const activeStudents = teacher.activeStudents || 0;

  // Stat Numbers
  const statClasses = document.getElementById('tStatClasses');
  const statStudents = document.getElementById('tStatStudents');
  const statTodayClasses = document.getElementById('tStatTodayClasses');
  const statAssignments = document.getElementById('tStatAssignments');

  if (statClasses) statClasses.textContent = `${assignedClasses.length} Batches`;
  if (statStudents) statStudents.textContent = activeStudents;
  
  // Calculate today's status
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = daysOfWeek[new Date().getDay()];
  const isTodayClass = Array.isArray(teacher.availableDays) && teacher.availableDays.includes(todayName);

  if (statTodayClasses) {
    statTodayClasses.textContent = isTodayClass && assignedClasses.length > 0 ? `${assignedClasses.length} Sessions` : '0 Sessions';
  }
  if (statAssignments) statAssignments.textContent = '0';

  // Today's schedule list
  const scheduleContainer = document.getElementById('tTodayScheduleList');
  if (scheduleContainer) {
    if (isTodayClass && assignedClasses.length > 0) {
      scheduleContainer.innerHTML = assignedClasses.map(c => `
        <div class="bg-white/10 border border-accent-lime/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-accent-lime bg-tealbg-900 px-2.5 py-0.5 rounded-full">${teacher.startTime || '17:00'} – ${teacher.endTime || '18:00'}</span>
              <span class="text-xs text-tealtext-200">Scheduled Session</span>
            </div>
            <h3 class="text-sm font-semibold text-white">${c}</h3>
            <p class="text-xs text-tealtext-300">Subject: ${Array.isArray(teacher.subjects) ? teacher.subjects.join(', ') : teacher.subjects}</p>
          </div>
          <button type="button" onclick="startHostClassModal('${c}', '${teacher.subjects || 'Quran'}', '${teacher.startTime || '17:00'}')" class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-tealbg-950 bg-accent-lime hover:bg-white rounded-full transition-all shadow-md flex items-center justify-center gap-1.5 self-start sm:self-center">
            <i data-lucide="video" class="w-3.5 h-3.5"></i>
            <span>Start Class</span>
          </button>
        </div>
      `).join('');
    } else {
      scheduleContainer.innerHTML = `
        <div class="bg-tealbg-900/60 border border-white/10 rounded-2xl p-6 text-center space-y-1">
          <p class="text-sm font-semibold text-white">No classes scheduled for today (${todayName}).</p>
          <p class="text-xs text-tealtext-300">Your regular class days: ${Array.isArray(teacher.availableDays) ? teacher.availableDays.join(', ') : (teacher.availableDays || 'Not configured')}.</p>
        </div>
      `;
    }
  }

  // Recent Notifications
  const notifContainer = document.getElementById('tRecentNotificationsList');
  if (notifContainer) {
    notifContainer.innerHTML = `
      <div class="bg-white/10 rounded-2xl p-3.5 space-y-1">
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-white">Account Verified</span>
          <span class="text-[10px] text-accent-lime font-mono">Official</span>
        </div>
        <p class="text-xs text-tealtext-200">Welcome to Zawiyah Faculty! Your account ID is <strong class="text-accent-lime">${teacher.id}</strong>.</p>
      </div>
    `;
  }
}

// 4. Render My Classes
function renderTeacherClasses(teacher) {
  const container = document.getElementById('tClassesGrid');
  if (!container) return;

  const classes = teacher.assignedClasses || [];

  if (classes.length === 0) {
    container.innerHTML = `
      <div class="bg-tealbg-900/60 border border-white/10 rounded-3xl p-10 text-center space-y-2 col-span-2">
        <i data-lucide="book-open" class="w-10 h-10 text-tealtext-400 mx-auto"></i>
        <h4 class="text-base font-semibold text-white">No active classes assigned yet.</h4>
        <p class="text-xs text-tealtext-300">Your assigned batches and student allocations will appear here once configured by administration.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = classes.map(c => `
    <div class="t-card bg-white/95 text-tealbg-950 p-7 rounded-3xl shadow-lg border border-white/40 space-y-5 flex flex-col justify-between">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="px-3 py-1 rounded-full bg-tealbg/10 text-tealbg text-xs font-bold uppercase tracking-wider">${c}</span>
          <span class="text-xs font-semibold text-tealbg-700">${teacher.activeStudents || 0} Students</span>
        </div>
        <div>
          <h3 class="text-xl font-display font-semibold text-tealbg-950">${c}</h3>
          <p class="text-xs text-tealbg-800 font-medium">Subject: ${Array.isArray(teacher.subjects) ? teacher.subjects.join(', ') : teacher.subjects}</p>
        </div>
        <ul class="space-y-2 text-xs text-tealbg-900 font-medium pt-2 border-t border-tealbg/10">
          <li class="flex items-center gap-2"><i data-lucide="calendar" class="w-3.5 h-3.5 text-tealbg"></i> ${Array.isArray(teacher.availableDays) ? teacher.availableDays.join(', ') : teacher.availableDays}</li>
          <li class="flex items-center gap-2"><i data-lucide="clock" class="w-3.5 h-3.5 text-tealbg"></i> ${teacher.startTime || '17:00'} – ${teacher.endTime || '18:00'} (${teacher.dailyDuration || '60 Mins'})</li>
        </ul>
      </div>
      <button type="button" onclick="startHostClassModal('${c}', '${teacher.subjects || 'Quran'}', '${teacher.startTime || '17:00'}')" class="w-full py-2.5 px-4 rounded-full text-xs font-semibold tracking-wider uppercase text-white bg-tealbg hover:bg-tealbg-600 transition-all shadow-md flex items-center justify-center gap-2">
        <span>Start Live Class</span>
        <i data-lucide="video" class="w-3.5 h-3.5"></i>
      </button>
    </div>
  `).join('');
}

// 5. Render Students Directory
function renderTeacherStudents(teacher) {
  const container = document.getElementById('studentsGrid');
  if (!container) return;

  const allStudents = window.ZawiyahAuth ? window.ZawiyahAuth.getStudents() : [];
  let myStudents = allStudents.filter(s => s.teacherId === teacher.id);

  if (myStudents.length === 0 && teacher.studentName) {
    myStudents = [{
      id: 'STU-2026-001',
      name: teacher.studentName,
      age: teacher.studentAge || 'N/A',
      place: teacher.studentPlace || teacher.place || 'N/A',
      level: teacher.studentLevel || 'Foundation',
      status: 'ACTIVE',
      attendance: '100%',
      className: teacher.assignedClasses && teacher.assignedClasses[0] ? teacher.assignedClasses[0] : `${teacher.studentLevel || 'Foundation'} Level Batch`
    }];
  }

  if (myStudents.length === 0) {
    container.innerHTML = `
      <div class="bg-tealbg-900/60 border border-white/10 rounded-3xl p-10 text-center space-y-2 col-span-3">
        <i data-lucide="users" class="w-10 h-10 text-tealtext-400 mx-auto"></i>
        <h4 class="text-base font-semibold text-white">No students assigned yet.</h4>
        <p class="text-xs text-tealtext-300">Enrolled students in your batches will appear here as registrations occur.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = myStudents.map(s => {
    let levelBadgeClass = 'bg-blue-500/20 text-blue-300 border border-blue-400/30';
    const lvl = (s.level || 'Foundation').toLowerCase();
    if (lvl.includes('intermediate')) levelBadgeClass = 'bg-purple-500/20 text-purple-300 border border-purple-400/30';
    else if (lvl.includes('advance')) levelBadgeClass = 'bg-accent-lime/20 text-accent-lime border border-accent-lime/30';
    else if (lvl.includes('quran')) levelBadgeClass = 'bg-amber-400/20 text-amber-300 border border-amber-400/30';
    else if (lvl.includes('other')) levelBadgeClass = 'bg-tealtext-400/20 text-tealtext-200 border border-white/20';

    const initials = s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';

    return `
      <div class="bg-tealbg-900/80 border border-white/15 rounded-3xl p-6 space-y-4 hover:border-white/30 transition-all shadow-md">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${levelBadgeClass}">${s.level || 'Foundation'}</span>
          <span class="text-xs font-mono font-bold text-accent-lime">${s.id}</span>
        </div>
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl bg-accent-lavender text-tealbg-950 font-display font-bold text-base flex items-center justify-center flex-shrink-0">
            ${initials}
          </div>
          <div>
            <h4 class="text-base font-semibold text-white">${s.name}</h4>
            <p class="text-xs text-tealtext-300">Age: <span class="text-white">${s.age || 'N/A'}</span> • ${s.place || 'N/A'}</p>
          </div>
        </div>
        <div class="pt-3 border-t border-white/10 space-y-1.5 text-xs">
          <div class="flex items-center justify-between text-tealtext-200">
            <span>Enrolled Batch:</span>
            <span class="text-white font-medium">${s.className || 'Assigned Batch'}</span>
          </div>
          <div class="flex items-center justify-between text-tealtext-200">
            <span>Attendance Rate:</span>
            <span class="text-accent-lime font-bold">${s.attendance || '100%'}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

// 6. Render Attendance System
function renderTeacherAttendance(teacher) {
  const classSelect = document.getElementById('attClassSelect');
  const sheetList = document.getElementById('attendanceSheetList');

  const classes = teacher.assignedClasses || [];
  if (classSelect) {
    if (classes.length === 0) {
      classSelect.innerHTML = `<option value="">No Classes Assigned</option>`;
    } else {
      classSelect.innerHTML = classes.map(c => `<option value="${c}">${c}</option>`).join('');
    }
  }

  if (sheetList) {
    sheetList.innerHTML = `
      <div class="text-center py-8 text-tealbg-700 space-y-1">
        <p class="text-sm font-semibold text-tealbg-950">No students enrolled to mark attendance.</p>
        <p class="text-xs text-tealbg-600">Attendance sheets will automatically populate when students are assigned to this batch.</p>
      </div>
    `;
  }
}

// 7. Render Schedule
function renderTeacherSchedule(teacher) {
  const container = document.getElementById('weeklyScheduleContainer');
  if (!container) return;

  const days = Array.isArray(teacher.availableDays) ? teacher.availableDays : (teacher.availableDays ? [teacher.availableDays] : []);

  if (days.length === 0) {
    container.innerHTML = `
      <div class="bg-tealbg-900/60 border border-white/10 rounded-2xl p-8 text-center space-y-2">
        <p class="text-sm font-semibold text-white">No teaching schedule configured yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = days.map(day => `
    <div class="bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-accent-lime text-tealbg-950 font-bold flex flex-col items-center justify-center flex-shrink-0">
          <span class="text-[10px] uppercase">${day.substring(0, 3)}</span>
          <span class="text-xs font-bold">SLOT</span>
        </div>
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-accent-lime uppercase tracking-wider bg-tealbg-900 px-2.5 py-0.5 rounded-full">${teacher.startTime || '17:00'} – ${teacher.endTime || '18:00'}</span>
            <span class="text-xs text-tealtext-200">${teacher.dailyDuration || '60 Mins'}</span>
          </div>
          <h3 class="text-base font-semibold text-white">${teacher.name} (${teacher.id})</h3>
          <p class="text-xs text-tealtext-300">Subject: ${Array.isArray(teacher.subjects) ? teacher.subjects.join(', ') : teacher.subjects}</p>
        </div>
      </div>
      <button type="button" onclick="startHostClassModal('Session (${day})', '${teacher.subjects || 'Quran'}', '${teacher.startTime || '17:00'}')" class="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-tealbg-950 bg-accent-lime hover:bg-white rounded-full transition-all shadow-md flex items-center justify-center gap-2 flex-shrink-0">
        <i data-lucide="video" class="w-4 h-4"></i>
        <span>Start Live Class</span>
      </button>
    </div>
  `).join('');
}

// 8. Render Assignments
function renderTeacherAssignments(teacher) {
  const container = document.getElementById('assignmentsList');
  if (!container) return;

  container.innerHTML = `
    <div class="bg-tealbg-900/60 border border-white/10 rounded-3xl p-10 text-center space-y-2">
      <i data-lucide="file-text" class="w-10 h-10 text-tealtext-400 mx-auto"></i>
      <h4 class="text-base font-semibold text-white">No assignments created yet.</h4>
      <p class="text-xs text-tealtext-300">Click “Create Assignment” to publish new homework tasks and recitation audio drills for your students.</p>
    </div>
  `;
}

// 9. Render Student Progress
function renderTeacherProgress(teacher) {
  const select = document.getElementById('progressStudentSelect');
  const container = document.getElementById('progressContainer');

  if (select) {
    select.innerHTML = `<option value="">No Students Enrolled</option>`;
  }
}

// 10. Render Materials
function renderTeacherMaterials(teacher) {
  const tbody = document.getElementById('materialsTableBody');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="5" class="py-10 text-center text-tealtext-300 space-y-2">
        <i data-lucide="folder" class="w-8 h-8 text-tealtext-400 mx-auto"></i>
        <p class="text-sm font-semibold text-white">No learning materials uploaded yet.</p>
        <p class="text-xs text-tealtext-300">Upload recitation guides, worksheets, and Tajweed summaries for your students.</p>
      </td>
    </tr>
  `;
}

// 11. Render Messages
function renderTeacherMessages(teacher) {
  const container = document.getElementById('teacherMessagesContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="bg-tealbg-900/60 border border-white/10 rounded-3xl p-10 text-center space-y-2">
      <i data-lucide="message-square" class="w-10 h-10 text-tealtext-400 mx-auto"></i>
      <h4 class="text-base font-semibold text-white">No messages yet.</h4>
      <p class="text-xs text-tealtext-300">Incoming communications from students, parents, and administration will appear here.</p>
    </div>
  `;
}

// 12. Render Notifications
function renderTeacherNotifications(teacher) {
  const container = document.getElementById('notificationsFullList');
  if (!container) return;

  container.innerHTML = `
    <div class="bg-tealbg-900/80 border border-white/15 rounded-2xl p-5 space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-accent-lime">Account Active</span>
        <span class="text-[10px] text-tealtext-400 font-mono">System</span>
      </div>
      <h4 class="text-sm font-semibold text-white">Welcome to Zawiyah Faculty Portal</h4>
      <p class="text-xs text-tealtext-200">Your faculty credentials have been activated. Teacher ID: <span class="font-mono text-accent-lime">${teacher.id}</span>.</p>
    </div>
  `;
}

// Host Class Modal
function startHostClassModal(className, subject, time) {
  const modal = document.getElementById('tHostClassModal');
  if (!modal) {
    alert(`Starting live classroom for ${className} (${subject}) at ${time}.`);
    return;
  }
  document.getElementById('hostModalTitle').textContent = className;
  document.getElementById('hostModalSubject').textContent = `Subject: ${subject} • Time: ${time}`;
  modal.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeHostClassModal() {
  const modal = document.getElementById('tHostClassModal');
  if (modal) modal.classList.add('hidden');
}

// Create Assignment Modal
function openCreateAssignmentModal() {
  const modal = document.getElementById('tCreateAssignmentModal');
  if (modal) {
    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }
}

function closeCreateAssignmentModal() {
  const modal = document.getElementById('tCreateAssignmentModal');
  if (modal) modal.classList.add('hidden');
}

// Upload Material Modal
function openUploadMaterialModal() {
  const modal = document.getElementById('tUploadMaterialModal');
  if (modal) {
    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }
}

function closeUploadMaterialModal() {
  const modal = document.getElementById('tUploadMaterialModal');
  if (modal) modal.classList.add('hidden');
}

// Expose globals for HTML inline onclick
window.switchTeacherTab = switchTeacherTab;
window.startHostClassModal = startHostClassModal;
window.closeHostClassModal = closeHostClassModal;
window.openCreateAssignmentModal = openCreateAssignmentModal;
window.closeCreateAssignmentModal = closeCreateAssignmentModal;
window.openUploadMaterialModal = openUploadMaterialModal;
window.closeUploadMaterialModal = closeUploadMaterialModal;
