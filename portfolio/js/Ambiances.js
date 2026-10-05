/* =========================================================
   AMBIANCES + SCÈNE "À PROPOS"
   - le fond de la page selon la section
   - le texte de "À propos" qui se révèle mot après mot en défilant
   Ce fichier REMPLACE entièrement js/ambiances.js
   ========================================================= */

// Indique au CSS que le JavaScript fonctionne
document.documentElement.classList.add("js-pret");

/* ----- Quelle section utilise quelle ambiance ? (ids des sections) ----- */
const ambiances = {
  "accueil": "blanc",
  "projets": "ivoire",
  "services": "ivoire",
  "creations": "ivoire",
  "savoir-faire": "ivoire",
  "contact": "ivoire"
};
const observateurAmbiance = new IntersectionObserver(entrees => {
  entrees.forEach(e => { if (e.isIntersecting) document.body.dataset.ambiance = ambiances[e.target.id]; });
}, { rootMargin: "-50% 0px -50% 0px" });
Object.keys(ambiances).forEach(id => {
  const section = document.getElementById(id);
  if (section) observateurAmbiance.observe(section);
});

/* =========================================================
   SCÈNE À PROPOS
   ========================================================= */
const scene = document.getElementById("scene-apropos");
const sectionApropos = document.getElementById("apropos");

if (scene && sectionApropos) {

  /* 1. On découpe le paragraphe en mots. Les mots dans un <span class="surligne"> sont des mots clés (en gras). */
  const paragraphe = scene.querySelector(".apropos__paragraphe");
  const motsRevelation = [];
  function decouper(noeud, motCle) {
    [...noeud.childNodes].forEach(n => {
      if (n.nodeType === 3) {                                    // du texte simple
        const morceaux = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(morceau => {
          if (!morceau.trim()) { morceaux.appendChild(document.createTextNode(morceau)); return; }
          const mot = document.createElement("span");
          mot.className = "mot-rev" + (motCle ? " cle" : "");
          mot.textContent = morceau;
          morceaux.appendChild(mot);
          motsRevelation.push(mot);
        });
        n.replaceWith(morceaux);
      } else if (n.nodeType === 1) {                             // une balise (ex : <span class="surligne">)
        decouper(n, motCle || n.classList.contains("surligne"));
      }
    });
  }
  decouper(paragraphe, false);

  /* 2. Selon l'avancement du défilement, on révèle de plus en plus de mots */
  const sansAnim = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function reveler() {
    const haut = sectionApropos.getBoundingClientRect().top;
    const longueur = sectionApropos.offsetHeight - innerHeight;
    const avancement = Math.min(Math.max(-haut / longueur, 0), 1);          // 0 → 1 pendant la scène
    const part = sansAnim ? 1 : Math.min(Math.max((avancement - 0.08) / 0.75, 0), 1);
    const nombre = Math.round(part * motsRevelation.length);
    motsRevelation.forEach((m, i) => m.classList.toggle("revele", i < nombre));
  }
  let enAttenteReveler = false;
  addEventListener("scroll", () => {
    if (!enAttenteReveler) { enAttenteReveler = true; requestAnimationFrame(() => { enAttenteReveler = false; reveler(); }); }
  }, { passive: true });
  reveler();

  /* 3. Étapes (utilisées seulement sur mobile : la photo seule d'abord, puis le texte) */
  const observateurEtapes = new IntersectionObserver(entrees => {
    entrees.forEach(e => { if (e.isIntersecting) scene.dataset.etape = e.target.dataset.etape; });
  }, { rootMargin: "-50% 0px -50% 0px" });
  sectionApropos.querySelectorAll(".apropos__etapes i").forEach(i => observateurEtapes.observe(i));

  /* 4. Arrivée : le texte et la photo se rejoignent, une seule fois */
  new IntersectionObserver((entrees, obs) => {
    if (entrees[0].isIntersecting) { scene.classList.add("entree"); obs.disconnect(); }
  }, { threshold: 0.25 }).observe(scene);
}

/* =========================================================
   FOOTER
   ========================================================= */

/* ----- Coordonnées affichées (prises dans js/config.js) ----- */
document.querySelectorAll("[data-texte-email]").forEach(a => { a.textContent = CONFIG.email; });
document.querySelectorAll("[data-tel]").forEach(a => {
  a.textContent = "+" + CONFIG.whatsapp;
  a.href = "tel:+" + CONFIG.whatsapp;
});

/* ----- Les grands noms (accueil et footer) occupent toute la largeur de l'écran ----- */
const nomsGeants = [...document.querySelectorAll(".pied__nom b, .accueil__nom")];
function ajusterNoms() {
  nomsGeants.forEach(nom => {
    const parent = nom.parentElement;
    const style = getComputedStyle(parent);
    const largeurDisponible = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    nom.style.fontSize = "100px";                                  // on mesure à une taille connue
    const largeurMesuree = nom.getBoundingClientRect().width;
    nom.style.fontSize = (100 * largeurDisponible / largeurMesuree) + "px";
  });
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajusterNoms);
addEventListener("load", ajusterNoms);
addEventListener("resize", ajusterNoms);
ajusterNoms();

/* ----- La signature et le menu du haut changent de couleur selon le fond derrière eux -----
   Une zone au fond noir porte l'attribut data-fond="sombre" dans index.html. */
let enAttenteCouleurHaut = false;
function adapterCouleurHaut() {
  enAttenteCouleurHaut = false;
  const dessous = document.elementFromPoint(innerWidth * 0.25, 20);   // un point du haut de l'écran, à côté de la signature
  const zone = dessous && dessous.closest("[data-fond]");
  document.body.dataset.entete = zone ? zone.dataset.fond : "clair";
}
addEventListener("scroll", () => {
  if (!enAttenteCouleurHaut) { enAttenteCouleurHaut = true; requestAnimationFrame(adapterCouleurHaut); }
}, { passive: true });
adapterCouleurHaut();

/* ----- "Parlons-en" : le message part sur WhatsApp ou par e-mail ----- */
const formPied = document.getElementById("form-pied");
if (formPied) {
  const champ = formPied.querySelector("input");
  const erreur = formPied.querySelector(".pied__erreur");

  function envoyerMessage(canal) {
    const texte = champ.value.trim();
    if (!texte) {
      erreur.textContent = "Écrivez quelques mots sur votre projet avant d'envoyer.";
      champ.focus();
      return;
    }
    erreur.textContent = "";
    const message = "Bonjour Charles, " + texte;
    if (canal === "email") {
      location.href = "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("Prise de contact") + "&body=" + encodeURIComponent(message);
    } else {
      window.open("https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(message), "_blank", "noopener");
    }
  }

  formPied.querySelectorAll("[data-canal]").forEach(b => b.addEventListener("click", () => envoyerMessage(b.dataset.canal)));
  formPied.addEventListener("submit", e => { e.preventDefault(); envoyerMessage("whatsapp"); });   // touche Entrée = WhatsApp
}