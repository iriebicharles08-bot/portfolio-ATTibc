/* =========================================================
   DATA : le contenu que vous ferez évoluer.
   Pour ajouter un projet : copiez un bloc { ... } puis changez les textes.
   Les images se déposent dans assets/images/.
   ========================================================= */
const projects = [
  {
    title: "NØVÉA",
    category: "Maison de parfum · Expérience web",
    description: "Une expérience digitale autour de l'univers du parfum et de la découverte.",
    image: "assets/images/novea-1.jpg",
    secondaryImage: "assets/images/novea-2.jpg",
    link: "https://iriebicharles08-bot.github.io/NOVEA-PARFUMS/#test",
    year: "2026"
  },
  {
    title: "LA MARINA",
    category: "Restaurant · Menu digital · Expérience web",
    description: "Une expérience pensée pour découvrir le restaurant et son univers.",
    image: "assets/images/marina-1.jpg",
    secondaryImage: "assets/images/marina-2.jpg",
    link: "https://lamarina.onrender.com/#moments",
    year: "2026"
  },
  {
    title: "NEMESIS",
    category: "Sneakers · Direction visuelle · Web",
    description: "Une présentation digitale construite autour du produit et de son identité.",
    image: "assets/images/nemesis-1.jpg",
    secondaryImage: "assets/images/nemesis-2.jpg",
    link: "https://iriebicharles08-bot.github.io/NEMESIS/",
    year: "2026"
  }
];

/* Créations : category = "web", "affiches", "flyers" ou "visuels".
   ratio = forme de l'image (largeur/hauteur) :
   flyer 1200x1680 -> "5/7" ; menu 2400x1680 -> "10/7" ; affiche 1200x1600 -> "3/4".
   Pour ajouter une création : copiez une ligne, changez le nom du fichier. */
const creations = [
  { category: "affiches", title: "Affiche 01",      image: "assets/images/creation-1.jpg", ratio: "3/4" },
  { category: "flyers",   title: "Flyer 01",        image: "assets/images/flyer-01.jpg",   ratio: "5/7" },
  { category: "web",      title: "Site vitrine 01", image: "assets/images/creation-2.jpg", ratio: "4/3" },
  { category: "flyers",   title: "Flyer 02",        image: "assets/images/flyer-02.jpg",   ratio: "5/7" },
  { category: "flyers",   title: "Menu 01",         image: "assets/images/flyer-07.jpg",   ratio: "10/7" },
  { category: "visuels",  title: "Visuel 01",       image: "assets/images/creation-4.jpg", ratio: "4/5" },
  { category: "flyers",   title: "Flyer 03",        image: "assets/images/flyer-03.jpg",   ratio: "5/7" },
  { category: "affiches", title: "Affiche 02",      image: "assets/images/creation-5.jpg", ratio: "2/3" },
  { category: "flyers",   title: "Flyer 04",        image: "assets/images/flyer-04.jpg",   ratio: "5/7" },
  { category: "flyers",   title: "Menu 02",         image: "assets/images/flyer-08.jpg",   ratio: "10/7" },
  { category: "flyers",   title: "Flyer 05",        image: "assets/images/flyer-05.jpg",   ratio: "5/7" },
  { category: "flyers",   title: "Flyer 06",        image: "assets/images/flyer-06.jpg",   ratio: "5/7" }
];