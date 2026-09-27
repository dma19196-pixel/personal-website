/* ==========================================================================
   script.js — vanilla JS, no dependencies
   Sections:
     1. Utility: copyText (Clipboard API with execCommand fallback)
     2. Mobile Nav Drawer Toggle
     3. Smooth Scroll (offsets for the sticky navbar)
     4. Category Filters (Policy & Debate Vault grid)
     5. Contact Email — Copy to Clipboard
     6. Code Snippet — Copy to Clipboard
     7. PDF Preview Modal (wires the modal markup already in index.html)
   ========================================================================== */
'use strict';

(function () {

  /* ------------------------------------------------------------------------
     1. Utility — copy arbitrary text to the clipboard
     ------------------------------------------------------------------------ */
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        /* fall through to legacy fallback */
      }
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch (err) {
      return false;
    }
  }

  /* ------------------------------------------------------------------------
     2. Mobile Nav Drawer Toggle
     ------------------------------------------------------------------------ */
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    const overlay = document.getElementById('navOverlay');
    if (!toggle || !links || !overlay) return;

    function openNav() {
      toggle.classList.add('is-open');
      links.classList.add('is-open');
      overlay.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      toggle.classList.remove('is-open');
      links.classList.remove('is-open');
      overlay.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
      links.classList.contains('is-open') ? closeNav() : openNav();
    });

    overlay.addEventListener('click', closeNav);

    links.querySelectorAll('.navbar__link').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });

    // Auto-close the drawer if the viewport grows past the mobile breakpoint
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) closeNav();
    });
  }

  /* ------------------------------------------------------------------------
     3. Smooth Scroll — offsets the sticky navbar height for every in-page
        anchor link (nav links, hero buttons, footer links, etc.)
     ------------------------------------------------------------------------ */
  function initSmoothScroll() {
    const navbar = document.querySelector('.navbar');
    const getOffset = () => (navbar ? navbar.offsetHeight : 0) + 16;

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const hash = link.getAttribute('href');
      if (!hash || hash.length < 2) return; // ignore bare "#"

      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - getOffset();
      window.scrollTo({ top, behavior: 'smooth' });

      // Keep the URL shareable and move focus for keyboard/screen-reader users
      history.pushState(null, '', hash);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }

  /* ------------------------------------------------------------------------
     4. Category Filters — works for any .filter-bar followed by a
        .project-grid; matches each card's data-type, falling back to
        data-category, against the clicked button's data-filter value.
     ------------------------------------------------------------------------ */
  function initFilters() {
    document.querySelectorAll('.filter-bar').forEach((bar) => {
      const grid = bar.nextElementSibling;
      if (!grid || !grid.classList.contains('project-grid')) return;
      const cards = grid.querySelectorAll('.project-card');

      bar.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        const value = btn.dataset.filter;

        bar.querySelectorAll('.filter-btn').forEach((b) => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });

        cards.forEach((card) => {
          const cardValue = card.dataset.type || card.dataset.category;
          const show = value === 'all' || cardValue === value;
          card.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. Contact Email — Copy to Clipboard with a dynamic tooltip
     ------------------------------------------------------------------------ */
  function initEmailCopy() {
    const btn = document.getElementById('copyEmailBtn');
    const tooltip = document.getElementById('copyEmailTooltip');
    if (!btn || !tooltip) return;

    let hideTimer;

    btn.addEventListener('click', async () => {
      const email = btn.dataset.copyEmail;
      const ok = await copyText(email);

      tooltip.textContent = ok ? 'Copied!' : 'Copy failed';
      tooltip.classList.add('is-visible');

      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => tooltip.classList.remove('is-visible'), 1800);
    });
  }

  /* ------------------------------------------------------------------------
     6. Code Snippet — Copy to Clipboard for the SQL / Python blocks
     ------------------------------------------------------------------------ */
  function initCodeCopy() {
    document.querySelectorAll('.code-block__copy').forEach((btn) => {
      const targetId = btn.dataset.copyTarget;
      const codeEl = targetId ? document.getElementById(targetId) : null;
      if (!codeEl) return;

      const originalLabel = btn.textContent;
      let resetTimer;

      btn.addEventListener('click', async () => {
        const ok = await copyText(codeEl.textContent.trim());
        btn.textContent = ok ? 'Copied' : 'Failed';

        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          btn.textContent = originalLabel;
        }, 1500);
      });
    });
  }

  /* ------------------------------------------------------------------------
     7. PDF Preview Modal — wires up the [data-modal-pdf] links and the
        #pdfModalOverlay markup already sitting in index.html
     ------------------------------------------------------------------------ */
  function initPdfModal() {
    const overlay = document.getElementById('pdfModalOverlay');
    const frame = document.getElementById('pdfModalFrame');
    const titleEl = document.getElementById('pdfModalTitle');
    const closeBtn = document.getElementById('pdfModalClose');
    if (!overlay || !frame || !titleEl || !closeBtn) return;

    let lastTrigger = null;

    function openModal(url, title) {
      lastTrigger = document.activeElement;
      frame.src = url;
      titleEl.textContent = title || 'Research Brief';
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeModal() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      frame.src = '';
      if (lastTrigger) lastTrigger.focus();
    }

    document.querySelectorAll('[data-modal-pdf]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(link.dataset.modalPdf, link.dataset.modalTitle);
      });
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
    });
  }

  /* ------------------------------------------------------------------------
     Init — script.js is loaded with `defer`, so the DOM is already parsed
     ------------------------------------------------------------------------ */
  function init() {
    initMobileNav();
    initSmoothScroll();
    initFilters();
    initEmailCopy();
    initCodeCopy();
    initPdfModal();
  }

  init();
})();
