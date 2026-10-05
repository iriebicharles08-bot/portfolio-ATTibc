/* =========================================================
   LOGO ÉLASTIQUE (voir css/logo-elastique.css)
   - on attrape le logo (souris ou doigt) et on le tire : il résiste de plus en plus, comme un élastique
   - on le lâche : il revient en rebondissant, il penche selon sa vitesse
   - une onde bleue part du logo au lâcher
   - une seule fois par visite, il bouge tout seul pour montrer qu'on peut le saisir
   À charger EN DERNIER (après js/projets-effets.js).
   ========================================================= */
(function () {
  "use strict";

  var logo = document.getElementById("logo-accueil");
  if (!logo) return;
  var html = document.documentElement;
  var cercle = logo.querySelector(".accueil__cercle circle");

  // Moins d'animations ? (réglage de l'appareil ou bouton du footer) : le logo reste fixe
  function reduit() {
    return html.classList.contains("animations-reduites") ||
      (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  /* ----- Réglages ----- */
  var RAIDEUR = 190;      // force du ressort au retour (plus grand = revient plus vite)
  var FREIN = 15;         // amortissement (plus petit = rebondit plus longtemps)
  var PORTEE = 0.38;      // distance maximale de tirage, en part du plus petit côté de l'écran
  var INCLINAISON = 0.012; // inclinaison selon la vitesse
  var SOULEVE = 1.08;     // le logo grossit un peu quand on le tient

  /* ----- État ----- */
  var x = 0, y = 0, vx = 0, vy = 0;      // position et vitesse du logo (pixels, pixels/seconde)
  var ang = 0, vang = 0;                 // inclinaison et vitesse d'inclinaison (degrés)
  var ech = 1;                           // échelle
  var tenu = false, aBouge = false, id = null;
  var departX = 0, departY = 0, cibleX = 0, cibleY = 0;
  var boucle = false, dernier = 0, invite = false;

  function borne(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // Si le logo d'accueil (main.js) a une fonction de mise à jour, on la rappelle pour redessiner le cercle
  function rafraichirCercle() {
    if (typeof demanderMajLogo === "function") demanderMajLogo();
    else if (cercle) cercle.style.strokeDashoffset = "";
  }

  /* ----- Le moteur de physique : tourne seulement quand il y a du mouvement ----- */
  function pas(t) {
    var dt = Math.min((t - dernier) / 1000, 1 / 30) || 1 / 60;
    dernier = t;

    if (tenu) {
      // élastique : plus on tire, plus ça résiste (effet radial)
      var L = Math.min(innerWidth, innerHeight) * PORTEE;
      var m = Math.hypot(cibleX, cibleY);
      var k = m ? (L * (1 - Math.exp(-m / L))) / m : 0;
      var px = cibleX * k, py = cibleY * k;
      // vitesse du doigt (lissée) : elle sert au lancer au moment du lâcher
      vx += ((px - x) / dt - vx) * 0.35;
      vy += ((py - y) / dt - vy) * 0.35;
      x = px; y = py;
    } else {
      // ressort : le logo est rappelé vers sa place, en rebondissant
      vx += (-RAIDEUR * x - FREIN * vx) * dt;
      vy += (-RAIDEUR * y - FREIN * vy) * dt;
      x += vx * dt; y += vy * dt;
    }

    // inclinaison : le logo penche selon sa vitesse horizontale, puis se redresse en oscillant
    var cible = borne(vx * INCLINAISON, -16, 16);
    vang += (120 * (cible - ang) - 11 * vang) * dt;
    ang += vang * dt;

    // échelle : un peu plus grand quand on le tient
    ech += ((tenu ? SOULEVE : 1) - ech) * Math.min(1, dt * 10);

    var s = logo.style;
    s.translate = x.toFixed(2) + "px " + y.toFixed(2) + "px";
    s.rotate = ang.toFixed(2) + "deg";
    s.scale = ech.toFixed(3);

    // au repos : on arrête tout et on nettoie
    var repos = !tenu && Math.abs(x) < 0.15 && Math.abs(y) < 0.15 && Math.abs(vx) < 4 && Math.abs(vy) < 4 &&
                Math.abs(ang) < 0.05 && Math.abs(vang) < 0.5 && Math.abs(ech - 1) < 0.002;
    if (repos) {
      x = y = vx = vy = ang = vang = 0; ech = 1; boucle = false;
      s.translate = ""; s.rotate = ""; s.scale = "";
      return;
    }
    requestAnimationFrame(pas);
  }
  function demarrer() {
    if (boucle) return;
    boucle = true; dernier = performance.now();
    requestAnimationFrame(pas);
  }

  /* ----- L'onde bleue au lâcher ----- */
  function onde() {
    var o = document.createElement("span");
    o.className = "logo-onde";
    o.setAttribute("aria-hidden", "true");
    logo.appendChild(o);
    setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); }, 1000);
  }

  /* ----- Saisir, tirer, lâcher ----- */
  Array.prototype.forEach.call(logo.querySelectorAll("img"), function (img) { img.draggable = false; });

  logo.addEventListener("pointerdown", function (e) {
    if (reduit() || id !== null) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    id = e.pointerId; tenu = true; aBouge = false; invite = true;
    departX = e.clientX - x; departY = e.clientY - y;          // si le logo bouge encore, on l'attrape sans à-coup
    cibleX = x; cibleY = y;
    try { logo.setPointerCapture(e.pointerId); } catch (err) {}
    logo.classList.add("saisi");
    if (cercle) cercle.style.strokeDashoffset = 0;              // le cercle se trace entièrement
    demarrer();
  });

  logo.addEventListener("pointermove", function (e) {
    if (!tenu || e.pointerId !== id) return;
    cibleX = e.clientX - departX;
    cibleY = e.clientY - departY;
    if (!aBouge && Math.hypot(cibleX, cibleY) > 6) aBouge = true;
  });

  function relacher(e) {
    if (!tenu || (e && e.pointerId !== id)) return;
    tenu = false; id = null;
    logo.classList.remove("saisi");
    if (aBouge && Math.hypot(x, y) > 30) onde();
    if (aBouge && navigator.vibrate) { try { navigator.vibrate(8); } catch (err) {} }   // petit tic sur Android
    rafraichirCercle();
  }
  logo.addEventListener("pointerup", relacher);
  logo.addEventListener("pointercancel", relacher);

  // Un glisser ne doit pas compter comme un clic (le clic du logo active le cercle et le gyroscope)
  logo.addEventListener("click", function (e) {
    if (aBouge) { e.stopImmediatePropagation(); e.preventDefault(); aBouge = false; }
  }, true);

  /* ----- Invitation : une seule fois par visite, le logo bouge de lui-même ----- */
  var dejaInvite = false;
  try { dejaInvite = !!sessionStorage.getItem("logoInvite"); } catch (e) {}
  if (!dejaInvite && !reduit()) {
    var essais = 0;
    var attente = setInterval(function () {
      essais++;
      var intro = document.getElementById("intro");
      if (!intro || intro.classList.contains("termine") || essais > 120) {
        clearInterval(attente);
        setTimeout(function () {
          if (invite || reduit() || scrollY > 40 || tenu) return;   // la personne a déjà joué avec ou a défilé
          try { sessionStorage.setItem("logoInvite", "1"); } catch (e) {}
          vx = 520;                                                 // petite impulsion vers la droite : le ressort fait le reste
          demarrer();
        }, 1800);
      }
    }, 150);
  }
})();
