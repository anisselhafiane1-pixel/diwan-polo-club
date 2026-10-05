/* ============================================================
   DIWAN POLO CLUB — configuration de la boutique
   Tout ce qui change (prix, numéro, photos, textes) se modifie ici.
   ============================================================ */
window.STORE = {
  marque: "DIWAN",
  marqueComplete: "DIWAN POLO CLUB",
  devise: "MAD",

  // Numéro WhatsApp au format international, sans + ni espaces (ex : 212612345678)
  whatsapp: "212708876151",

  // URL du script Google Sheets (voir google-apps-script.gs). Vide = mode test (commandes gardées dans le navigateur).
  leadsEndpoint: "",

  // ID du pixel Meta (Facebook / Instagram). Vide = désactivé.
  metaPixelId: "",

  // Vidéos d'accueil, jouées l'une après l'autre en fondu.
  heroVideos: ["assets/hero-1.mp4", "assets/hero-2.mp4"],

  livraison: "Livraison partout au Maroc en 24 à 72 h",
  // ⚠️ À confirmer avec ton transporteur avant la mise en ligne
  ouvertureColis: true,
  echangeJours: 7,

  // Série limitée : nombre de pièces produites par coloris
  serieParColoris: 250,

  produit: {
    slug: "polo-club-manches-longues",
    nom: "Le Polo Club",
    sousTitre: "Polo manches longues · Coton piqué 320 g/m²",
    prix: 590,
    matiere: "100 % coton piqué",
    grammage: "320 g/m²",
    coupe: "Regular Fit",
    details: [
      "100 % coton",
      "Coton piqué 320 g/m²",
      "Coupe Regular Fit",
      "Manches longues",
      "Emblème DIWAN brodé",
      "Lettrage DIWAN POLO CLUB brodé",
      "Col polo structuré",
      "Poignets côtelés",
      "Finitions contrastées",
      "Confectionné au Maroc",
    ],
  },

  // Les 3 coloris. Déposer les photos dans assets/ avec ces noms exacts.
  coloris: [
    {
      id: "noir",
      nom: "Noir & Beige",
      court: "Noir",
      principal: "#121212",
      accent: "#e8dcc4",
      photos: ["assets/noir-studio.jpg", "assets/noir-dressing.jpg"],
      phrase: "Le plus affirmé. Il se porte le soir comme le week-end.",
    },
    {
      id: "bordeaux",
      nom: "Bordeaux & Beige",
      court: "Bordeaux",
      principal: "#5c1a24",
      accent: "#e8dcc4",
      photos: ["assets/bordeaux-studio.jpg", "assets/bordeaux-dressing.jpg"],
      phrase: "Le plus raffiné. Une couleur profonde qu'on remarque sans qu'elle crie.",
    },
    {
      id: "marine",
      nom: "Marine & Beige",
      court: "Marine",
      principal: "#1d2f6b",
      accent: "#e8dcc4",
      photos: ["assets/marine-studio.jpg", "assets/marine-dressing.jpg"],
      phrase: "Le classique des clubs. Il va avec tout ce que vous avez déjà.",
    },
  ],

  // Offres : le pack 3 coloris est l'offre phare
  offres: [
    { id: "1", label: "1 polo", qte: 1, prix: 590, ancien: null, badge: null, note: "+ 35 MAD de livraison" },
    { id: "2", label: "2 polos", qte: 2, prix: 1090, ancien: 1180, badge: "Livraison offerte", note: "Vous économisez 90 MAD + la livraison" },
    { id: "3", label: "La collection · 3 polos", qte: 3, prix: 1490, ancien: 1770, badge: "Meilleure offre", note: "Vous économisez 280 MAD + la livraison" },
  ],
  fraisLivraison: 35, // appliqué uniquement à l'offre 1 polo

  tailles: ["S", "M", "L", "XL", "XXL"],

  // ⚠️ À remplacer par les mesures réelles de l'usine (en cm, à plat)
  guideTailles: {
    colonnes: ["Taille", "Poitrine", "Longueur", "Manche", "Poids conseillé"],
    lignes: [
      ["S", "52", "70", "62", "55–65 kg"],
      ["M", "55", "72", "63", "65–75 kg"],
      ["L", "58", "74", "64", "75–85 kg"],
      ["XL", "61", "76", "65", "85–95 kg"],
      ["XXL", "64", "78", "66", "95–110 kg"],
    ],
  },

  // Avis clients RÉELS uniquement. La section reste masquée tant que la liste est vide.
  // ex : { nom: "Youssef, Casablanca", note: 5, texte: "...", coloris: "Bordeaux" }
  avis: [],

  villes: [
    "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", "Oujda", "Kénitra", "Tétouan",
    "Salé", "Témara", "Mohammédia", "El Jadida", "Safi", "Béni Mellal", "Nador", "Settat", "Khouribga", "Laâyoune",
    "Dakhla", "Essaouira", "Ifrane", "Larache", "Berrechid", "Bouskoura", "Dar Bouazza", "Taza", "Errachidia", "Ouarzazate", "Autre",
  ],
};
