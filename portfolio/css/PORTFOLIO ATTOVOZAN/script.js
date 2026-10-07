// ===== LISTE DE MES CRÉATIONS =====
// Pour ajouter une création : copie un bloc {} et modifie les infos.
// "images" peut contenir plusieurs fichiers (ex: un menu sur 2 pages).
const creations = [
    {
        titre: "Flyer — Gamme d'épices",
        description: "Flyer promotionnel conçu pour mettre en valeur une gamme d'épices, avec une présentation visuelle attractive destinée à capter l'attention et encourager l'achat.",
        images: ["images/flyer-epices.jpeg"]
    },
    {
        titre: "Menu — La Thônesienne",
        description: "Menu conçu pour le restaurant africain La Thônesienne, mettant en valeur ses plats et spécialités à travers une présentation claire, élégante et appétissante.",
        images: ["images/menu-la-thonesienne-1.jpeg", "images/menu-la-thonesienne-2.jpeg"]
    },
    {
        titre: "Affiche — La Thônesienne",
        description: "Affiche promotionnelle conçue pour attirer les clients à La Thônesienne, en mettant en avant son ambiance et son offre culinaire.",
        images: ["images/affiche-la-thonesienne.jpeg"]
    },
    {
        titre: "Affiche — Fytya G",
        description: "Affiche commerciale présentant les produits de Fytya G, notamment les œufs et les volailles, avec une mise en avant claire de l'offre.",
        images: ["images/affiche-fytya-g.jpeg"]
    },
    {
        titre: "Affiche — Vendeuse de vêtements",
        description: "Affiche promotionnelle conçue pour mettre en valeur des articles vestimentaires et attirer l'attention des clientes grâce à une présentation moderne et tendance.",
        images: ["images/affiche-vendeuse-de-vetements.jpeg"]
    },
    {
        titre: "Affiche — Cheeseburger",
        description: "Affiche publicitaire réalisée pour mettre en valeur un cheeseburger gourmand et appétissant, avec un visuel conçu pour stimuler l'envie d'achat.",
        images: ["images/affiche-cheeseburger.jpeg"]
    }
];

// ===== GÉNÉRATION DES CARTES =====
function afficherCreations() {
    const galerie = document.getElementById("galerie-creations");

    creations.forEach((creation, index) => {
        const carte = document.createElement("div");
        carte.classList.add("carte-creation");
        carte.setAttribute("tabindex", "0"); // accessible au clavier aussi

        carte.innerHTML = `
            <img src="${creation.images[0]}" alt="${creation.titre}">
            <div class="carte-overlay">
                <span>Voir</span>
            </div>
            <h3>${creation.titre}</h3>
        `;

        carte.addEventListener("click", () => ouvrirLightbox(index));

        galerie.appendChild(carte);
    });
}

// ===== LIGHTBOX =====
let pageActuelle = 0;
let creationActuelle = 0;

function ouvrirLightbox(index) {
    creationActuelle = index;
    pageActuelle = 0;

    const lightbox = document.getElementById("lightbox");
    lightbox.classList.add("actif");
    document.body.style.overflow = "hidden"; // empêche le scroll derrière

    mettreAJourLightbox();
}

function mettreAJourLightbox() {
    const creation = creations[creationActuelle];

    document.getElementById("lightbox-image").src = creation.images[pageActuelle];
    document.getElementById("lightbox-titre").textContent = creation.titre;
    document.getElementById("lightbox-description").textContent = creation.description;

    // Navigation entre pages (menu 2 pages par ex.)
    const navigation = document.getElementById("lightbox-navigation");
    if (creation.images.length > 1) {
        navigation.style.display = "flex";
        document.getElementById("lightbox-page-info").textContent =
            `Page ${pageActuelle + 1} / ${creation.images.length}`;
    } else {
        navigation.style.display = "none";
    }
}

function pageSuivante() {
    const creation = creations[creationActuelle];
    pageActuelle = (pageActuelle + 1) % creation.images.length;
    mettreAJourLightbox();
}

function pagePrecedente() {
    const creation = creations[creationActuelle];
    pageActuelle = (pageActuelle - 1 + creation.images.length) % creation.images.length;
    mettreAJourLightbox();
}

function fermerLightbox() {
    document.getElementById("lightbox").classList.remove("actif");
    document.body.style.overflow = "auto";
}

// ===== INITIALISATION =====
afficherCreations();

document.getElementById("lightbox-fermer").addEventListener("click", fermerLightbox);
document.getElementById("lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox") fermerLightbox(); // clic en dehors de l'image = ferme
});
document.getElementById("lightbox-suivant").addEventListener("click", pageSuivante);
document.getElementById("lightbox-precedent").addEventListener("click", pagePrecedente);

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fermerLightbox();
});
// ===== FORMULAIRE DE CONTACT =====
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const nom = document.getElementById('nom').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        const sujet = `Message de ${nom} via le portfolio`;
        const corps = `Nom : ${nom}\nEmail : ${email}\n\nMessage :\n${message}`;

        const lienGmail = `https://mail.google.com/mail/?view=cm&fs=1&to=iriebi972@gmail.com&su=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;

        window.open(lienGmail, '_blank');
    });
}