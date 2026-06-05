 
export const ARRONDISSEMENTS = [
  "Ahuntsic-Cartierville",
  "Anjou",
  "Côte-des-Neiges–Notre-Dame-de-Grâce",
  "Lachine",
  "LaSalle",
  "Le Plateau-Mont-Royal",
  "Le Sud-Ouest",
  "Mercier–Hochelaga-Maisonneuve",
  "Montréal-Nord",
  "Outremont",
  "Pierrefonds-Roxboro",
  "Rivière-des-Prairies–Pointe-aux-Trembles",
  "Rosemont–La Petite-Patrie",
  "Saint-Laurent",
  "Saint-Léonard",
  "Verdun",
  "Ville-Marie",
  "Villeray–Saint-Michel–Parc-Extension",
];

// Normalisation pour la comparaison  
// Ils utilisent des tirets courts (-) et longs (–) de façon (ex: "Mercier-Hochelaga" vs "Mercier–Hochelaga")
function normaliserPourComparaison(texte) {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")               // off (é→e, è→e, etc.)
    .replace(/[–—]/g, "-")                         // –— par -
    .replace(/\s+/g, " ")                          // espaces multiples -> un seul
    .trim();
}

// ── Extraction de l'arrondissement depuis le titre ────────────────────────
 
export function extraireArrondissement(titre) {

  const titreNormalise = normaliserPourComparaison(titre);                       // titre api normalisé

  for (const arrondissement of ARRONDISSEMENTS) { 
    const arrNormalise = normaliserPourComparaison(arrondissement);              // titre liste normalisé
    if (titreNormalise.includes(arrNormalise)) {                                 // comparaison liste et api
      return arrondissement;                                                     // cherche dans le titre pour assigner
    }
  }

  // ── Passe 2 : Certains titres utilisent "arr." au lieu d'"arrondissement"
 
  const motifArr = /\barr\.\s+(?:du\s+|de\s+l['']|de\s+|d[''])?(.+)/i;
  const match = motifArr.exec(titre);
  if (match) {
    const candidatNormalise = normaliserPourComparaison(match[1].trim());         // match[0] = "arr. du Plateau-Mont-Royal" // correspondance complète match[1] = "Plateau-Mont-Royal"          // premier groupe capturé entre ( )
    for (const arrondissement of ARRONDISSEMENTS) {
      const arrNormalise = normaliserPourComparaison(arrondissement);
      if (candidatNormalise.includes(arrNormalise) || arrNormalise.includes(candidatNormalise)) {
        return arrondissement;
      }
    }
  }
  // (titre sans arrondissement, plusieurs arrondissements, sigle inconnu, etc.)
  return "Non spécifié";
}

// ── Récupérer les sujets depuis l'API ──────────────────────────

export async function getSujets() {
      const url =
        "https://donnees.montreal.ca/api/3/action/datastore_search_sql" +
        "?sql=SELECT%20DISTINCT%20type%20FROM%20%22fc6e5f85-7eba-451c-8243-bdf35c2ab336%22";

      const reponse = await fetch(url);

      if (!reponse.ok) {
           throw new Error(`Erreur API sujets : ${reponse.status} ${reponse.statusText}`);
      }

      const json = await reponse.json();

      if (!json.success) { // Penser à ajouter liste locale au cas ou
           throw new Error("L'API a retourné une erreur pour les sujets.");
      }

      return json.result.records.map((r) => r.type).sort(); // / Extrait "type" et trie alphabétiquement
}