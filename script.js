// ============================================
// HOCHZEIT SCHMAUTZENS — Wedding Website JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ---- Navigation Scroll Effect ----
    const nav = document.getElementById('nav');
    const handleScroll = () => {
        const scrolled = window.scrollY > 80;
        nav.classList.toggle('nav-scrolled', scrolled);
        nav.classList.toggle('nav-transparent', !scrolled);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // ---- Mobile Menu ----
    const navToggle = document.getElementById('navToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavClose = document.getElementById('mobileNavClose');

    navToggle.addEventListener('click', () => {
        mobileNav.classList.add('open');
        document.body.style.overflow = 'hidden';
    });

    const closeMobileNav = () => {
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
    };

    mobileNavClose.addEventListener('click', closeMobileNav);

    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });

    // ---- Scroll Reveal ----
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, i * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => revealObserver.observe(el));

    // ---- Smooth Scroll for Anchor Links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ---- RSVP Form Logic ----
    const form = document.getElementById('rsvpForm');
    const attendingDetails = document.getElementById('attendingDetails');
    const attendingRadios = document.querySelectorAll('input[name="attending"]');
    const childrenCheckbox = document.querySelector('input[name="children"]');
    const childrenInput = document.getElementById('childrenInput');
    const foodSelect = document.getElementById('food');
    const allergiesInput = document.getElementById('allergiesInput');
    const successEl = document.getElementById('rsvpSuccess');

    // Show/hide attending details
    attendingRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            attendingDetails.classList.toggle('show', radio.value === 'ja' && radio.checked);
        });
    });

    // Show/hide children details
    if (childrenCheckbox) {
        childrenCheckbox.addEventListener('change', () => {
            childrenInput.classList.toggle('show', childrenCheckbox.checked);
        });
    }

    // Show/hide allergies field
    if (foodSelect) {
        foodSelect.addEventListener('change', () => {
            allergiesInput.classList.toggle('show', foodSelect.value === 'allergien');
        });
    }

    // ---- Google Apps Script URL ----
    // HIER DEINE GOOGLE APPS SCRIPT WEB-APP URL EINTRAGEN:
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxKybsJIUhFS1awxFTckX5uKKJdqBZABdDo91ZHMoI5ISxDUsPSq5KsAgPDMI3LGDnbBw/exec';

    // Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="material-symbols-outlined text-xl animate-spin">progress_activity</span> Wird gesendet...';
        submitBtn.disabled = true;

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        });

        console.log('RSVP Submission:', data);

        // Save to localStorage as backup
        const submissions = JSON.parse(localStorage.getItem('rsvp_submissions') || '[]');
        submissions.push({ ...data, timestamp: new Date().toISOString() });
        localStorage.setItem('rsvp_submissions', JSON.stringify(submissions));

        // Send to Google Sheets via Apps Script
        if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'DEINE_GOOGLE_APPS_SCRIPT_URL_HIER') {
            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(() => {
                form.style.display = 'none';
                successEl.classList.add('show');
            })
            .catch((err) => {
                console.error('Google Sheets Error:', err);
                // Trotzdem Erfolg anzeigen (localStorage hat Backup)
                form.style.display = 'none';
                successEl.classList.add('show');
            });
        } else {
            // Fallback ohne Google Script URL
            form.style.display = 'none';
            successEl.classList.add('show');
        }
    });

    // ---- Parallax on Hero (subtle, desktop only) ----
    const heroImg = document.querySelector('#hero img');
    if (heroImg && window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroImg.style.transform = `translateY(${scrolled * 0.15}px) scale(1.05)`;
            }
        }, { passive: true });
    }

});
