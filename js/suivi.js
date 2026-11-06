/* Page de suivi DIWAN : le client entre son code, la page affiche où en est sa commande.
   Les données viennent de l'application DIWAN (fonction diwan_suivi, lecture par code seulement). */
(() => {
  const S = window.STORE || {};
  const $ = (s) => document.querySelector(s);

  // Fond : monuments en fondu, chacun 7 s, avec son nom en légende
  // Photos libres de droits (licence Unsplash), étalonnées ensemble pour un rendu homogène
  const MONUMENTS = [
    ["tour-hassan", "Tour Hassan · Rabat"],
    ["koutoubia", "Koutoubia et l'Atlas · Marrakech"],
    ["oudayas", "Kasbah des Oudayas · Rabat"],
    ["tamnougalt", "Kasbah de Tamnougalt · Vallée du Drâa"],
    ["telouet", "Kasbah de Telouet · Haut Atlas"],
    ["porte-rabat", "Porte de mosquée · Rabat"],
  ];
  const fond = $(".fond"), legende = $("#legende");
  const images = MONUMENTS.map(([f], i) => {
    const img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    if (i > 0) img.loading = "lazy"; else img.className = "premiere";
    img.src = `assets/suivi/${f}.jpg`;
    fond.appendChild(img);
    return img;
  });
  let n = 0;
  const montrer = (i) => {
    images.forEach((img, j) => img.classList.toggle("active", j === i));
    legende.classList.add("cache");
    setTimeout(() => { legende.textContent = MONUMENTS[i][1]; legende.classList.remove("cache"); }, 500);
  };
  montrer(0);
  setTimeout(() => images[0].classList.remove("premiere"), 100);
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(() => montrer((n = (n + 1) % images.length)), 7000);

  // Liens WhatsApp
  const wa = `https://wa.me/${S.whatsapp || "212708876151"}?text=${encodeURIComponent("Bonjour, j'ai une question sur ma commande.")}`;
  document.querySelectorAll(".lien-wa").forEach((a) => { a.href = wa; a.target = "_blank"; a.rel = "noopener"; });

  const ETAPES = [
    ["recue", "Commande reçue"],
    ["confirmee", "Commande confirmée"],
    ["route", "En route vers votre ville"],
    ["livreur", "Chez le livreur"],
    ["livree", "Livrée"],
  ];
  const PHRASES = {
    recue: ["Nous avons bien reçu votre commande.", "Confirmez-la sur WhatsApp pour que nous la préparions."],
    confirmee: ["Votre commande est confirmée.", "Nous la préparons avec soin, elle part très vite."],
    route: ["Votre polo est en route.", "Il arrive dans votre ville sous 24 à 72 h."],
    livreur: ["Votre polo arrive aujourd'hui.", "Gardez votre téléphone allumé et préparez le montant exact."],
    livree: ["Votre polo est arrivé.", "Bienvenue au club. Merci pour votre confiance."],
    annulee: ["Cette commande a été annulée.", "Une erreur ? Écrivez-nous sur WhatsApp, nous la relançons tout de suite."],
    retournee: ["Cette commande nous est revenue.", "Vous la voulez toujours ? Écrivez-nous sur WhatsApp, nous la renvoyons."],
  };
  const PHOTOS = { noir: "assets/noir-face.jpg", bordeaux: "assets/bordeaux-face.jpg", marine: "assets/marine2-face.jpg" };
  const nomColoris = (id) => (S.coloris || []).find((c) => c.id === id)?.court || id;
  const date = (d) => d ? new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

  // Lecture dans l'application DIWAN : avec le code seulement, sans adresse ni téléphone du client
  async function chercher(code) {
    if (!S.api) return null;
    try {
      const r = await fetch(`${S.api.url}/rest/v1/rpc/diwan_suivi`, {
        method: "POST",
        headers: { apikey: S.api.cle, Authorization: `Bearer ${S.api.cle}`, "Content-Type": "application/json" },
        body: JSON.stringify({ p_code: code }),
      });
      return r.ok ? await r.json() : null;
    } catch { return null; }
  }

  function afficher(c) {
    $("#r-code").textContent = c.code;
    let [titre, phrase] = PHRASES[c.etape] || PHRASES.recue;
    // Plusieurs polos : « vos polos arrivent », « sont en route »…
    if ((c.articles || []).length > 1) titre = titre.replace("Votre polo arrive", "Vos polos arrivent").replace("Votre polo est arrivé", "Vos polos sont arrivés").replace("Votre polo est", "Vos polos sont");
    $("#r-titre").textContent = c.prenom ? `${c.prenom}, ${titre.charAt(0).toLowerCase()}${titre.slice(1)}` : titre;
    $("#r-phrase").textContent = phrase;
    const articles = c.articles || [];
    const produit = articles.map((a) => `${nomColoris(a.coloris)} ${a.taille || ""}`.trim()).join(" + ");
    $("#r-photo").src = PHOTOS[articles[0]?.coloris] || PHOTOS.noir;
    $("#r-photo").alt = `Polo Club ${produit}`;
    $("#r-produit").textContent = `${articles.length > 1 ? articles.length + " polos" : "Polo Club"} · ${produit}`;
    $("#r-montant").textContent = !c.montant ? "Offert" : c.etape === "livree" ? `${c.montant} MAD, payé à la réception` : `${c.montant} MAD à payer à la réception`;

    const ferme = c.etape === "annulee" || c.etape === "retournee";
    const rang = ETAPES.findIndex(([id]) => id === c.etape);
    const dates = { recue: date(c.recue_le), livree: date(c.livree_le) };
    if (rang > 0 && rang < 4) dates[c.etape] = date(c.maj_le);
    $("#r-etapes").hidden = ferme;
    $("#r-etapes").innerHTML = ETAPES.map(([id, nom], i) =>
      `<li class="${i < rang || c.etape === "livree" ? "fait" : i === rang ? "encours" : ""}">${nom}${i <= rang && dates[id] ? `<small>${dates[id]}</small>` : ""}${i === rang && c.statut_livreur && c.etape !== "livree" ? `<small>Livreur : ${c.statut_livreur}</small>` : ""}</li>`).join("");
    const l = c.livreur;
    $("#r-livreur").hidden = !(l && c.etape === "livreur");
    if (l) { $("#r-livreur-nom").textContent = l.nom ? `${l.nom} · ${l.tel}` : l.tel; $("#r-livreur-tel").href = `tel:${l.tel}`; }
    $(".rassurance").hidden = ferme || c.etape === "livree";
    $("#vue-code").hidden = true;
    $("#vue-suivi").hidden = false;
    history.replaceState(null, "", `?code=${encodeURIComponent(c.code)}`);
  }

  const champ = $("#code"), erreur = $("#erreur");
  // Le code s'écrit en majuscules, avec le tiret ajouté tout seul après DW
  champ.addEventListener("input", () => {
    let v = champ.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (v.startsWith("DW") && v.length > 2) v = "DW-" + v.slice(2);
    champ.value = v.slice(0, 12);
    erreur.hidden = true;
  });
  $("#form-code").addEventListener("submit", async (e) => {
    e.preventDefault();
    const c = await chercher(champ.value.trim().toUpperCase());
    if (!c) { erreur.textContent = "Ce code ne correspond à aucune commande. Vérifiez-le dans votre message WhatsApp."; erreur.hidden = false; return; }
    afficher(c);
  });
  $("#autre-code").addEventListener("click", () => {
    $("#vue-suivi").hidden = true; $("#vue-code").hidden = false; champ.value = ""; champ.focus();
    history.replaceState(null, "", location.pathname);
  });

  // Lien du message WhatsApp : le code est déjà dans l'adresse
  const q = new URLSearchParams(location.search).get("code");
  if (q) { champ.value = q.toUpperCase(); chercher(champ.value).then((c) => c && afficher(c)); }
})();
