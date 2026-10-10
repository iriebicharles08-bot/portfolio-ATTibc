/* =========================================================
   GALLERY : galerie de créations, filtres, lightbox et effets au défilement.
   Ce fichier REMPLACE ENTIÈREMENT l'ancien js/gallery.js.
   Il utilise $, $$ et creerImage() (définis dans js/main.js) et la liste "creations" de js/data.js.
   ========================================================= */
const galerie = $("#galerie");

// Évite qu'un guillemet dans un titre casse le HTML
const galEchapper = t => String(t).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// Moins d'animations ? (réglage de l'appareil ou bouton du footer)
const galReduit = () =>
  document.documentElement.classList.contains("animations-reduites") ||
  matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ----- 1. Affichage des créations (données dans js/data.js) ----- */
// Chaque carte a un cadre qui prend la forme de l'image (ratio) : il est grand dès le départ, même sans image.
galerie.innerHTML = creations.map((c, i) => `
  <figure class="carte-creation" data-categorie="${c.category}" data-index="${i}"
          style="--n:${i % 3}; --sens:${i % 2 ? 1 : -1}" tabindex="0" role="button"
          aria-label="Agrandir : ${galEchapper(c.title)}">
    <div class="galerie__cadre" style="aspect-ratio:${galEchapper(String(c.ratio || "4/5").replace("/", " / "))}">${creerImage(c.image, galEchapper(c.title))}</div>
    <figcaption>${galEchapper(c.title)}</figcaption>
  </figure>`).join("");

/* ----- 2. Effets : apparition (la carte monte) + inclinaison selon sa place à l'écran ----- */
const galObservateur = ("IntersectionObserver" in window) ? new IntersectionObserver(entrees => {
  entrees.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("revele-creation"); galObservateur.unobserve(e.target); }
  });
}, { threshold: 0.12 }) : null;

let galAttente = false;
function galMajScroll() {
  if (galAttente) return;
  galAttente = true;
  requestAnimationFrame(() => {
    galAttente = false;
    const vh = innerHeight, stop = galReduit();
    $$("#galerie figure").forEach(f => {
      if (stop) { f.style.rotate = ""; return; }
      if (f.hidden) return;                                   // carte masquée par un filtre
      const r = f.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;          // hors écran
      // d : -1 quand la carte est en haut de l'écran, 0 au centre, 1 en bas
      const d = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)));
      const sens = parseFloat(f.style.getPropertyValue("--sens")) || 1;
      f.style.rotate = (d * 3 * sens).toFixed(2) + "deg";      // 3 = inclinaison maximale en degrés (0 = aucune)
    });
  });
}
if (galObservateur) {
  $$("#galerie figure").forEach(f => galObservateur.observe(f));
  document.documentElement.classList.add("fin-galerie");     // les cartes ne sont cachées que si l'effet peut les révéler
}
addEventListener("scroll", galMajScroll, { passive: true });
addEventListener("resize", galMajScroll);
const galBoutonAnim = $("#bouton-animations");
if (galBoutonAnim) galBoutonAnim.addEventListener("click", () => setTimeout(galMajScroll, 0));

/* ----- 3. Filtres : on cache les créations qui ne correspondent pas ----- */
$$(".filtres button").forEach(bouton => {
  bouton.onclick = () => {
    $$(".filtres button").forEach(b => b.setAttribute("aria-pressed", b === bouton));
    $$("#galerie figure").forEach(f => {
      f.hidden = bouton.dataset.filtre !== "tout" && f.dataset.categorie !== bouton.dataset.filtre;
    });
    galMajScroll();
  };
});

/* ----- 4. Lightbox : fermeture par le bouton, Échap, ou un clic à l'extérieur ; flèches ← → pour passer à la suivante ----- */
const lightbox = $("#lightbox");
let galCourant = null;                                         // carte actuellement agrandie

function ouvrirLightbox(figure) {
  const c = creations[figure.dataset.index];
  galCourant = figure;
  $("#lightbox-image").innerHTML = `Image à ajouter<img src="${c.image}" alt="${galEchapper(c.title)}" onerror="this.remove()">`;
  $("#lightbox-legende").textContent = c.title;
  if (!lightbox.open) {
    lightbox.showModal();
    document.documentElement.style.overflow = "hidden";        // la page ne défile plus derrière
  }
}
function galVoisine(sens) {
  const visibles = $$("#galerie figure").filter(f => !f.hidden);
  const i = visibles.indexOf(galCourant);
  if (i === -1) return;
  ouvrirLightbox(visibles[(i + sens + visibles.length) % visibles.length]);
}
$$("#galerie figure").forEach(f => {
  f.onclick = () => ouvrirLightbox(f);
  f.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ouvrirLightbox(f); } };
});
$("#lightbox-fermer").onclick = () => lightbox.close();
lightbox.onclick = e => { if (e.target === lightbox) lightbox.close(); };
lightbox.addEventListener("close", () => {
  document.documentElement.style.overflow = "";
  if (galCourant) galCourant.focus({ preventScroll: true });   // le focus revient sur la carte
});
lightbox.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") galVoisine(1);
  if (e.key === "ArrowLeft") galVoisine(-1);
});

galMajScroll();