/* DIWAN POLO CLUB — logique du site (accueil, produit, merci) */
(function () {
  const S = window.STORE;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const mad = (n) => n.toLocaleString("fr-FR").replace(/ /g, " ") + " " + S.devise;
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const page = document.body.dataset.page;

  /* ---------- Tarif du jour : lancement ou prix normal ---------- */
  const L = S.lancement;
  const enLancement = !!L && L.active === true;
  const prixBase = L ? (enLancement ? L.prixLancement : L.prixNormal) : S.produit.prix;
  const dateFr = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  S.offres = [1, 2, 3].map((q) => {
    const prix = prixBase * q - (S.remisePack?.[q] || 0);
    const ancien = enLancement ? L.prixNormal * q : q > 1 ? prixBase * q : null;
    return {
      id: String(q), qte: q, prix, ancien,
      label: q === 1 ? "1 polo" : q === 2 ? "2 polos" : "3 polos",
      badge: q === 3 ? "Meilleure offre" : q === 2 || enLancement ? "Livraison offerte" : null,
      note: q === 1 ? (enLancement ? "Livraison offerte" : `+ ${S.fraisLivraison} MAD de livraison`) : `Vous économisez ${ancien - prix} MAD + la livraison`,
    };
  });
  const fraisDuJour = (q) => (q === 1 && !enLancement ? S.fraisLivraison : 0);

  /* ---------- Visuel provisoire : le polo dessiné aux couleurs du coloris ---------- */
  let uid = 0;
  function poloSVG(c) {
    const p = c.principal, a = c.accent, id = "sh" + uid++;
    return `<svg class="polo-svg" viewBox="0 0 400 430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Polo ${c.nom}">
      <defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".2"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient></defs>
      <path d="M130 52 L84 70 Q62 80 58 108 L28 372 L72 380 L104 176 L104 74 Z" fill="${a}"/>
      <path d="M270 52 L316 70 Q338 80 342 108 L372 372 L328 380 L296 176 L296 74 Z" fill="${a}"/>
      <path d="M31 346 L75 353 L72 380 L28 372 Z" fill="${p}"/><path d="M369 346 L325 353 L328 380 L372 372 Z" fill="${p}"/>
      <path d="M130 52 L270 52 L296 74 L298 402 Q200 414 102 402 L104 74 Z" fill="${p}"/>
      <rect x="103" y="206" width="194" height="74" fill="${a}"/>
      <text x="200" y="250" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="42" font-weight="600" letter-spacing="3" fill="${p}">DIWAN</text>
      <text x="200" y="270" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="13" font-weight="700" letter-spacing="2.5" fill="${p}">POLO CLUB</text>
      <rect x="191" y="76" width="18" height="76" fill="${a}"/>
      <circle cx="200" cy="98" r="3.6" fill="${a}" stroke="#0003"/><circle cx="200" cy="128" r="3.6" fill="${a}" stroke="#0003"/>
      <path d="M156 44 Q200 62 244 44 L272 54 L224 106 L200 78 L176 106 L128 54 Z" fill="${p}" stroke="#000" stroke-opacity=".35"/>
      <path d="M234 152 L234 124 Q234 108 246 100 Q258 108 258 124 L258 152 Z" fill="none" stroke="#c9a45c" stroke-width="2"/>
      <path d="M239 146 L253 114 M253 146 L239 114" stroke="#c9a45c" stroke-width="1.6"/>
      <path d="M130 52 L270 52 L296 74 L298 402 Q200 414 102 402 L104 74 Z" fill="url(#${id})"/>
      <path d="M102 390 Q200 402 298 390 L298 402 Q200 414 102 402 Z" fill="#000" opacity=".15"/>
    </svg>`;
  }
  // <img> qui se remplace par le dessin si la photo n'est pas encore déposée
  function visuel(src, c, alt) {
    const holder = document.createElement("div");
    holder.className = "visuel";
    holder.style.display = "contents";
    const img = new Image();
    img.alt = alt || `${S.marqueComplete} ${c.nom}`;
    img.decoding = "async";
    img.onerror = () => { holder.innerHTML = poloSVG(c); };
    img.src = src;
    holder.appendChild(img);
    return holder;
  }
  window.DIWAN_visuel = visuel;
  // Pastille de coloris : 80 % couleur du polo, 20 % beige (comme le polo lui-même)
  const pastille = (c) => `linear-gradient(135deg, ${c.principal} 80%, ${c.accent} 80%)`;

  /* ---------- Suivi : UTM + pixel Meta ---------- */
  (function utm() {
    const q = new URLSearchParams(location.search);
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid"];
    const found = {};
    keys.forEach((k) => q.get(k) && (found[k] = q.get(k)));
    if (Object.keys(found).length) store.set("diwan_utm", found);
  })();
  if (S.metaPixelId) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", S.metaPixelId);
    fbq("track", "PageView");
  }
  const track = (ev, data) => { try { window.fbq && fbq("track", ev, data); } catch {} };

  /* ---------- Commun : en-tête, bandeau, WhatsApp, apparitions ---------- */
  const annonce = $(".annonce-piste");
  if (annonce) {
    const msgs = [
      "Paiement à la livraison",
      S.livraison,
      "Série limitée · quantités limitées",
      ...(enLancement ? [`Profitez de l'offre −${Math.round((1 - L.prixLancement / L.prixNormal) * 100)} % · quantité limitée`] : []),
      S.offres.map((o) => `${o.label} ${mad(o.prix)}`).join(" · "),
      "100 % coton",
    ];
    annonce.innerHTML = [...msgs, ...msgs].map((m) => `<span>${m}</span>`).join("");
  }

  const entete = $(".entete");
  if (entete && entete.classList.contains("sur-video")) {
    const onScroll = () => {
      const solide = scrollY > innerHeight * 0.75;
      entete.classList.toggle("solide", solide);
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const waLien = `https://wa.me/${S.whatsapp}?text=${encodeURIComponent("Bonjour DIWAN, j'ai une question sur le Polo Club.")}`;
  $$(".wa, .lien-wa").forEach((a) => (a.href = waLien));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("vu"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  const observer = () => $$(".revele:not(.vu)").forEach((el) => io.observe(el));

  $$("[data-annee]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ============================================================
     ACCUEIL
     ============================================================ */
  if (page === "accueil") {
    // Héros : vidéo si présente, sinon diaporama des photos portées
    const heros = $(".heros");
    const diapo = $(".heros-diapo");
    S.coloris.forEach((c, i) => {
      const slide = document.createElement("div");
      slide.className = "diapo" + (i === 0 ? " actif" : "");
      const img = new Image();
      img.alt = `${S.marqueComplete} ${c.nom} porté`;
      img.onerror = () => { slide.classList.add("dessin"); slide.innerHTML = poloSVG(c); };
      img.src = c.photos[1] || c.photos[0];
      slide.appendChild(img);
      diapo.appendChild(slide);
    });
    let idx = 0;
    const slides = $$(".diapo", diapo);
    const timer = setInterval(() => {
      slides[idx].classList.remove("actif");
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add("actif");
    }, 5200);

    // Vidéos enchaînées en fondu : chacune démarre quand la précédente se termine
    const sources = S.heroVideos || [];
    const vids = sources.map((src) => {
      const v = document.createElement("video");
      Object.assign(v, { muted: true, playsInline: true, preload: "auto", src });
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      v.loop = sources.length === 1;
      diapo.after(v);
      return v;
    });
    vids.forEach((v, i) => {
      v.addEventListener("ended", () => {
        const suivant = vids[(i + 1) % vids.length];
        suivant.currentTime = 0;
        suivant.play().catch(() => {});
        suivant.classList.add("pret");
        v.classList.remove("pret");
      });
    });
    if (vids[0]) {
      vids[0].autoplay = true;
      vids[0].addEventListener("canplay", () => { vids[0].classList.add("pret"); clearInterval(timer); vids[0].play().catch(() => {}); }, { once: true });
      vids[0].addEventListener("error", () => vids.forEach((v) => v.remove()), { once: true });
    }

    // Collection : les 3 coloris
    const grille = $("#collection");
    S.coloris.forEach((c, i) => {
      const a = document.createElement("a");
      a.className = `carte revele d${i + 1}`;
      a.href = `produit.html?coloris=${c.id}`;
      a.innerHTML = `
        <div class="carte-visuel">
          <span class="carte-tag">Quantités limitées</span>
          <span class="carte-voir">Découvrir</span>
        </div>
        <div class="carte-info">
          <div><h3>${c.nom}</h3><small>${c.phrase}</small></div>
          <span class="carte-prix">${enLancement ? `<s>${mad(L.prixNormal)}</s> ` : ""}${mad(prixBase)}${enLancement ? `<em class="pct">−${Math.round((1 - L.prixLancement / L.prixNormal) * 100)} %</em>` : ""}</span>
        </div>`;
      const v = $(".carte-visuel", a);
      v.appendChild(visuel(c.photos[0], c));
      const porte = c.photos[1];
      if (porte) {
        const survol = new Image();
        survol.className = "survol";
        survol.alt = "";
        survol.loading = "lazy";
        survol.onerror = () => survol.remove();
        survol.src = porte;
        v.appendChild(survol);
      }
      grille.appendChild(a);
    });

    // Autres modèles épuisés : présentés, sans commande ; bouton pour être prévenu du retour
    const autres = $("#autres-modeles");
    if (autres) (S.autresModeles || []).forEach((m) => {
      const bloc = document.createElement("div");
      bloc.className = "autre-modele";
      bloc.innerHTML = `<div class="titre-section revele"><p class="eyebrow">${m.epuise ? "Épuisé" : "Nouveau"}</p><h2>${m.nom}</h2></div><div class="collection"></div>`;
      const g = $(".collection", bloc);
      m.coloris.forEach((c, i) => {
        const a = document.createElement("a");
        a.className = `carte revele d${i + 1}` + (m.epuise ? " epuise" : "");
        a.href = `epuise.html?modele=${m.slug}&coloris=${c.id}`;
        a.innerHTML = `
          <div class="carte-visuel">
            ${m.epuise ? `<span class="voile-epuise"><b>Épuisé</b><small>Bientôt de retour</small></span>` : ""}
            <span class="carte-voir">${m.epuise ? "Être prévenu du retour" : "Découvrir"}</span>
          </div>
          <div class="carte-info">
            <div><h3>${c.nom}</h3><small>${m.epuise ? "Rupture de stock" : ""}</small></div>
            <span class="carte-prix">${mad(m.prix)}</span>
          </div>`;
        const v = $(".carte-visuel", a);
        const img = new Image(); img.alt = `${m.nom} ${c.nom}`; img.loading = "lazy"; img.src = c.face; v.insertBefore(img, v.firstChild);
        if (c.porte) { const s2 = new Image(); s2.className = "survol"; s2.alt = ""; s2.loading = "lazy"; s2.src = c.porte; v.insertBefore(s2, img.nextSibling); }
        g.appendChild(a);
      });
      autres.appendChild(bloc);
    });

    // Bandeau photos portées
    const porte = $("#portes");
    if (porte) S.coloris.forEach((c) => {
      const f = document.createElement("figure");
      f.className = "revele";
      f.appendChild(visuel(c.photos[1] || c.photos[0], c, `${c.nom} porté`));
      f.insertAdjacentHTML("beforeend", `<figcaption>${c.nom}</figcaption>`);
      porte.appendChild(f);
    });

    observer();
  }

  /* ============================================================
     PAGE MODÈLE ÉPUISÉ : galerie + « prévenez-moi du retour »
     ============================================================ */
  if (page === "epuise") {
    const q = new URLSearchParams(location.search);
    const m = (S.autresModeles || []).find((x) => x.slug === q.get("modele")) || (S.autresModeles || [])[0];
    if (!m) { location.href = "index.html"; return; }
    let c = m.coloris.find((x) => x.id === q.get("coloris")) || m.coloris[0];
    document.title = `${m.nom} · DIWAN POLO CLUB`;
    $$("[data-nom]").forEach((el) => (el.textContent = m.nom));
    $("[data-sous-titre]").textContent = m.sousTitre || "";
    $("[data-prix]").textContent = mad(m.prix);
    const principal = $(".visuel-principal"), vignettes = $(".vignettes");
    function rendre() {
      $("#nom-coloris").textContent = c.nom;
      history.replaceState(null, "", `?modele=${m.slug}&coloris=${c.id}`);
      vignettes.innerHTML = "";
      const vues = [c.face, c.porte, c.dos].filter(Boolean);
      const montrer = (src) => { $$(".visuel-principal > :not(.badge-epuise)").forEach((n) => n.remove()); principal.appendChild(visuel(src, c)); };
      vues.forEach((src, i) => {
        const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", `Voir la photo ${i + 1}`);
        b.appendChild(visuel(src, c));
        b.onclick = () => { $$("button", vignettes).forEach((x) => x.classList.remove("actif")); b.classList.add("actif"); montrer(src); };
        if (!i) { b.classList.add("actif"); montrer(src); }
        vignettes.appendChild(b);
      });
      const p = $("#coloris"); p.innerHTML = "";
      m.coloris.forEach((x) => {
        const b = document.createElement("button"); b.type = "button"; b.title = x.nom; b.setAttribute("aria-label", x.nom);
        b.style.background = pastille(x); if (x === c) b.classList.add("actif");
        b.onclick = () => { c = x; rendre(); }; p.appendChild(b);
      });
    }
    rendre();

    const f = $("#alerte"), champ = $("#contact"), msg = $("#alerte-msg");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = champ.value.trim();
      const email = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v);
      const tel = /^0[5-7]\d{8}$/.test("0" + v.replace(/\D/g, "").replace(/^(00212|212)/, "").replace(/^0/, ""));
      if (!email && !tel) { msg.textContent = "Indiquez un e-mail valide ou un numéro marocain (ex : 06 12 34 56 78)."; msg.className = "alerte-msg erreur"; champ.focus(); return; }
      const btn = $("button[type=submit]", f); btn.disabled = true;
      try {
        const r = await fetch(`${S.api.url}/rest/v1/rpc/diwan_alerte_retour`, {
          method: "POST", headers: { apikey: S.api.cle, Authorization: `Bearer ${S.api.cle}`, "Content-Type": "application/json" },
          body: JSON.stringify({ p_modele: m.nom, p_coloris: c.nom, p_contact: v }),
        });
        if (!r.ok) throw new Error();
        f.hidden = true;
        msg.textContent = `C'est noté. Nous vous prévenons dès le retour du ${m.nom} ${c.nom}, avant tout le monde.`;
        msg.className = "alerte-msg ok";
        track("Lead", { content_name: `${m.nom} ${c.nom}` });
      } catch {
        msg.textContent = "L'envoi n'a pas abouti. Réessayez, ou écrivez-nous sur WhatsApp."; msg.className = "alerte-msg erreur";
      } finally { btn.disabled = false; }
    });
    observer();
  }

  /* ============================================================
     PAGE PRODUIT
     ============================================================ */
  if (page === "produit") {
    const P = S.produit;
    const q = new URLSearchParams(location.search);
    let coloris = S.coloris.find((c) => c.id === q.get("coloris")) || S.coloris[1];
    let offre = S.offres[S.offres.length - 1]; // le pack est présélectionné
    let lignes = []; // [{coloris, taille}]

    track("ViewContent", { content_name: P.nom, value: P.prix, currency: "MAD" });

    // Textes dynamiques
    $$("[data-prix]").forEach((el) => (el.textContent = mad(prixBase)));
    if (enLancement) {
      $$("[data-prix-normal]").forEach((el) => { el.textContent = mad(L.prixNormal); el.hidden = false; });
      $("#lancement").hidden = false;
      $("[data-lancement-pct]").textContent = "−" + Math.round((1 - L.prixLancement / L.prixNormal) * 100) + " %";
    }
    $$("[data-serie]").forEach((el) => (el.textContent = S.serieParColoris));
    $("#details-liste").innerHTML = P.details.map((d) => `<li>${d}</li>`).join("");

    // Galerie
    const principal = $(".visuel-principal");
    const vignettes = $(".vignettes");
    function rendreGalerie() {
      $$(".visuel-principal > :not(.badge-serie)").forEach((n) => n.remove());
      vignettes.innerHTML = "";
      const sources = [];
      coloris.photos.forEach((src) => sources.push({ src, c: coloris }));
      sources.forEach((s, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `Voir ${s.c.nom}`);
        b.appendChild(visuel(s.src, s.c));
        b.onclick = () => {
          $$("button", vignettes).forEach((x) => x.classList.remove("actif"));
          b.classList.add("actif");
          $$(".visuel-principal > :not(.badge-serie)").forEach((n) => n.remove());
          principal.appendChild(visuel(s.src, s.c));
        };
        if (i === 0) { b.classList.add("actif"); principal.appendChild(visuel(s.src, s.c)); }
        vignettes.appendChild(b);
      });
    }

    // Choix du coloris (galerie)
    const pastilles = $("#coloris");
    function rendreColoris() {
      pastilles.innerHTML = "";
      S.coloris.forEach((c) => {
        const b = document.createElement("button");
        b.type = "button";
        b.title = c.nom;
        b.setAttribute("aria-label", c.nom);
        b.style.background = pastille(c);
        if (c === coloris) b.classList.add("actif");
        b.onclick = () => {
          coloris = c;
          history.replaceState(null, "", `?coloris=${c.id}`);
          rendreColoris();
          rendreGalerie();
          if (lignes[0]) { lignes[0].coloris = c.id; rendreLignes(); }
        };
        pastilles.appendChild(b);
      });
      $("#nom-coloris").textContent = coloris.nom;
      $("#phrase-coloris").textContent = coloris.phrase;
    }

    // Offres
    const blocOffres = $("#offres");
    function rendreOffres() {
      blocOffres.innerHTML = "";
      S.offres.forEach((o) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "offre" + (o === offre ? " actif" : "");
        b.innerHTML = `
          ${o.badge ? `<span class="ruban">${o.badge}</span>` : ""}
          <span class="radio"></span>
          <span><b>${o.label}</b><small>${o.note}</small></span>
          <span class="p">${o.ancien ? `<s>${mad(o.ancien)}</s>` : ""}${mad(o.prix)}</span>`;
        b.onclick = () => { offre = o; rendreOffres(); ajusterLignes(); };
        blocOffres.appendChild(b);
      });
    }

    // Une ligne coloris + taille par polo du pack
    // Une ligne coloris + taille par polo. Quand le nombre de polos change,
    // chaque polo reçoit automatiquement un coloris différent (tailles conservées).
    function ajusterLignes() {
      const ordre = [coloris.id, ...S.coloris.map((c) => c.id).filter((id) => id !== coloris.id)];
      const tailles = lignes.map((l) => l.taille);
      lignes = Array.from({ length: offre.qte }, (_, i) => ({ coloris: ordre[i % ordre.length], taille: tailles[i] ?? tailles[0] ?? "" }));
      lignes.forEach((l) => { if (epuise(l.coloris, l.taille)) l.taille = ""; });
      rendreLignes();
      majTotal();
    }
    // Retirer un polo du pack : l'offre passe automatiquement à la quantité inférieure
    function retirerPolo(i) {
      if (lignes.length <= 1) return;
      lignes.splice(i, 1);
      offre = S.offres.find((o) => o.qte === lignes.length);
      rendreOffres();
      rendreLignes();
      majTotal();
    }
    const blocLignes = $("#lignes");
    // Stock : une taille à 0 n'est plus commandable ; en dessous de 6, on affiche ce qu'il reste
    let stockBas = [];
    const reste = (coloris, taille) => stockBas.find((x) => x.coloris === coloris && x.taille === taille)?.reste;
    const epuise = (coloris, taille) => reste(coloris, taille) === 0;
    if (S.api) fetch(`${S.api.url}/rest/v1/rpc/diwan_stock_public`, { method: "POST", headers: { apikey: S.api.cle, Authorization: `Bearer ${S.api.cle}`, "Content-Type": "application/json" }, body: "{}" })
      .then((r) => (r.ok ? r.json() : []))
      .then((liste) => { stockBas = Array.isArray(liste) ? liste : []; lignes.forEach((l) => { if (epuise(l.coloris, l.taille)) l.taille = ""; }); rendreLignes(); })
      .catch(() => {});

    function rendreLignes() {
      blocLignes.innerHTML = "";
      lignes.forEach((l, i) => {
        const div = document.createElement("div");
        div.className = "ligne-article" + (!l.taille && !$("#err-taille").hidden ? " manque" : "");
        const r = l.taille ? reste(l.coloris, l.taille) : undefined;
        div.innerHTML = `
          <div class="num"><span>${offre.qte > 1 ? "Polo " + (i + 1) : "Votre polo"} · <b>${S.coloris.find((c) => c.id === l.coloris).court}</b>${l.taille ? " · " + l.taille : ""}${r > 0 ? `<em class="reste">Plus que ${r}</em>` : ""}</span>${lignes.length > 1 ? `<button type="button" class="retirer" data-retirer aria-label="Retirer le polo ${i + 1}">Retirer</button>` : ""}</div>
          <div class="mini-coloris">${S.coloris.map((c) => `<button type="button" data-c="${c.id}" title="${c.nom}" aria-label="${c.nom}" class="${l.coloris === c.id ? "actif" : ""}" style="background:${pastille(c)}"></button>`).join("")}</div>
          <div class="mini-tailles">${S.tailles.map((t) => `<button type="button" data-t="${t}" class="${l.taille === t ? "actif" : ""}" ${epuise(l.coloris, t) ? 'disabled title="Épuisé"' : ""}>${t}</button>`).join("")}</div>`;
        $$("[data-c]", div).forEach((b) => (b.onclick = () => { l.coloris = b.dataset.c; if (epuise(l.coloris, l.taille)) l.taille = ""; rendreLignes(); }));
        const r2 = $("[data-retirer]", div);
        if (r2) r2.onclick = () => retirerPolo(i);
        $$("[data-t]", div).forEach((b) => (b.onclick = () => { l.taille = b.dataset.t; if (i === 0) lignes.forEach((x) => !x.taille && !epuise(x.coloris, b.dataset.t) && (x.taille = b.dataset.t)); rendreLignes(); if (lignes.every((x) => x.taille)) $("#err-taille").hidden = true; }));
        blocLignes.appendChild(div);
      });
    }

    function total() { return offre.prix + fraisDuJour(offre.qte); }
    function majTotal() {
      $("#total").textContent = mad(total());
      $("#total-detail").textContent = fraisDuJour(offre.qte) ? `dont ${S.fraisLivraison} MAD de livraison` : "Livraison offerte";
      $$("[data-cta-prix]").forEach((el) => (el.textContent = mad(total())));
      $$("[data-cta-verbe]").forEach((el) => (el.textContent = "Commander maintenant"));
      $$("[data-prix-barre]").forEach((el) => (el.textContent = offre.ancien ? mad(offre.ancien) : ""));
      $("#barre-offre").textContent = offre.label;
    }

    // Villes

    // Formulaire & leads
    const form = $("#commande");
    const leadId = "D" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
    const telOk = (t) => /^(?:\+212|00212|0)?[5-7]\d{8}$/.test(t.replace(/[\s.\-()]/g, ""));
    // Message adapté : vide, chiffres manquants, en trop, ou mauvais début
    function messageTel(t) {
      const d = t.replace(/\D/g, "").replace(/^00212|^212/, "0");
      if (!d) return "Indiquez votre numéro de téléphone.";
      const local = d.startsWith("0") ? d : "0" + d;
      if (!/^0[5-7]/.test(local)) return "Le numéro doit commencer par 05, 06 ou 07.";
      if (local.length < 10) { const n = 10 - local.length; return `Numéro incomplet : il manque ${n} chiffre${n > 1 ? "s" : ""} (10 chiffres, ex : 06 12 34 56 78).`; }
      if (local.length > 10) return "Numéro trop long : il doit faire 10 chiffres (ex : 06 12 34 56 78).";
      return "Numéro invalide (ex : 06 12 34 56 78).";
    }
    // Les erreurs disparaissent dès que le client corrige
    ["nom", "telephone", "ville", "adresse"].forEach((n) => form[n].addEventListener("input", () => {
      const c = form[n].closest(".champ");
      if (!c.classList.contains("erreur")) return;
      const ok = n === "telephone" ? telOk(form[n].value) : n === "nom" ? form[n].value.trim().length >= 3 : n === "adresse" ? form[n].value.trim().length >= 5 : form[n].value.trim().length >= 2;
      if (n === "telephone" && !ok) $(".msg", c).textContent = messageTel(form[n].value);
      c.classList.toggle("erreur", !ok);
    }));
    const telNorm = (t) => { const d = t.replace(/[^\d]/g, "").replace(/^00212|^212/, ""); return "0" + d.replace(/^0/, ""); };

    function donnees(statut) {
      return {
        id: leadId,
        date: new Date().toLocaleString("fr-FR"),
        statut,
        nom: form.nom.value.trim(),
        telephone: telNorm(form.telephone.value),
        ville: form.ville.value.trim(),
        adresse: form.adresse.value.trim(),
        offre: offre.label,
        quantite: offre.qte,
        articles: lignes.map((l) => `${S.coloris.find((c) => c.id === l.coloris).court} / ${l.taille || "?"}`).join(" + "),
        liste: lignes.map((l) => ({ coloris: l.coloris, taille: l.taille })),
        total: total(),
        club: form.club.checked ? "oui" : "non",
        source: Object.entries(store.get("diwan_utm", {})).map(([k, v]) => `${k}=${v}`).join("&"),
        page: location.href,
      };
    }
    // Envoie la commande à la base. Renvoie true si elle est bien enregistrée.
    async function envoyer(d) {
      if (!S.api) { console.info("[DIWAN] Commande (mode test) :", d); return true; }
      try {
        const r = await fetch(`${S.api.url}/rest/v1/rpc/diwan_commander`, {
          method: "POST",
          headers: { apikey: S.api.cle, Authorization: `Bearer ${S.api.cle}`, "Content-Type": "application/json" },
          body: JSON.stringify({ p: { id: d.id, statut: d.statut, nom: d.nom, telephone: d.telephone, ville: d.ville, adresse: d.adresse, offre: d.offre, quantite: d.quantite, articles: d.liste, club: d.club === "oui", source: d.source } }),
        });
        return r.ok;
      } catch { return false; }
    }

    // Lead partiel : dès qu'un numéro valide est saisi (relance des commandes abandonnées)
    let partielEnvoye = false, commence = false;
    form.telephone.addEventListener("blur", () => {
      if (!partielEnvoye && telOk(form.telephone.value)) { partielEnvoye = true; envoyer(donnees("partiel")); }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;
      const erreur = (name, cond) => { const c = form[name].closest(".champ"); c.classList.toggle("erreur", !cond); if (!cond) ok = false; };
      erreur("nom", form.nom.value.trim().length >= 3);
      erreur("telephone", telOk(form.telephone.value));
      if (!telOk(form.telephone.value)) $(".msg", form.telephone.closest(".champ")).textContent = messageTel(form.telephone.value);
      erreur("ville", form.ville.value.trim().length >= 2);
      erreur("adresse", form.adresse.value.trim().length >= 5);
      const taillesOk = lignes.every((l) => l.taille);
      const manquants = lignes.map((l, i) => (l.taille ? null : i + 1)).filter(Boolean);
      $("#err-taille").textContent = lignes.length > 1
        ? `Choisissez la taille du polo ${manquants.join(" et du polo ")}.`
        : "Choisissez votre taille.";
      $("#err-taille").hidden = taillesOk;
      $$(".ligne-article").forEach((el, i) => el.classList.toggle("manque", !lignes[i].taille));
      if (!taillesOk) ok = false;
      if (!ok) {
        const premier = !taillesOk ? $(".ligne-article.manque") || $("#lignes") : $(".champ.erreur");
        premier && premier.scrollIntoView({ behavior: "smooth", block: "center" });
        if (premier && premier.querySelector("input, select")) premier.querySelector("input, select").focus();
        return;
      }
      const btn = $("#btn-commander");
      btn.disabled = true;
      $(".btn-txt", btn).textContent = "Envoi en cours…";
      const d = donnees("nouvelle");
      if (!(await envoyer(d))) {
        // La commande n'est pas partie : on propose WhatsApp plutôt que de la perdre
        btn.disabled = false;
        $(".btn-txt", btn).textContent = "Réessayer · " + mad(total());
        const msg = `Bonjour DIWAN, je souhaite commander : ${d.articles}, ${mad(d.total)}. ${d.nom}, ${d.ville}, ${d.adresse}. Tél : ${d.telephone}`;
        const e = $("#err-envoi");
        e.hidden = false;
        $("a", e).href = `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}`;
        return;
      }
      track("Purchase", { value: d.total, currency: "MAD", num_items: d.quantite, content_ids: d.liste.map((l) => l.coloris), content_type: "product" });
      try { sessionStorage.setItem("diwan_derniere", JSON.stringify(d)); } catch {}
      location.href = "merci.html";
    });

    // Guide des tailles
    const g = S.guideTailles;
    $("#tableau-tailles").innerHTML = `<thead><tr>${g.colonnes.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${g.lignes.map((l) => `<tr>${l.map((x) => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody>`;
    const dlg = $("#dlg-tailles");
    $$("[data-guide]").forEach((b) => (b.onclick = () => dlg.showModal()));
    $(".fermer", dlg).onclick = () => dlg.close();
    dlg.addEventListener("click", (e) => e.target === dlg && dlg.close());

    // Avis réels uniquement
    if (S.avis.length) {
      $("#avis").hidden = false;
      $("#avis-grille").innerHTML = S.avis.map((a) => `
        <div class="avis-carte revele"><div class="etoiles">${"★".repeat(a.note)}</div><p>« ${a.texte} »</p><small>${a.nom}${a.coloris ? " · " + a.coloris : ""}</small></div>`).join("");
    }

    // Boutons « Commander » → remontent au formulaire
    // La commande se passe dans une fenêtre : offre et tailles déjà choisies, il reste les coordonnées
    const dlgC = $("#dlg-commande");
    $$("[data-vers-commande]").forEach((b) => (b.onclick = (e) => {
      e.preventDefault();
      dlgC.showModal();
      dlgC.scrollTop = 0;
      track("InitiateCheckout", { value: total(), currency: "MAD" });
    }));
    $(".fermer", dlgC).onclick = () => dlgC.close();
    dlgC.addEventListener("click", (e) => e.target === dlgC && dlgC.close());

    // Barre d'achat : toujours en bas de l'écran, sur téléphone comme sur ordinateur
    $(".barre-collante").classList.add("visible");

    rendreColoris();
    rendreGalerie();
    rendreOffres();
    ajusterLignes();
    observer();
  }

  /* ============================================================
     MERCI
     ============================================================ */
  if (page === "merci") {
    let d = null;
    try { d = JSON.parse(sessionStorage.getItem("diwan_derniere")); } catch {}
    if (d) {
      $("#prenom").textContent = d.nom.split(" ")[0];
      $("#recap").innerHTML = [
        ["Commande", d.id], ["Articles", d.articles], ["Livraison", `${d.ville} · ${d.adresse}`], ["Téléphone", d.telephone], ["À payer à la livraison", mad(d.total)],
      ].map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join("");
      if (d.club === "oui") $("#club-merci").hidden = false;
      // Message détaillé : chaque polo, total, adresse (sans lien)
      const polos = (d.liste || []).map((l) => `• ${S.produit.nom}, ${S.coloris.find((c) => c.id === l.coloris)?.court || l.coloris}, taille ${l.taille}`);
      const msg = [
        `Bonjour DIWAN, je confirme ma commande n° ${d.id} :`, "",
        ...(polos.length ? polos : [`• ${d.articles}`]), "",
        `Total : ${mad(d.total)}, payé à la livraison`,
        `Nom : ${d.nom}`, `Téléphone : ${d.telephone}`, `Adresse : ${d.adresse}, ${d.ville}`,
        ...(d.club === "oui" ? ["Membre du Club DIWAN"] : []),
      ].join("\n");
      $("#wa-confirmer").href = `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}`;
    } else {
      $("#recap").remove();
      $("#prenom-v").remove();
    }
  }
})();
