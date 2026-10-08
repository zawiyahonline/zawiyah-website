// Zawiyah Online Islamic School - Interactive Logic, WhatsApp Enquiry Modal & Dot Canvas

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Set dynamic copyright year
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // 3. Mobile Menu Logic
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link:not(.join-us-trigger)');

  const openMobileMenu = () => {
    mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
    mobileMenu.classList.add('opacity-100', 'pointer-events-auto');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
    mobileMenu.classList.add('opacity-0', 'pointer-events-none');
    document.body.style.overflow = '';
  };

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileMenu);
  }
  if (closeMobileMenuBtn) {
    closeMobileMenuBtn.addEventListener('click', closeMobileMenu);
  }
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // 3b. Interactive Greeting Pill & Character Voice ("Assalamu Alaikum!")
  const greetingPill = document.getElementById('greetingPill');
  const heroBoy = document.getElementById('heroBoy');
  const speakGreeting = () => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('Assalamu Alaikum');
        utterance.rate = 0.92;
        utterance.pitch = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang && (v.lang.includes('ar') || v.name.includes('Arabic')));
        if (arabicVoice) utterance.voice = arabicVoice;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {}
  };

  if (greetingPill) {
    greetingPill.addEventListener('click', speakGreeting);
  }
  if (heroBoy) {
    heroBoy.addEventListener('click', speakGreeting);
  }

  // 4. Join Us / Enquiry Modal Logic (Manual Entry - Contact Suggestions Disabled)
  initEnquiryModal();

  // 4b. Book Free Demo Class Modal Logic (Direct WhatsApp Booking)
  initDemoModal();

  // 5. Gentle Mouse Parallax for Hero Character (Desktop only - Throttled with rAF)
  const characterBackdrop = document.querySelector('.character-backdrop');
  
  if (window.matchMedia('(min-width: 1024px)').matches && heroBoy) {
    let mouseX = 0, mouseY = 0;
    let isTicking = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isTicking) {
        requestAnimationFrame(() => {
          const { innerWidth, innerHeight } = window;
          const xOffset = (mouseX - innerWidth / 2) / (innerWidth / 2);
          const yOffset = (mouseY - innerHeight / 2) / (innerHeight / 2);

          heroBoy.style.transform = `translate3d(${xOffset * 6}px, ${yOffset * 4}px, 0)`;
          if (characterBackdrop) {
            characterBackdrop.style.transform = `translate3d(${-xOffset * 8}px, ${-yOffset * 6}px, 0) scale(1.02)`;
          }
          isTicking = false;
        });
        isTicking = true;
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      heroBoy.style.transform = 'translate3d(0px, 0px, 0)';
      if (characterBackdrop) {
        characterBackdrop.style.transform = 'translate3d(0px, 0px, 0) scale(1)';
      }
    });
  }

  // 6. Scroll Reveal Observer (Optimized with unobserve)
  const scrollSections = document.querySelectorAll('.scroll-section');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          sectionObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    scrollSections.forEach(sec => sectionObserver.observe(sec));
  } else {
    scrollSections.forEach(sec => sec.classList.add('is-revealed'));
  }

  // 7. Subtle Interactive Decorative Dots Engine (Optimized & Throttled)
  initInteractiveDots();

  // 8. Dynamic 4-5 Student World Map Engine
  initDynamicWorldMapStudents();

  // 9. Premium Reviews / Testimonials Engine
  initReviewsSection();

  // 10. Interactive Animated Learning Moments Engine
  initInteractiveLearningMoments();
});

// Join Us / Enquiry Modal & WhatsApp Generator
function initEnquiryModal() {
  const joinModal = document.getElementById('joinModal');
  const joinModalCard = document.getElementById('joinModalCard');
  const closeJoinModalBtn = document.getElementById('closeJoinModalBtn');
  const joinForm = document.getElementById('joinForm');
  const formStatus = document.getElementById('formStatus');
  const joinTriggers = document.querySelectorAll('.join-us-trigger');
  const mobileMenu = document.getElementById('mobileMenu');

  // Zawiyah WhatsApp Number: 6282552309 (India +91)
  const WHATSAPP_NUMBER = '916282552309';

  // Completely prevent browser autofill/contact heuristic sniffing
  const manualInputs = document.querySelectorAll('.manual-clean-input');
  const setupManualInputs = () => {
    manualInputs.forEach(input => {
      input.setAttribute('readonly', 'readonly');
      const removeReadonly = () => {
        input.removeAttribute('readonly');
      };
      input.addEventListener('focus', removeReadonly, { once: true });
      input.addEventListener('touchstart', removeReadonly, { once: true });
      input.addEventListener('mousedown', removeReadonly, { once: true });
    });
  };
  setupManualInputs();

  const openModal = () => {
    // If mobile drawer is open, close it first
    if (mobileMenu && !mobileMenu.classList.contains('opacity-0')) {
      mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
      mobileMenu.classList.add('opacity-0', 'pointer-events-none');
    }

    joinModal.classList.remove('opacity-0', 'pointer-events-none');
    joinModal.classList.add('opacity-100', 'pointer-events-auto');
    if (joinModalCard) {
      joinModalCard.classList.remove('scale-95');
      joinModalCard.classList.add('scale-100');
    }
    document.body.style.overflow = 'hidden';

    setupManualInputs();

    // Auto-focus first input cleanly without triggering contact picker
    const firstInput = document.getElementById('zq_name_val');
    if (firstInput) {
      setTimeout(() => {
        firstInput.removeAttribute('readonly');
        firstInput.focus();
      }, 150);
    }
  };

  const closeModal = () => {
    joinModal.classList.remove('opacity-100', 'pointer-events-auto');
    joinModal.classList.add('opacity-0', 'pointer-events-none');
    if (joinModalCard) {
      joinModalCard.classList.remove('scale-100');
      joinModalCard.classList.add('scale-95');
    }
    document.body.style.overflow = '';
    setupManualInputs();
  };

  joinTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeJoinModalBtn) {
    closeJoinModalBtn.addEventListener('click', closeModal);
  }

  // Close when clicking outside modal card
  if (joinModal) {
    joinModal.addEventListener('click', (e) => {
      if (e.target === joinModal) {
        closeModal();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && joinModal && !joinModal.classList.contains('opacity-0')) {
      closeModal();
    }
  });

  // Form Submission & WhatsApp Link Building
  if (joinForm) {
    joinForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = document.getElementById('zq_name_val');
      const place = document.getElementById('zq_place_val');
      const contactNumber = document.getElementById('zq_phone_val');
      const age = document.getElementById('zq_age_val');
      const country = document.getElementById('zq_country_val');

      let isValid = true;

      // Validation Helper
      const validateField = (input, condition) => {
        const parent = input.closest('div');
        const errorMsg = parent ? parent.querySelector('.error-msg') : null;
        if (!condition) {
          isValid = false;
          input.classList.add('border-accent-lavender');
          if (errorMsg) errorMsg.classList.remove('hidden');
        } else {
          input.classList.remove('border-accent-lavender');
          if (errorMsg) errorMsg.classList.add('hidden');
        }
      };

      validateField(fullName, fullName && fullName.value.trim().length > 0);
      validateField(place, place && place.value.trim().length > 0);
      validateField(contactNumber, contactNumber && contactNumber.value.trim().length >= 4);
      validateField(age, age && age.value.trim().length > 0 && !isNaN(parseInt(age.value)) && parseInt(age.value) > 0 && parseInt(age.value) <= 100);
      validateField(country, country && country.value && country.value.trim().length > 0);

      // Realtime validation cleanup on input
      [fullName, place, contactNumber, age, country].forEach(el => {
        if (!el) return;
        el.addEventListener('input', () => {
          el.classList.remove('border-accent-lavender');
          const err = el.closest('div')?.querySelector('.error-msg');
          if (err) err.classList.add('hidden');
        }, { once: true });
      });

      if (!isValid) return;

      // Construct formatted WhatsApp message exactly as requested
      const message = `Assalamu Alaikum Zawiyah,\n\nI would like to enquire about Zawiyah Online Islamic School.\n\nName: ${fullName.value.trim()}\nPlace: ${place.value.trim()}\nContact Number: ${contactNumber.value.trim()}\nAge: ${age.value.trim()}\nCountry: ${country.value.trim()}\n\nI would like to know more about the classes and admission process.\n\nJazakAllah Khair.`;

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      // Show Status Feedback
      if (formStatus) {
        formStatus.classList.remove('hidden');
      }

      const continueBtn = document.getElementById('continueBtn');
      if (continueBtn) {
        continueBtn.disabled = true;
        continueBtn.innerHTML = `<i data-lucide="message-circle" class="w-4 h-4 text-tealbg"></i><span>Opening WhatsApp...</span>`;
        if (window.lucide) window.lucide.createIcons();
      }

      // Open WhatsApp with pre-filled enquiry message
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');

        // Reset form & close modal after slight delay
        setTimeout(() => {
          closeModal();
          joinForm.reset();
          if (formStatus) formStatus.classList.add('hidden');
          if (continueBtn) {
            continueBtn.disabled = false;
            continueBtn.innerHTML = `<i data-lucide="message-circle" class="w-4 h-4 text-tealbg"></i><span>Send Enquiry on WhatsApp</span>`;
            if (window.lucide) window.lucide.createIcons();
          }
        }, 1000);
      }, 500);
    });
  }
}

// -----------------------------------------------------------------------------
// Free Demo Class Booking Modal Logic (Direct WhatsApp Booking)
// -----------------------------------------------------------------------------
function initDemoModal() {
  const demoModal = document.getElementById('demoModal');
  const demoModalCard = document.getElementById('demoModalCard');
  const closeDemoModalBtn = document.getElementById('closeDemoModalBtn');
  const demoForm = document.getElementById('demoForm');
  const demoFormStatus = document.getElementById('demoFormStatus');
  const demoTriggers = document.querySelectorAll('.free-demo-trigger');

  const WHATSAPP_NUMBER = '916282552309';

  window.openDemoModal = (courseName = '') => {
    if (!demoModal) return;
    
    // If course specified, select it in dropdown
    if (courseName) {
      const courseSelect = document.getElementById('demo_course_val');
      if (courseSelect) {
        for (let i = 0; i < courseSelect.options.length; i++) {
          if (courseSelect.options[i].value.toLowerCase().includes(courseName.toLowerCase()) || 
              courseName.toLowerCase().includes(courseSelect.options[i].value.toLowerCase())) {
            courseSelect.selectedIndex = i;
            break;
          }
        }
      }
    }

    demoModal.classList.remove('opacity-0', 'pointer-events-none');
    demoModal.classList.add('opacity-100', 'pointer-events-auto');
    if (demoModalCard) {
      demoModalCard.classList.remove('scale-95');
      demoModalCard.classList.add('scale-100');
    }
    document.body.style.overflow = 'hidden';

    const firstInput = document.getElementById('demo_name_val');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 150);
    }
  };

  window.closeDemoModal = () => {
    if (!demoModal) return;
    demoModal.classList.remove('opacity-100', 'pointer-events-auto');
    demoModal.classList.add('opacity-0', 'pointer-events-none');
    if (demoModalCard) {
      demoModalCard.classList.remove('scale-100');
      demoModalCard.classList.add('scale-95');
    }
    document.body.style.overflow = '';
  };

  demoTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const courseAttr = btn.getAttribute('data-course') || '';
      window.openDemoModal(courseAttr);
    });
  });

  if (closeDemoModalBtn) {
    closeDemoModalBtn.addEventListener('click', window.closeDemoModal);
  }

  if (demoModal) {
    demoModal.addEventListener('click', (e) => {
      if (e.target === demoModal) {
        window.closeDemoModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && demoModal && !demoModal.classList.contains('opacity-0')) {
      window.closeDemoModal();
    }
  });

  if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('demo_name_val');
      const ageInput = document.getElementById('demo_age_val');
      const placeInput = document.getElementById('demo_place_val');
      const timeInput = document.getElementById('demo_time_val');
      const courseInput = document.getElementById('demo_course_val');

      let isValid = true;

      const validateField = (input, condition) => {
        const parent = input.closest('div');
        const errorMsg = parent ? parent.querySelector('.error-msg') : null;
        if (!condition) {
          isValid = false;
          input.classList.add('border-accent-lavender');
          if (errorMsg) errorMsg.classList.remove('hidden');
        } else {
          input.classList.remove('border-accent-lavender');
          if (errorMsg) errorMsg.classList.add('hidden');
        }
      };

      validateField(nameInput, nameInput && nameInput.value.trim().length > 0);
      validateField(ageInput, ageInput && ageInput.value.trim().length > 0);
      validateField(placeInput, placeInput && placeInput.value.trim().length > 0);
      validateField(timeInput, timeInput && timeInput.value && timeInput.value.trim().length > 0);

      [nameInput, ageInput, placeInput, timeInput, courseInput].forEach(el => {
        if (!el) return;
        el.addEventListener('input', () => {
          el.classList.remove('border-accent-lavender');
          const err = el.closest('div')?.querySelector('.error-msg');
          if (err) err.classList.add('hidden');
        }, { once: true });
      });

      if (!isValid) return;

      const selectedCourse = courseInput ? courseInput.value : 'General Islamic Studies';

      // Format clean, professional WhatsApp Message
      const message = `Assalamu Alaikum Zawiyah,\n\nI would like to book a *FREE DEMO CLASS* for my child.\n\n👤 *Student / Parent Name:* ${nameInput.value.trim()}\n🎂 *Child's Age:* ${ageInput.value.trim()}\n📍 *Place / Location:* ${placeInput.value.trim()}\n⏰ *Preferred Time for Demo:* ${timeInput.value.trim()}\n📚 *Class Type:* ${selectedCourse}\n\nPlease let me know the available demo slots.\n\nJazakAllah Khair!`;

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      if (demoFormStatus) {
        demoFormStatus.classList.remove('hidden');
      }

      const continueBtn = document.getElementById('demoContinueBtn');
      if (continueBtn) {
        continueBtn.disabled = true;
        continueBtn.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4 text-tealbg-950 animate-spin"></i><span>Opening WhatsApp...</span>`;
        if (window.lucide) window.lucide.createIcons();
      }

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');

        setTimeout(() => {
          window.closeDemoModal();
          demoForm.reset();
          if (demoFormStatus) demoFormStatus.classList.add('hidden');
          if (continueBtn) {
            continueBtn.disabled = false;
            continueBtn.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4 text-tealbg-950"></i><span>Book Free Demo on WhatsApp</span>`;
            if (window.lucide) window.lucide.createIcons();
          }
        }, 1000);
      }, 500);
    });
  }
}

// Interactive Decorative Dots Canvas Engine (#c188d5 & #baed2c - Optimized & Low GPU Load)
function initInteractiveDots() {
  const canvas = document.getElementById('dotsCanvas');
  if (!canvas) return;

  // On mobile phones (< 768px), disable heavy canvas rendering for 60fps zero-lag performance
  if (window.innerWidth < 768) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // High-DPI Display Scaling
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
  }
  resizeCanvas();

  // Harmonized background particles matching Zawiyah teal palette
  const colors = ['#DCEDF2', '#9DCBD5', '#1593A0', '#E0F7FA'];

  // Low visual density to maintain peak 60fps performance
  const dotCount = width > 1024 ? 18 : width > 640 ? 12 : 8;
  const dots = [];

  class Dot {
    constructor() {
      this.init();
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.currentX = this.x;
      this.currentY = this.y;
    }

    init() {
      this.baseRadius = 1.5 + Math.random() * 1.5;
      this.currentRadius = this.baseRadius;
      this.targetRadius = this.baseRadius;

      this.color = colors[Math.floor(Math.random() * colors.length)];

      this.baseOpacity = 0.4 + Math.random() * 0.25;
      this.currentOpacity = this.baseOpacity;
      this.targetOpacity = this.baseOpacity;

      this.vx = (Math.random() - 0.5) * 0.16;
      this.vy = (Math.random() - 0.5) * 0.16;

      this.timePhase = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.008 + Math.random() * 0.008;

      this.offsetX = 0;
      this.offsetY = 0;
      this.targetOffsetX = 0;
      this.targetOffsetY = 0;
    }

    update(mouseX, mouseY, isPointerActive) {
      this.timePhase += this.pulseSpeed;
      this.x += this.vx + Math.sin(this.timePhase) * 0.08;
      this.y += this.vy + Math.cos(this.timePhase * 0.8) * 0.08;

      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      if (this.y < -20) this.y = height + 20;
      if (this.y > height + 20) this.y = -20;

      if (isPointerActive) {
        const dx = (this.x + this.offsetX) - mouseX;
        const dy = (this.y + this.offsetY) - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 120;

        if (dist < maxDist) {
          const factor = (1 - dist / maxDist);
          const angle = Math.atan2(dy, dx);
          const pushForce = factor * 18;
          this.targetOffsetX = Math.cos(angle) * pushForce;
          this.targetOffsetY = Math.sin(angle) * pushForce;

          this.targetRadius = this.baseRadius * (1 + factor * 0.4);
          this.targetOpacity = Math.min(0.9, this.baseOpacity + factor * 0.35);
        } else {
          this.targetOffsetX = 0;
          this.targetOffsetY = 0;
          this.targetRadius = this.baseRadius + Math.sin(this.timePhase) * 0.15;
          this.targetOpacity = this.baseOpacity;
        }
      } else {
        this.targetOffsetX = 0;
        this.targetOffsetY = 0;
        this.targetRadius = this.baseRadius + Math.sin(this.timePhase) * 0.15;
        this.targetOpacity = this.baseOpacity;
      }

      this.offsetX += (this.targetOffsetX - this.offsetX) * 0.08;
      this.offsetY += (this.targetOffsetY - this.offsetY) * 0.08;
      this.currentRadius += (this.targetRadius - this.currentRadius) * 0.1;
      this.currentOpacity += (this.targetOpacity - this.currentOpacity) * 0.1;

      this.currentX = this.x + this.offsetX;
      this.currentY = this.y + this.offsetY;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, this.currentOpacity));
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.currentX, this.currentY, Math.max(0.5, this.currentRadius), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < dotCount; i++) {
    dots.push(new Dot());
  }

  let pointer = {
    x: -1000,
    y: -1000,
    active: false,
    timer: null
  };

  const updatePointerPosition = (x, y) => {
    pointer.x = x;
    pointer.y = y;
    pointer.active = true;

    clearTimeout(pointer.timer);
    pointer.timer = setTimeout(() => {
      pointer.active = false;
    }, 2000);
  };

  window.addEventListener('mousemove', (e) => {
    updatePointerPosition(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    pointer.active = false;
  });

  window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      updatePointerPosition(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      updatePointerPosition(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    pointer.timer = setTimeout(() => {
      pointer.active = false;
    }, 1000);
  });

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
    }, 150);
  }, { passive: true });

  let animationFrameId;
  let isCanvasActive = true;
  let lastFrameTime = 0;
  const targetFrameInterval = 1000 / 30; // Smooth 30 FPS cap for background particles

  function animate(currentTime) {
    if (!isCanvasActive) return;

    animationFrameId = requestAnimationFrame(animate);

    if (currentTime - lastFrameTime < targetFrameInterval) return;
    lastFrameTime = currentTime;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < dots.length; i++) {
      dots[i].update(pointer.x, pointer.y, pointer.active);
      dots[i].draw();
    }
  }

  animationFrameId = requestAnimationFrame(animate);

  // Pause when tab hidden or scrolled out of view
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isCanvasActive = false;
      cancelAnimationFrame(animationFrameId);
    } else {
      if (!isCanvasActive) {
        isCanvasActive = true;
        animationFrameId = requestAnimationFrame(animate);
      }
    }
  });
}

/* ==========================================================================
   FLOATING SIDE CHATBOT LOGIC
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const triggerBtn = document.getElementById('sideChatTriggerBtn');
  const chatWindow = document.getElementById('sideChatWindow');
  const closeBtn = document.getElementById('closeSideChatBtn');

  if (triggerBtn && chatWindow) {
    triggerBtn.addEventListener('click', () => {
      const isHidden = chatWindow.classList.contains('hidden');
      if (isHidden) {
        chatWindow.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      } else {
        chatWindow.classList.add('hidden');
      }
    });
  }

  if (closeBtn && chatWindow) {
    closeBtn.addEventListener('click', () => {
      chatWindow.classList.add('hidden');
    });
  }
});

const sideBotAnswers = {
  'Demo': {
    text: "You can book a 100% Free Demo Class to experience Zawiyah's interactive virtual classrooms and teaching methods firsthand!",
    actionUrl: "javascript:openDemoModal()",
    actionText: "✨ Book Free Demo Now"
  },
  'Admission': {
    text: "Our Admission Counsellor Jilsha can guide you regarding enrollment, class schedules, and selecting the right course for your child.",
    actionUrl: "https://wa.me/919539552309?text=Hello%20Jilsha%2C%20I%20would%20like%20to%20enquire%20about%20admission%20at%20Zawiyah.",
    actionText: "Chat with Jilsha (WhatsApp)"
  },
  'Classes': {
    text: "Zawiyah offers 1-on-1 personalized sessions, interactive small group classes, and flexible self-paced Islamic learning for ages 5–15.",
    actionUrl: "https://wa.me/919539552309?text=Hello%2C%20I%20would%20like%20to%20know%20more%20about%20Zawiyah%20classes.",
    actionText: "Enquire via WhatsApp"
  },
  'Fees': {
    text: "Fee plans are transparent and structured per monthly/quarterly class package. Would you like a detailed fee breakdown?",
    actionUrl: "https://wa.me/919539552309?text=Hello%2C%20please%20share%20the%20fee%20structure%20for%20Zawiyah%20courses.",
    actionText: "Get Fee Details"
  },
  'Support': {
    text: "Need assistance with class schedules, student progress, portal access or technical support? Our care team is ready to help.",
    actionUrl: "https://wa.me/916282552309?text=Hello%20Zawiyah%20Support%2C%20I%20need%20assistance.",
    actionText: "Contact Support (6282552309)"
  },
  'Complaints': {
    text: "We take all feedback seriously. Your concern will be reviewed promptly by our Directorate Redressal team.",
    actionUrl: "https://wa.me/916282552309?text=Hello%2C%20I%20would%20like%20to%20submit%20a%20concern%2Fcomplaint%20to%20Zawiyah.",
    actionText: "Submit to Directorate"
  }
};

function handleSideChatOption(topic) {
  appendSideUserMsg(topic);
  const info = sideBotAnswers[topic];
  if (!info) return;

  setTimeout(() => {
    appendSideBotMsg(info.text, info.actionUrl, info.actionText);
  }, 300);
}

function handleSideChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('sideChatInput');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  appendSideUserMsg(val);
  input.value = '';

  setTimeout(() => {
    appendSideBotMsg(
      `Thank you for your message! For direct, personalized guidance regarding "${val}", connect with our team on WhatsApp.`,
      `https://wa.me/916282552309?text=${encodeURIComponent('Hello Zawiyah Support,\n\nI have a question regarding: ' + val)}`,
      "Connect on WhatsApp"
    );
  }, 400);
}

function appendSideUserMsg(text) {
  const container = document.getElementById('sideChatMessages');
  if (!container) return;
  const bubble = document.createElement('div');
  bubble.className = 'flex items-start justify-end gap-1.5 max-w-[85%] ml-auto chat-bubble-in';
  bubble.innerHTML = `
    <div class="bg-gradient-to-r from-tealbg-600 to-tealbg-500 border border-white/20 rounded-2xl rounded-tr-sm p-2.5 text-white shadow-md text-left">
      <p class="leading-relaxed text-[11px]">${escapeSideHtml(text)}</p>
    </div>
  `;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function appendSideBotMsg(text, actionUrl, actionText) {
  const container = document.getElementById('sideChatMessages');
  if (!container) return;
  const bubble = document.createElement('div');
  bubble.className = 'flex items-start gap-2 max-w-[90%] chat-bubble-in';
  let ctaHtml = '';
  if (actionUrl && actionText) {
    ctaHtml = `
      <div class="pt-1.5">
        <a href="${actionUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-lime text-tealbg-950 font-bold text-[10px] uppercase tracking-wider hover:brightness-110 shadow-sm transition-all">
          <i data-lucide="message-circle" class="w-3 h-3"></i>
          <span>${actionText}</span>
        </a>
      </div>
    `;
  }
  bubble.innerHTML = `
    <div class="w-6 h-6 rounded-full bg-tealbg-700 border border-white/20 flex items-center justify-center text-[9px] font-bold text-accent-lime shrink-0 mt-0.5">
      ZW
    </div>
    <div class="bg-tealbg-800/95 border border-white/15 rounded-2xl rounded-tl-sm p-3 text-white shadow-md space-y-1 text-left">
      <p class="leading-relaxed text-[11px]">${escapeSideHtml(text)}</p>
      ${ctaHtml}
    </div>
  `;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function escapeSideHtml(string) {
  return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// -----------------------------------------------------------------------------
// DYNAMIC LIVE STUDENT WORLD MAP ENGINE (FIXED ANCHORED SPOTS, IN-PLACE ROTATION)
// -----------------------------------------------------------------------------
function initDynamicWorldMapStudents() {
  const container = document.getElementById('dynamicWorldMapStudents');
  if (!container) return;

  // 1. Fixed geographic regional spots on the world map
  const REGIONAL_SPOTS = [
    {
      id: 'spot-uae',
      country: 'UAE',
      top: '15%',
      left: '46%',
      gradient: 'from-accent-lime to-tealbg-400',
      dotClass: 'bg-accent-lime',
      students: [
        { id: 'ilaan', name: 'Ilaan Athier', country: 'UAE', image: 'assets/ilaan-athier-uae.jpg' },
        { id: 'aahil', name: 'Aahil Ahammad', country: 'UAE', image: 'assets/aahil-ahammad-uae.jpg' },
        { id: 'ayisha', name: 'Ayisha Mehrin', country: 'UAE', image: 'assets/ayisha-mehrin-uae.jpg' },
        { id: 'eva', name: 'Eva Mehak', country: 'UAE', image: 'assets/eva-mehak-uae.jpg' }
      ],
      currentIndex: 0
    },
    {
      id: 'spot-kerala',
      country: 'Kerala',
      top: '68%',
      left: '54%',
      gradient: 'from-accent-lime to-tealbg-400',
      dotClass: 'bg-accent-lime',
      students: [
        { id: 'fathima', name: 'Fathima Naznin', country: 'Kerala', image: 'assets/fathima-naznin-kerala.jpg' },
        { id: 'omid', name: 'Muhammed Omid', country: 'Kerala', image: 'assets/muhammed-omid-zair.jpg' },
        { id: 'saira', name: 'Saira Mariyam', country: 'Kerala', image: 'assets/saira-mariyam-kerala.jpg' },
        { id: 'zaiha', name: 'Zaiha Mehek', country: 'Kerala', image: 'assets/zaiha-mehek-kerala.jpg' },
        { id: 'ghaliba', name: 'Ghaliba Hayat', country: 'Kerala', image: 'assets/ghaliba-hayat-kerala.jpg' },
        { id: 'khairiyya', name: 'Khairiyya Swabr', country: 'Kerala', image: 'assets/khairiyya-swabr-kerala.jpg' }
      ],
      currentIndex: 0
    },
    {
      id: 'spot-saudi',
      country: 'Saudi Arabia',
      top: '28%',
      left: '10%',
      gradient: 'from-accent-lime to-tealbg-400',
      dotClass: 'bg-accent-lime',
      students: [
        { id: 'syha', name: 'Syha Hyzin', country: 'Saudi Arabia', image: 'assets/syha-hyzin-saudi.jpg' }
      ],
      currentIndex: 0
    },
    {
      id: 'spot-qatar',
      country: 'Qatar',
      top: '14%',
      left: '28%',
      gradient: 'from-accent-lavender to-tealbg-400',
      dotClass: 'bg-accent-lavender',
      students: [
        { id: 'nyha', name: 'Nyha Azmin', country: 'Qatar', image: 'assets/nyha-azmin-qatar.jpg' }
      ],
      currentIndex: 0
    },
    {
      id: 'spot-bengaluru',
      country: 'Bengaluru',
      top: '46%',
      left: '70%',
      gradient: 'from-cyan-400 to-tealbg-400',
      dotClass: 'bg-cyan-400',
      students: [
        { id: 'amaan', name: 'Mohammed Amaan', country: 'Bengaluru', image: 'assets/mohammed-amaan-bengaluru.jpg' }
      ],
      currentIndex: 0
    }
  ];

  const isMobile = window.innerWidth < 640;
  // On small mobile, show top 3 primary spots to keep map clean; on desktop show all 5 spots
  const activeSpots = isMobile ? REGIONAL_SPOTS.slice(0, 3) : REGIONAL_SPOTS;

  let rotationTimer = null;
  let rotatingSpotIndex = 0;

  const renderStudentInnerHtml = (student, spot) => {
    return `
      <div class="relative w-7 h-7 sm:w-10 sm:h-10 rounded-full p-0.5 bg-gradient-to-tr ${spot.gradient} shrink-0 shadow-md">
        <img src="${student.image}" alt="${escapeSideHtml(student.name)} - ${escapeSideHtml(student.country)}" class="w-full h-full rounded-full object-cover object-top" loading="lazy" />
        <span class="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${spot.dotClass} border-2 border-tealbg-950"></span>
      </div>
      <div class="text-left leading-tight">
        <div class="flex items-center gap-1 sm:gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full ${spot.dotClass}"></span>
          <p class="text-[9px] sm:text-xs font-bold text-white tracking-tight truncate max-w-[75px] sm:max-w-[120px]">${escapeSideHtml(student.name)}</p>
        </div>
        <p class="text-[7.5px] sm:text-[10px] text-tealtext-300 font-mono font-medium">${escapeSideHtml(student.country)}</p>
      </div>
    `;
  };

  const startEngine = () => {
    container.innerHTML = '';

    activeSpots.forEach((spot, idx) => {
      const student = spot.students[spot.currentIndex];
      const el = document.createElement('div');
      el.id = spot.id;
      // Fixed static position anchored permanently to geographic country location
      el.className = 'absolute flex items-center gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 pr-2 sm:pr-3.5 rounded-full bg-tealbg-900/95 border border-white/20 shadow-2xl backdrop-blur-md pointer-events-auto hover:scale-110 cursor-pointer select-none';
      el.style.top = spot.top;
      el.style.left = spot.left;
      el.style.zIndex = `${25 + idx}`;

      const innerWrapper = document.createElement('div');
      innerWrapper.className = 'flex items-center gap-1.5 sm:gap-2.5 transition-all duration-500';
      innerWrapper.id = `${spot.id}-inner`;
      innerWrapper.innerHTML = renderStudentInnerHtml(student, spot);

      el.appendChild(innerWrapper);
      container.appendChild(el);
    });

    if (rotationTimer) clearInterval(rotationTimer);
    // Rotate 1 spot in-place smoothly every 6 seconds
    rotationTimer = setInterval(rotateNextSpotInPlace, 6000);
  };

  // In-place rotation: Position never moves, only inner student details change smoothly
  const rotateNextSpotInPlace = () => {
    if (document.hidden) return;

    // Filter spots that have multiple students to rotate
    const rotatableSpots = activeSpots.filter(s => s.students.length > 1);
    if (rotatableSpots.length === 0) return;

    const spot = rotatableSpots[rotatingSpotIndex % rotatableSpots.length];
    rotatingSpotIndex = (rotatingSpotIndex + 1) % rotatableSpots.length;

    const innerEl = document.getElementById(`${spot.id}-inner`);
    if (!innerEl) return;

    // 1. Smooth Fade out in place
    innerEl.style.opacity = '0';
    innerEl.style.transform = 'scale(0.92)';

    setTimeout(() => {
      // Advance to next student in this spot's list
      spot.currentIndex = (spot.currentIndex + 1) % spot.students.length;
      const nextStudent = spot.students[spot.currentIndex];

      innerEl.innerHTML = renderStudentInnerHtml(nextStudent, spot);

      // 2. Smooth Fade in in place
      innerEl.style.opacity = '1';
      innerEl.style.transform = 'scale(1)';
    }, 350);
  };

  startEngine();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rotationTimer) clearInterval(rotationTimer);
    } else {
      if (rotationTimer) clearInterval(rotationTimer);
      rotationTimer = setInterval(rotateNextSpotInPlace, 6000);
    }
  });
}

// -----------------------------------------------------------------------------
// PREMIUM REVIEWS & TESTIMONIALS ENGINE
// -----------------------------------------------------------------------------
function initReviewsSection() {
  const container = document.getElementById('reviewsContainer');
  const track = document.getElementById('reviewsTrack');
  const dotsContainer = document.getElementById('reviewsPaginationDots');
  const prevBtn = document.getElementById('prevReviewBtn');
  const nextBtn = document.getElementById('nextReviewBtn');

  if (!container || !track) return;

  const DEFAULT_REVIEWS = [
    {
      id: 'rev-001',
      reviewerName: 'Parent of a Zawiyah Student',
      reviewText: 'Zawiyah has made learning Islamic studies much more engaging and comfortable for my child. The personal attention and regular guidance have made a real difference.',
      rating: 5,
      reviewerType: 'Parent',
      course: 'One-to-One Classes'
    },
    {
      id: 'rev-002',
      reviewerName: 'Parent of a Gulf Batch Student',
      reviewText: 'The interactive group classes and flexible timing have been perfect for our family routine. The mentors are patient, caring, and truly dedicated to the children\'s tarbiyah.',
      rating: 5,
      reviewerType: 'Parent',
      course: 'Group Classes'
    },
    {
      id: 'rev-003',
      reviewerName: 'Parent of a Flexible Learner',
      reviewText: 'Finding quality Islamic education online with structured Tajweed and Quran recitation was a blessing. My child looks forward to every session with teacher enthusiasm.',
      rating: 5,
      reviewerType: 'Parent',
      course: 'Flexible Learning'
    },
    {
      id: 'rev-004',
      reviewerName: 'Senior Islamic Studies Student',
      reviewText: 'Learning Quranic recitation, Duas, and Islamic values with the mentors at Zawiyah has helped me understand the lessons deeply and with great clarity.',
      rating: 5,
      reviewerType: 'Student',
      course: 'Quran & Tajweed'
    }
  ];

  let reviewsList = [...DEFAULT_REVIEWS];
  let currentIndex = 0;
  let autoRotateTimer = null;

  const getVisibleCount = () => {
    if (window.innerWidth >= 1024) return 3; // Desktop
    if (window.innerWidth >= 640) return 2;  // Tablet
    return 1;                                // Mobile
  };

  const getMaxIndex = () => {
    const visible = getVisibleCount();
    return Math.max(0, reviewsList.length - visible);
  };

  const renderStars = (rating = 5) => {
    let starsHtml = '';
    const num = Math.max(1, Math.min(5, parseInt(rating) || 5));
    for (let i = 0; i < num; i++) {
      starsHtml += `<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 fill-accent-lime text-accent-lime inline" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
    return starsHtml;
  };

  const renderCards = () => {
    track.innerHTML = '';
    const visible = getVisibleCount();
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;

    reviewsList.forEach((rev) => {
      const card = document.createElement('div');
      
      if (isTablet) {
        card.style.flex = '0 0 calc(50% - 10px)';
      } else if (!isMobile) {
        card.style.flex = '0 0 calc(33.333% - 12px)';
      } else {
        card.style.flex = '0 0 100%';
      }

      card.className = 'glass-card-teal text-white p-4 sm:p-5 rounded-2xl border border-white/20 shadow-lg flex flex-col justify-between hover:-translate-y-0.5 hover:border-accent-lime/40 transition-all duration-300 select-none min-h-[160px] sm:min-h-[175px] mr-4 last:mr-0 backdrop-blur-xl';

      const typeBadge = rev.reviewerType === 'Student' 
        ? `<span class="px-2 py-0.5 rounded-full bg-accent-lavender/20 border border-accent-lavender/30 text-accent-lavender text-[9px] font-bold uppercase tracking-wider">Student</span>`
        : `<span class="px-2 py-0.5 rounded-full bg-accent-lime/20 border border-accent-lime/30 text-accent-lime text-[9px] font-bold uppercase tracking-wider">Parent</span>`;

      const courseBadge = rev.course 
        ? `<span class="text-[10px] text-tealtext-300 font-medium truncate">${escapeSideHtml(rev.course)}</span>`
        : '';

      card.innerHTML = `
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-0.5">
              ${renderStars(rev.rating)}
            </div>
            ${typeBadge}
          </div>
          <p class="text-tealtext-100 text-xs sm:text-[13px] leading-relaxed font-normal italic">
            "${escapeSideHtml(rev.reviewText)}"
          </p>
        </div>
        <div class="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <div class="space-y-0.5 overflow-hidden pr-2">
            <h4 class="font-display font-semibold text-white text-xs truncate">— ${escapeSideHtml(rev.reviewerName)}</h4>
            ${courseBadge}
          </div>
          <div class="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-accent-lime flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-2.5 h-2.5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>
          </div>
        </div>
      `;

      track.appendChild(card);
    });

    renderDots();
    updateSlidePosition();
  };

  const renderDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const maxIdx = getMaxIndex();

    if (maxIdx <= 0) return;

    for (let i = 0; i <= maxIdx; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to review slide ${i + 1}`);
      dot.className = `w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${i === currentIndex ? 'bg-accent-lime w-6' : 'bg-white/30 hover:bg-white/60'}`;
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateSlidePosition();
        resetAutoRotate();
      });
      dotsContainer.appendChild(dot);
    }
  };

  const updateSlidePosition = () => {
    const maxIdx = getMaxIndex();
    if (currentIndex > maxIdx) currentIndex = maxIdx;
    if (currentIndex < 0) currentIndex = 0;

    const visible = getVisibleCount();
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;

    // Calculate shift percentage including the 24px gap compensation
    let shiftPercent = (100 / visible) * currentIndex;
    if (isMobile) {
      shiftPercent = 100 * currentIndex;
    }
    track.style.transform = `translateX(-${shiftPercent}%)`;

    // Update Dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('button');
      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.className = 'w-6 h-2.5 rounded-full bg-accent-lime transition-all duration-300 cursor-pointer';
        } else {
          dot.className = 'w-2.5 h-2.5 rounded-full bg-white/30 hover:bg-white/60 transition-all duration-300 cursor-pointer';
        }
      });
    }

    // Update Arrow States
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIdx;
  };

  const nextSlide = () => {
    const maxIdx = getMaxIndex();
    if (currentIndex >= maxIdx) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    updateSlidePosition();
  };

  const prevSlide = () => {
    const maxIdx = getMaxIndex();
    if (currentIndex <= 0) {
      currentIndex = maxIdx;
    } else {
      currentIndex--;
    }
    updateSlidePosition();
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoRotate();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoRotate();
    });
  }

  // Auto rotation sliding smoothly every 3.5 seconds
  const startAutoRotate = () => {
    if (autoRotateTimer) clearInterval(autoRotateTimer);
    if (reviewsList.length > getVisibleCount()) {
      autoRotateTimer = setInterval(nextSlide, 3500);
    }
  };

  const resetAutoRotate = () => {
    startAutoRotate();
  };

  container.addEventListener('mouseenter', () => {
    if (autoRotateTimer) clearInterval(autoRotateTimer);
  });

  container.addEventListener('mouseleave', () => {
    startAutoRotate();
  });

  // Touch Swipe Support on Mobile
  let startX = 0;
  let moveX = 0;

  track.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      startX = e.touches[0].clientX;
      moveX = startX;
      if (autoRotateTimer) clearInterval(autoRotateTimer);
    }
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      moveX = e.touches[0].clientX;
    }
  }, { passive: true });

  track.addEventListener('touchend', () => {
    const diff = startX - moveX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    startAutoRotate();
  });

  // Fetch Public Approved Reviews from API
  fetch('/api/reviews')
    .then(res => res.json())
    .then(data => {
      if (data && data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
        reviewsList = data.reviews;
      }
      renderCards();
      startAutoRotate();
    })
    .catch(() => {
      renderCards();
      startAutoRotate();
    });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderCards();
    }, 150);
  });
}

// 10. Interactive Animated Learning Moments Section (Single Transparent 3D Visual)
function initInteractiveLearningMoments() {
  const container = document.getElementById('joyfulStudyDisplay');
  if (!container) return;

  if (window.matchMedia('(min-width: 1024px)').matches) {
    const img = container.querySelector('.joyful-study-img');
    const aura = container.querySelector('.joyful-study-aura');
    let isMoving = false;

    container.addEventListener('mousemove', (e) => {
      if (isMoving) return;
      isMoving = true;
      requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const xPercent = (e.clientX - rect.left) / rect.width - 0.5;
        const yPercent = (e.clientY - rect.top) / rect.height - 0.5;

        if (img) img.style.transform = `scale(1.02) translate3d(${xPercent * 8}px, ${yPercent * 6}px, 0)`;
        if (aura) aura.style.transform = `translate3d(${-xPercent * 10}px, ${-yPercent * 8}px, 0)`;
        isMoving = false;
      });
    }, { passive: true });

    container.addEventListener('mouseleave', () => {
      if (img) img.style.transform = '';
      if (aura) aura.style.transform = '';
    });
  }
}

