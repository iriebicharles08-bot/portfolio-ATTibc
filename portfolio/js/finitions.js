/* =========================================================
   FINITIONS : projets (rideau + parallaxe), nom de l'accueil lettre par lettre,
   bande d'outils, grain. Chaque effet est isolé : si l'un plante, les autres marchent
   et le reste du site n'est pas touché.
   ========================================================= */
(function () {
  "use strict";

  var html = document.documentElement;

  // L'utilisateur veut-il moins d'animations ? (réglage système ou bouton du footer)
  function reduit() {
    return html.classList.contains("animations-reduites") ||
      (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  // Exécute une fonction au plus une fois par image (évite de ralentir le scroll)
  function limiter(fn) {
    var attente = false;
    return function () {
      if (attente) return;
      attente = true;
      requestAnimationFrame(function () { attente = false; fn(); });
    };
  }

  /* ----- 1) Le nom de l'accueil : lettre par lettre + réaction au curseur ----- */
  function nomLettres() {
    var nom = document.querySelector(".accueil__nom");
    var accueil = document.getElementById("accueil");
    if (!nom || !accueil) return;

    // On découpe le texte en lettres (construit à part, puis posé d'un coup)
    var texte = nom.textContent.trim();
    var morceau = document.createDocumentFragment();
    var n = 0;
    texte.split("").forEach(function (c) {
      if (c === " ") { morceau.appendChild(document.createTextNode(" ")); return; }
      var s = document.createElement("span");
      s.className = "lettre";
      s.setAttribute("aria-hidden", "true");   // les lecteurs d'écran lisent le titre en entier (aria-label)
      s.textContent = c;
      s.style.setProperty("--n", n++);          // numéro de la lettre : sert au décalage d'apparition
      morceau.appendChild(s);
    });
    nom.setAttribute("aria-label", texte);
    nom.textContent = "";
    nom.appendChild(morceau);
    html.classList.add("fin-nom");

    // L'apparition démarre quand l'intro est terminée (ou absente)
    var essais = 0;
    var attente = setInterval(function () {
      var intro = document.getElementById("intro");
      essais++;
      if (!intro || intro.classList.contains("termine") || essais > 120) {
        clearInterval(attente);
        nom.classList.add("nom--entre");
      }
    }, 100);

    // Souris : les lettres proches du curseur se penchent et se lèvent
    var lettres = Array.prototype.slice.call(nom.querySelectorAll(".lettre"));
    var px = -9999, py = -9999;
    var appliquer = limiter(function () {
      var rayon = Math.max(120, innerWidth * 0.12);     // distance d'effet autour du curseur
      var stop = reduit();
      lettres.forEach(function (l) {
        var r = l.getBoundingClientRect();
        var f = 0;
        if (!stop) {
          var d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
          f = Math.max(0, 1 - d / rayon);
        }
        l.style.setProperty("--f", f.toFixed(3));
      });
    });
    accueil.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;            // pas d'effet au doigt
      px = e.clientX; py = e.clientY;
      appliquer();
    });
    accueil.addEventListener("pointerleave", function () { px = py = -9999; appliquer(); });
  }

  /* ----- 2) Projets : image dévoilée en rideau + parallaxe ----- */
  function projets() {
    var blocs = document.querySelectorAll(".projet__grande, .projet__petite");
    if (!blocs.length) return;

    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("revele"); observateur.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    Array.prototype.forEach.call(blocs, function (b) { observateur.observe(b); });
    html.classList.add("fin-projets");

    var images = Array.prototype.slice.call(document.querySelectorAll(".projet .visuel img"));
    var petites = Array.prototype.slice.call(document.querySelectorAll(".projet__petite"));

    var parallaxe = limiter(function () {
      var vh = innerHeight, stop = reduit();

      // Les petites images avancent un peu plus vite que la page (sur grand écran seulement)
      petites.forEach(function (p) {
        if (stop || innerWidth < 800) { p.style.translate = ""; return; }
        var r = p.parentNode.getBoundingClientRect();    // on mesure l'article, qui ne bouge pas
        var d = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)));
        p.style.translate = "0 " + (-d * 28).toFixed(1) + "px";   // 28 = amplitude en pixels
      });

      // Les images glissent à l'intérieur de leur cadre
      images.forEach(function (img) {
        if (!img.isConnected) return;                    // image absente (retirée par main.js)
        if (stop) { img.style.translate = ""; return; }
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return; // hors écran : rien à faire
        var d = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)));
        img.style.translate = "0 " + (-d * r.height * 0.07).toFixed(1) + "px";   // 0.07 = force
      });
    });
    addEventListener("scroll", parallaxe, { passive: true });
    addEventListener("resize", parallaxe);
    parallaxe();
  }

  /* ----- 3) Bande d'outils : on duplique la liste pour une boucle sans coupure ----- */
  function outils() {
    var piste = document.querySelector(".outils__piste");
    var liste = piste && piste.querySelector("ul");
    if (!liste) return;
    var copie = liste.cloneNode(true);
    copie.setAttribute("aria-hidden", "true");           // la copie n'est pas lue deux fois
    piste.appendChild(copie);
    html.classList.add("fin-outils");
  }

  /* ----- 4) Grain ----- */
  function grain() {
    var g = document.createElement("div");
    g.className = "grain";
    g.setAttribute("aria-hidden", "true");
    document.body.appendChild(g);
  }

  // Chaque effet est protégé : une erreur dans l'un ne bloque pas les autres
  [grain, outils, projets, nomLettres].forEach(function (effet) {
    try { if ("IntersectionObserver" in window || effet === grain || effet === outils) effet(); }
    catch (e) { if (window.console) console.warn("finitions.js :", effet.name, e); }
  });
})();
