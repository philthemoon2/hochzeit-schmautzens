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

    // ---- Dynamic Person Fields ----
    let personCount = 1;
    const personenList = document.getElementById('personenList');
    const addPersonBtn = document.getElementById('addPersonBtn');

    if (addPersonBtn) {
        addPersonBtn.addEventListener('click', () => {
            if (personCount >= 8) return; // max 8 Personen
            const idx = personCount;
            personCount++;

            const entry = document.createElement('div');
            entry.className = 'person-entry flex gap-3 items-start';
            entry.dataset.person = idx;
            entry.innerHTML = `
                <div class="flex-1">
                    <input type="text" name="person_name_${idx}" required placeholder="Vor- und Nachname"
                           class="w-full rounded-lg border-charcoal/15 bg-ivory focus:ring-gold focus:border-gold px-4 py-3 text-sm font-light">
                </div>
                <div class="w-40">
                    <select name="person_food_${idx}" class="w-full rounded-lg border-charcoal/15 bg-ivory focus:ring-gold focus:border-gold text-sm font-light py-3">
                        <option value="normal">Normal</option>
                        <option value="vegetarisch">Vegetarisch</option>
                        <option value="vegan">Vegan</option>
                    </select>
                </div>
                <button type="button" class="remove-person mt-1 text-charcoal/30 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none p-2"
                        title="Person entfernen">
                    <span class="material-symbols-outlined text-lg">close</span>
                </button>
            `;

            entry.querySelector('.remove-person').addEventListener('click', () => {
                entry.remove();
                personCount--;
                // Re-enable button if we were at max
                if (personCount < 8) addPersonBtn.style.display = '';
            });

            personenList.appendChild(entry);

            // Focus the new name field
            entry.querySelector('input[type="text"]').focus();

            // Hide button at max
            if (personCount >= 8) addPersonBtn.style.display = 'none';
        });
    }

    // ---- Collect all persons from form ----
    function collectPersons() {
        const persons = [];
        const entries = personenList.querySelectorAll('.person-entry');
        entries.forEach(entry => {
            const idx = entry.dataset.person;
            const nameEl = entry.querySelector(`[name="person_name_${idx}"]`);
            const foodEl = entry.querySelector(`[name="person_food_${idx}"]`);
            if (nameEl && nameEl.value.trim()) {
                persons.push({
                    name: nameEl.value.trim(),
                    food: foodEl ? foodEl.value : 'normal'
                });
            }
        });
        return persons;
    }

    // ---- Google Apps Script URL ----
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxRDzphJtNcHjgKsmtBUNCv9EFnQWnZnjBYCPNxhGEBm9CpdniRpoGEUJKs0M5TFn5bEQ/exec';

    // Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="material-symbols-outlined text-xl animate-spin">progress_activity</span> Wird gesendet...';
        submitBtn.disabled = true;

        // Collect persons
        const persons = collectPersons();
        if (persons.length === 0) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        // Collect shared RSVP data
        const formData = new FormData(form);
        const days = formData.getAll('days');
        const attending = formData.get('attending') || '';
        const stayFrom = formData.get('stayFrom') || '';
        const stayTo = formData.get('stayTo') || '';
        const room = formData.get('room') || '';
        const children = formData.get('children') || '';
        const childrenDetails = formData.get('childrenDetails') || '';
        const allergies = formData.get('allergies') || '';
        const notes = formData.get('notes') || '';

        const data = {
            persons: persons,
            attending: attending,
            days: days,
            stayFrom: stayFrom,
            stayTo: stayTo,
            room: room,
            children: children,
            childrenDetails: childrenDetails,
            allergies: allergies,
            notes: notes
        };

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
            form.style.display = 'none';
            successEl.classList.add('show');
        }
    });

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
