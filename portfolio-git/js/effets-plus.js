/* =========================================================
   EFFETS PLUS : compteurs, titres révélés, (le soulignement est en CSS)
   À charger TOUT À LA FIN d'index.html (après mobile.js).
   Fonction fermée : aucun conflit avec les autres scripts.
   ========================================================= */
(function () {
  "use strict";

  var html = document.documentElement;

  // Moins d'animations ? (réglage du téléphone ou bouton du footer)
  function reduit() {
    return html.classList.contains("animations-reduites") ||
      (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  var okObservateur = "IntersectionObserver" in window;

  /* ----- 1) COMPTEURS ----- */

  // Crée la bande de chiffres au-dessus de la liste des projets (valeurs lues dans data.js)
  function creerBande() {
    var liste = document.getElementById("liste-projets");
    if (!liste || document.querySelector(".ee-chiffres")) return;
    var nbProjets = (typeof projects !== "undefined" && projects.length) ? projects.length : 0;
    var nbCreations = (typeof creations !== "undefined" && creations.length) ? creations.length : 0;
    var elements = [];
    if (nbProjets)   elements.push([nbProjets, "Projets en ligne"]);
    if (nbCreations) elements.push([nbCreations, "Créations visuelles"]);
    if (!elements.length) return;

    var bande = document.createElement("div");
    bande.className = "ee-chiffres";
    bande.innerHTML = elements.map(function (e) {
      return '<div class="ee-chiffre"><span class="ee-chiffre__nombre" data-compteur="' + e[0] + '">' + e[0] + '</span>' +
             '<span class="ee-chiffre__texte">' + e[1] + '</span></div>';
    }).join("");
    liste.parentNode.insertBefore(bande, liste);
  }

  // Fait monter un nombre de 0 jusqu'à sa valeur
  function compter(el) {
    var cible = parseInt(el.getAttribute("data-compteur"), 10);
    if (isNaN(cible)) return;
    if (reduit()) { el.textContent = cible; return; }
    var duree = 1400, debut = null;                                       // 1400 = durée en millisecondes
    function pas(t) {
      if (debut === null) debut = t;
      var p = Math.min((t - debut) / duree, 1);
      var v = 1 - Math.pow(1 - p, 3);                                     // démarre vite, finit doucement
      el.textContent = Math.round(cible * v);
      if (p < 1) requestAnimationFrame(pas);
    }
    el.textContent = "0";
    requestAnimationFrame(pas);
  }

  function lancerCompteurs() {
    creerBande();
    var nombres = document.querySelectorAll("[data-compteur]");           // marche aussi pour tes propres chiffres
    if (!nombres.length) return;
    if (!okObservateur) return;                                           // sans observateur : les chiffres restent affichés tels quels
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { compter(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(nombres, function (n) { obs.observe(n); });
  }

  /* ----- 2) TITRES : mot par mot ----- */
  function lancerTitres() {
    if (!okObservateur || reduit()) return;                               // rien n'est caché si l'effet ne peut pas se lancer
    var titres = Array.prototype.filter.call(document.querySelectorAll("main h2"), function (h) {
      // On ne touche qu'aux titres faits de texte simple (pas d'image, ni de balise à l'intérieur)
      return h.children.length === 0 && h.textContent.trim().length > 0 && !h.closest("#menu, #intro");
    });
    if (!titres.length) return;

    titres.forEach(function (h) {
      var texte = h.textContent.trim().replace(/\s+/g, " ");
      h.setAttribute("aria-label", texte);                                // les lecteurs d'écran lisent le titre entier
      h.innerHTML = texte.split(" ").map(function (mot, i) {
        return '<span class="ee-mot" aria-hidden="true"><span class="ee-mot__in" style="--k:' + i + '">' + mot + '</span></span>';
      }).join(" ");
      h.classList.add("ee-titre");
    });
    html.classList.add("ee-actif");                                       // à partir d'ici, les mots sont cachés puis révélés

    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("ee-visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    titres.forEach(function (h) { obs.observe(h); });
  }

  /* ----- Démarrage ----- */
  try { lancerCompteurs(); } catch (e) { /* un effet qui échoue ne casse jamais le site */ }
  try { lancerTitres(); } catch (e) { html.classList.remove("ee-actif"); }
})();
