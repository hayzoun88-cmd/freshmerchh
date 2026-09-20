
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
  const video = $("#introVideo");
  if (!intro) return;

  const alreadySeen = (() => {
    try { return sessionStorage.getItem("freshmerch-intro-seen") === "1"; } catch (e) { return false; }
  })();

  const hideImmediately = () => {
    intro.classList.add("is-done");
    intro.setAttribute("aria-hidden", "true");
    intro.inert = true;
  };

  if (alreadySeen) {
    hideImmediately();
    return;
  }

  document.body.classList.add("is-locked");
  skip?.focus({ preventScroll: true });

  let dismissTimer = null;
  const closeIntro = () => {
    if (dismissTimer) clearTimeout(dismissTimer);
    hideImmediately();
    document.body.classList.remove("is-locked");
    try { sessionStorage.setItem("freshmerch-intro-seen", "1"); } catch (e) { /* stockage indisponible */ }
    video?.pause();
  };

  skip?.addEventListener("click", closeIntro);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!video || reducedMotion) {
    // Pas de vidéo (ou mouvement réduit demandé) : on affiche juste la marque quelques instants.
    dismissTimer = window.setTimeout(closeIntro, 1800);
    return;
  }

  video.addEventListener("loadeddata", () => video.classList.add("is-ready"), { once: true });
  video.addEventListener("ended", closeIntro, { once: true });
  // Vraie erreur de lecture (fichier introuvable, format non supporté...) : on n'y peut rien,
  // pas la peine de garder le visiteur bloqué sur un écran noir.
  video.addEventListener("error", closeIntro, { once: true });

  const armSafetyTimeout = () => {
    if (dismissTimer) clearTimeout(dismissTimer);
    const seconds = isFinite(video.duration) && video.duration > 0 ? video.duration : 12;
    dismissTimer = window.setTimeout(closeIntro, Math.ceil(seconds * 1000) + 1500);
  };
  video.addEventListener("loadedmetadata", armSafetyTimeout, { once: true });
  // Filet de sécurité initial le temps que les métadonnées de la vidéo arrivent.
  dismissTimer = window.setTimeout(closeIntro, 12000);

  video.play().catch(() => {
    // Autoplay refusé par le navigateur (rare pour une vidéo muette, mais possible selon les
    // réglages) : plutôt que de passer directement au site sans l'avoir jouée, on démarre la
    // vidéo au premier geste du visiteur sur l'intro (clic, tap, touche).
    const startOnInteract = () => { video.play().catch(closeIntro); };
    intro.addEventListener("pointerdown", startOnInteract, { once: true });
    intro.addEventListener("keydown", startOnInteract, { once: true });
  });
}

/* ============================================================
   THEME TOGGLE (mode clair / sombre)
============================================================ */
const THEME_KEY = "freshmerch-theme";

function initThemeToggle() {
  const toggle = $("#themeToggle");
  if (!toggle) return;

  const apply = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    toggle.setAttribute("aria-pressed", String(theme === "light"));
    toggle.setAttribute("aria-label", theme === "light" ? "Activer le mode sombre" : "Activer le mode clair");
  };

  toggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* stockage indisponible, on continue sans persister */ }
    apply(next);
  });

  apply(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
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
    window.location.href = `mailto:jules.frescaline@gmail.com?subject=${subject}&body=${body}`;

    status.textContent = "Votre messagerie va s'ouvrir avec votre demande pré-remplie.";
  });
}

/* ============================================================
   QUOTE FORM (devis.html)
   ------------------------------------------------------------
   Le site est 100% statique (aucun serveur, aucune clé API
   exposée) : l'envoi ouvre le client mail du visiteur avec le
   récapitulatif complet du projet, adressé à
   jules.frescaline@gmail.com. Les fichiers ne peuvent pas être
   joints automatiquement par un lien mailto : la liste des
   fichiers sélectionnés est rappelée dans le corps du message.

   Pour brancher un vrai envoi serveur plus tard (ex. Formspree,
   backend maison…), remplacer le contenu du bloc
   `form.addEventListener("submit", ...)` ci-dessous par un appel
   fetch() vers l'endpoint choisi, sans jamais exposer de clé
   secrète côté front (un ID de formulaire public suffit pour
   Formspree).
============================================================ */

const FIELD_ERROR_MESSAGES = {
  nom: "Veuillez renseigner votre nom.",
  prenom: "Veuillez renseigner votre prénom.",
  email: "Veuillez renseigner une adresse e-mail valide.",
  telephone: "Veuillez renseigner un numéro de téléphone.",
  type_de_projet: "Veuillez sélectionner un type de projet.",
  produit: "Veuillez préciser le produit recherché.",
  description: "Veuillez décrire votre projet.",
  consentement: "Merci de confirmer que nous pouvons vous recontacter."
};

function fieldLabelText(field) {
  return field?.closest(".contact-form__field")?.querySelector("label")?.textContent?.trim() || field?.name || "";
}

function showFieldError(field, message) {
  const wrap = field.closest(".contact-form__field");
  if (!wrap) return;
  wrap.classList.add("has-error");
  let err = wrap.querySelector(".field-error");
  if (!err) {
    err = document.createElement("p");
    err.className = "field-error";
    wrap.appendChild(err);
  }
  err.textContent = message;
}

function clearFieldError(field) {
  const wrap = field.closest(".contact-form__field");
  if (!wrap) return;
  wrap.classList.remove("has-error");
  const err = wrap.querySelector(".field-error");
  if (err) err.textContent = "";
}

function validateQuoteForm(form) {
  let firstInvalid = null;
  let valid = true;

  $$("[required]", form).forEach(field => {
    clearFieldError(field);
    const value = field.value.trim();
    const isEmail = field.type === "email";
    const isCheckbox = field.type === "checkbox";
    const empty = isCheckbox ? !field.checked : !value;
    const badEmail = isEmail && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (empty || badEmail) {
      valid = false;
      const message = FIELD_ERROR_MESSAGES[field.name] || `Veuillez renseigner « ${fieldLabelText(field)} ».`;
      showFieldError(field, badEmail ? "Veuillez renseigner une adresse e-mail valide." : message);
      if (!firstInvalid) firstInvalid = field;
    }
  });

  if (firstInvalid) firstInvalid.focus({ preventScroll: false });
  return valid;
}

/* ---- Upload de fichiers (logo, maquette, cahier des charges…) ---- */
const ACCEPTED_FILE_TYPES = [".pdf", ".png", ".jpg", ".jpeg", ".svg", ".zip"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo / fichier
const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25 Mo au total

function initFileDrop() {
  const drop = $("#qf-file-drop");
  const input = $("#qf-files");
  const list = $("#qf-file-list");
  const errorEl = $("#qf-file-error");
  if (!drop || !input || !list) return;

  let files = [];

  const renderList = () => {
    list.innerHTML = files.map((f, i) => `
      <li>
        <span>${f.name} · ${(f.size / 1024 / 1024).toFixed(1)} Mo</span>
        <button type="button" data-remove="${i}" aria-label="Retirer ${f.name}">Retirer</button>
      </li>
    `).join("");
  };

  const syncInput = () => {
    const dt = new DataTransfer();
    files.forEach(f => dt.items.add(f));
    input.files = dt.files;
  };

  const addFiles = (fileList) => {
    errorEl.textContent = "";
    const incoming = [...fileList];
    let addedCount = 0;
    for (const file of incoming) {
      const ext = "." + file.name.split(".").pop().toLowerCase();
      if (!ACCEPTED_FILE_TYPES.includes(ext)) {
        errorEl.textContent = `Format non accepté : ${file.name}. Formats acceptés : PDF, PNG, JPG, SVG, ZIP.`;
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errorEl.textContent = `${file.name} dépasse la taille maximale de 10 Mo.`;
        continue;
      }
      files.push(file);
      addedCount++;
    }
    const total = files.reduce((sum, f) => sum + f.size, 0);
    if (total > MAX_TOTAL_SIZE) {
      errorEl.textContent = "La taille totale des fichiers dépasse 25 Mo. Merci d'en retirer un ou plusieurs.";
      // On annule uniquement les fichiers réellement ajoutés lors de cet appel
      // (et non tous les fichiers déposés, dont certains ont pu être rejetés au-dessus).
      if (addedCount) files = files.slice(0, -addedCount);
    }
    syncInput();
    renderList();
  };

  drop.addEventListener("click", () => input.click());
  drop.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); }
  });
  input.addEventListener("change", () => addFiles(input.files));

  ["dragenter", "dragover"].forEach(evt => drop.addEventListener(evt, (e) => {
    e.preventDefault();
    drop.classList.add("is-dragover");
  }));
  ["dragleave", "drop"].forEach(evt => drop.addEventListener(evt, (e) => {
    e.preventDefault();
    drop.classList.remove("is-dragover");
  }));
  drop.addEventListener("drop", (e) => addFiles(e.dataTransfer.files));

  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;
    files.splice(Number(btn.dataset.remove), 1);
    syncInput();
    renderList();
  });
}

function buildQuoteEmailBody(form) {
  const data = new FormData(form);
  const get = (name) => (data.get(name) || "").toString().trim();
  const files = $("#qf-files", form)?.files;

  const lines = [
    `Nom : ${get("nom")} ${get("prenom")}`.trim(),
    get("societe") && `Société / association / club : ${get("societe")}`,
    get("fonction") && `Fonction : ${get("fonction")}`,
    `Email : ${get("email")}`,
    `Téléphone : ${get("telephone")}`,
    "",
    `Type de projet : ${get("type_de_projet")}`,
    get("date_souhaitee") && `Date souhaitée : ${get("date_souhaitee")}`,
    get("quantite") && `Quantité estimée : ${get("quantite")}`,
    get("delai_souhaite") && `Délai souhaité : ${get("delai_souhaite")}`,
    get("budget_indicatif") && `Budget indicatif : ${get("budget_indicatif")}`,
    "",
    `Produit(s) recherché(s) : ${get("produit")}`,
    "",
    get("type_personnalisation") && `Type de personnalisation : ${get("type_personnalisation")}`,
    get("couleurs") && `Couleurs souhaitées : ${get("couleurs")}`,
    get("logo") && `Logo : ${get("logo")}`,
    get("noms") && `Noms : ${get("noms")}`,
    get("numeros") && `Numéros : ${get("numeros")}`,
    get("sponsors") && `Sponsors : ${get("sponsors")}`,
    get("autres_personnalisation") && `Autres éléments : ${get("autres_personnalisation")}`,
    "",
    "Description du projet :",
    get("description"),
    files?.length ? `\n${files.length} fichier(s) à joindre manuellement à cet e-mail : ${[...files].map(f => f.name).join(", ")}` : ""
  ];

  return lines.filter(line => line !== false).join("\n");
}

function initQuoteForm() {
  const form = $("#quoteForm");
  const successAlert = $("#qfSuccess");
  const copyBtn = $("#qfCopyRecap");
  const copyStatus = $("#qfCopyStatus");
  if (!form) return;

  let lastRecap = "";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    successAlert?.classList.remove("is-visible");

    // Honeypot anti-spam : champ invisible qui ne doit jamais être rempli par un humain.
    const honeypot = form.querySelector('input[name="site_web"]');
    if (honeypot && honeypot.value.trim() !== "") {
      return; // soumission silencieusement ignorée (bot probable)
    }

    if (!validateQuoteForm(form)) {
      return;
    }

    const nom = $("#qf-nom", form)?.value.trim() || "";
    const prenom = $("#qf-prenom", form)?.value.trim() || "";
    const subject = encodeURIComponent(`Demande de devis FreshMerch — ${nom} ${prenom}`.trim());
    lastRecap = buildQuoteEmailBody(form);
    const body = encodeURIComponent(lastRecap);

    // Un lien mailto: ne déclenche jamais d'exception JS depuis le navigateur, même
    // en l'absence de client mail configuré : il est donc impossible de détecter un
    // échec ici. Le récapitulatif reste copiable (bouton ci-dessous) en solution de
    // repli si la messagerie ne s'ouvre pas chez le visiteur.
    window.location.href = `mailto:jules.frescaline@gmail.com?subject=${subject}&body=${body}`;
    form.reset();
    $("#qf-file-list")?.replaceChildren();
    if (copyStatus) copyStatus.textContent = "";
    successAlert?.classList.add("is-visible");
    successAlert?.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  copyBtn?.addEventListener("click", async () => {
    if (!lastRecap) return;
    try {
      await navigator.clipboard.writeText(lastRecap);
      if (copyStatus) copyStatus.textContent = "Récapitulatif copié ✓";
    } catch (e) {
      if (copyStatus) copyStatus.textContent = "Copie automatique indisponible : sélectionnez et copiez le texte manuellement.";
    }
  });

  $$("[required]", form).forEach(field => {
    field.addEventListener("blur", () => {
      if (field.type === "checkbox" ? field.checked : field.value.trim()) clearFieldError(field);
    });
  });
}

/* ============================================================
   STUDIO → DEVIS HANDOFF
   ------------------------------------------------------------
   Quand le Studio 3D transmet une maquette (window.fmcSubmit dans
   studio.html), elle est stockée le temps de la redirection dans
   sessionStorage puis affichée ici en résumé, avec pré-remplissage
   des champs du formulaire de devis.
============================================================ */
function initStudioHandoff() {
  const banner = $("#studioHandoff");
  if (!banner) return;

  let raw = null;
  try { raw = sessionStorage.getItem("freshmerch-studio-config"); } catch (e) { /* stockage indisponible */ }
  if (!raw) return;

  let data = null;
  try { data = JSON.parse(raw); } catch (e) { return; }
  try { sessionStorage.removeItem("freshmerch-studio-config"); } catch (e) { /* rien à faire */ }
  if (!data) return;

  const summaryParts = [];
  if (Array.isArray(data.pieces) && data.pieces.length) {
    summaryParts.push(`Couleurs — ${data.pieces.map(p => `${p.piece} : ${p.color}`).join(", ")}`);
  }
  if (Array.isArray(data.logos) && data.logos.length) {
    summaryParts.push(`${data.logos.length} logo(s) positionné(s)`);
  }
  if (Array.isArray(data.texts) && data.texts.length) {
    summaryParts.push(`Textes : ${data.texts.map(t => `« ${t.text} »`).join(", ")}`);
  }

  const img = $("#studioHandoffImg");
  if (img && data.preview3D) {
    img.src = data.preview3D;
    img.hidden = false;
  }

  const summaryEl = $("#studioHandoffSummary");
  if (summaryEl) summaryEl.textContent = summaryParts.join(" · ") || "Configuration reçue depuis le Studio 3D.";

  banner.hidden = false;

  const typeSelect = $("#qf-type");
  if (typeSelect) {
    const sportOption = [...typeSelect.options].find(o => /sport/i.test(o.textContent));
    if (sportOption) typeSelect.value = sportOption.value;
  }

  const produit = $("#qf-produit");
  if (produit && !produit.value) produit.value = "Maillot configuré via le Studio 3D";

  const desc = $("#qf-desc");
  if (desc && !desc.value && summaryParts.length) {
    desc.value = `Configuration réalisée dans le Studio 3D :\n${summaryParts.join("\n")}`;
  }
}

/* ============================================================
   CATALOGUE DATA (textile.html / sport.html)
   ------------------------------------------------------------
   Données de démonstration (pas de tarifs). Le catalogue textile
   sera remplacé par un appel à l'API TopTex dès que les accès
   seront disponibles (le client dispose déjà des identifiants du
   portail, pas encore d'un accès API).
============================================================ */
const TEXTILE_PRODUCTS = [
  { cat: "tshirts", name: "T-shirt col rond", desc: "Coton 180g, coupe droite, idéal flocage grand format.", tag: "Exemple" },
  { cat: "tshirts", name: "Débardeur technique", desc: "Matière respirante, léger, pour l'entraînement ou l'événementiel.", tag: "Exemple" },
  { cat: "sweats", name: "Sweat col rond", desc: "Molleton 300g, logo floqué ou brodé sur poitrine.", tag: "Exemple" },
  { cat: "sweats", name: "Hoodie zippé", desc: "Capuche doublée, fermeture éclair, finition premium.", tag: "Exemple" },
  { cat: "polos", name: "Polo piqué", desc: "Coton piqué 210g, broderie logo, coloris entreprise.", tag: "Exemple" },
  { cat: "polos", name: "Veste softshell", desc: "Coupe-vent, résistante, marquage broderie ou transfert.", tag: "Exemple" },
  { cat: "bas", name: "Jogging molleton", desc: "Confort quotidien, taille élastiquée, logo brodé jambe.", tag: "Exemple" },
  { cat: "bas", name: "Casquette brodée", desc: "Structure 6 panneaux, broderie 3D, réglage arrière.", tag: "Exemple" },
];

const CATEGORY_ICONS = {
  tshirts: '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3 3 7l3 3 2-1.5V21h8V8.5L18 10l3-3-5-4-2 2h-4L8 3Z"/></svg>',
  sweats: '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3 3 7l3 3 2-1.5V21h8V8.5L18 10l3-3-5-4-2 2h-4L8 3Z"/><path d="M9 3c1 2 5 2 6 0"/></svg>',
  polos: '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3 3 7l3 3 2-1.5V21h8V8.5L18 10l3-3-5-4-2 2h-4L8 3Z"/><path d="M10.5 7.5 12 9l1.5-1.5M12 6v3.4"/></svg>',
  bas: '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 14a7.5 7.5 0 0 1 15 0"/><path d="M2.5 14h19M12 6.5v4"/></svg>',
};

function renderShopGrid(gridId, list) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = list.map(p => `
    <article class="shop-card" data-cat="${p.cat}">
      <div class="shop-card__art shop-card__art--icon art-${p.cat}">
        ${CATEGORY_ICONS[p.cat] || ""}
      </div>
      <div class="shop-card__body">
        <span class="shop-card__cat">${p.cat}</span>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="shop-card__foot"><span>${p.tag}</span><span aria-hidden="true">↗</span></div>
      </div>
    </article>
  `).join("");
}

function initCatalogues() {
  renderShopGrid("textileGrid", TEXTILE_PRODUCTS);
}

/* ============================================================
   CATALOGUE FILTERS (textile.html / sport.html)
   ------------------------------------------------------------
   Une seule source de vérité : les chips ET les tuiles visuelles
   (sport.html) pilotent le même filtre et restent synchronisées,
   aria-pressed compris.
============================================================ */
function initCatalogueFilters() {
  const chipRow = $(".chip-row");
  const grid = $("[data-filter-grid]");
  if (!chipRow || !grid) return;

  const chips = $$(".chip", chipRow);
  const tiles = $$(".sport-tile");
  const cards = $$("[data-cat]", grid);

  const applyFilter = (cat) => {
    chips.forEach(c => {
      const active = (c.dataset.cat || "") === cat;
      c.classList.toggle("is-active", active);
      c.setAttribute("aria-pressed", String(active));
    });
    tiles.forEach(t => t.setAttribute("aria-pressed", String(t.dataset.cat === cat)));
    cards.forEach(card => {
      const match = !cat || card.dataset.cat === cat;
      card.style.display = match ? "" : "none";
    });
  };

  chips.forEach(chip => {
    chip.addEventListener("click", () => applyFilter(chip.dataset.cat || ""));
  });

  tiles.forEach(tile => {
    tile.addEventListener("click", () => {
      applyFilter(tile.dataset.cat || "");
      grid.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  applyFilter($(".chip.is-active", chipRow)?.dataset.cat || "");
}

/* ============================================================
   QUOTE FORM STEPPER (devis.html)
============================================================ */
function initFormStepper() {
  const nav = $("#formProgress");
  const sections = $$(".form-section[id]");
  if (!nav || !sections.length) return;

  const steps = $$(".form-progress__step", nav);

  steps.forEach(step => {
    step.addEventListener("click", () => {
      $(`#${step.dataset.target}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const setCurrent = (id) => {
    steps.forEach(step => {
      const idx = steps.indexOf(step);
      const targetIdx = sections.findIndex(s => s.id === id);
      step.classList.toggle("is-current", step.dataset.target === id);
      step.classList.toggle("is-done", targetIdx > -1 && idx < targetIdx);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible[0]) setCurrent(visible[0].target.id);
  }, { rootMargin: "-120px 0px -60% 0px" });

  sections.forEach(section => observer.observe(section));
  setCurrent(sections[0].id);
}

/* ============================================================
   SKIP LINK (accessibilité clavier)
============================================================ */
function initSkipLink() {
  if ($(".skip-link")) return;
  const main = $("main");
  if (!main) return;
  if (!main.id) main.id = "main-content";
  const link = document.createElement("a");
  link.className = "skip-link";
  link.href = `#${main.id}`;
  link.textContent = "Aller au contenu principal";
  document.body.insertBefore(link, document.body.firstChild);
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
  initThemeToggle();
  initIntro();
  initHeader();
  initMobileMenu();
  initRevealAnimations();
  initScrollProgress();
  initMagneticButtons();
  initCardTilt();
  initHeroParallax();
  initParallax();
  initContactForm();
  initFileDrop();
  initQuoteForm();
  initStudioHandoff();
  initCatalogues();
  initCatalogueFilters();
  initFormStepper();
  initSmoothNavigation();
  initSkipLink();
  initYear();
});
