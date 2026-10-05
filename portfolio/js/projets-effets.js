/* =========================================================
   PROJETS : effets au survol et au défilement (voir css/projets-effets.css).
   - souris : inclinaison 3D, reflet, ombre qui bouge
   - téléphone : léger basculement selon la position de la carte à l'écran
   - le texte de chaque projet monte quand il arrive
   À charger APRÈS js/main.js (qui construit la liste des projets), en dernier.
   ========================================================= */
(function () {
  "use strict";

  var html = document.documentElement;
  var cartes = document.querySelectorAll("#liste-projets .projet__grande, #liste-projets .projet__petite");
  if (!cartes.length) return;

  function reduit() {
    return html.classList.contains("animations-reduites") ||
      (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  var souris = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ----- 1) Inclinaison, reflet et ombre (souris) ----- */
  Array.prototype.forEach.call(cartes, function (carte) {
    carte.classList.add("pe-carte");
    if (!souris) return;                                   // pas de curseur : on passe au basculement au défilement

    carte.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse" || reduit()) return;
      var r = carte.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;              // 0 à 1, de gauche à droite
      var y = (e.clientY - r.top) / r.height;              // 0 à 1, de haut en bas
      var s = carte.style;
      s.setProperty("--pe-rx", ((0.5 - y) * 10).toFixed(2) + "deg");     // 10 = force de l'inclinaison verticale
      s.setProperty("--pe-ry", ((x - 0.5) * 12).toFixed(2) + "deg");     // 12 = force de l'inclinaison horizontale
      s.setProperty("--pe-lx", (x * 100).toFixed(1) + "%");
      s.setProperty("--pe-ly", (y * 100).toFixed(1) + "%");
      s.setProperty("--pe-lo", "1");
      s.setProperty("--pe-sx", ((0.5 - x) * 28).toFixed(1) + "px");      // l'ombre part à l'opposé de l'inclinaison
      s.setProperty("--pe-sy", ((0.5 - y) * 28).toFixed(1) + "px");
    });
    carte.addEventListener("pointerleave", function () {
      var s = carte.style;
      s.setProperty("--pe-rx", "0deg"); s.setProperty("--pe-ry", "0deg");
      s.setProperty("--pe-lo", "0");
      s.setProperty("--pe-sx", "0px"); s.setProperty("--pe-sy", "0px");
    });
  });

  /* ----- 2) Téléphone : la carte bascule légèrement selon sa place à l'écran ----- */
  if (!souris) {
    var attente = false;
    var basculer = function () {
      attente = false;
      var vh = innerHeight, stop = reduit();
      Array.prototype.forEach.call(cartes, function (c) {
        if (stop) { c.style.setProperty("--pe-rx", "0deg"); return; }
        var r = c.getBoundingClientRect();
        if (r.bottom < -50 || r.top > vh + 50) return;
        var d = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)));   // -1 haut, 0 centre, 1 bas
        c.style.setProperty("--pe-rx", (d * 5).toFixed(2) + "deg");      // 5 = basculement maximal en degrés
      });
    };
    addEventListener("scroll", function () { if (!attente) { attente = true; requestAnimationFrame(basculer); } }, { passive: true });
    basculer();
  }

  /* ----- 3) Le texte de chaque projet monte quand il arrive à l'écran ----- */
  var infos = document.querySelectorAll("#liste-projets .projet__infos");
  if ("IntersectionObserver" in window && infos.length) {
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("pe-visible"); observateur.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    Array.prototype.forEach.call(infos, function (bloc) {
      Array.prototype.forEach.call(bloc.children, function (enfant, i) { enfant.style.setProperty("--i", i); });   // décalage entre les lignes
      observateur.observe(bloc);
    });
    html.classList.add("pe-actif");                       // le texte n'est caché que si l'effet peut le révéler
  }
})();
