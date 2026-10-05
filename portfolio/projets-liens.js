/* =========================================================
   PROJETS : rend les images cliquables vers le vrai projet.
   Le lien vient de js/data.js (champ "link"). Pas de vrai lien ("#" ou vide) = rien de cliquable.
   À charger APRÈS js/main.js (qui construit la liste des projets).
   ========================================================= */
(function () {
  "use strict";

  // L'utilisateur veut-il moins d'animations ? (réglage de l'appareil ou bouton du footer)
  function reduit() {
    return document.documentElement.classList.contains("animations-reduites") ||
      (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  /* ----- Effet 3D : les images s'inclinent vers la souris, avec un reflet ----- */
  var cartes = document.querySelectorAll("#liste-projets .projet__grande, #liste-projets .projet__petite");
  var sourisFine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;

  var balayage = ("IntersectionObserver" in window) ? new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("balaye"); balayage.unobserve(e.target); }   // le trait de lumière passe une fois
    });
  }, { threshold: 0.3 }) : null;

  Array.prototype.forEach.call(cartes, function (carte) {
    carte.classList.add("carte-3d");
    if (balayage) balayage.observe(carte);
    if (!sourisFine) return;                            // pas d'inclinaison au doigt

    carte.addEventListener("pointermove", function (e) {
      if (reduit()) return;
      var r = carte.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;           // 0 à 1, de gauche à droite
      var y = (e.clientY - r.top) / r.height;           // 0 à 1, de haut en bas
      carte.style.setProperty("--rx", ((0.5 - y) * 10).toFixed(2) + "deg");   // 10 = force de l'inclinaison verticale
      carte.style.setProperty("--ry", ((x - 0.5) * 12).toFixed(2) + "deg");   // 12 = force de l'inclinaison horizontale
      carte.style.setProperty("--lx", (x * 100).toFixed(1) + "%");
      carte.style.setProperty("--ly", (y * 100).toFixed(1) + "%");
      carte.style.setProperty("--lo", "1");
    });
    carte.addEventListener("pointerleave", function () {
      carte.style.setProperty("--rx", "0deg");
      carte.style.setProperty("--ry", "0deg");
      carte.style.setProperty("--lo", "0");
    });
  });

  /* ----- Projets : images cliquables ----- */
  var projets = document.querySelectorAll("#liste-projets .projet");

  Array.prototype.forEach.call(projets, function (projet) {
    var bouton = projet.querySelector("a.lien");
    if (!bouton) return;

    var href = (bouton.getAttribute("href") || "").trim();
    if (href === "" || href === "#") return;           // pas encore de lien : on ne fait rien

    // Lien externe (http...) : s'ouvre dans un nouvel onglet
    var externe = /^https?:\/\//i.test(href);
    if (externe) {
      bouton.target = "_blank";
      bouton.rel = "noopener noreferrer";
    }

    // Une zone cliquable sur chaque image
    ["grande", "petite"].forEach(function (type) {
      var cadre = projet.querySelector(".projet__" + type);
      if (!cadre) return;
      var a = document.createElement("a");
      a.className = "projet__cadre-lien projet__cadre-lien--" + type;
      a.href = href;
      if (externe) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
      a.setAttribute("aria-hidden", "true");           // le clavier et les lecteurs d'écran utilisent déjà le bouton
      a.tabIndex = -1;
      cadre.appendChild(a);
    });
  });
})();