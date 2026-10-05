/* =========================================================
   TRANSITION : rideau + signature à chaque clic important
   - Chargé AVANT main.js (voir index.html).
   - Ne modifie aucun autre fichier : il intercepte les clics.
   - Réglez les durées ici (en millisecondes).
   ========================================================= */
(function () {
  "use strict";

  /* L'intro doit se rejouer à CHAQUE rafraîchissement :
     on efface la mémoire "intro déjà vue" avant que main.js ne la lise. */
  try { sessionStorage.removeItem("introVue"); } catch (e) {}

  const DEBUT_ECRITURE = 350;   // la signature commence à s'écrire quand le rideau est presque fermé
  const ECRITURE       = 800;   // durée d'écriture de la signature
  const PAUSE          = 150;   // petit temps d'arrêt avant l'ouverture
  const OUVERTURE      = 700;   // durée d'ouverture du rideau (doit correspondre au CSS)

  const html = document.documentElement;

  /* Création du rideau (aucun HTML à ajouter à la main) */
  const rideau = document.createElement("div");
  rideau.className = "rideau";
  rideau.setAttribute("aria-hidden", "true");
  rideau.innerHTML = '<svg viewBox="0 0 400 150"><use href="#trace-signature" class="rideau-sig"></use></svg>';
  document.body.appendChild(rideau);
  const signature = rideau.querySelector(".rideau-sig");

  let enCours = false;        // une transition est déjà en train de jouer
  let contournement = false;  // on rejoue un clic après la fermeture du rideau

  function animationsReduites() {
    return html.classList.contains("animations-reduites") ||
           window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function remettreAZero() {
    rideau.classList.remove("actif", "ferme", "ouvre");
    enCours = false;
  }

  /* Joue la séquence : fermer -> écrire -> action -> ouvrir
     couleur : "bleu" ou "noir" ; sansOuverture : true quand on quitte la page */
  function jouer(couleur, action, sansOuverture) {
    enCours = true;
    rideau.classList.toggle("noir", couleur === "noir");
    rideau.classList.add("actif");
    signature.style.transition = "none";
    signature.style.strokeDashoffset = 1;
    void rideau.offsetWidth;                       // force le navigateur à prendre en compte l'état de départ
    rideau.classList.add("ferme");

    setTimeout(() => {                             // la signature s'écrit
      signature.style.transition = "stroke-dashoffset " + ECRITURE + "ms ease";
      signature.style.strokeDashoffset = 0;
    }, DEBUT_ECRITURE);

    setTimeout(() => {                             // l'écran est couvert : on change de contenu
      action();
      if (sansOuverture) return;                   // on quitte la page, le rideau reste fermé
      setTimeout(() => {
        rideau.classList.remove("ferme");
        rideau.classList.add("ouvre");
        setTimeout(remettreAZero, OUVERTURE + 60);
      }, PAUSE);
    }, DEBUT_ECRITURE + ECRITURE + 150);
  }

  /* Rejoue un clic normal (celui qu'on avait mis en attente) */
  function rejouerClic(element) {
    const comportement = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";            // le saut se fait pendant que l'écran est couvert
    contournement = true;
    element.click();
    contournement = false;
    html.style.scrollBehavior = comportement;
  }

  function arreter(e) { e.preventDefault(); e.stopPropagation(); }

  /* Écoute tous les clics, en amont des autres scripts (phase de capture) */
  document.addEventListener("click", e => {
    if (contournement) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (animationsReduites()) return;              // animations réduites : comportement normal, sans rideau

    /* 1. Bouton du menu (ouvrir ou fermer) */
    const bouton = e.target.closest("#bouton-menu");
    if (bouton) {
      arreter(e);
      if (!enCours) jouer("bleu", () => rejouerClic(bouton));
      return;
    }

    const lien = e.target.closest("a[href]");
    if (!lien) return;
    const href = lien.getAttribute("href");

    /* 2. Lien interne (#apropos, #projets, #contact...) */
    if (href.charAt(0) === "#") {
      if (href === "#") return;
      let cible = null;
      try { cible = document.querySelector(href); } catch (err) {}
      if (!cible) return;
      arreter(e);
      if (!enCours) jouer(lien.dataset.rideau === "noir" ? "noir" : "bleu", () => rejouerClic(lien));
      return;
    }

    /* 3. Lien vers un projet ou un autre site, ouvert dans le même onglet */
    let url;
    try { url = new URL(lien.href, location.href); } catch (err) { return; }
    if (!/^https?:$/.test(url.protocol)) return;               // mailto:, tel: ... ne sont pas concernés
    if (lien.target === "_blank" || lien.hasAttribute("download")) return;   // WhatsApp, GitHub... : nouvel onglet, pas de rideau
    arreter(e);
    if (!enCours) jouer(lien.dataset.rideau === "bleu" ? "bleu" : "noir", () => { location.href = lien.href; }, true);
  }, true);

  /* Si l'on revient avec le bouton "retour" du navigateur, le rideau ne doit pas rester fermé */
  window.addEventListener("pageshow", e => { if (e.persisted) remettreAZero(); });
})();
