/* ==========================================================================
   OperaViva — Script Interattivo Sito Cloudflare Pages
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle con Blocco Scorrimento Body (Evita scroll bleed sotto il menu)
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  function setMobileMenu(isOpen) {
    if (!navMenu || !mobileToggle) return;
    const spans = mobileToggle.querySelectorAll('span');

    if (isOpen) {
      navMenu.classList.add('open');
      document.body.classList.add('mobile-nav-open');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      mobileToggle.setAttribute('aria-expanded', 'true');

      if (spans.length >= 3) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      }
    } else {
      navMenu.classList.remove('open');
      document.body.classList.remove('mobile-nav-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
      mobileToggle.setAttribute('aria-expanded', 'false');

      if (spans.length >= 3) {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    }
  }

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !navMenu.classList.contains('open');
      setMobileMenu(willOpen);
    });

    // Chiudi il menu quando si clicca su un link di navigazione o sulla CTA
    navMenu.querySelectorAll('.nav-link, .nav-mobile-cta').forEach(link => {
      link.addEventListener('click', () => {
        setMobileMenu(false);
      });
    });

    // Chiudi se si clicca fuori dall'header/menu
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        setMobileMenu(false);
      }
    });

    // Chiudi se si ridimensiona a viewport desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900 && navMenu.classList.contains('open')) {
        setMobileMenu(false);
      }
    });
  }

  // 2. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Chiudi gli altri item aperti
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });

        // Alterna lo stato corrente
        if (isActive) {
          item.classList.remove('active');
        } else {
          item.classList.add('active');
        }
      });
    }
  });

  // 3. Selezione Interattiva Piattaforme (Illuminazione al Click)
  const platformCards = document.querySelectorAll('.platform-card');
  platformCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Non interferire se l'utente clicca direttamente su un link <a>
      const target = e.target;
      if (target && target.closest && target.closest('a')) {
        return;
      }
      platformCards.forEach(c => c.classList.remove('highlight-card'));
      card.classList.add('highlight-card');
    });
  });

  // 4. Navbar scroll effect
  const siteHeader = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteHeader.style.padding = '0.75rem 0';
      siteHeader.style.background = 'rgba(10, 12, 16, 0.95)';
      siteHeader.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    } else {
      siteHeader.style.padding = '1rem 0';
      siteHeader.style.background = 'rgba(10, 12, 16, 0.85)';
      siteHeader.style.boxShadow = 'none';
    }
  });

  // 6. Language Switcher (IT / EN)
  let currentLang = 'it';
  const savedLang = localStorage.getItem('operaviva_sito_lang');
  if (savedLang === 'it' || savedLang === 'en') {
    currentLang = savedLang;
  } else {
    const browserLang = (navigator.language || '').toLowerCase();
    if (browserLang.startsWith('en')) {
      currentLang = 'en';
    }
  }

  function applyLanguage(lang) {
    if (typeof siteTranslations === 'undefined' || !siteTranslations[lang]) {
      return;
    }
    currentLang = lang;
    const t = siteTranslations[lang];

    // Aggiorna attributo lang del documento
    document.documentElement.lang = lang;

    // Aggiorna elementi di solo testo
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        el.textContent = t[key];
      }
    });

    // Aggiorna elementi con formattazione HTML (strong, em, br)
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      if (t[key] !== undefined) {
        el.innerHTML = t[key];
      }
    });

    // Aggiorna visivamente il bottone unificato lingua (solo bandierina grafica SVG italiana / inglese)
    const FLAG_IT_SVG = `<svg width="22" height="15" viewBox="0 0 30 20" class="flag-svg" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="20" fill="#009246"/><rect x="10" width="10" height="20" fill="#ffffff"/><rect x="20" width="10" height="20" fill="#ce2b37"/><rect width="30" height="20" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/></svg>`;
    const FLAG_EN_SVG = `<svg width="22" height="15" viewBox="0 0 60 40" class="flag-svg" xmlns="http://www.w3.org/2000/svg"><clipPath id="uk-flag-clip-site"><rect width="60" height="40" rx="3"/></clipPath><g clipPath="url(#uk-flag-clip-site)"><rect width="60" height="40" fill="#012169"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#ffffff" stroke-width="8"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" stroke-width="4"/><path d="M30,0 V40 M0,20 H60" stroke="#ffffff" stroke-width="12"/><path d="M30,0 V40 M0,20 H60" stroke="#C8102E" stroke-width="7"/><rect width="60" height="40" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/></g></svg>`;

    const flagSvg = lang === 'en' ? FLAG_EN_SVG : FLAG_IT_SVG;
    const titleText = lang === 'it' 
      ? 'Lingua attuale: Italiano (clicca per passare all\'Inglese)' 
      : 'Current language: English (click to switch to Italian)';

    const langFlag = document.getElementById('langFlag');
    if (langFlag) langFlag.innerHTML = flagSvg;
    const langToggle = document.getElementById('langToggleBtn');
    if (langToggle) langToggle.setAttribute('title', titleText);

    const langFlagMobile = document.getElementById('langFlagMobile');
    if (langFlagMobile) langFlagMobile.innerHTML = flagSvg;
    const langToggleMobile = document.getElementById('langToggleBtnMobile');
    if (langToggleMobile) langToggleMobile.setAttribute('title', titleText);

    // Salva preferenza
    localStorage.setItem('operaviva_sito_lang', lang);
  }

  // Applica lingua iniziale
  applyLanguage(currentLang);

  // Click handler per il bottone unificato lingua (desktop)
  const langToggleBtn = document.getElementById('langToggleBtn');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      applyLanguage(currentLang === 'it' ? 'en' : 'it');
    });
  }

  // Click handler per il bottone unificato lingua (mobile drawer)
  const langToggleBtnMobile = document.getElementById('langToggleBtnMobile');
  if (langToggleBtnMobile) {
    langToggleBtnMobile.addEventListener('click', (e) => {
      e.preventDefault();
      applyLanguage(currentLang === 'it' ? 'en' : 'it');
    });
  }
});
