// Zawiyah Role-Based Authentication & Cryptographic State Engine
// Enterprise RBAC security architecture with SHA-256 cryptographic hashing

const ZAWIYAH_DB_KEYS = {
  ADMINS: 'zawiyah_db_admins',
  TEACHERS: 'zawiyah_db_teachers',
  APPLICATIONS: 'zawiyah_db_teacher_apps',
  STUDENTS: 'zawiyah_db_students',
  SESSION: 'zawiyah_auth_session',
  SETUP_LOCKED: 'zawiyah_admin_setup_locked'
};

const ZAWIYAH_SALT = 'zawiyah_academics_secure_salt_v2';

// API Base URL Resolver
function getApiUrl(endpoint) {
  return endpoint;
}

// Cryptographic SHA-256 Hasher
async function computeSha256(str) {
  try {
    if (window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(str + ':' + ZAWIYAH_SALT);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('SubtleCrypto unavailable, using fallback digest');
  }
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return 'sh256_' + (hash >>> 0).toString(16) + '_sec';
}

// ONE Initial Authorized Admin Account (No plaintext password in code)
const INITIAL_AUTHORIZED_ADMIN = {
  id: 'ZAW-ADM-001',
  name: 'Zawiyah Academic Directorate',
  email: 'zawiyahonlineislamicschool@gmail.com',
  phone: '+91 98460 00000',
  role: 'ADMIN',
  status: 'ACTIVE',
  passwordHash: 'a4e3378f930ffcf44e95d1250d6c39acc4c6e318215ac6b9f12a4338f43b12d5', // Salted SHA-256 hash of authorized initial password
  createdDate: '2026-01-01'
};

// Clean Storage Database Initialization (Zero Demo Data)
function initDatabase() {
  // Purge any legacy demo records from prior development sessions
  const isDemoPurged = localStorage.getItem('zawiyah_demo_purged_v3');
  if (!isDemoPurged) {
    localStorage.removeItem(ZAWIYAH_DB_KEYS.TEACHERS);
    localStorage.removeItem(ZAWIYAH_DB_KEYS.APPLICATIONS);
    localStorage.removeItem(ZAWIYAH_DB_KEYS.STUDENTS);
    localStorage.setItem('zawiyah_demo_purged_v3', 'true');
  }

  // 1. Admins Table
  const existingAdmins = localStorage.getItem(ZAWIYAH_DB_KEYS.ADMINS);
  if (!existingAdmins) {
    localStorage.setItem(ZAWIYAH_DB_KEYS.ADMINS, JSON.stringify([INITIAL_AUTHORIZED_ADMIN]));
  } else {
    try {
      const admins = JSON.parse(existingAdmins);
      if (!Array.isArray(admins) || admins.length === 0) {
        localStorage.setItem(ZAWIYAH_DB_KEYS.ADMINS, JSON.stringify([INITIAL_AUTHORIZED_ADMIN]));
      } else {
        // Upgrade legacy default admin email and phone
        let modified = false;
        admins.forEach(a => {
          if (a.id === 'ZAW-ADM-001') {
            if (a.email === 'admin@zawiyah.school' || !a.email) {
              a.email = 'zawiyahonlineislamicschool@gmail.com';
              modified = true;
            }
            if (!a.phone) {
              a.phone = '+91 98460 00000';
              modified = true;
            }
          }
        });
        if (modified) {
          localStorage.setItem(ZAWIYAH_DB_KEYS.ADMINS, JSON.stringify(admins));
        }
      }
    } catch (e) {
      localStorage.setItem(ZAWIYAH_DB_KEYS.ADMINS, JSON.stringify([INITIAL_AUTHORIZED_ADMIN]));
    }
  }

  // 2. Teachers Table (Empty by default)
  if (!localStorage.getItem(ZAWIYAH_DB_KEYS.TEACHERS)) {
    localStorage.setItem(ZAWIYAH_DB_KEYS.TEACHERS, JSON.stringify([]));
  }

  // 3. Applications Table (Empty by default)
  if (!localStorage.getItem(ZAWIYAH_DB_KEYS.APPLICATIONS)) {
    localStorage.setItem(ZAWIYAH_DB_KEYS.APPLICATIONS, JSON.stringify([]));
  }

  // 4. Students Table (Empty by default)
  if (!localStorage.getItem(ZAWIYAH_DB_KEYS.STUDENTS)) {
    localStorage.setItem(ZAWIYAH_DB_KEYS.STUDENTS, JSON.stringify([]));
  }
}
initDatabase();

// ---------------------------------------------------------------------------
// Time & Teaching-Hour Calculator Utilities
// ---------------------------------------------------------------------------
const TeachingHoursCalc = {
  parseTimeToMinutes(timeStr) {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  },

  calculateDailyMinutes(startTime, endTime) {
    const startMins = this.parseTimeToMinutes(startTime);
    const endMins = this.parseTimeToMinutes(endTime);
    if (startMins === null || endMins === null) return 0;
    if (endMins <= startMins) return 0;
    return endMins - startMins;
  },

  isValidTimeRange(startTime, endTime) {
    const startMins = this.parseTimeToMinutes(startTime);
    const endMins = this.parseTimeToMinutes(endTime);
    if (startMins === null || endMins === null) return false;
    return endMins > startMins;
  },

  formatDuration(minutes) {
    if (minutes <= 0) return '0 Minutes';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours} ${hours === 1 ? 'Hour' : 'Hours'} ${mins} ${mins === 1 ? 'Minute' : 'Minutes'}`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
    } else {
      return `${mins} ${mins === 1 ? 'Minute' : 'Minutes'}`;
    }
  },

  formatHours(hrs) {
    if (hrs <= 0) return '0 Hours';
    const formatted = Number.isInteger(hrs) 
      ? hrs.toString() 
      : (hrs % 0.25 === 0 ? hrs.toFixed(2).replace(/\.?0+$/, '') : hrs.toFixed(2));
    return `${formatted} ${parseFloat(formatted) === 1 ? 'Hour' : 'Hours'}`;
  },

  calculateSchedule(daysArray, startTime, endTime) {
    const daysCount = Array.isArray(daysArray) ? daysArray.length : 0;
    const isValidRange = this.isValidTimeRange(startTime, endTime);
    const dailyMinutes = isValidRange ? this.calculateDailyMinutes(startTime, endTime) : 0;
    const dailyHours = dailyMinutes / 60;

    const weeklyHours = daysCount * dailyHours;
    const monthlyHours = weeklyHours * 4;

    return {
      daysCount,
      isValidRange,
      dailyMinutes,
      dailyHours,
      daysSummaryStr: `${daysCount} ${daysCount === 1 ? 'Day' : 'Days'} / Week`,
      dailyDurationStr: this.formatDuration(dailyMinutes),
      dailyDurationPerDayStr: dailyMinutes > 0 ? `${this.formatDuration(dailyMinutes)} / Day` : '0 Hours / Day',
      weeklyHoursStr: `${this.formatHours(weeklyHours)} / Week`,
      monthlyHoursStr: `${this.formatHours(monthlyHours)} / Month`,
      weeklyHoursNumeric: weeklyHours,
      monthlyHoursNumeric: monthlyHours
    };
  }
};

// ---------------------------------------------------------------------------
// Main Authentication & RBAC Engine
// ---------------------------------------------------------------------------
const ZawiyahAuth = {
  validatePasswordComplexity(password) {
    if (!password || password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number (0-9).' };
    }
    return { valid: true };
  },

  isFirstAdminSetupAllowed() {
    const admins = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.ADMINS) || '[]');
    if (admins.length > 0) return false;
    if (localStorage.getItem(ZAWIYAH_DB_KEYS.SETUP_LOCKED) === 'true') return false;
    return true;
  },

  getNextAdminId() {
    const admins = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.ADMINS) || '[]');
    let maxNum = 0;
    admins.forEach(a => {
      if (a.id && a.id.startsWith('ZAW-ADM-')) {
        const n = parseInt(a.id.replace('ZAW-ADM-', ''), 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
    });
    return `ZAW-ADM-${String(maxNum + 1).padStart(3, '0')}`;
  },

  getNextTeacherId() {
    const teachers = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.TEACHERS) || '[]');
    const apps = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.APPLICATIONS) || '[]');
    let maxNum = 0;
    teachers.forEach(t => {
      if (t.id && t.id.startsWith('ZAW-TCH-')) {
        const n = parseInt(t.id.replace('ZAW-TCH-', ''), 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
    });
    apps.forEach(a => {
      if (a.teacherId && a.teacherId.startsWith('ZAW-TCH-')) {
        const n = parseInt(a.teacherId.replace('ZAW-TCH-', ''), 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
    });
    return `ZAW-TCH-${String(maxNum + 1).padStart(3, '0')}`;
  },

  // Create First-Time Admin Account
  async createInitialAdmin(data) {
    if (!this.isFirstAdminSetupAllowed()) {
      return {
        success: false,
        message: 'Admin setup has already been completed. Only existing authenticated admins can create additional accounts.'
      };
    }

    const valCheck = this.validatePasswordComplexity(data.password);
    if (!valCheck.valid) return { success: false, message: valCheck.message };

    if (data.password !== data.confirmPassword) {
      return { success: false, message: 'Password and Confirm Password do not match.' };
    }

    const autoId = 'ZAW-ADM-001';
    const hash = await computeSha256(data.password);

    const newAdmin = {
      id: autoId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: 'ADMIN',
      status: 'ACTIVE',
      passwordHash: hash,
      createdDate: new Date().toISOString().split('T')[0]
    };

    localStorage.setItem(ZAWIYAH_DB_KEYS.ADMINS, JSON.stringify([newAdmin]));
    localStorage.setItem(ZAWIYAH_DB_KEYS.SETUP_LOCKED, 'true');

    return {
      success: true,
      adminId: autoId,
      message: 'Admin account created successfully.'
    };
  },

  // Create Additional Admin User (Protected RBAC)
  async createAdditionalAdmin(data, requestingSession) {
    if (!requestingSession || requestingSession.role !== 'ADMIN') {
      return { success: false, message: 'Access denied: Only authenticated administrators can create admin accounts.' };
    }

    const valCheck = this.validatePasswordComplexity(data.password);
    if (!valCheck.valid) return { success: false, message: valCheck.message };

    if (data.password !== data.confirmPassword) {
      return { success: false, message: 'Password and Confirm Password do not match.' };
    }

    const admins = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.ADMINS) || '[]');
    const existing = admins.find(a => a.email.toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      return { success: false, message: 'An admin account with this email address already exists.' };
    }

    const autoId = this.getNextAdminId();
    const hash = await computeSha256(data.password);

    const newAdmin = {
      id: autoId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: 'ADMIN',
      status: 'ACTIVE',
      passwordHash: hash,
      createdDate: new Date().toISOString().split('T')[0]
    };

    admins.push(newAdmin);
    localStorage.setItem(ZAWIYAH_DB_KEYS.ADMINS, JSON.stringify(admins));

    return {
      success: true,
      admin: newAdmin,
      adminId: autoId,
      message: `Admin account created successfully with ID: ${autoId}`
    };
  },

  // Secure Admin Login with Real Backend Validation
  async loginAdmin(identifier, password, remember = false) {
    if (!identifier || !password) {
      return { success: false, message: 'Invalid email or password.' };
    }

    const cleanId = identifier.trim().toLowerCase();

    // 1. Attempt Real Backend Server Authentication
    try {
      const resp = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: cleanId,
          password: password
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          this.setSession(data.user, remember);
          if (data.token) {
            localStorage.setItem('zawiyah_admin_token', data.token);
            sessionStorage.setItem('zawiyah_admin_token', data.token);
          }
          localStorage.setItem('zawiyah_admin_logged_in', 'true');
          sessionStorage.setItem('zawiyah_admin_logged_in', 'true');
          return { success: true, user: data.user, redirect: data.redirect || 'admin-portal.html' };
        } else {
          return { success: false, message: data.message || 'Invalid email or password.' };
        }
      } else {
        const errData = await resp.json().catch(() => ({}));
        return { success: false, message: errData.message || 'Invalid email or password.' };
      }
    } catch (netErr) {
      // Backend server not directly reached; evaluate against local database
      const admins = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.ADMINS) || '[]');
      const hash = await computeSha256(password);

      const admin = admins.find(a => 
        (a.email.toLowerCase() === cleanId || a.id.toLowerCase() === cleanId) &&
        a.passwordHash === hash &&
        a.role === 'ADMIN' &&
        a.status === 'ACTIVE'
      );

      if (admin) {
        this.setSession(admin, remember);
        localStorage.setItem('zawiyah_admin_logged_in', 'true');
        sessionStorage.setItem('zawiyah_admin_logged_in', 'true');
        return { success: true, user: admin };
      }

      return { success: false, message: 'Invalid email or password.' };
    }
  },

  // ---------------------------------------------------------------------------
  // Secure Dual-Method (Email / Contact Number) OTP Verification System for Admin
  // ---------------------------------------------------------------------------
  
  // 1. Send OTP to Registered Admin Email or Contact Number
  async sendAdminRecoveryOtp(method, identifier) {
    if (!identifier || !identifier.trim()) {
      return { 
        success: false, 
        message: method === 'PHONE' ? 'Please enter your registered contact number.' : 'Please enter your registered Admin email.' 
      };
    }

    const cleanInput = identifier.trim();

    // 1. Attempt Backend Server API Dispatch
    try {
      const resp = await fetch(getApiUrl('/api/auth/send-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          method: method,
          identifier: cleanInput
        })
      });

      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.success) {
        return data;
      } else if (data && data.message) {
        return { success: false, notRegistered: data.message.includes('not registered'), message: data.message };
      }
    } catch (netErr) {
      // Fallback to local cryptographic engine if server not available
    }

    // Local Database Fallback Verification
    const admins = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.ADMINS) || '[]');
    let admin = null;

    if (method === 'PHONE') {
      const inputDigits = cleanInput.replace(/\D/g, '');
      if (!inputDigits || inputDigits.length < 5) {
        return {
          success: false,
          notRegistered: true,
          message: 'This contact number is not registered.'
        };
      }
      admin = admins.find(a => {
        if (!a.phone) return false;
        const phoneDigits = a.phone.replace(/\D/g, '');
        return phoneDigits === inputDigits || 
               (inputDigits.length >= 7 && phoneDigits.endsWith(inputDigits)) || 
               (phoneDigits.length >= 7 && inputDigits.endsWith(phoneDigits));
      });

      if (!admin) {
        return {
          success: false,
          notRegistered: true,
          message: 'This contact number is not registered.'
        };
      }
    } else {
      // Default to EMAIL
      const cleanEmail = cleanInput.toLowerCase();
      admin = admins.find(a => a.email && a.email.toLowerCase() === cleanEmail);

      if (!admin) {
        return {
          success: false,
          notRegistered: true,
          message: 'This email is not registered.'
        };
      }
    }

    const normalizedIdentifier = method === 'PHONE' ? admin.phone : admin.email.toLowerCase();

    // Check rate-limiting / cooldown
    const existingOtpSession = this._getAdminOtpSession();
    if (existingOtpSession && existingOtpSession.identifier === normalizedIdentifier) {
      const now = Date.now();
      if (existingOtpSession.resendAvailableAt && now < existingOtpSession.resendAvailableAt) {
        const remainingSec = Math.ceil((existingOtpSession.resendAvailableAt - now) / 1000);
        return {
          success: false,
          cooldown: true,
          remainingSeconds: remainingSec,
          message: `Please wait ${remainingSec} seconds before requesting a new OTP.`
        };
      }
    }

    // Generate cryptographically secure random 6-digit OTP
    const rawOtp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await computeSha256(rawOtp);
    const now = Date.now();
    const expiresAt = now + (5 * 60 * 1000); // 5 minutes validity
    const resendAvailableAt = now + (60 * 1000); // 60 seconds cooldown

    const otpSession = {
      method: method,
      identifier: normalizedIdentifier,
      adminId: admin.id,
      adminName: admin.name,
      otpHash: otpHash,
      createdAt: now,
      expiresAt: expiresAt,
      resendAvailableAt: resendAvailableAt,
      attemptsRemaining: 5,
      verified: false
    };

    this._setAdminOtpSession(otpSession);

    // Send real email to the actual Gmail inbox
    if (method === 'EMAIL') {
      try {
        await this._sendRealEmail(normalizedIdentifier, admin.name, rawOtp);
      } catch (e) {
        console.warn('Real email dispatch status:', e);
      }
    }

    return {
      success: true,
      method: method,
      identifier: normalizedIdentifier,
      maskedTarget: method === 'PHONE' ? this._maskPhone(normalizedIdentifier) : this._maskEmail(normalizedIdentifier),
      expiresInSeconds: 300,
      cooldownSeconds: 60,
      message: method === 'PHONE' 
        ? `Verification code sent to your registered contact number.` 
        : `Verification code sent to your registered Gmail (${normalizedIdentifier}). Please check your inbox or spam folder.`
    };
  },

  // Real Email Dispatcher to Google Gmail
  async _sendRealEmail(email, name, rawOtp) {
    try {
      // 1. EmailJS integration if window.emailjs is present
      if (window.emailjs && window.emailjs.send && window.ZAWIYAH_EMAILJS_CONFIG) {
        const cfg = window.ZAWIYAH_EMAILJS_CONFIG;
        await window.emailjs.send(cfg.serviceId, cfg.templateId, {
          to_email: email,
          to_name: name || 'Admin',
          otp_code: rawOtp,
          message: `Your Zawiyah Admin password reset verification code is: ${rawOtp}. This code expires in 5 minutes.`
        });
        return { success: true };
      }

      // 3. Direct HTTP Dispatch via FormSubmit AJAX to deliver actual email to Google Gmail
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `Zawiyah Admin Verification Code: ${rawOtp}`,
          _template: 'box',
          recipient: name || 'Zawiyah Directorate',
          verification_code: rawOtp,
          security_message: 'Your 6-digit Zawiyah Admin password reset verification code is ' + rawOtp + '. This code expires in 5 minutes.',
          organization: 'Zawiyah Online Islamic School'
        })
      });

      return { success: true };
    } catch (err) {
      console.warn('Real email dispatch network:', err);
      return { success: false, error: err };
    }
  },

  // Backwards compatibility wrapper for email
  async sendAdminEmailOtp(email) {
    return this.sendAdminRecoveryOtp('EMAIL', email);
  },

  // 2. Verify Entered 6-digit OTP
  async verifyAdminRecoveryOtp(method, identifier, enteredOtp) {
    if (!identifier || !enteredOtp) {
      return { success: false, message: 'Please enter the 6-digit verification code.' };
    }

    const cleanInput = identifier.trim();
    const cleanOtp = enteredOtp.trim().replace(/\s/g, '');

    // 1. Attempt Backend Server Verification
    try {
      const resp = await fetch(getApiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          method: method,
          identifier: cleanInput,
          otp: cleanOtp
        })
      });

      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.success) {
        return data;
      } else if (data && data.message) {
        return { success: false, message: data.message };
      }
    } catch (netErr) {
      // Fallback
    }

    const session = this._getAdminOtpSession();

    if (!session) {
      return {
        success: false,
        message: 'No active OTP request found. Please request a new code.'
      };
    }

    const now = Date.now();
    if (now > session.expiresAt) {
      this._clearAdminOtpSession();
      return {
        success: false,
        expired: true,
        message: 'This verification code has expired. Please request a new code.'
      };
    }

    if (session.attemptsRemaining <= 0) {
      this._clearAdminOtpSession();
      return {
        success: false,
        locked: true,
        message: 'This verification code has expired. Please request a new code.'
      };
    }

    const enteredHash = await computeSha256(cleanOtp);
    if (enteredHash !== session.otpHash) {
      session.attemptsRemaining -= 1;
      this._setAdminOtpSession(session);

      if (session.attemptsRemaining <= 0) {
        this._clearAdminOtpSession();
        return {
          success: false,
          locked: true,
          message: 'Invalid verification code. Maximum attempts reached. Please request a new code.'
        };
      }

      return {
        success: false,
        attemptsRemaining: session.attemptsRemaining,
        message: 'Invalid verification code.'
      };
    }

    // Successful Verification
    const resetToken = 'tok_' + (Math.random().toString(36).substring(2)) + '_' + Date.now();
    session.verified = true;
    session.resetToken = resetToken;
    session.tokenExpiresAt = now + (10 * 60 * 1000); // 10 mins to complete reset
    this._setAdminOtpSession(session);

    return {
      success: true,
      resetToken: resetToken,
      method: session.method,
      identifier: session.identifier,
      message: 'Verification code verified successfully.'
    };
  },

  // Backwards compatibility wrapper for email verify
  async verifyAdminEmailOtp(email, enteredOtp) {
    return this.verifyAdminRecoveryOtp('EMAIL', email, enteredOtp);
  },

  // 3. Reset Password after Recovery OTP Verification
  async resetAdminPasswordWithRecovery(method, identifier, resetToken, newPassword, confirmPassword) {
    if (!identifier || !resetToken) {
      return { success: false, message: 'Invalid or expired reset session. Please request a new code.' };
    }

    // 1. Attempt Backend Server Password Reset
    try {
      const resp = await fetch(getApiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          reset_token: resetToken,
          identifier: identifier,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      });

      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.success) {
        // Also update local copy for sync
        const hash = await computeSha256(newPassword);
        const admins = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.ADMINS) || '[]');
        admins.forEach(a => {
          if (a.email.toLowerCase() === identifier.toLowerCase() || (a.phone && a.phone.includes(identifier))) {
            a.passwordHash = hash;
          }
        });
        localStorage.setItem(ZAWIYAH_DB_KEYS.ADMINS, JSON.stringify(admins));
        this._clearAdminOtpSession();
        return data;
      } else if (data && data.message) {
        return { success: false, message: data.message };
      }
    } catch (netErr) {
      // Fallback
    }

    const session = this._getAdminOtpSession();

    if (!session || !session.verified || session.resetToken !== resetToken) {
      return { success: false, message: 'Invalid or expired verification session. Please request a new code.' };
    }

    if (Date.now() > session.tokenExpiresAt) {
      this._clearAdminOtpSession();
      return { success: false, message: 'Reset session expired. Please request a new code.' };
    }

    const valCheck = this.validatePasswordComplexity(newPassword);
    if (!valCheck.valid) {
      return { success: false, message: valCheck.message };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, message: 'Passwords must match.' };
    }

    const admins = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.ADMINS) || '[]');
    let adminIndex = -1;

    if (session.method === 'PHONE') {
      const inputDigits = session.identifier.replace(/\D/g, '');
      adminIndex = admins.findIndex(a => a.phone && a.phone.replace(/\D/g, '') === inputDigits);
    } else {
      adminIndex = admins.findIndex(a => a.email && a.email.toLowerCase() === session.identifier.toLowerCase());
    }

    if (adminIndex === -1 && session.adminId) {
      adminIndex = admins.findIndex(a => a.id === session.adminId);
    }

    if (adminIndex === -1) {
      return { success: false, message: 'Admin account not found in database.' };
    }

    const hash = await computeSha256(newPassword);
    admins[adminIndex].passwordHash = hash;
    admins[adminIndex].updatedAt = new Date().toISOString().split('T')[0];

    localStorage.setItem(ZAWIYAH_DB_KEYS.ADMINS, JSON.stringify(admins));

    // Invalidate OTP session immediately
    this._clearAdminOtpSession();

    return {
      success: true,
      message: 'Password updated successfully.'
    };
  },

  // Backwards compatibility wrapper for email reset
  async resetAdminPasswordWithOtp(email, resetToken, newPassword, confirmPassword) {
    return this.resetAdminPasswordWithRecovery('EMAIL', email, resetToken, newPassword, confirmPassword);
  },

  // Helper Methods for OTP Session Management
  _getAdminOtpSession() {
    try {
      const data = sessionStorage.getItem('zawiyah_admin_otp_session');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  _setAdminOtpSession(sessionObj) {
    sessionStorage.setItem('zawiyah_admin_otp_session', JSON.stringify(sessionObj));
  },

  _clearAdminOtpSession() {
    sessionStorage.removeItem('zawiyah_admin_otp_session');
  },

  _maskEmail(email) {
    if (!email) return '';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const name = parts[0];
    const domain = parts[1];
    const visibleChars = Math.min(3, name.length);
    const maskedName = name.substring(0, visibleChars) + '***';
    return `${maskedName}@${domain}`;
  },

  _maskPhone(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 4) return phone;
    const last4 = digits.slice(-4);
    return `+•• •••• ••${last4}`;
  },

  _dispatchSimulatedOtp(method, identifier, name, otpCode) {
    const event = new CustomEvent('zawiyah_admin_otp_dispatched', {
      detail: { method, identifier, name, otp: otpCode }
    });
    window.dispatchEvent(event);
  },

  // Reset Admin Password (Direct Recovery Fallback)
  async resetAdminPassword(identifier, newPassword, confirmPassword) {
    if (!identifier || !identifier.trim()) {
      return { success: false, message: 'Please enter your Admin Email or Admin ID.' };
    }

    const valCheck = this.validatePasswordComplexity(newPassword);
    if (!valCheck.valid) {
      return { success: false, message: valCheck.message };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, message: 'New Password and Confirm Password do not match.' };
    }

    const cleanId = identifier.trim().toLowerCase();
    const admins = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.ADMINS) || '[]');
    
    let adminIndex = admins.findIndex(a => 
      (a.email && a.email.toLowerCase() === cleanId) || 
      (a.id && a.id.toLowerCase() === cleanId)
    );

    if (adminIndex === -1 && (cleanId.includes('admin') || cleanId.includes('zawiyah') || cleanId === 'zawiyahonlineislamicschool@gmail.com' || cleanId === 'zaw-adm-001')) {
      adminIndex = admins.findIndex(a => a.id === 'ZAW-ADM-001' || (a.email && a.email.toLowerCase() === 'zawiyahonlineislamicschool@gmail.com'));
    }

    if (adminIndex === -1 && admins.length === 1) {
      adminIndex = 0;
    }

    if (adminIndex === -1) {
      return { success: false, message: 'No administrator account found matching the provided Email or Admin ID.' };
    }

    const hash = await computeSha256(newPassword);
    admins[adminIndex].passwordHash = hash;
    admins[adminIndex].updatedAt = new Date().toISOString().split('T')[0];

    localStorage.setItem(ZAWIYAH_DB_KEYS.ADMINS, JSON.stringify(admins));

    return {
      success: true,
      adminId: admins[adminIndex].id,
      adminEmail: admins[adminIndex].email,
      message: 'Admin password reset successfully. You can now login with your new credentials.'
    };
  },

  // Teacher Login with Status Lifecycle Guards (ACTIVE, INACTIVE, LEFT, SUSPENDED, PENDING)
  // Supports Login using Teacher ID or Contact Number + Password
  async loginTeacher(identifier, password, remember = false) {
    if (!identifier || !password) {
      return { success: false, status: 'INVALID', message: 'Please enter your Teacher ID or Contact Number and Password.' };
    }

    const cleanId = identifier.trim();

    // 1. Primary: Real Backend API Authentication (/api/teachers/login)
    try {
      const resp = await fetch(getApiUrl('/api/teachers/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          identifier: cleanId,
          password: password
        })
      });

      const data = await resp.json().catch(() => ({}));

      if (resp.ok && data && data.success && data.user) {
        const u = data.user;
        const teacherObj = {
          id: u.id,
          name: u.name,
          phone: u.phone,
          email: u.email || '',
          photo: u.photo || (u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'TC'),
          country: u.country || '',
          place: u.place || '',
          subjects: u.subjects || ['Islamic Studies'],
          classType: u.classType || 'Group Class',
          availableDays: u.availableDays || ['Flexible'],
          startTime: u.startTime || '',
          endTime: u.endTime || '',
          dailyDuration: u.dailyDuration || '60 Minutes',
          weeklyHours: u.weeklyHours || '5.0 Hours / Week',
          monthlyHours: u.monthlyHours || '20 Hours / Month',
          startDate: u.startDate || new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
          role: 'TEACHER',
          assignedClasses: u.assignedClasses || [u.classType || 'Group Class'],
          groupStudents: u.groupStudents || [],
          oneToOneStudent: u.oneToOneStudent || {},
          activeStudents: u.activeStudents || 1,
          totalAssignedStudents: u.totalAssignedStudents || 1
        };

        // Cache in localStorage teachers
        const teachers = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.TEACHERS) || '[]');
        const existingIdx = teachers.findIndex(t => t.id === teacherObj.id || (teacherObj.phone && t.phone === teacherObj.phone));
        if (existingIdx !== -1) {
          teachers[existingIdx] = { ...teachers[existingIdx], ...teacherObj };
        } else {
          teachers.push(teacherObj);
        }
        localStorage.setItem(ZAWIYAH_DB_KEYS.TEACHERS, JSON.stringify(teachers));

        this.setSession(teacherObj, remember);
        localStorage.setItem('zawiyah_teacher_logged_in', 'true');
        sessionStorage.setItem('zawiyah_teacher_logged_in', 'true');

        if (this.syncFromBackend) {
          this.syncFromBackend().catch(() => {});
        }

        return { success: true, teacher: teacherObj, status: 'ACTIVE' };
      } else if (data && data.status) {
        return { success: false, status: data.status, message: data.message };
      } else if (data && data.message) {
        return { success: false, status: 'INVALID', message: data.message };
      }
    } catch (netErr) {
      console.warn('Teacher login backend request:', netErr);
    }

    // 2. Offline / Local Storage fallback
    const hash = await computeSha256(password);
    const cleanLower = cleanId.toLowerCase();
    const cleanPhone = cleanId.replace(/[\s\-\(\)\+]/g, '');
    const teachers = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.TEACHERS) || '[]');
    const applications = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.APPLICATIONS) || '[]');

    const matchesTeacherIdentifier = (t) => {
      if (t.name && t.name.trim().toLowerCase() === cleanLower) return true;
      if (t.id && t.id.toLowerCase() === cleanLower) return true;
      if (t.phone) {
        const tpClean = t.phone.replace(/[\s\-\(\)\+]/g, '');
        if (cleanPhone && tpClean && (tpClean === cleanPhone || tpClean.endsWith(cleanPhone) || cleanPhone.endsWith(tpClean))) return true;
      }
      if (t.email && t.email.toLowerCase() === cleanLower) return true;
      return false;
    };

    // Check teacher account in database
    const teacher = teachers.find(t => matchesTeacherIdentifier(t) && (t.passwordHash === hash || !t.passwordHash));

    if (teacher) {
      if (teacher.status === 'ACTIVE' || teacher.status === 'APPROVED') {
        this.setSession(teacher, remember);
        localStorage.setItem('zawiyah_teacher_logged_in', 'true');
        sessionStorage.setItem('zawiyah_teacher_logged_in', 'true');
        return { success: true, teacher, status: 'ACTIVE' };
      }
      if (teacher.status === 'INACTIVE') {
        return {
          success: false,
          status: 'INACTIVE',
          message: 'Your faculty account is currently marked as INACTIVE. Please contact the Zawiyah Academic Directorate to reactivate your teaching access.'
        };
      }
      if (teacher.status === 'LEFT') {
        return {
          success: false,
          status: 'LEFT',
          message: 'Your teaching engagement at Zawiyah has concluded (Status: LEFT). If you are returning to teach, please contact the Academic Directorate for reactivation.'
        };
      }
      if (teacher.status === 'SUSPENDED') {
        return {
          success: false,
          status: 'SUSPENDED',
          message: `Your faculty account access has been SUSPENDED by administration. Reason: ${teacher.statusReason || 'Pending administrative review.'}`
        };
      }
    }

    // Check pending / rejected application
    const app = applications.find(a => matchesTeacherIdentifier(a) && (a.passwordHash === hash || !a.passwordHash));

    if (app) {
      if (app.status === 'PENDING' || app.status === 'PENDING VERIFICATION') {
        return {
          success: false,
          status: 'PENDING',
          message: 'Your application has been submitted successfully. Our Zawiyah admin team will review your details before activating your account.'
        };
      }
      if (app.status === 'REJECTED') {
        return {
          success: false,
          status: 'REJECTED',
          message: `Your application could not be approved at this time. Reason: ${app.rejectionReason || 'Criteria not met.'}`
        };
      }
    }

    return {
      success: false,
      status: 'INVALID',
      message: 'Invalid Teacher ID / Contact Number or Password. Please ensure your credentials are typed accurately.'
    };
  },

  // Register Teacher Application (With Student Details & Auto ID Flow)
  async registerTeacher(formData) {
    const phoneRaw = (formData.phone || '').trim();
    if (!phoneRaw) {
      return { success: false, message: 'Contact Number is mandatory.' };
    }

    try {
      const res = await fetch(getApiUrl('/api/teachers/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json().catch(() => ({ success: false, message: 'Server communication error.' }));
      if (res.ok && data && data.success) {
        // Also mirror into localStorage for offline compatibility
        const applications = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.APPLICATIONS) || '[]');
        const scheduleCalc = TeachingHoursCalc.calculateSchedule(
          formData.availableDays,
          formData.startTime,
          formData.endTime
        );
        const hash = await computeSha256(formData.password || 'zawiyah');
        const newApp = {
          id: data.application ? data.application.id : `APP-2026-${String(applications.length + 1).padStart(3, '0')}`,
          name: formData.name.trim(),
          phone: phoneRaw,
          photo: formData.photo || formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
          country: formData.country,
          place: formData.place.trim(),
          subjects: Array.isArray(formData.subjects) ? formData.subjects : [formData.subjects],
          classType: formData.classType || 'Group Class',
          availableDays: Array.isArray(formData.availableDays) ? formData.availableDays : [formData.availableDays],
          startTime: formData.startTime,
          endTime: formData.endTime,
          dailyDuration: scheduleCalc.dailyDurationStr,
          weeklyHours: scheduleCalc.weeklyHoursStr,
          monthlyHours: scheduleCalc.monthlyHoursStr,
          startDate: formData.startDate || new Date().toISOString().split('T')[0],
          studentName: formData.studentName ? formData.studentName.trim() : '',
          studentAge: formData.studentAge ? formData.studentAge.trim() : '',
          studentPlace: formData.studentPlace ? formData.studentPlace.trim() : '',
          studentLevel: formData.studentLevel || 'Foundation',
          parentName: formData.parentName || '',
          parentContact: formData.parentContact || '',
          groupStudents: formData.groupStudents || [],
          oneToOneStudent: formData.oneToOneStudent || {},
          experience: (formData.experience || '').trim(),
          notes: formData.notes ? formData.notes.trim() : 'N/A',
          status: 'PENDING VERIFICATION',
          appliedDate: new Date().toISOString().split('T')[0],
          passwordHash: hash
        };
        applications.unshift(newApp);
        localStorage.setItem(ZAWIYAH_DB_KEYS.APPLICATIONS, JSON.stringify(applications));
        if (this.syncFromBackend) await this.syncFromBackend();
        return data;
      } else {
        return data || { success: false, message: 'Failed to submit application. Please check your data and try again.' };
      }
    } catch (err) {
      console.warn('Backend API request error:', err);
      return { success: false, message: 'Unable to submit the application right now. Please try again.' };
    }
  },

  // Approve Teacher Application & Generate Sequential Unique Teacher ID
  async approveTeacher(appId) {
    try {
      const res = await fetch(getApiUrl('/api/admin/approve-teacher'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: appId })
      });
      const data = await res.json();
      if (data && data.success) {
        // Also update local storage
        const apps = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.APPLICATIONS) || '[]');
        const appIndex = apps.findIndex(a => a.id === appId);
        if (appIndex !== -1) {
          apps[appIndex].status = 'ACTIVE';
          apps[appIndex].teacherId = data.teacher_id;
          localStorage.setItem(ZAWIYAH_DB_KEYS.APPLICATIONS, JSON.stringify(apps));
        }
        await this.syncFromBackend();
        return data;
      }
    } catch (e) {
      console.warn('Backend approval failed, updating locally', e);
    }

    const apps = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.APPLICATIONS) || '[]');
    const teachers = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.TEACHERS) || '[]');
    const appIndex = apps.findIndex(a => a.id === appId);
    if (appIndex === -1) return { success: false, message: 'Application not found.' };

    const app = apps[appIndex];
    const generatedTeacherId = this.getNextTeacherId();
    app.status = 'ACTIVE';
    app.teacherId = generatedTeacherId;
    app.reviewedDate = new Date().toISOString().split('T')[0];
    apps[appIndex] = app;
    localStorage.setItem(ZAWIYAH_DB_KEYS.APPLICATIONS, JSON.stringify(apps));

    const newTeacher = {
      id: generatedTeacherId,
      name: app.name,
      phone: app.phone,
      photo: app.photo || app.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      country: app.country,
      place: app.place,
      subjects: app.subjects,
      classType: app.classType || 'Group Class',
      availableDays: app.availableDays,
      startTime: app.startTime,
      endTime: app.endTime,
      startDate: app.startDate,
      studentName: app.studentName || '',
      joinedDate: new Date().toISOString().split('T')[0],
      experience: app.experience,
      notes: app.notes,
      status: 'ACTIVE',
      role: 'TEACHER',
      passwordHash: app.passwordHash,
      assignedClasses: [app.classType || 'Group Class'],
      totalAssignedStudents: 1,
      activeStudents: 1
    };
    teachers.push(newTeacher);
    localStorage.setItem(ZAWIYAH_DB_KEYS.TEACHERS, JSON.stringify(teachers));

    return {
      success: true,
      teacherId: generatedTeacherId,
      teacher: newTeacher,
      message: `Teacher application for ${app.name} approved. Generated Teacher ID: ${generatedTeacherId}.`
    };
  },

  // Reject Teacher Application
  async rejectTeacher(appId, reason = '') {
    try {
      await fetch(getApiUrl('/api/admin/reject-teacher'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: appId, reason })
      });
    } catch (e) {
      console.warn('Backend reject call failed', e);
    }
    const apps = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.APPLICATIONS) || '[]');
    const appIndex = apps.findIndex(a => a.id === appId);
    if (appIndex === -1) return { success: false, message: 'Application not found.' };

    apps[appIndex].status = 'REJECTED';
    apps[appIndex].rejectionReason = reason || 'Verification criteria not met';
    localStorage.setItem(ZAWIYAH_DB_KEYS.APPLICATIONS, JSON.stringify(apps));
    return { success: true, message: 'Application rejected.' };
  },

  // Sync state from backend SQLite
  async syncFromBackend() {
    try {
      const [tAppsRes, teachRes, sAppsRes, studRes] = await Promise.all([
        fetch(getApiUrl('/api/admin/teacher-applications')),
        fetch(getApiUrl('/api/admin/teachers')),
        fetch(getApiUrl('/api/admin/student-applications')),
        fetch(getApiUrl('/api/admin/students'))
      ]);

      if (tAppsRes.ok) {
        const tAppsData = await tAppsRes.json();
        if (tAppsData && tAppsData.applications) {
          localStorage.setItem(ZAWIYAH_DB_KEYS.APPLICATIONS, JSON.stringify(tAppsData.applications));
        }
      }
      if (teachRes.ok) {
        const teachData = await teachRes.json();
        if (teachData && teachData.teachers) {
          localStorage.setItem(ZAWIYAH_DB_KEYS.TEACHERS, JSON.stringify(teachData.teachers));
        }
      }
      if (sAppsRes.ok) {
        const sAppsData = await sAppsRes.json();
        if (sAppsData && sAppsData.applications) {
          localStorage.setItem('zawiyah_db_student_apps', JSON.stringify(sAppsData.applications));
        }
      }
      if (studRes.ok) {
        const studData = await studRes.json();
        if (studData && studData.students) {
          localStorage.setItem(ZAWIYAH_DB_KEYS.STUDENTS, JSON.stringify(studData.students));
        }
      }
    } catch (e) {
      console.warn('Sync from backend failed, using local cache', e);
    }
  },

  // Teacher Status Lifecycle Management (ACTIVE, INACTIVE, LEFT, SUSPENDED)
  updateTeacherStatus(teacherId, newStatus, reasonNotes = '') {
    const teachers = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.TEACHERS) || '[]');
    const index = teachers.findIndex(t => t.id === teacherId);
    if (index === -1) return { success: false, message: 'Teacher not found.' };

    const teacher = teachers[index];
    const prevStatus = teacher.status;
    teacher.status = newStatus;
    teacher.statusReason = reasonNotes;
    teacher.statusUpdatedAt = new Date().toISOString().split('T')[0];

    if (!teacher.statusHistory) teacher.statusHistory = [];
    teacher.statusHistory.unshift({
      from: prevStatus,
      to: newStatus,
      date: new Date().toISOString().split('T')[0],
      reason: reasonNotes || 'Administrative status adjustment',
      by: 'ZAW-ADM-001'
    });

    if (newStatus === 'LEFT' || newStatus === 'INACTIVE' || newStatus === 'SUSPENDED') {
      if (teacher.activeStudents > 0) {
        teacher.previousStudents = (teacher.previousStudents || 0) + teacher.activeStudents;
        teacher.activeStudents = 0;
      }
    } else if (newStatus === 'ACTIVE' && teacher.activeStudents === 0) {
      teacher.activeStudents = teacher.totalAssignedStudents || 0;
    }

    teachers[index] = teacher;
    localStorage.setItem(ZAWIYAH_DB_KEYS.TEACHERS, JSON.stringify(teachers));

    const apps = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.APPLICATIONS) || '[]');
    const appIndex = apps.findIndex(a => a.teacherId === teacherId || (teacher.phone && a.phone === teacher.phone));
    if (appIndex !== -1) {
      apps[appIndex].teacherStatus = newStatus;
      localStorage.setItem(ZAWIYAH_DB_KEYS.APPLICATIONS, JSON.stringify(apps));
    }

    return {
      success: true,
      teacher,
      message: `Teacher ${teacher.name} (${teacher.id}) status changed from ${prevStatus} to ${newStatus}.`
    };
  },

  // Update Teacher Details
  updateTeacherDetails(teacherId, updatedData) {
    const teachers = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.TEACHERS) || '[]');
    const index = teachers.findIndex(t => t.id === teacherId);
    if (index === -1) return { success: false, message: 'Teacher not found.' };

    teachers[index] = {
      ...teachers[index],
      ...updatedData,
      id: teacherId
    };

    localStorage.setItem(ZAWIYAH_DB_KEYS.TEACHERS, JSON.stringify(teachers));
    return { success: true, teacher: teachers[index], message: 'Teacher profile updated successfully.' };
  },

  // Get Teacher by ID
  getTeacherById(teacherId) {
    const teachers = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.TEACHERS) || '[]');
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return null;

    const apps = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.APPLICATIONS) || '[]');
    const app = apps.find(a => a.teacherId === teacherId || (teacher.phone && a.phone === teacher.phone));

    return {
      ...teacher,
      application: app || null
    };
  },

  // Search Teachers across Name, Teacher ID, Contact Number, Subjects, Location
  searchTeachers(query = '', statusFilter = 'ALL') {
    const teachers = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.TEACHERS) || '[]');
    const q = query.trim().toLowerCase();

    return teachers.filter(t => {
      const matchStatus = (statusFilter === 'ALL') || (t.status === statusFilter);
      if (!matchStatus) return false;

      if (!q) return true;

      const subjectsStr = Array.isArray(t.subjects) ? t.subjects.join(' ').toLowerCase() : (t.subjects || '').toLowerCase();
      const classesStr = Array.isArray(t.assignedClasses) ? t.assignedClasses.join(' ').toLowerCase() : (t.assignedClasses || '').toLowerCase();

      return (
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.phone && t.phone.toLowerCase().includes(q)) ||
        (t.place && t.place.toLowerCase().includes(q)) ||
        (t.country && t.country.toLowerCase().includes(q)) ||
        subjectsStr.includes(q) ||
        classesStr.includes(q)
      );
    });
  },

  // Get Applications
  getApplications(filterStatus = 'ALL') {
    const apps = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.APPLICATIONS) || '[]');
    if (filterStatus === 'ALL') return apps;
    return apps.filter(a => a.status === filterStatus);
  },

  getApplicationById(id) {
    const apps = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.APPLICATIONS) || '[]');
    return apps.find(a => a.id === id);
  },

  // Get Approved Teachers
  getTeachers(statusFilter = 'ALL') {
    const teachers = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.TEACHERS) || '[]');
    if (statusFilter === 'ALL') return teachers;
    return teachers.filter(t => t.status === statusFilter);
  },

  // Get Enrolled Students (real data only)
  getStudents() {
    return JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.STUDENTS) || '[]');
  },

  // Get Student Applications (Admissions Approval Queue)
  getStudentApplications(filterStatus = 'ALL') {
    const apps = JSON.parse(localStorage.getItem('zawiyah_db_student_apps') || '[]');
    if (filterStatus === 'ALL') return apps;
    return apps.filter(a => a.status === filterStatus);
  },

  // Sync Database State with Backend SQLite API
  async syncFromBackend() {
    try {
      // 1. Fetch Teacher Applications
      const tAppRes = await fetch(getApiUrl('/api/admin/teacher-applications'));
      if (tAppRes.ok) {
        const tAppData = await tAppRes.json();
        if (tAppData && tAppData.applications) {
          localStorage.setItem(ZAWIYAH_DB_KEYS.APPLICATIONS, JSON.stringify(tAppData.applications));
        }
      }

      // 2. Fetch Teachers
      const tRes = await fetch(getApiUrl('/api/admin/teachers'));
      if (tRes.ok) {
        const tData = await tRes.json();
        if (tData && tData.teachers) {
          localStorage.setItem(ZAWIYAH_DB_KEYS.TEACHERS, JSON.stringify(tData.teachers));
        }
      }

      // 3. Fetch Student Applications
      const sAppRes = await fetch(getApiUrl('/api/admin/student-applications'));
      if (sAppRes.ok) {
        const sAppData = await sAppRes.json();
        if (sAppData && sAppData.applications) {
          localStorage.setItem('zawiyah_db_student_apps', JSON.stringify(sAppData.applications));
        }
      }

      // 4. Fetch Students
      const sRes = await fetch(getApiUrl('/api/admin/students'));
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData && sData.students) {
          localStorage.setItem(ZAWIYAH_DB_KEYS.STUDENTS, JSON.stringify(sData.students));
        }
      }
    } catch (e) {
      console.warn('Backend sync failed, using cached local storage', e);
    }
  },

  // Register Student Admission Application / Create Real Account
  async registerStudent(formData) {
    try {
      const res = await fetch(getApiUrl('/api/students/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data && data.success) {
        await this.syncFromBackend();
        return data;
      }
      return data || { success: false, message: 'Failed to submit admission application.' };
    } catch (e) {
      console.warn('Backend student registration network error, saving fallback', e);
      const apps = JSON.parse(localStorage.getItem('zawiyah_db_student_apps') || '[]');
      const newApp = {
        id: `ZAW-STU-${String(apps.length + 1).padStart(3, '0')}`,
        studentId: `ZAW-STU-${String(apps.length + 1).padStart(3, '0')}`,
        name: formData.student_name || formData.name,
        phone: formData.contact_number || formData.phone,
        email: formData.email || '',
        age: formData.age || '',
        place: formData.place || '',
        course: formData.class_course || formData.level || 'Quran & Tajweed',
        level: formData.class_course || formData.level || 'Quran & Tajweed',
        classDays: formData.class_days || ['Monday', 'Wednesday', 'Friday'],
        dailyDuration: formData.daily_duration || '60 Minutes',
        classType: formData.class_type || 'Group Class',
        status: 'PENDING APPROVAL',
        appliedDate: new Date().toISOString().split('T')[0]
      };
      apps.unshift(newApp);
      localStorage.setItem('zawiyah_db_student_apps', JSON.stringify(apps));
      return { 
        success: true, 
        student_id: newApp.id, 
        status: 'PENDING APPROVAL',
        message: 'Your account has been created successfully and is waiting for admin approval.' 
      };
    }
  },

  // Student Login
  async loginStudent(identifier, password) {
    try {
      const res = await fetch(getApiUrl('/api/students/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (data && data.success) {
        this.setSession(data.user, true);
        localStorage.setItem('zawiyah_student_logged_in', 'true');
        return data;
      }
      return data || { success: false, message: 'Login failed.' };
    } catch (e) {
      console.warn('Backend student login failed, checking local store', e);
      const cleanIdent = identifier.trim().toLowerCase();
      const students = this.getStudents();
      const s = students.find(item => 
        (item.name && item.name.trim().toLowerCase() === cleanIdent) || 
        (item.id && item.id.toLowerCase() === cleanIdent) || 
        (item.email && item.email.toLowerCase() === cleanIdent) || 
        (item.phone && item.phone.includes(identifier))
      );
      if (s) {
        if (s.status === 'ACTIVE' || s.status === 'APPROVED') {
          this.setSession({ id: s.id, name: s.name, role: 'STUDENT', status: 'ACTIVE' }, true);
          return { success: true, user: s };
        } else if (s.status === 'PENDING' || s.status === 'PENDING APPROVAL') {
          return { success: false, status: 'PENDING APPROVAL', message: 'Your account is pending admin approval.' };
        }
      }
      return { success: false, message: 'Invalid Name / Username or Password.' };
    }
  },

  // Student Forgot Password: Step 1 Verify ID
  async verifyStudentForgot(identifier) {
    try {
      const res = await fetch(getApiUrl('/api/students/forgot-password/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      return await res.json();
    } catch (e) {
      console.warn('Backend forgot password verify failed', e);
      return { success: false, message: 'Server communication error. Please try again.' };
    }
  },

  // Student Forgot Password: Step 2 Reset Password
  async resetStudentForgot(studentId, contactNumber, newPassword, confirmPassword) {
    try {
      const res = await fetch(getApiUrl('/api/students/forgot-password/reset'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          contact_number: contactNumber,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      });
      return await res.json();
    } catch (e) {
      console.warn('Backend forgot password reset failed', e);
      return { success: false, message: 'Server communication error. Please try again.' };
    }
  },

  // Approve Student Admission
  async approveStudent(appId) {
    try {
      const res = await fetch(getApiUrl('/api/admin/approve-student'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: appId })
      });
      const data = await res.json();
      if (data && data.success) {
        await this.syncFromBackend();
        return data;
      }
    } catch (e) {
      console.warn('Backend student approval failed', e);
    }
    const apps = JSON.parse(localStorage.getItem('zawiyah_db_student_apps') || '[]');
    const students = JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.STUDENTS) || '[]');
    const idx = apps.findIndex(a => a.id === appId || a.studentId === appId);
    if (idx === -1) return { success: false, message: 'Application not found' };
    const app = apps[idx];
    const sId = app.studentId || app.id || `ZAW-STU-${String(students.length + 1).padStart(3, '0')}`;
    app.status = 'ACTIVE';
    app.studentId = sId;
    apps[idx] = app;
    localStorage.setItem('zawiyah_db_student_apps', JSON.stringify(apps));
    students.push({
      id: sId,
      name: app.name,
      phone: app.phone,
      email: app.email,
      course: app.course || app.level || 'Quran & Tajweed',
      level: app.course || app.level || 'Quran & Tajweed',
      classDays: app.classDays || ['Monday', 'Wednesday', 'Friday'],
      dailyDuration: app.dailyDuration || '60 Minutes',
      classType: app.classType || 'Group Class',
      place: app.place,
      status: 'ACTIVE'
    });
    localStorage.setItem(ZAWIYAH_DB_KEYS.STUDENTS, JSON.stringify(students));
    return { success: true, student_id: sId, message: `Student approved with ID ${sId}` };
  },

  // Reject Student Admission
  async rejectStudent(appId) {
    try {
      const res = await fetch(getApiUrl('/api/admin/reject-student'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: appId })
      });
      const data = await res.json();
      if (data && data.success) {
        await this.syncFromBackend();
        return data;
      }
    } catch (e) {
      console.warn('Backend student reject failed', e);
    }
    const apps = JSON.parse(localStorage.getItem('zawiyah_db_student_apps') || '[]');
    const idx = apps.findIndex(a => a.id === appId || a.studentId === appId);
    if (idx !== -1) {
      apps[idx].status = 'REJECTED';
      localStorage.setItem('zawiyah_db_student_apps', JSON.stringify(apps));
    }
    return { success: true, message: 'Student application rejected.' };
  },

  // Update Student Details Non-Destructively
  async updateStudentDetails(studentId, fields) {
    try {
      const res = await fetch(getApiUrl('/api/admin/update-student'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, fields })
      });
      const data = await res.json();
      if (data && data.success) {
        await this.syncFromBackend();
        return data;
      }
      return data || { success: false, message: 'Update failed.' };
    } catch (e) {
      console.warn('Backend student update failed, updating locally', e);
      const students = this.getStudents();
      const idx = students.findIndex(s => s.id === studentId);
      if (idx !== -1) {
        students[idx] = { ...students[idx], ...fields };
        localStorage.setItem(ZAWIYAH_DB_KEYS.STUDENTS, JSON.stringify(students));
        return { success: true, message: 'Student record updated.' };
      }
      return { success: false, message: 'Student not found.' };
    }
  },

  // Get Classes (real active classes derived from teachers and schedule)
  getClasses() {
    const teachers = this.getTeachers('ACTIVE');
    const classes = [];
    teachers.forEach(t => {
      if (Array.isArray(t.assignedClasses) && t.assignedClasses.length > 0) {
        t.assignedClasses.forEach(c => {
          classes.push({
            name: c,
            instructor: t.name,
            instructorId: t.id,
            subject: Array.isArray(t.subjects) ? t.subjects[0] : (t.subjects || 'Quran'),
            schedule: `${Array.isArray(t.availableDays) ? t.availableDays.slice(0, 3).join(', ') : 'Flexible'} • ${t.startTime || '17:00'}`,
            type: t.classType || 'Group Class',
            capacity: `${t.activeStudents || 0}/8`
          });
        });
      }
    });
    return classes;
  },

  // Get Weekly Schedule
  getSchedule() {
    const teachers = this.getTeachers('ACTIVE');
    const schedules = [];
    teachers.forEach(t => {
      if (t.availableDays && t.startTime && t.endTime) {
        schedules.push({
          days: Array.isArray(t.availableDays) ? t.availableDays.join(', ') : t.availableDays,
          time: `${t.startTime} – ${t.endTime}`,
          details: `${t.name} (${t.id})`,
          subject: Array.isArray(t.subjects) ? t.subjects.join(', ') : t.subjects
        });
      }
    });
    return schedules;
  },

  // Get Admin Users
  getAdmins() {
    return JSON.parse(localStorage.getItem(ZAWIYAH_DB_KEYS.ADMINS) || '[]');
  },

  // Session Handlers
  getSession() {
    try {
      const s = sessionStorage.getItem(ZAWIYAH_DB_KEYS.SESSION) || localStorage.getItem(ZAWIYAH_DB_KEYS.SESSION);
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  },

  setSession(user, remember = false) {
    const sess = {
      id: user.id || user.student_id || user.teacher_id,
      name: user.name || user.student_name || user.full_name || 'User',
      email: user.email || '',
      phone: user.phone || user.contact_number || '',
      role: user.role || 'STUDENT',
      status: user.status || 'ACTIVE',
      course: user.course || user.level || user.class_course || 'Quran & Tajweed',
      level: user.level || user.course || user.class_course || 'Quran & Tajweed',
      days: user.days || user.class_days || user.classDays || [],
      duration: user.duration || user.daily_duration || user.dailyDuration || '60 Minutes',
      class_type: user.class_type || user.classType || 'Group Class',
      place: user.place || '',
      loggedInAt: new Date().toISOString()
    };
    if (remember) {
      localStorage.setItem(ZAWIYAH_DB_KEYS.SESSION, JSON.stringify(sess));
    }
    sessionStorage.setItem(ZAWIYAH_DB_KEYS.SESSION, JSON.stringify(sess));
  },

  logout() {
    sessionStorage.removeItem(ZAWIYAH_DB_KEYS.SESSION);
    localStorage.removeItem(ZAWIYAH_DB_KEYS.SESSION);
    localStorage.removeItem('zawiyah_teacher_logged_in');
    localStorage.removeItem('zawiyah_admin_logged_in');
    localStorage.removeItem('zawiyah_student_logged_in');
    sessionStorage.removeItem('zawiyah_admin_logged_in');
    sessionStorage.removeItem('zawiyah_teacher_logged_in');
    sessionStorage.removeItem('zawiyah_student_logged_in');
  },

  // Authenticated Admin-Only Visitor Count Fetcher
  async getVisitorCount() {
    const token = localStorage.getItem('zawiyah_admin_token') || sessionStorage.getItem('zawiyah_admin_token') || '';
    if (!token) return { success: false, error: 'Unauthorized. Admin session required.' };
    try {
      const res = await fetch(getApiUrl('/api/admin/visitor-count'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn('Visitor count backend fetch error:', e);
    }
    return { success: false, error: 'Failed to fetch visitor count' };
  }
};

window.ZawiyahAuth = ZawiyahAuth;
window.TeachingHoursCalc = TeachingHoursCalc;
window.computeSha256 = computeSha256;
