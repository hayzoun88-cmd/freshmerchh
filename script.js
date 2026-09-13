
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

  const closeIntro = () => {
    intro.classList.add("is-done");
    document.body.classList.remove("is-locked");
    sessionStorage.setItem("freshmerch-intro-seen", "1");
  };

  skip?.addEventListener("click", closeIntro);

  if (sessionStorage.getItem("freshmerch-intro-seen") === "1") {
    intro.classList.add("is-done");
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
    menu.setAttribute("aria-hidden", "true");
    menu.classList.remove("is-open");
    document.body.classList.remove("is-locked");
  };

  toggle.addEventListener("click", () => {
    const open = !menu.classList.contains("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("is-locked", open);
  });

  $$("#mobileMenu a").forEach(link => link.addEventListener("click", close));
}

/* ============================================================
   REVEAL ON SCROLL
============================================================ */
function initRevealAnimations() {
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
      buttons.forEach(item => item.classList.remove("is-active"));
      button.classList.add("is-active");

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
  initHeroParallax();
  initParallax();
  initProductSwitcher();
  initStudio();
  initSmoothNavigation();
  initYear();
});
