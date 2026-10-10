/* =========================================================
   INTERACTIONS : contact en conversation, curseur, message caché.
   Chaque bloc est indépendant : on peut supprimer l'un sans toucher aux autres.
   ========================================================= */
(function () {

  /* ----- 1. CONTACT : une question à la fois ----- */
  const conv = document.getElementById("conversation");
  if (conv) {
    const etapes = [...conv.querySelectorAll("fieldset")];
    const barre = document.getElementById("conv-barre"), num = document.getElementById("conv-num");
    const retour = document.getElementById("conv-retour"), suite = document.getElementById("conv-suite");
    const erreur = conv.querySelector(".conversation__erreur"), merci = document.getElementById("conv-merci");
    const erreurs = ["Choisissez ce que vous aimeriez créer.", "Dites-moi où vous en êtes.", "Écrivez quelques mots sur votre projet.", "Choisissez WhatsApp ou e-mail."];
    let i = 0;

    function afficher(n) {
      i = n;
      etapes.forEach((e, k) => { e.hidden = k !== n; });
      num.textContent = n + 1;
      barre.style.width = ((n + 1) / etapes.length * 100) + "%";
      retour.hidden = n === 0;
      suite.textContent = n === etapes.length - 1 ? "Envoyer →" : "Continuer →";
      erreur.textContent = "";
      const champ = etapes[n].querySelector("textarea");
      if (champ) champ.focus({ preventScroll: true });
    }
    const reponse = nom => { const c = conv.querySelector(`input[name="${nom}"]:checked`); return c ? c.value : ""; };
    const valide = n => etapes[n].querySelector("textarea") ? etapes[n].querySelector("textarea").value.trim() !== "" : !!etapes[n].querySelector("input:checked");

    function envoyer() {
      const message = "Bonjour Charles,\n\nJ'aimerais créer : " + reponse("quoi") + ".\nMon idée : " + reponse("idee") + ".\n\nMon projet :\n" + conv.querySelector("textarea").value.trim();
      if (reponse("canal") === "E-mail") location.href = "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("Nouveau projet") + "&body=" + encodeURIComponent(message);
      else window.open("https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(message), "_blank", "noopener");
      etapes.forEach(e => { e.hidden = true; });
      [retour, suite].forEach(b => { b.hidden = true; });
      merci.hidden = false;
      merci.textContent = "Merci ! Votre message est prêt : il ne reste qu'à l'envoyer.";
    }
    function avancer() {
      if (!valide(i)) { erreur.textContent = erreurs[i]; return; }
      i < etapes.length - 1 ? afficher(i + 1) : envoyer();
    }
    suite.onclick = avancer;
    retour.onclick = () => afficher(i - 1);
    conv.addEventListener("submit", e => { e.preventDefault(); avancer(); });
    conv.addEventListener("change", e => { if (e.target.type === "radio" && i < 2) setTimeout(avancer, 280); });   // questions 1 et 2 : passage automatique
    afficher(0);
  }

  /* ----- 2. CURSEUR : un petit point, qui devient "DÉCOUVRIR" sur un projet (ordinateur seulement) ----- */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const point = document.createElement("div");
    point.id = "curseur";
    point.setAttribute("aria-hidden", "true");
    document.body.append(point);
    document.body.classList.add("curseur-perso");
    let x = 0, y = 0, cibleX = 0, cibleY = 0;
    addEventListener("pointermove", e => { cibleX = e.clientX; cibleY = e.clientY; point.style.opacity = 1; });
    (function suivre() {                                                   // le point rattrape doucement la souris
      x += (cibleX - x) * 0.25; y += (cibleY - y) * 0.25;
      point.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      requestAnimationFrame(suivre);
    })();
    document.addEventListener("pointerover", e => {
      const t = e.target;
      const type = t.closest(".projet") ? "projet" : t.closest("a, button, .chip, figure[tabindex], input, textarea") ? "lien" : "";
      point.className = type;
      point.textContent = type === "projet" ? "Découvrir" : "";
    });
  }

  /* ----- 3. MESSAGE CACHÉ : "IBC / 2026" dans le footer ----- */
  const secret = document.getElementById("secret"), egg = document.getElementById("egg"), fermer = document.getElementById("secret-fermer");
  if (secret && egg) {
    const ouvrir = () => { secret.hidden = false; fermer.focus(); };
    const clore = () => { secret.hidden = true; egg.focus(); };
    egg.addEventListener("click", ouvrir);
    fermer.addEventListener("click", clore);
    addEventListener("keydown", e => { if (e.key === "Escape" && !secret.hidden) clore(); });
  }
})();