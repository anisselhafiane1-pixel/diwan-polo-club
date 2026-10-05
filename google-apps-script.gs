/**
 * DIWAN POLO CLUB — réception des commandes dans Google Sheets
 *
 * Installation (5 minutes) :
 * 1. Créer un Google Sheet nommé « DIWAN — Commandes ».
 * 2. Menu Extensions > Apps Script, coller ce fichier, enregistrer.
 * 3. Déployer > Nouveau déploiement > Type « Application Web »
 *      Exécuter en tant que : Moi
 *      Qui a accès : Tout le monde
 * 4. Copier l'URL obtenue (…/exec) dans js/config.js → leadsEndpoint.
 *
 * Chaque commande devient une ligne. Un lead « partiel » (numéro saisi mais
 * commande non validée) est mis à jour en « nouvelle » s'il finit par commander :
 * les partiels restants sont à rappeler (paniers abandonnés).
 */
const COLONNES = ["id", "date", "statut", "nom", "telephone", "ville", "adresse", "offre", "quantite", "articles", "total", "source", "page", "suivi"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const sheet = feuille_();
    const ids = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).getValues().flat();
    const ligne = COLONNES.map((c) => (c === "suivi" ? "" : d[c] ?? ""));
    const i = ids.indexOf(d.id);
    if (i >= 0) {
      // Ne jamais rétrograder une commande validée en « partiel »
      const statutActuel = sheet.getRange(i + 2, 3).getValue();
      if (d.statut === "partiel" && statutActuel !== "partiel") return ok_();
      sheet.getRange(i + 2, 1, 1, COLONNES.length - 1).setValues([ligne.slice(0, -1)]);
    } else {
      sheet.appendRow(ligne);
    }
    if (d.statut === "nouvelle") sheet.getRange(i >= 0 ? i + 2 : sheet.getLastRow(), 1, 1, COLONNES.length).setBackground("#fff7e0");
    return ok_();
  } finally {
    lock.releaseLock();
  }
}

function feuille_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName("Commandes");
  if (!sh) {
    sh = ss.insertSheet("Commandes");
    sh.appendRow(COLONNES);
    sh.getRange(1, 1, 1, COLONNES.length).setFontWeight("bold").setBackground("#0d0c0a").setFontColor("#f4efe6");
    sh.setFrozenRows(1);
  }
  return sh;
}

function ok_() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
