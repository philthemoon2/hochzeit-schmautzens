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

    // ---- Google Apps Script URL ----
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyEjAklRiy51LeyQx1ELQryWByCDUM3dotTLKxYgVx22WpKOBe_DedJCwxOcgIQzoHG8A/exec';

    // ---- Absage Form ----
    const absageForm = document.getElementById('absageForm');
    const absageSuccess = document.getElementById('absageSuccess');

    if (absageForm) {
        absageForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = absageForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            const formData = new FormData(absageForm);
            const data = {
                type: 'absage',
                name: (formData.get('absageName') || '').trim(),
                email: (formData.get('absageEmail') || '').trim(),
                message: (formData.get('absageMessage') || '').trim()
            };

            if (!data.name || !data.email) return;

            submitBtn.innerHTML = '<span class="material-symbols-outlined text-xl animate-spin">progress_activity</span> Wird gesendet...';
            submitBtn.disabled = true;

            // Backup im Browser, falls der Versand scheitert
            const absagen = JSON.parse(localStorage.getItem('absage_submissions') || '[]');
            absagen.push({ ...data, timestamp: new Date().toISOString() });
            localStorage.setItem('absage_submissions', JSON.stringify(absagen));

            const showSuccess = () => {
                absageForm.style.display = 'none';
                absageSuccess.classList.add('show');
            };

            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(showSuccess)
            .catch((err) => {
                console.error('Absage konnte nicht gesendet werden:', err);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                alert('Das hat leider nicht geklappt. Bitte schreibt uns kurz direkt an info@phil-thebeat.com.');
            });
        });
    }

    // ---- Countdown to Wedding Day ----
    const weddingDate = new Date('2026-08-21T14:00:00+02:00'); // Zeremonie 14 Uhr
    const cdDays = document.getElementById('cd-days');
    const cdHours = document.getElementById('cd-hours');
    const cdMinutes = document.getElementById('cd-minutes');
    const cdSeconds = document.getElementById('cd-seconds');

    function updateCountdown() {
        const now = new Date();
        const diff = weddingDate - now;

        if (diff <= 0) {
            cdDays.textContent = '0';
            cdHours.textContent = '0';
            cdMinutes.textContent = '0';
            cdSeconds.textContent = '0';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        cdDays.textContent = days;
        cdHours.textContent = String(hours).padStart(2, '0');
        cdMinutes.textContent = String(minutes).padStart(2, '0');
        cdSeconds.textContent = String(seconds).padStart(2, '0');
    }

    if (cdDays) {
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

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
