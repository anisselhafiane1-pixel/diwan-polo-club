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
      `Série limitée à ${S.serieParColoris} pièces par coloris`,
      "Confectionné au Maroc",
      "Coton piqué 320 g/m²",
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
          <span class="carte-tag">${S.serieParColoris} pièces</span>
          <span class="carte-voir">Découvrir</span>
        </div>
        <div class="carte-info">
          <div><h3>${c.nom}</h3><small>${c.phrase}</small></div>
          <span class="carte-prix">${mad(S.produit.prix)}</span>
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
    $$("[data-prix]").forEach((el) => (el.textContent = mad(P.prix)));
    $$("[data-serie]").forEach((el) => (el.textContent = S.serieParColoris));
    $$("[data-echange]").forEach((el) => (el.textContent = S.echangeJours));
    $("#details-liste").innerHTML = P.details.map((d) => `<li>${d}</li>`).join("");

    // Galerie
    const principal = $(".visuel-principal");
    const vignettes = $(".vignettes");
    function rendreGalerie() {
      $$(".visuel-principal > :not(.badge-serie)").forEach((n) => n.remove());
      vignettes.innerHTML = "";
      const sources = [];
      coloris.photos.forEach((src) => sources.push({ src, c: coloris }));
      S.coloris.filter((c) => c !== coloris).forEach((c) => sources.push({ src: c.photos[0], c }));
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
        b.style.background = `linear-gradient(135deg, ${c.principal} 50%, ${c.accent} 50%)`;
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
    function ajusterLignes() {
      const ordre = [coloris.id, ...S.coloris.map((c) => c.id).filter((id) => id !== coloris.id)];
      while (lignes.length < offre.qte) {
        const deja = lignes.map((l) => l.coloris);
        const libre = ordre.find((id) => !deja.includes(id)) || coloris.id;
        lignes.push({ coloris: libre, taille: lignes[0]?.taille || "" });
      }
      lignes = lignes.slice(0, offre.qte);
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
        div.className = "ligne-article";
        const r = l.taille ? reste(l.coloris, l.taille) : undefined;
        div.innerHTML = `
          <span class="num">${offre.qte > 1 ? "Polo " + (i + 1) : "Votre polo"}${r > 0 ? `<em class="reste">Plus que ${r} en ${l.taille}</em>` : ""}</span>
          <div class="mini-coloris">${S.coloris.map((c) => `<button type="button" data-c="${c.id}" title="${c.nom}" aria-label="${c.nom}" class="${l.coloris === c.id ? "actif" : ""}" style="background:linear-gradient(135deg, ${c.principal} 50%, ${c.accent} 50%)"></button>`).join("")}</div>
          <div class="mini-tailles">${S.tailles.map((t) => `<button type="button" data-t="${t}" class="${l.taille === t ? "actif" : ""}" ${epuise(l.coloris, t) ? 'disabled title="Épuisé"' : ""}>${t}</button>`).join("")}</div>`;
        $$("[data-c]", div).forEach((b) => (b.onclick = () => { l.coloris = b.dataset.c; if (epuise(l.coloris, l.taille)) l.taille = ""; rendreLignes(); }));
        $$("[data-t]", div).forEach((b) => (b.onclick = () => { l.taille = b.dataset.t; if (i === 0) lignes.forEach((x) => !x.taille && !epuise(x.coloris, b.dataset.t) && (x.taille = b.dataset.t)); rendreLignes(); $("#err-taille").hidden = true; }));
        blocLignes.appendChild(div);
      });
    }

    function total() { return offre.prix + (offre.qte === 1 ? S.fraisLivraison : 0); }
    function majTotal() {
      $("#total").textContent = mad(total());
      $("#total-detail").textContent = offre.qte === 1 ? `dont ${S.fraisLivraison} MAD de livraison` : "Livraison offerte";
      $$("[data-cta-prix]").forEach((el) => (el.textContent = mad(total())));
      $("#barre-offre").textContent = offre.label;
    }

    // Villes
    $("#ville").innerHTML = `<option value="">Choisir votre ville</option>` + S.villes.map((v) => `<option>${v}</option>`).join("");

    // Formulaire & leads
    const form = $("#commande");
    const leadId = "D" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
    const telOk = (t) => /^(?:\+212|00212|0)?[5-7]\d{8}$/.test(t.replace(/[\s.\-()]/g, ""));
    const telNorm = (t) => { const d = t.replace(/[^\d]/g, "").replace(/^00212|^212/, ""); return "0" + d.replace(/^0/, ""); };

    function donnees(statut) {
      return {
        id: leadId,
        date: new Date().toLocaleString("fr-FR"),
        statut,
        nom: form.nom.value.trim(),
        telephone: telNorm(form.telephone.value),
        ville: form.ville.value,
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
    form.addEventListener("focusin", () => { if (!commence) { commence = true; track("InitiateCheckout", { value: total(), currency: "MAD" }); } });
    form.telephone.addEventListener("blur", () => {
      if (!partielEnvoye && telOk(form.telephone.value)) { partielEnvoye = true; envoyer(donnees("partiel")); }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;
      const erreur = (name, cond) => { const c = form[name].closest(".champ"); c.classList.toggle("erreur", !cond); if (!cond) ok = false; };
      erreur("nom", form.nom.value.trim().length >= 3);
      erreur("telephone", telOk(form.telephone.value));
      erreur("ville", !!form.ville.value);
      erreur("adresse", form.adresse.value.trim().length >= 5);
      const taillesOk = lignes.every((l) => l.taille);
      $("#err-taille").hidden = taillesOk;
      if (!taillesOk) ok = false;
      if (!ok) {
        const premier = !taillesOk ? $("#lignes") : $(".champ.erreur");
        premier && premier.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      const btn = $("#btn-commander");
      btn.disabled = true;
      $(".btn-txt", btn).textContent = "Envoi en cours…";
      const d = donnees("nouvelle");
      if (!(await envoyer(d))) {
        // La commande n'est pas partie : on propose WhatsApp plutôt que de la perdre
        btn.disabled = false;
        $(".btn-txt", btn).textContent = "Réessayer";
        const msg = `Bonjour DIWAN, je souhaite commander : ${d.articles} — ${mad(d.total)}. ${d.nom}, ${d.ville}, ${d.adresse}. Tél : ${d.telephone}`;
        const e = $("#err-envoi");
        e.hidden = false;
        $("a", e).href = `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}`;
        return;
      }
      track("Lead", { value: d.total, currency: "MAD" });
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
    $$("[data-vers-commande]").forEach((b) => (b.onclick = (e) => { e.preventDefault(); $("#achat").scrollIntoView({ behavior: "smooth" }); }));

    // Barre collante mobile : visible quand le formulaire n'est pas à l'écran
    const barre = $(".barre-collante");
    new IntersectionObserver(([e]) => barre.classList.toggle("visible", !e.isIntersecting && scrollY > 400)).observe(form);

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
      const msg = `Bonjour DIWAN, je confirme ma commande ${d.id} : ${d.articles} — ${mad(d.total)}. Nom : ${d.nom}, ${d.ville}.`;
      $("#wa-confirmer").href = `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}`;
    } else {
      $("#recap").remove();
      $("#prenom-v").remove();
    }
  }
})();
