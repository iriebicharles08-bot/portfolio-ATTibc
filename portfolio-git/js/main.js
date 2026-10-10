/* =========================================================
   MAIN : intro, navigation, menu, fil d'encre, mots, photo, projets
   ========================================================= */

// Raccourcis pour écrire moins de code
const $  = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

// L'utilisateur veut-il moins d'animations ? (réglage système ou bouton du footer)
const animationsReduites = () =>
  document.documentElement.classList.contains("animations-reduites") ||
  matchMedia("(prefers-reduced-motion: reduce)").matches;

// Crée une zone d'image. Si le fichier n'existe pas encore, un fond coloré s'affiche.
// CORRECTION : loading="eager" + decoding="async" -> l'image se charge tout de suite,
// même dans le carrousel du téléphone (avant : "lazy" laissait des blocs vides).
function creerImage(src, alt, teinte = "") {
  return `<div class="visuel ${teinte}">Image à ajouter<img src="${src}" alt="${alt}" loading="eager" decoding="async" onerror="this.remove()"></div>`;
}

/* ----- 1. Liens de contact (remplis depuis config.js) ----- */
const liens = {
  email: "mailto:" + CONFIG.email,
  whatsapp: "https://wa.me/" + CONFIG.whatsapp,
  linkedin: CONFIG.linkedin,
  github: CONFIG.github
};
$$("[data-lien]").forEach(a => {
  a.href = liens[a.dataset.lien];
  if (a.dataset.lien !== "email") { a.target = "_blank"; a.rel = "noopener"; }
});

/* ----- 2. Projets (générés depuis js/data.js) ----- */
const teintes = ["visuel--marine", "visuel--cannelle", ""];
$("#liste-projets").innerHTML = projects.map((p, i) => `
  <article class="projet composition-${i % 3}">
    <div class="projet__grande">${creerImage(p.image, p.title + ", image principale", teintes[i % 3])}</div>
    <div class="projet__infos">
      <p class="etiquette">${String(i + 1).padStart(2, "0")} · ${p.category} · ${p.year}</p>
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      <a class="lien" href="${p.link}">Découvrir le projet</a>
    </div>
    <div class="projet__petite">${creerImage(p.secondaryImage, p.title + ", détail", teintes[(i + 1) % 3])}</div>
  </article>`).join("");

/* ----- 3. Intro : la signature se dessine, le pourcentage monte ----- */
const intro = $("#intro");
let dejaVue = false;
try { dejaVue = sessionStorage.getItem("introVue"); } catch (e) {}

function terminerIntro() {
  intro.classList.add("termine");                       // le panneau glisse vers le bas
  try { sessionStorage.setItem("introVue", "1"); } catch (e) {}
  setTimeout(() => intro.remove(), 1000);
}

if (dejaVue || animationsReduites()) {
  intro.remove();
} else {
  const debut = performance.now(), duree = 1800;        // durée du tracé en millisecondes
  (function avancer(maintenant) {
    const t = Math.min((maintenant - debut) / duree, 1);
    const progres = 1 - Math.pow(1 - t, 2.2);           // démarre vite, finit doucement
    $("#sig-intro").style.strokeDashoffset = 1 - progres;
    $("#pct").textContent = String(Math.round(progres * 100)).padStart(2, "0") + "%";
    if (t < 1) requestAnimationFrame(avancer); else setTimeout(terminerIntro, 350);
  })(debut);
  $("#passer").onclick = terminerIntro;
}

/* ----- 4. Au scroll : navigation, fil d'encre, bandes (un seul écouteur) ----- */
const entete = $("#entete"), fil = $("#fil path"), bandes = $$(".bande");
let dernierY = 0, enAttente = false;

function mettreAJourScroll() {
  enAttente = false;
  const y = scrollY, hauteur = document.body.scrollHeight - innerHeight;

  // Navigation : compacte quand on descend, normale quand on remonte
  entete.classList.toggle("compact", y > 80 && y > dernierY);
  dernierY = y;

  // Fil d'encre : se dessine selon l'avancement dans la page
  fil.style.strokeDashoffset = 1 - (hauteur > 0 ? y / hauteur : 0);

  // Bandes plein écran : chaque bande glisse de côté pendant qu'elle entre dans l'écran
  bandes.forEach(b => {
    if (animationsReduites()) { b.style.transform = ""; return; }
    const r = b.getBoundingClientRect();
    const p = Math.min(Math.max((innerHeight - r.top) / innerHeight, 0), 1);   // 0 = pas encore visible, 1 = bande en place
    b.style.transform = `translateX(${(p - 1) * 100 * b.dataset.sens}vw)`;
  });
}
addEventListener("scroll", () => {
  if (!enAttente) { enAttente = true; requestAnimationFrame(mettreAJourScroll); }
}, { passive: true });
mettreAJourScroll();

/* ----- 5. Mots-clés : gris → couleur au centre de l'écran ----- */
const observateurMots = new IntersectionObserver(
  entrees => entrees.forEach(e => e.target.classList.toggle("actif", e.isIntersecting)),
  { rootMargin: "-35% 0px -35% 0px" }
);
$$(".mot").forEach(m => observateurMots.observe(m));

/* ----- 6. Footer : la signature se réécrit quand on arrive ----- */
new IntersectionObserver((entrees, obs) => {
  if (entrees[0].isIntersecting) { $("#sig-footer").style.strokeDashoffset = 0; obs.disconnect(); }
}, { threshold: 0.5 }).observe($(".pied__nom"));

/* ----- 7. Photo : au toucher (mobile) ou à la touche Entrée ----- */
const photo = $("#photo");
photo.onclick = () => photo.classList.toggle("actif");
photo.onkeydown = e => { if (e.key === "Enter") photo.classList.toggle("actif"); };

/* ----- 8. Bouton "Parler d'un projet" : affiche WhatsApp / E-mail ----- */
$("#bouton-parler").onclick = e => {
  const ouvert = $("#choix-contact").classList.toggle("ouvert");
  e.target.setAttribute("aria-expanded", ouvert);
};

/* ----- 9. Bouton "Réduire les animations" ----- */
$("#bouton-animations").onclick = e => {
  const reduit = document.documentElement.classList.toggle("animations-reduites");
  e.target.textContent = reduit ? "Réactiver les animations" : "Réduire les animations";
  mettreAJourScroll();
};

/* =========================================================
   MENU PLEIN ÉCRAN : ouverture, fermeture, clavier, section actuelle.
   Tout est dans une fonction fermée (IIFE) : aucun conflit avec les autres scripts.
   ========================================================= */
(function () {
  "use strict";

  var bouton = document.getElementById("bouton-menu");
  var menu = document.getElementById("menu");
  var entete = document.getElementById("entete");
  if (!bouton || !menu) return;            // sécurité : si le menu n'existe pas, on ne fait rien

  var html = document.documentElement;
  var liens = Array.prototype.slice.call(menu.querySelectorAll("a"));
  var zonesBloquees = Array.prototype.slice.call(document.querySelectorAll("main, footer, .reseaux"));
  var ouvert = false;
  var minuteur = null;

  // Numérote chaque lien (sert au décalage d'apparition défini en CSS)
  Array.prototype.forEach.call(menu.querySelectorAll(".menu__liste li"), function (li, i) {
    li.style.setProperty("--i", i);
  });

  // Lit la vitesse du rideau dans le CSS (--menu-vitesse), en millisecondes
  function vitesse() {
    var v = getComputedStyle(menu).getPropertyValue("--menu-vitesse").trim();
    var n = parseFloat(v);
    if (isNaN(n)) return 700;
    return /ms$/.test(v) ? n : n * 1000;
  }

  /* ----- Ouvrir ----- */
  function ouvrir() {
    if (ouvert) return;
    ouvert = true;
    clearTimeout(minuteur);
    menu.hidden = false;
    void menu.offsetWidth;                 // force le navigateur à "voir" l'état fermé avant d'animer
    html.classList.add("menu-ouvert");     // bloque le défilement + header en blanc
    menu.classList.add("ouvert");
    bouton.setAttribute("aria-expanded", "true");
    bouton.setAttribute("aria-label", "Fermer le menu");
    zonesBloquees.forEach(function (z) { z.inert = true; });   // le reste de la page n'est plus accessible
    if (liens[0]) liens[0].focus({ preventScroll: true });     // le focus entre dans le menu
  }

  /* ----- Fermer ----- */
  function fermer(rendreFocus) {
    if (!ouvert) return;
    ouvert = false;
    menu.classList.remove("ouvert");
    html.classList.remove("menu-ouvert");
    bouton.setAttribute("aria-expanded", "false");
    bouton.setAttribute("aria-label", "Ouvrir le menu");
    zonesBloquees.forEach(function (z) { z.inert = false; });
    if (rendreFocus) bouton.focus({ preventScroll: true });   // le focus revient sur le bouton
    // on cache vraiment le menu une fois le rideau remonté
    minuteur = setTimeout(function () { menu.hidden = true; }, vitesse() + 60);
  }

  /* ----- Bouton : ouvre / ferme ----- */
  bouton.addEventListener("click", function () {
    if (ouvert) fermer(true); else ouvrir();
  });

  /* ----- Un clic sur un lien interne (#...) ferme le menu ----- */
  menu.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a") : null;
    if (a && (a.getAttribute("href") || "").charAt(0) === "#") fermer(false);
  });
  // Un clic sur un lien du header (signature, Contact) ferme aussi le menu
  if (entete) entete.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a") : null;
    if (a && ouvert) fermer(false);
  });

  /* ----- Clavier : Échap ferme, Tab reste dans le menu ----- */
  document.addEventListener("keydown", function (e) {
    if (!ouvert) return;

    if (e.key === "Escape") { fermer(true); return; }

    if (e.key === "Tab") {
      // Éléments atteignables : ceux du header + ceux du menu
      var cycle = Array.prototype.slice.call(entete ? entete.querySelectorAll("a, button") : [bouton]).concat(liens);
      var i = cycle.indexOf(document.activeElement);
      if (e.shiftKey) {
        if (i <= 0) { e.preventDefault(); cycle[cycle.length - 1].focus(); }
      } else if (i === -1) {
        e.preventDefault(); cycle[0].focus();
      } else if (i === cycle.length - 1) {
        e.preventDefault(); cycle[0].focus();
      }
    }
  });

  /* ----- Section actuelle : le lien correspondant est marqué dans le menu ----- */
  function marquer(id) {
    liens.forEach(function (l) {
      if (l.getAttribute("href") === "#" + id) l.setAttribute("aria-current", "location");
      else l.removeAttribute("aria-current");
    });
  }
  if ("IntersectionObserver" in window) {
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) { if (en.isIntersecting) marquer(en.target.id); });
    }, { rootMargin: "-45% 0px -45% 0px" });     // la section qui passe au milieu de l'écran
    var ids = ["accueil"];                        // l'accueil efface la marque
    liens.forEach(function (l) {
      var h = l.getAttribute("href") || "";
      if (h.charAt(0) === "#" && h.length > 1) ids.push(h.slice(1));
    });
    ids.forEach(function (id) {
      var s = document.getElementById(id);
      if (s) observateur.observe(s);
    });
  }
})();