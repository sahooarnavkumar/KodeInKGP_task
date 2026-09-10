/* ECLIPSE '26 — app logic
   No framework, no build step. Everything below is plain DOM + localStorage. */

(() => {
  "use strict";

  const STORAGE_KEY = "eclipse26_passes";
  const THEME_KEY = "eclipse26_theme";
  const TOTAL_STEPS = 6;

  /* ---------------------------------------------------------
     State
     --------------------------------------------------------- */
  const state = {
    step: 1,
    user: { name: "", roll: "", photo: "" },
    passId: null,
    artistIds: new Set(),
    food: {},   // id -> qty
    games: new Set(),
  };

  let lastGeneratedTicket = null;

  /* ---------------------------------------------------------
     Small helpers
     --------------------------------------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const money = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.hidden = true; }, 2600);
  }

  function uniqueTicketId() {
    const rand = Math.floor(Math.random() * 900000 + 100000);
    return `ECL26-${rand}`;
  }

  function qrUrl(data, size = 160) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=6&data=${encodeURIComponent(data)}`;
  }

  /* ---------------------------------------------------------
     Theme
     --------------------------------------------------------- */
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const theme = saved || "dark";
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeIcon(theme);
  }
  function updateThemeIcon(theme) {
    $("#theme-toggle .theme-icon").textContent = theme === "dark" ? "☾" : "☀";
  }
  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
    updateThemeIcon(next);
  }

  /* ---------------------------------------------------------
     Tab navigation
     --------------------------------------------------------- */
  function goToTab(name) {
    $$(".tab-btn").forEach((b) => {
      const active = b.dataset.tab === name;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", String(active));
    });
    $$(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === `panel-${name}`));
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (name === "passes") renderPassesList();
  }

  function initTabs() {
    $$(".tab-btn").forEach((b) => b.addEventListener("click", () => goToTab(b.dataset.tab)));
    $$("[data-goto]").forEach((b) => b.addEventListener("click", () => goToTab(b.dataset.goto)));
  }

  /* ---------------------------------------------------------
     Render: static content (pass / artist / food / games)
     --------------------------------------------------------- */
  function renderPassGrid() {
    const grid = $("#pass-grid");
    grid.innerHTML = PASSES.map((p) => `
      <button type="button" class="pass-card" data-id="${p.id}" aria-pressed="false">
        <div class="pass-card-top">
          <span class="pass-card-name">${p.name}</span>
        </div>
        <div class="pass-card-tag">${p.tagline}</div>
        <div class="pass-card-price">${money(p.price)} <small>/ pass</small></div>
        <ul class="pass-card-perks">${p.perks.map((perk) => `<li>${perk}</li>`).join("")}</ul>
      </button>
    `).join("");

    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".pass-card");
      if (!card) return;
      state.passId = card.dataset.id;
      $$(".pass-card", grid).forEach((c) => {
        const sel = c === card;
        c.classList.toggle("selected", sel);
        c.setAttribute("aria-pressed", String(sel));
      });
      clearError("pass");
    });
  }

  function artistCardHTML(a) {
    const selected = state.artistIds.has(a.id);
    return `
      <button type="button" class="artist-card ${selected ? "selected" : ""}" data-id="${a.id}" aria-pressed="${selected}">
        <span class="artist-check">${selected ? "✓" : ""}</span>
        <img src="${a.img}" alt="" loading="lazy" />
        <div class="artist-card-body">
          <div class="artist-card-name">${a.name}</div>
          <div class="artist-card-genre">${a.genre}</div>
          <div class="artist-card-day">${a.day}</div>
          <p class="artist-card-blurb">${a.blurb}</p>
        </div>
      </button>
    `;
  }

  function renderArtistGrid(filter = "") {
    const grid = $("#artist-grid");
    const q = filter.trim().toLowerCase();
    const list = ARTISTS.filter((a) =>
      !q || a.name.toLowerCase().includes(q) || a.genre.toLowerCase().includes(q)
    );
    grid.innerHTML = list.length
      ? list.map(artistCardHTML).join("")
      : `<p class="no-results">No artists match "${filter}".</p>`;
  }

  function foodRowHTML(f) {
    const qty = state.food[f.id] || 0;
    return `
      <div class="list-row" data-id="${f.id}">
        <div class="list-row-icon">${f.icon}</div>
        <div class="list-row-info">
          <div class="list-row-name">${f.name}</div>
          <div class="list-row-meta">${f.tag}</div>
          <div class="list-row-price">${money(f.price)}</div>
        </div>
        <div class="qty-control">
          <button type="button" class="qty-btn" data-action="dec">−</button>
          <span class="qty-value">${qty}</span>
          <button type="button" class="qty-btn" data-action="inc">+</button>
        </div>
      </div>
    `;
  }

  function renderFoodList(filter = "") {
    const list = $("#food-list");
    const q = filter.trim().toLowerCase();
    const items = FOOD.filter((f) => !q || f.name.toLowerCase().includes(q));
    list.innerHTML = items.length
      ? items.map(foodRowHTML).join("")
      : `<p class="no-results">No food items match "${filter}".</p>`;
  }

  function gameRowHTML(g) {
    const on = state.games.has(g.id);
    return `
      <div class="list-row" data-id="${g.id}">
        <div class="list-row-icon">${g.icon}</div>
        <div class="list-row-info">
          <div class="list-row-name">${g.name}</div>
          <div class="list-row-meta">${g.desc}</div>
          <div class="list-row-price">${money(g.price)}</div>
        </div>
        <button type="button" class="toggle-btn ${on ? "on" : ""}" data-action="toggle">${on ? "Added" : "Add"}</button>
      </div>
    `;
  }

  function renderGamesList(filter = "") {
    const list = $("#games-list");
    const q = filter.trim().toLowerCase();
    const items = GAMES.filter((g) => !q || g.name.toLowerCase().includes(q));
    list.innerHTML = items.length
      ? items.map(gameRowHTML).join("")
      : `<p class="no-results">No activities match "${filter}".</p>`;
  }

  /* ---------------------------------------------------------
     Interaction wiring for selection steps
     --------------------------------------------------------- */
  function initArtistInteractions() {
    $("#artist-grid").addEventListener("click", (e) => {
      const card = e.target.closest(".artist-card");
      if (!card) return;
      const id = card.dataset.id;
      if (state.artistIds.has(id)) state.artistIds.delete(id);
      else state.artistIds.add(id);
      renderArtistGrid($("#search-artists").value);
      clearError("artists");
    });
    $("#search-artists").addEventListener("input", (e) => renderArtistGrid(e.target.value));
  }

  function initFoodInteractions() {
    $("#food-list").addEventListener("click", (e) => {
      const btn = e.target.closest(".qty-btn");
      if (!btn) return;
      const row = btn.closest(".list-row");
      const id = row.dataset.id;
      const current = state.food[id] || 0;
      const next = btn.dataset.action === "inc" ? current + 1 : Math.max(0, current - 1);
      if (next === 0) delete state.food[id];
      else state.food[id] = next;
      renderFoodList($("#search-food").value);
    });
    $("#search-food").addEventListener("input", (e) => renderFoodList(e.target.value));
  }

  function initGamesInteractions() {
    $("#games-list").addEventListener("click", (e) => {
      const btn = e.target.closest(".toggle-btn");
      if (!btn) return;
      const row = btn.closest(".list-row");
      const id = row.dataset.id;
      if (state.games.has(id)) state.games.delete(id);
      else state.games.add(id);
      renderGamesList($("#search-games").value);
    });
    $("#search-games").addEventListener("input", (e) => renderGamesList(e.target.value));
  }

  /* ---------------------------------------------------------
     Step 1 — user details
     --------------------------------------------------------- */
  function initDetailsStep() {
    const nameEl = $("#in-name");
    const rollEl = $("#in-roll");
    const photoEl = $("#in-photo");

    nameEl.addEventListener("input", () => { state.user.name = nameEl.value; clearError("in-name"); });
    rollEl.addEventListener("input", () => { state.user.roll = rollEl.value; clearError("in-roll"); });
    photoEl.addEventListener("input", () => {
      state.user.photo = photoEl.value;
      clearError("in-photo");
      updatePhotoPreview(photoEl.value);
    });
  }

  function updatePhotoPreview(url) {
    const img = $("#photo-preview-img");
    const placeholder = $("#photo-preview-placeholder");
    if (!url) {
      img.hidden = true;
      placeholder.hidden = false;
      return;
    }
    img.onload = () => { img.hidden = false; placeholder.hidden = true; };
    img.onerror = () => { img.hidden = true; placeholder.hidden = false; placeholder.textContent = "Couldn't load that image"; };
    img.src = url;
  }

  /* ---------------------------------------------------------
     Validation
     --------------------------------------------------------- */
  function setError(key, msg) {
    const small = $(`.field-error[data-for="in-${key}"]`) || $(`.field-error[data-for="${key}"]`);
    if (small) small.textContent = msg;
  }
  function clearError(key) { setError(key, ""); }

  function validateStep(step) {
    if (step === 1) {
      let ok = true;
      if (!state.user.name.trim()) { setError("name", "Enter your full name."); ok = false; }
      if (!state.user.roll.trim()) { setError("roll", "Enter your roll number."); ok = false; }
      if (!state.user.photo.trim()) {
        setError("photo", "Paste an image URL — it's printed on your ticket.");
        ok = false;
      }
      return ok;
    }
    if (step === 2) {
      if (!state.passId) { toast("Pick a pass tier to continue."); return false; }
      return true;
    }
    if (step === 3) {
      if (state.artistIds.size === 0) { toast("Select at least one artist."); return false; }
      return true;
    }
    return true; // steps 4 and 5 are optional
  }

  /* ---------------------------------------------------------
     Step navigation
     --------------------------------------------------------- */
  function updateStepper() {
    const pct = (state.step / TOTAL_STEPS) * 100;
    $("#stepper-fill").style.width = `${pct}%`;
    $$(".stepper-labels li").forEach((li) => {
      const s = Number(li.dataset.step);
      li.classList.toggle("active", s === state.step);
      li.classList.toggle("done", s < state.step);
    });
  }

  function showStep(step) {
    state.step = step;
    $$(".step").forEach((el) => el.classList.toggle("active", Number(el.dataset.step) === step));
    updateStepper();

    $("#prev-btn").disabled = step === 1;
    $("#next-btn").hidden = step === TOTAL_STEPS;
    $("#generate-btn").hidden = step !== TOTAL_STEPS;

    if (step === 6) renderReview();
    window.scrollTo({ top: $("#stepper").offsetTop - 20, behavior: "smooth" });
  }

  function initStepNav() {
    $("#next-btn").addEventListener("click", () => {
      if (!validateStep(state.step)) return;
      if (state.step < TOTAL_STEPS) showStep(state.step + 1);
    });
    $("#prev-btn").addEventListener("click", () => {
      if (state.step > 1) showStep(state.step - 1);
    });
    $("#generate-btn").addEventListener("click", generateTicket);
    $("#ticket-form").addEventListener("submit", (e) => e.preventDefault());
  }

  /* ---------------------------------------------------------
     Pricing
     --------------------------------------------------------- */
  function computeBreakdown() {
    const pass = PASSES.find((p) => p.id === state.passId);
    const passPrice = pass ? pass.price : 0;

    const foodItems = Object.entries(state.food)
      .map(([id, qty]) => ({ item: FOOD.find((f) => f.id === id), qty }))
      .filter((x) => x.item);
    const foodTotal = foodItems.reduce((sum, x) => sum + x.item.price * x.qty, 0);

    const gameItems = Array.from(state.games).map((id) => GAMES.find((g) => g.id === id)).filter(Boolean);
    const gamesTotal = gameItems.reduce((sum, g) => sum + g.price, 0);

    const total = passPrice + foodTotal + gamesTotal;

    return { pass, passPrice, foodItems, foodTotal, gameItems, gamesTotal, total };
  }

  /* ---------------------------------------------------------
     Review step
     --------------------------------------------------------- */
  function renderReview() {
    const b = computeBreakdown();

    $("#review-user").innerHTML = `
      <strong>${escapeHTML(state.user.name)}</strong>
      <span>${escapeHTML(state.user.roll)}</span>
    `;

    $("#review-pass").innerHTML = b.pass
      ? `<strong>${b.pass.name}</strong><br><span class="review-empty">${money(b.pass.price)}</span>`
      : `<span class="review-empty">No pass selected</span>`;

    const artistList = Array.from(state.artistIds).map((id) => ARTISTS.find((a) => a.id === id)).filter(Boolean);
    $("#review-artist-count").textContent = artistList.length;
    $("#review-artists").innerHTML = artistList.length
      ? artistList.map((a) => `<li><span>${a.name}</span><span>${a.day}</span></li>`).join("")
      : `<li class="review-empty">None selected</li>`;

    $("#review-food").innerHTML = b.foodItems.length
      ? b.foodItems.map((x) => `<li><span>${x.item.name} × ${x.qty}</span><span>${money(x.item.price * x.qty)}</span></li>`).join("")
      : `<li class="review-empty">None selected</li>`;

    $("#review-games").innerHTML = b.gameItems.length
      ? b.gameItems.map((g) => `<li><span>${g.name}</span><span>${money(g.price)}</span></li>`).join("")
      : `<li class="review-empty">None selected</li>`;

    $("#price-breakdown").innerHTML = `
      <div><dt>${b.pass ? b.pass.name + " pass" : "Pass"}</dt><dd>${money(b.passPrice)}</dd></div>
      <div><dt>Food (${b.foodItems.reduce((n, x) => n + x.qty, 0)} items)</dt><dd>${money(b.foodTotal)}</dd></div>
      <div><dt>Games & activities (${b.gameItems.length})</dt><dd>${money(b.gamesTotal)}</dd></div>
    `;
    $("#price-total-value").textContent = money(b.total);
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------------------------------------------------
     Ticket generation
     --------------------------------------------------------- */
  function buildTicketObject() {
    const b = computeBreakdown();
    return {
      id: uniqueTicketId(),
      issuedAt: new Date().toISOString(),
      name: state.user.name.trim(),
      roll: state.user.roll.trim(),
      photo: state.user.photo.trim(),
      pass: b.pass ? { id: b.pass.id, name: b.pass.name, price: b.pass.price } : null,
      artists: Array.from(state.artistIds).map((id) => ARTISTS.find((a) => a.id === id)).filter(Boolean).map((a) => ({ id: a.id, name: a.name, day: a.day })),
      food: b.foodItems.map((x) => ({ id: x.item.id, name: x.item.name, qty: x.qty, price: x.item.price })),
      games: b.gameItems.map((g) => ({ id: g.id, name: g.name, price: g.price })),
      total: b.total,
    };
  }

  function savePass(ticket) {
    const all = loadPasses();
    all.unshift(ticket);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    updatePassesCount();
  }

  function loadPasses() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function updatePassesCount() {
    const n = loadPasses().length;
    const pill = $("#passes-count");
    pill.hidden = n === 0;
    pill.textContent = n;
  }

  function generateTicket() {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast("Something's missing — check earlier steps.");
      return;
    }
    const ticket = buildTicketObject();
    lastGeneratedTicket = ticket;
    savePass(ticket);
    paintFinalTicket(ticket);
    $("#ticket-form").hidden = true;
    $(".step-nav").hidden = true;
    $("#ticket-result").hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast("Ticket generated and saved to My Passes.");
  }

  function detailsRowsHTML(ticket) {
    const artistNames = ticket.artists.map((a) => a.name).join(", ") || "—";
    const foodNames = ticket.food.map((f) => `${f.name} ×${f.qty}`).join(", ") || "—";
    const gameNames = ticket.games.map((g) => g.name).join(", ") || "—";
    return `
      <div class="stub-details-row"><b>Line-up</b><span>${escapeHTML(artistNames)}</span></div>
      <div class="stub-details-row"><b>Food</b><span>${escapeHTML(foodNames)}</span></div>
      <div class="stub-details-row"><b>Games</b><span>${escapeHTML(gameNames)}</span></div>
      <div class="stub-details-row"><b>Total</b><span>${money(ticket.total)}</span></div>
    `;
  }

  // Paint a ticket into a target set of element ids (used for both the
  // "just generated" view and the "view saved pass" modal).
  function paintTicketInto(ids, ticket) {
    $(ids.photo).src = ticket.photo;
    $(ids.photo).alt = `${ticket.name}'s photo`;
    $(ids.name).textContent = ticket.name;
    $(ids.roll).textContent = ticket.roll;
    $(ids.passName).textContent = ticket.pass ? `${ticket.pass.name} Pass · ${money(ticket.pass.price)}` : "No pass";
    $(ids.details).innerHTML = detailsRowsHTML(ticket);
    $(ids.qr).src = qrUrl(`ECLIPSE26-TICKET:${ticket.id}`);
    $(ids.id).textContent = `#${ticket.id}`;
  }

  /* ---------------------------------------------------------
     Download as PNG (html2canvas)
     --------------------------------------------------------- */
  async function downloadTicket(el, filename) {
    if (typeof html2canvas === "undefined") {
      toast("Download tool is still loading — try again in a second.");
      return;
    }
    try {
      const canvas = await html2canvas(el, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      toast("Couldn't generate the image — try again.");
    }
  }

  /* ---------------------------------------------------------
     My Passes tab
     --------------------------------------------------------- */
  function passSummaryHTML(t) {
    const date = new Date(t.issuedAt);
    return `
      <div class="pass-summary-card" data-id="${t.id}">
        <div class="pass-summary-top">
          <strong>${escapeHTML(t.name)}</strong>
          <span class="pass-summary-tier">${t.pass ? t.pass.name : "—"}</span>
        </div>
        <div class="pass-summary-meta">#${t.id} · ${date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
        <div class="pass-summary-price">${money(t.total)}</div>
      </div>
    `;
  }

  function renderPassesList() {
    const all = loadPasses();
    $("#passes-empty").hidden = all.length > 0;
    $("#passes-list").innerHTML = all.map(passSummaryHTML).join("");
    updatePassesCount();
  }

  function initPassesList() {
    $("#passes-list").addEventListener("click", (e) => {
      const card = e.target.closest(".pass-summary-card");
      if (!card) return;
      openModal(card.dataset.id);
    });
  }

  function openModal(ticketId) {
    const ticket = loadPasses().find((t) => t.id === ticketId);
    if (!ticket) return;
    paintTicketInto({
      photo: "#modal-photo", name: "#modal-name", roll: "#modal-roll",
      passName: "#modal-pass-name", details: "#modal-details", qr: "#modal-qr", id: "#modal-id",
    }, ticket);
    $("#ticket-modal").hidden = false;
    $("#ticket-modal").dataset.currentId = ticketId;
  }

  function closeModal() { $("#ticket-modal").hidden = true; }

  function initModal() {
    $$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

    $("#modal-download-btn").addEventListener("click", () => {
      downloadTicket($("#modal-ticket"), `${$("#ticket-modal").dataset.currentId}.png`);
    });

    $("#modal-delete-btn").addEventListener("click", () => {
      const id = $("#ticket-modal").dataset.currentId;
      const remaining = loadPasses().filter((t) => t.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
      closeModal();
      renderPassesList();
      toast("Pass deleted.");
    });
  }

  /* ---------------------------------------------------------
     Ticket result panel actions
     --------------------------------------------------------- */
  function initTicketResultActions() {
    $("#download-btn").addEventListener("click", () => {
      if (!lastGeneratedTicket) return;
      downloadTicket($("#final-ticket"), `${lastGeneratedTicket.id}.png`);
    });

    $("#new-ticket-btn").addEventListener("click", resetForm);
  }

  function resetForm() {
    state.step = 1;
    state.user = { name: "", roll: "", photo: "" };
    state.passId = null;
    state.artistIds = new Set();
    state.food = {};
    state.games = new Set();
    lastGeneratedTicket = null;

    $("#in-name").value = "";
    $("#in-roll").value = "";
    $("#in-photo").value = "";
    updatePhotoPreview("");
    $$(".pass-card").forEach((c) => { c.classList.remove("selected"); c.setAttribute("aria-pressed", "false"); });
    renderArtistGrid("");
    renderFoodList("");
    renderGamesList("");

    $("#ticket-form").hidden = false;
    $(".step-nav").hidden = false;
    $("#ticket-result").hidden = true;
    showStep(1);
  }

  /* ---------------------------------------------------------
     Fix the paintTicket helper above (final generated ticket ids)
     --------------------------------------------------------- */
  function paintFinalTicket(ticket) {
    paintTicketInto({
      photo: "#ticket-photo", name: "#ticket-name", roll: "#ticket-roll",
      passName: "#ticket-pass-name", details: "#ticket-details", qr: "#ticket-qr", id: "#ticket-id",
    }, ticket);
  }

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */
  function init() {
    initTheme();
    $("#theme-toggle").addEventListener("click", toggleTheme);

    initTabs();
    renderPassGrid();
    renderArtistGrid();
    renderFoodList();
    renderGamesList();
    initArtistInteractions();
    initFoodInteractions();
    initGamesInteractions();
    initDetailsStep();
    initStepNav();
    initPassesList();
    initModal();
    initTicketResultActions();

    updatePassesCount();
    showStep(1);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
