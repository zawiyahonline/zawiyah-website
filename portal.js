// Zawiyah Student Portal - Interactive Dashboard Logic & State Management

document.addEventListener('DOMContentLoaded', () => {
  initPortalAuth();
  initPortalTabs();
});

// 1. Authentication & Session Management
function initPortalAuth() {
  const loginForm = document.getElementById('portalLoginForm');
  const registerForm = document.getElementById('studentRegisterForm');
  const loginView = document.getElementById('portalLoginView');
  const dashboardView = document.getElementById('portalDashboardView');
  const navUserArea = document.getElementById('navUserArea');
  const logoutBtn = document.getElementById('logoutBtn');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const toggleEyeIcon = document.getElementById('toggleEyeIcon');
  const studentPassword = document.getElementById('studentPassword');
  const studentIdentifier = document.getElementById('studentIdentifier');
  const forgotPassBtn = document.getElementById('forgotPassBtn');
  const navNotifyBtn = document.getElementById('navNotifyBtn');
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const alertBox = document.getElementById('studentAuthAlert');
  const authTitle = document.getElementById('authTitle');
  const authSubtitle = document.getElementById('authSubtitle');

  const showAlert = (msg, type = 'error') => {
    if (!alertBox) return;
    alertBox.classList.remove('hidden', 'bg-rose-500/20', 'border-rose-500/40', 'text-rose-200', 'bg-emerald-500/20', 'border-emerald-500/40', 'text-emerald-200');
    if (type === 'error') {
      alertBox.classList.add('bg-rose-500/20', 'border', 'border-rose-500/40', 'text-rose-200');
    } else {
      alertBox.classList.add('bg-emerald-500/20', 'border', 'border-emerald-500/40', 'text-emerald-200');
    }
    alertBox.innerHTML = `<div class="flex items-start gap-2"><span>${msg}</span></div>`;
  };

  const hideAlert = () => {
    if (alertBox) alertBox.classList.add('hidden');
  };

  // Tab switching between Login and Admission
  if (tabLoginBtn && tabRegisterBtn) {
    tabLoginBtn.addEventListener('click', () => {
      tabLoginBtn.className = 'py-2 rounded-xl transition-all bg-white text-tealbg-950 shadow-md font-semibold';
      tabRegisterBtn.className = 'py-2 rounded-xl transition-all text-tealtext-200 hover:text-white font-medium';
      if (loginForm) loginForm.classList.remove('hidden');
      if (registerForm) registerForm.classList.add('hidden');
      if (authTitle) authTitle.textContent = 'Student Portal';
      if (authSubtitle) authSubtitle.textContent = 'Continue your Zawiyah learning journey.';
      hideAlert();
    });

    tabRegisterBtn.addEventListener('click', () => {
      tabRegisterBtn.className = 'py-2 rounded-xl transition-all bg-white text-tealbg-950 shadow-md font-semibold';
      tabLoginBtn.className = 'py-2 rounded-xl transition-all text-tealtext-200 hover:text-white font-medium';
      if (loginForm) loginForm.classList.add('hidden');
      if (registerForm) registerForm.classList.remove('hidden');
      if (authTitle) authTitle.textContent = 'Apply for Admission';
      if (authSubtitle) authSubtitle.textContent = 'Submit your student details for administrative approval.';
      hideAlert();
    });
  }

  // Check if session exists in localStorage/sessionStorage
  const session = window.ZawiyahAuth ? window.ZawiyahAuth.getSession() : null;
  const isAuthenticated = localStorage.getItem('zawiyah_student_logged_in') === 'true' || (session && session.role === 'STUDENT');

  const updateStudentDisplay = (user) => {
    const navName = document.getElementById('navStudentName');
    const navInitials = document.getElementById('navStudentInitials');
    const dashGreeting = document.getElementById('dashStudentGreeting');
    const dashId = document.getElementById('dashStudentId');
    const dashInitials = document.getElementById('dashStudentInitials');
    const dashTrack = document.getElementById('dashStudentTrack');

    const name = user?.name || session?.name || 'Student';
    const id = user?.id || session?.id || 'ZAW-STU-001';
    const track = user?.level ? `${user.level} Track` : (user?.class_type || 'Online Islamic Studies');

    if (navName) navName.textContent = name;
    if (dashGreeting) dashGreeting.textContent = `Welcome, ${name}!`;
    if (dashId) dashId.textContent = id;
    if (dashTrack) dashTrack.textContent = track;
    if (navInitials) {
      navInitials.textContent = name.charAt(0).toUpperCase();
    }
    if (dashInitials) {
      const parts = name.split(' ').filter(Boolean);
      dashInitials.textContent = (parts.length > 1 ? parts[0][0] + parts[1][0] : name.substring(0, 2)).toUpperCase();
    }
  };

  const showDashboard = (user) => {
    if (loginView) loginView.classList.add('hidden');
    if (dashboardView) {
      dashboardView.classList.remove('hidden');
      dashboardView.classList.add('animate-fade-in');
    }
    if (navUserArea) {
      navUserArea.classList.remove('hidden');
      navUserArea.classList.add('flex');
    }
    updateStudentDisplay(user);
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

  if (isAuthenticated) {
    showDashboard(session);
  } else {
    showLogin();
  }

  // Password Visibility Toggle
  if (togglePasswordBtn && studentPassword) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPass = studentPassword.type === 'password';
      studentPassword.type = isPass ? 'text' : 'password';
      if (toggleEyeIcon) {
        toggleEyeIcon.setAttribute('data-lucide', isPass ? 'eye-off' : 'eye');
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // Forgot Password Trigger
  if (forgotPassBtn) {
    forgotPassBtn.addEventListener('click', () => {
      openStudentForgotModal();
    });
  }

  // Notification Button in Navbar jumps to Notifications Tab
  if (navNotifyBtn) {
    navNotifyBtn.addEventListener('click', () => {
      switchTab('notifications');
    });
  }

  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const idVal = studentIdentifier ? studentIdentifier.value.trim() : '';
      const passVal = studentPassword ? studentPassword.value.trim() : '';

      const idErr = document.getElementById('identifierError');
      const passErr = document.getElementById('passwordError');

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

      const submitBtn = document.getElementById('loginSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="animate-spin mr-2">◌</span> Verifying credentials...`;
      }

      try {
        if (window.ZawiyahAuth && typeof window.ZawiyahAuth.loginStudent === 'function') {
          const result = await window.ZawiyahAuth.loginStudent(idVal, passVal);
          if (result.success) {
            localStorage.setItem('zawiyah_student_logged_in', 'true');
            showAlert('Login successful! Redirecting to student dashboard...', 'success');
            setTimeout(() => {
              showDashboard(result.user);
            }, 600);
          } else {
            if (result.status === 'PENDING APPROVAL' || result.status === 'PENDING') {
              showAlert('⚠️ Your account is pending admin approval. Please wait while our academic team reviews your application.', 'error');
            } else if (result.status === 'REJECTED') {
              showAlert('⚠️ Your application could not be approved at this time. Please contact school administration.', 'error');
            } else {
              showAlert(result.message || 'Invalid Name / Username or password.', 'error');
            }
          }
        } else {
          // Fallback
          localStorage.setItem('zawiyah_student_logged_in', 'true');
          showDashboard();
        }
      } catch (err) {
        showAlert('An error occurred during login. Please verify your connection.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Login to Portal</span><i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>`;
          if (window.lucide) window.lucide.createIcons();
        }
      }
    });
  }

  // Student Admission / Account Creation Form Submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const name = document.getElementById('regStudentFullName')?.value.trim();
      const phone = document.getElementById('regStudentContact')?.value.trim();
      const age = document.getElementById('regStudentAgeNum')?.value.trim();
      const place = document.getElementById('regStudentPlaceText')?.value.trim();
      const course = document.getElementById('regStudentCourseSelect')?.value || 'Quran & Tajweed';
      const duration = document.getElementById('regStudentDurationSelect')?.value || '60 Minutes';
      const classType = document.getElementById('regStudentClassTypeSelect')?.value || 'Group Class';
      const password = document.getElementById('regStudentPass')?.value;
      const confirmPassword = document.getElementById('regStudentConfirmPass')?.value;

      // Class Days Multi-select checkboxes
      const dayCheckboxes = document.querySelectorAll('input[name="regClassDays"]:checked');
      const selectedDays = Array.from(dayCheckboxes).map(cb => cb.value);

      if (!name || !phone || !password || !confirmPassword) {
        showAlert('Please fill in all mandatory fields.');
        return;
      }

      if (password !== confirmPassword) {
        showAlert('Passwords do not match. Please re-enter your password.');
        return;
      }

      if (password.length < 6) {
        showAlert('Password must be at least 6 characters long.');
        return;
      }

      if (selectedDays.length === 0) {
        showAlert('Please select at least one preferred class day.');
        return;
      }

      const submitBtn = document.getElementById('studentRegSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="animate-spin mr-2">◌</span> Creating Student Account...`;
      }

      try {
        if (window.ZawiyahAuth && typeof window.ZawiyahAuth.registerStudent === 'function') {
          const res = await window.ZawiyahAuth.registerStudent({
            student_name: name,
            contact_number: phone,
            age: age,
            place: place,
            class_course: course,
            class_days: selectedDays,
            daily_duration: duration,
            class_type: classType,
            password: password
          });

          if (res.success) {
            const assignedId = res.student_id || res.id || 'ZAW-STU-XXX';
            showAlert(`🎉 <strong>Account Created Successfully!</strong><br><br>Assigned Student ID: <strong class="font-mono text-accent-lime underline">${assignedId}</strong><br>Status: <span class="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold text-[11px]">PENDING APPROVAL</span><br><br>Your account has been submitted and is waiting for administrator approval. Once approved, you can login directly using your Student ID: <strong>${assignedId}</strong>.`, 'success');
            registerForm.reset();
            
            // Switch back to Login Tab after short delay with prefilled Student ID
            setTimeout(() => {
              if (tabLoginBtn) tabLoginBtn.click();
              if (studentIdentifier) {
                studentIdentifier.value = assignedId;
                if (studentPassword) studentPassword.focus();
              }
            }, 3000);
          } else {
            showAlert(res.message || 'Failed to create student account.');
          }
        }
      } catch (err) {
        showAlert('Network or server error while creating account.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Create Student Account</span><i data-lucide="send" class="w-3.5 h-3.5"></i>`;
          if (window.lucide) window.lucide.createIcons();
        }
      }
    });
  }

  // Logout Action
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out of your student portal?')) {
        if (window.ZawiyahAuth) window.ZawiyahAuth.logout();
        localStorage.removeItem('zawiyah_student_logged_in');
        showLogin();
      }
    });
  }

  // Forgot Password Modal Setup
  initStudentForgotPassword();
}

// ---------------------------------------------------------------------------
// Student Forgot Password Modal Controller (2-Step Verification)
// ---------------------------------------------------------------------------
let currentForgotStudentId = null;

function openStudentForgotModal() {
  const modal = document.getElementById('studentForgotModal');
  const card = document.getElementById('studentForgotCard');
  if (modal && card) {
    resetForgotStep1();
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100', 'pointer-events-auto');
    card.classList.remove('scale-95');
    card.classList.add('scale-100');
    document.body.style.overflow = 'hidden';
  }
  if (window.lucide) window.lucide.createIcons();
}

function closeStudentForgotModal() {
  const modal = document.getElementById('studentForgotModal');
  const card = document.getElementById('studentForgotCard');
  if (modal && card) {
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    modal.classList.add('opacity-0', 'pointer-events-none');
    card.classList.remove('scale-100');
    card.classList.add('scale-95');
    document.body.style.overflow = '';
  }
}

function resetForgotStep1() {
  const step1 = document.getElementById('studentForgotStep1Form');
  const step2 = document.getElementById('studentForgotStep2Form');
  const alertEl = document.getElementById('studentForgotAlert');
  if (step1) step1.classList.remove('hidden');
  if (step2) step2.classList.add('hidden');
  if (alertEl) alertEl.classList.add('hidden');
  currentForgotStudentId = null;
}

function initStudentForgotPassword() {
  const step1Form = document.getElementById('studentForgotStep1Form');
  const step2Form = document.getElementById('studentForgotStep2Form');
  const alertEl = document.getElementById('studentForgotAlert');

  const showForgotAlert = (msg, isSuccess = false) => {
    if (!alertEl) return;
    alertEl.classList.remove('hidden', 'bg-rose-500/20', 'border-rose-500/40', 'text-rose-200', 'bg-emerald-500/20', 'border-emerald-500/40', 'text-emerald-200');
    if (isSuccess) {
      alertEl.classList.add('bg-emerald-500/20', 'border', 'border-emerald-500/40', 'text-emerald-200');
    } else {
      alertEl.classList.add('bg-rose-500/20', 'border', 'border-rose-500/40', 'text-rose-200');
    }
    alertEl.innerHTML = msg;
  };

  if (step1Form) {
    step1Form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (alertEl) alertEl.classList.add('hidden');

      const idInput = document.getElementById('forgotStudentIdInput');
      const ident = idInput ? idInput.value.trim() : '';

      if (!ident) {
        showForgotAlert('Please enter your Student ID or Contact Number.');
        return;
      }

      const verifyBtn = document.getElementById('forgotVerifyIdBtn');
      if (verifyBtn) {
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = `<span class="animate-spin mr-1">◌</span> Verifying...`;
      }

      try {
        if (window.ZawiyahAuth && typeof window.ZawiyahAuth.verifyStudentForgot === 'function') {
          const res = await window.ZawiyahAuth.verifyStudentForgot(ident);
          if (res.success) {
            currentForgotStudentId = res.student_id;
            document.getElementById('forgotMatchedName').textContent = res.student_name || 'Student';
            document.getElementById('forgotMaskedContact').textContent = res.masked_contact || 'Registered Phone';

            step1Form.classList.add('hidden');
            step2Form.classList.remove('hidden');
            if (window.lucide) window.lucide.createIcons();
          } else {
            showForgotAlert(res.message || 'No account found matching this Student ID.');
          }
        }
      } catch (err) {
        showForgotAlert('Error communicating with server.');
      } finally {
        if (verifyBtn) {
          verifyBtn.disabled = false;
          verifyBtn.innerHTML = `<span>Verify Account</span><i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>`;
          if (window.lucide) window.lucide.createIcons();
        }
      }
    });
  }

  if (step2Form) {
    step2Form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (alertEl) alertEl.classList.add('hidden');

      const contact = document.getElementById('forgotConfirmContactInput')?.value.trim();
      const newPass = document.getElementById('forgotNewPasswordInput')?.value;
      const confirmPass = document.getElementById('forgotConfirmPasswordInput')?.value;

      if (!contact || !newPass || !confirmPass) {
        showForgotAlert('Please fill in all fields.');
        return;
      }

      if (newPass !== confirmPass) {
        showForgotAlert('Passwords do not match.');
        return;
      }

      if (newPass.length < 6) {
        showForgotAlert('New password must be at least 6 characters.');
        return;
      }

      const resetBtn = document.getElementById('forgotResetSubmitBtn');
      if (resetBtn) {
        resetBtn.disabled = true;
        resetBtn.innerHTML = `<span class="animate-spin mr-1">◌</span> Updating...`;
      }

      try {
        if (window.ZawiyahAuth && typeof window.ZawiyahAuth.resetStudentForgot === 'function') {
          const res = await window.ZawiyahAuth.resetStudentForgot(currentForgotStudentId, contact, newPass, confirmPass);
          if (res.success) {
            showForgotAlert('✅ Password reset successfully! You can now log in.', true);
            setTimeout(() => {
              closeStudentForgotModal();
              const authAlert = document.getElementById('studentAuthAlert');
              if (authAlert) {
                authAlert.classList.remove('hidden', 'bg-rose-500/20', 'border-rose-500/40', 'text-rose-200');
                authAlert.classList.add('bg-emerald-500/20', 'border', 'border-emerald-500/40', 'text-emerald-200');
                authAlert.innerHTML = '✅ Password updated successfully! Please login with your new password.';
              }
              const studentIdentifier = document.getElementById('studentIdentifier');
              if (studentIdentifier && currentForgotStudentId) {
                studentIdentifier.value = currentForgotStudentId;
              }
              const passInput = document.getElementById('studentPassword');
              if (passInput) passInput.focus();
            }, 1200);
          } else {
            showForgotAlert(res.message || 'Verification failed. Registered number did not match.');
          }
        }
      } catch (err) {
        showForgotAlert('Error resetting password.');
      } finally {
        if (resetBtn) {
          resetBtn.disabled = false;
          resetBtn.innerHTML = `<span>Update Password</span><i data-lucide="check" class="w-3.5 h-3.5"></i>`;
          if (window.lucide) window.lucide.createIcons();
        }
      }
    });
  }
}

// 2. Tab Navigation
function initPortalTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  tabContents.forEach(content => {
    if (content.id === `tab-${tabId}`) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });

  // Scroll smoothly to top of dashboard if needed
  const dash = document.getElementById('portalDashboardView');
  if (dash) {
    const rect = dash.getBoundingClientRect();
    if (rect.top < 0) {
      dash.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// 3. Modals & Interactive Actions

// A. Live Class Modal
function launchClassModal(subject, mentor, time) {
  const modal = document.getElementById('classLaunchModal');
  const card = document.getElementById('classModalCard');
  const title = document.getElementById('classModalTitle');
  const sub = document.getElementById('classModalSubtitle');
  const btnText = document.getElementById('launchBtnText');

  if (title) title.textContent = `${subject} Live Class`;
  if (sub) sub.textContent = `Mentor: ${mentor} • Scheduled at ${time}`;
  if (btnText) btnText.textContent = 'Enter Live Class';

  if (modal && card) {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100', 'pointer-events-auto');
    card.classList.remove('scale-95');
    card.classList.add('scale-100');
    document.body.style.overflow = 'hidden';
  }

  if (window.lucide) window.lucide.createIcons();
}

function closeClassModal() {
  const modal = document.getElementById('classLaunchModal');
  const card = document.getElementById('classModalCard');

  if (modal && card) {
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    modal.classList.add('opacity-0', 'pointer-events-none');
    card.classList.remove('scale-100');
    card.classList.add('scale-95');
    document.body.style.overflow = '';
  }
}

function simulateClassConnect() {
  const btnText = document.getElementById('launchBtnText');
  if (btnText) {
    btnText.innerHTML = `<span class="animate-spin mr-1">◌</span> Connecting to Virtual Room...`;
  }

  setTimeout(() => {
    alert('Connecting to Zawiyah Virtual Classroom... (In live environment, this launches the secure live video stream with your mentor).');
    closeClassModal();
    if (btnText) btnText.textContent = 'Enter Live Class';
  }, 900);
}

// B. Course Details Trigger
function openCourseDetails(courseName, mentor, progress) {
  alert(`Course: ${courseName}\nMentor: ${mentor}\nCurrent Progress: ${progress}\n\nYour next lesson material is ready in the Learning Materials tab!`);
}

// C. Mentor Message Modal
function openMessageMentorModal(mentorName, subject) {
  const modal = document.getElementById('mentorMsgModal');
  const card = document.getElementById('mentorModalCard');
  const nameEl = document.getElementById('mentorMsgName');
  const subEl = document.getElementById('mentorMsgSubject');
  const alertEl = document.getElementById('msgSentAlert');
  const inputEl = document.getElementById('mentorMsgInput');

  if (nameEl) nameEl.textContent = `Message ${mentorName}`;
  if (subEl) subEl.textContent = `Subject: ${subject}`;
  if (alertEl) alertEl.classList.add('hidden');
  if (inputEl) inputEl.value = '';

  if (modal && card) {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100', 'pointer-events-auto');
    card.classList.remove('scale-95');
    card.classList.add('scale-100');
    document.body.style.overflow = 'hidden';
  }

  if (window.lucide) window.lucide.createIcons();
}

function closeMentorMsgModal() {
  const modal = document.getElementById('mentorMsgModal');
  const card = document.getElementById('mentorModalCard');

  if (modal && card) {
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    modal.classList.add('opacity-0', 'pointer-events-none');
    card.classList.remove('scale-100');
    card.classList.add('scale-95');
    document.body.style.overflow = '';
  }
}

function handleSendMentorMsg(e) {
  e.preventDefault();
  const alertEl = document.getElementById('msgSentAlert');
  const inputEl = document.getElementById('mentorMsgInput');

  if (alertEl) {
    alertEl.classList.remove('hidden');
  }

  setTimeout(() => {
    closeMentorMsgModal();
    if (inputEl) inputEl.value = '';
    if (alertEl) alertEl.classList.add('hidden');
  }, 1200);
}

// D. Assignment Submit Modal
function openAssignmentSubmitModal(assignTitle) {
  const modal = document.getElementById('assignmentModal');
  const card = document.getElementById('assignmentModalCard');
  const titleEl = document.getElementById('assignmentModalTitle');
  const alertEl = document.getElementById('assignSuccessAlert');

  if (titleEl) titleEl.textContent = assignTitle;
  if (alertEl) alertEl.classList.add('hidden');

  if (modal && card) {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100', 'pointer-events-auto');
    card.classList.remove('scale-95');
    card.classList.add('scale-100');
    document.body.style.overflow = 'hidden';
  }

  if (window.lucide) window.lucide.createIcons();
}

function closeAssignmentModal() {
  const modal = document.getElementById('assignmentModal');
  const card = document.getElementById('assignmentModalCard');

  if (modal && card) {
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    modal.classList.add('opacity-0', 'pointer-events-none');
    card.classList.remove('scale-100');
    card.classList.add('scale-95');
    document.body.style.overflow = '';
  }
}

function handleAssignmentSubmit(e) {
  e.preventDefault();
  const alertEl = document.getElementById('assignSuccessAlert');
  if (alertEl) alertEl.classList.remove('hidden');

  setTimeout(() => {
    closeAssignmentModal();
    if (alertEl) alertEl.classList.add('hidden');
  }, 1200);
}

// E. Learning Material Modal
function openMaterialModal(title, type, subject) {
  const modal = document.getElementById('materialModal');
  const card = document.getElementById('materialModalCard');
  const typeEl = document.getElementById('materialModalType');
  const titleEl = document.getElementById('materialModalTitle');
  const subEl = document.getElementById('materialModalSubject');

  if (typeEl) typeEl.textContent = type;
  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = `Subject: ${subject}`;

  if (modal && card) {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100', 'pointer-events-auto');
    card.classList.remove('scale-95');
    card.classList.add('scale-100');
    document.body.style.overflow = 'hidden';
  }

  if (window.lucide) window.lucide.createIcons();
}

function closeMaterialModal() {
  const modal = document.getElementById('materialModal');
  const card = document.getElementById('materialModalCard');

  if (modal && card) {
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    modal.classList.add('opacity-0', 'pointer-events-none');
    card.classList.remove('scale-100');
    card.classList.add('scale-95');
    document.body.style.overflow = '';
  }
}

function downloadMaterialMock() {
  const btn = document.getElementById('downloadBtnText');
  if (btn) btn.textContent = 'Preparing download...';

  setTimeout(() => {
    alert('Opening study material in secure viewer...');
    closeMaterialModal();
    if (btn) btn.textContent = 'Download Resource';
  }, 600);
}
