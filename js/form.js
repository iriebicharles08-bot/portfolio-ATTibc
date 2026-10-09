/* =========================================================
   FORM : validation du formulaire et envoi
   ========================================================= */
const formulaire = $("#formulaire");
const messagesErreur = {
  nom: "Indiquez votre nom.",
  contact: "Indiquez un e-mail ou un numéro WhatsApp.",
  message: "Écrivez quelques mots sur votre projet."
};

formulaire.onsubmit = async e => {
  e.preventDefault();
  let valide = true;

  // Vérifie chaque champ obligatoire
  for (const nom in messagesErreur) {
    const champ = formulaire[nom];
    const vide = !champ.value.trim();
    champ.parentElement.querySelector(".erreur").textContent = vide ? messagesErreur[nom] : "";
    champ.setAttribute("aria-invalid", vide);
    if (vide && valide) { champ.focus(); valide = false; }   // met le curseur sur la 1re erreur
  }
  if (!valide) return;

  const d = Object.fromEntries(new FormData(formulaire));
  const retour = $("#retour-formulaire");

  // Sans service configuré : on ouvre la messagerie avec le message pré-rempli
  if (!CONFIG.formulaire) {
    const corps = `${d.nom} (${d.entreprise})\nBudget : ${d.budget}\nContact : ${d.contact}\n\n${d.message}`;
    location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Projet : " + d.type)}&body=${encodeURIComponent(corps)}`;
    retour.textContent = "Votre messagerie s'ouvre avec le message prêt à envoyer.";
    return;
  }

  // Avec un service (Formspree, etc.)
  try {
    const reponse = await fetch(CONFIG.formulaire, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(formulaire) });
    if (!reponse.ok) throw new Error();
    formulaire.reset();
    retour.textContent = "Merci, votre message est bien parti. Je vous réponds vite.";
  } catch {
    retour.textContent = "L'envoi a échoué. Écrivez-moi directement par e-mail ou WhatsApp.";
  }
};
