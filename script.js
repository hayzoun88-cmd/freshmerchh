
/* ============================================================
   FRESHMERCH — INTERACTIONS
   Each function owns one interaction so the file stays easy
   to maintain or extend.
============================================================ */

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

/* ============================================================
   INTRO
============================================================ */
function initIntro() {
  const intro = $("#intro");
  const skip = $("#skipIntro");
  if (!intro) return;

  document.body.classList.add("is-locked");
  skip?.focus({ preventScroll: true });

  const closeIntro = () => {
    intro.classList.add("is-done");
    intro.setAttribute("aria-hidden", "true");
    intro.inert = true;
    document.body.classList.remove("is-locked");
    sessionStorage.setItem("freshmerch-intro-seen", "1");
  };

  skip?.addEventListener("click", closeIntro);

  if (sessionStorage.getItem("freshmerch-intro-seen") === "1") {
    intro.classList.add("is-done");
    intro.setAttribute("aria-hidden", "true");
    intro.inert = true;
    document.body.classList.remove("is-locked");
  } else {
    window.setTimeout(closeIntro, 3200);
  }
}

/* ============================================================
   HEADER
============================================================ */
function initHeader() {
  const header = $("#siteHeader");
  if (!header) return;

  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

/* ============================================================
   MOBILE MENU
============================================================ */
function initMobileMenu() {
  const toggle = $("#menuToggle");
  const menu = $("#mobileMenu");
  if (!toggle || !menu) return;

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Ouvrir le menu");
    menu.setAttribute("aria-hidden", "true");
    menu.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    toggle.focus({ preventScroll: true });
  };

  toggle.addEventListener("click", () => {
    const open = !menu.classList.contains("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    menu.setAttribute("aria-hidden", String(!open));
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("is-locked", open);
    if (open) $(".mobile-menu__inner a", menu)?.focus({ preventScroll: true });
  });

  $$("#mobileMenu a").forEach(link => link.addEventListener("click", close));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) close();
  });
}

/* ============================================================
   REVEAL ON SCROLL
============================================================ */
function initRevealAnimations() {
  const groups = $$(".universe-grid, .craft-list, .product__facts, .timeline, .work-grid");
  groups.forEach(group => {
    $$(".reveal", group).forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 90, 360)}ms`;
    });
  });

  const items = $$(".reveal");
  if (!items.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px" });

  items.forEach(item => observer.observe(item));
}

/* ============================================================
   SCROLL PROGRESS
============================================================ */
function initScrollProgress() {
  const bar = $("#scrollProgress span");
  if (!bar) return;

  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    bar.style.width = `${Math.min(ratio * 100, 100)}%`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

/* ============================================================
   MAGNETIC BUTTONS
============================================================ */
function initMagneticButtons() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(pointer: fine)").matches) return;

  $$(".button").forEach(button => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.18}px, ${y * 0.35 - 3}px)`;
    });
    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}

/* ============================================================
   CARD TILT
============================================================ */
function initCardTilt() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(pointer: fine)").matches) return;

  $$(".universe-card").forEach(card => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${y * -8}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

/* ============================================================
   HERO PARALLAX
============================================================ */
function initHeroParallax() {
  const hero = $(".hero");
  const visual = $(".hero__visual");
  if (!hero || !visual || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let raf = null;
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      visual.style.transform = `perspective(1200px) rotateY(${x * 2.2}deg) rotateX(${y * -1.6}deg)`;
    });
  });

  hero.addEventListener("pointerleave", () => {
    visual.style.transform = "";
  });
}

/* ============================================================
   GENERIC PARALLAX
============================================================ */
function initParallax() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const items = $$("[data-parallax]");
  if (!items.length) return;

  let ticking = false;

  const update = () => {
    const viewport = window.innerHeight;
    items.forEach(item => {
      const rect = item.getBoundingClientRect();
      const strength = Number(item.dataset.parallax || 0.02);
      const center = rect.top + rect.height / 2;
      const offset = (viewport / 2 - center) * strength;
      item.style.translate = `0 ${offset}px`;
    });
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
}

/* ============================================================
   PRODUCT VIEW SWITCHER
============================================================ */
function initProductSwitcher() {
  const buttons = $$(".product__switcher button");
  const jersey = $(".product__jersey");
  if (!buttons.length || !jersey) return;

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(item => {
        item.classList.remove("is-active");
        item.setAttribute("aria-selected", "false");
        item.setAttribute("tabindex", "-1");
      });
      button.classList.add("is-active");
      button.setAttribute("aria-selected", "true");
      button.setAttribute("tabindex", "0");
      button.focus({ preventScroll: true });

      const view = button.dataset.view;
      if (view === "detail") {
        jersey.style.transform = "scale(1.16) translate(4%, -2%)";
        jersey.style.filter = "drop-shadow(0 35px 35px rgba(8,18,37,.28))";
      } else if (view === "scale") {
        jersey.style.transform = "scale(.82) translateY(3%)";
        jersey.style.filter = "drop-shadow(0 22px 24px rgba(8,18,37,.20))";
      } else {
        jersey.style.transform = "";
        jersey.style.filter = "";
      }
    });
  });
}

/* ============================================================
   STUDIO PREVIEW
============================================================ */
function initStudio() {
  const tools = $$(".tool");
  const jersey = $("#studioJersey");
  if (!tools.length || !jersey) return;

  tools.forEach(tool => {
    tool.addEventListener("click", () => {
      tools.forEach(item => item.classList.remove("is-active"));
      tool.classList.add("is-active");

      const style = tool.dataset.style;
      if (style === "02") {
        jersey.style.transform = "rotate(-2deg) scale(1.06)";
        jersey.style.filter = "drop-shadow(0 40px 40px rgba(255,210,26,.20))";
      } else if (style === "03") {
        jersey.style.transform = "scale(.91)";
        jersey.style.filter = "drop-shadow(0 30px 30px rgba(47,120,255,.24))";
      } else {
        jersey.style.transform = "";
        jersey.style.filter = "";
      }
    });
  });
}

/* ============================================================
   CONTACT FORM
============================================================ */
function initContactForm() {
  const form = $("#contactForm");
  const status = $("#cfStatus");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const name = $("#cf-name", form).value.trim();
    const email = $("#cf-email", form).value.trim();
    const message = $("#cf-message", form).value.trim();

    if (!name || !email || !message) {
      status.textContent = "Merci de remplir tous les champs.";
      return;
    }

    const subject = encodeURIComponent(`Nouveau projet FreshMerch — ${name}`);
    const body = encodeURIComponent(`Nom : ${name}\nEmail : ${email}\n\n${message}`);
    window.location.href = `mailto:contact@freshmerch.fr?subject=${subject}&body=${body}`;

    status.textContent = "Votre messagerie va s'ouvrir avec votre demande pré-remplie.";
  });
}

/* ============================================================
   SMOOTH NAVIGATION
============================================================ */
function initSmoothNavigation() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      const target = $(id);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* ============================================================
   YEAR
============================================================ */
function initYear() {
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
}

/* ============================================================
   START
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  initIntro();
  initHeader();
  initMobileMenu();
  initRevealAnimations();
  initScrollProgress();
  initMagneticButtons();
  initCardTilt();
  initHeroParallax();
  initParallax();
  initProductSwitcher();
  initStudio();
  initContactForm();
  initSmoothNavigation();
  initYear();
});
