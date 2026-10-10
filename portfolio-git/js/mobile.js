/* =========================================================
   MOBILE : à charger APRÈS main.js (voir index.html).
   - header qui se cache en descendant
   - carrousel des projets (points) + tap sur le mockup
   - encre au tap sur l'accueil
   - mode "connexion lente" : animations réduites automatiquement
   ========================================================= */
(function () {
  "use strict";

  const html = document.documentElement;
  const mobile = () => window.matchMedia("(max-width: 800px)").matches;
  const reduit = () => html.classList.contains("animations-reduites") ||
                       window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- 0. Connexion lente ou économie de données : version légère ----- */
  const reseau = navigator.connection;
  if (reseau && (reseau.saveData || /(^|-)2g$/.test(reseau.effectiveType || ""))) {
    html.classList.add("animations-reduites", "mode-leger");
    const passer = document.getElementById("passer");     // on saute l'intro pour économiser du temps
    if (passer) passer.click();
  }

  /* L'encoche des téléphones : le site peut occuper tout l'écran */
  const vue = document.querySelector('meta[name="viewport"]');
  if (vue && !/viewport-fit/.test(vue.content)) vue.content += ", viewport-fit=cover";

  /* ----- 1. Scroll : le header se cache en descendant, revient en remontant ----- */
  const entete = document.getElementById("entete");
  const menu = document.getElementById("menu");
  let dernier = window.scrollY, attente = false;

  function surScroll() {
    attente = false;
    const y = window.scrollY, delta = y - dernier;
    const menuOuvert = menu && !menu.hidden;
    if (entete && mobile()) {
      if (menuOuvert || y < 80 || delta < -6) entete.classList.remove("cache");
      else if (delta > 6) entete.classList.add("cache");
    }
    dernier = y;
  }
  window.addEventListener("scroll", () => { if (!attente) { attente = true; requestAnimationFrame(surScroll); } }, { passive: true });
  surScroll();

  /* ----- 2. Carrousel des projets : points + compteur ----- */
  const liste = document.getElementById("liste-projets");
  if (liste) {
    const projets = [...liste.querySelectorAll(".projet")];
    const points = document.createElement("div");
    points.className = "projets-points";
    points.setAttribute("aria-hidden", "true");
    points.innerHTML = projets.map(() => "<i></i>").join("") + '<span style="margin-left:.6rem"></span>';
    liste.after(points);
    const pastilles = [...points.querySelectorAll("i")], compteur = points.querySelector("span");

    function majPoints() {
      if (!mobile() || !projets.length) { points.style.display = "none"; return; }
      points.style.display = "";
      const centre = liste.scrollLeft + liste.clientWidth / 2;
      let actif = 0, ecart = Infinity;
      projets.forEach((p, i) => {
        const d = Math.abs(p.offsetLeft + p.offsetWidth / 2 - centre);
        if (d < ecart) { ecart = d; actif = i; }
      });
      pastilles.forEach((el, i) => el.classList.toggle("actif", i === actif));
      compteur.textContent = String(actif + 1).padStart(2, "0") + " / " + String(projets.length).padStart(2, "0");
    }
    liste.addEventListener("scroll", () => requestAnimationFrame(majPoints), { passive: true });
    window.addEventListener("resize", majPoints);
    majPoints();

    /* ----- 3. Tap sur le mockup : il grandit, puis le rideau t'emmène dans le projet ----- */
    liste.addEventListener("click", e => {
      const zone = e.target.closest(".projet__grande");
      if (!zone || !mobile()) return;
      const lien = zone.closest(".projet").querySelector(".projet__infos .lien");
      if (!lien) return;
      e.preventDefault();
      if (reduit()) { lien.click(); return; }

      const r = zone.getBoundingClientRect();
      const clone = zone.cloneNode(true);
      clone.classList.add("mockup-ouvre");
      clone.style.cssText = "top:" + r.top + "px;left:" + r.left + "px;width:" + r.width + "px;height:" + r.height + "px";
      document.body.appendChild(clone);
      void clone.offsetWidth;
      clone.style.top = "0px"; clone.style.left = "0px"; clone.style.width = "100%"; clone.style.height = "100%";
      setTimeout(() => lien.click(), 520);               // le lien déclenche le rideau noir + la signature
    });
  }
  window.addEventListener("pageshow", e => {             // retour arrière : on enlève l'image agrandie
    if (e.persisted) document.querySelectorAll(".mockup-ouvre").forEach(el => el.remove());
  });

  /* ----- 4. Accueil : l'encre au tap ----- */
  const accueil = document.getElementById("accueil");
  if (accueil) {
    const mots = ["Web", "Design", "Identité", "Expérience", "Marketing", "Idée"];
    let n = 0;
    const aide = document.createElement("p");
    aide.className = "accueil-aide";
    aide.textContent = "Touche l'écran";
    accueil.appendChild(aide);

    accueil.addEventListener("pointerdown", e => {
      if (!mobile() || reduit() || e.pointerType === "mouse") return;
      if (e.target.closest("a, button, input, textarea")) return;
      aide.classList.add("cache");
      const r = accueil.getBoundingClientRect();
      const goutte = document.createElement("span");
      goutte.className = "encre";
      goutte.textContent = mots[n++ % mots.length];
      goutte.style.left = (e.clientX - r.left) + "px";
      goutte.style.top = (e.clientY - r.top) + "px";
      if (accueil.querySelectorAll(".encre").length > 5) accueil.querySelector(".encre").remove();
      accueil.appendChild(goutte);
      setTimeout(() => goutte.remove(), 1400);
    });
  }
})();
