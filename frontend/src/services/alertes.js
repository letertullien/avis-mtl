import { extraireArrondissement } from "./listes";

const API_URL      = "https://avis-mtl-backend.onrender.com";                              // Ton backend Express
const GEOJSON_URL  = "https://donnees.montreal.ca/dataset/556c84af-aebf-4ca9-9a9c-2f246601674c/resource/d249e452-46f5-422f-91ae-898c98eea6cc/download/avis-alertes.geojson";

// ── Conversion d'un enregistrement brut vers le modèle interne  
function mapperAlerte(enreg) {
      return {
            id:             String(enreg._id),
            titre:          enreg.titre ?? "",
            arrondissement: extraireArrondissement(enreg.titre ?? ""),
            sujet:          enreg.type ?? "Autre",
            dateEmission:   enreg.date_debut ? enreg.date_debut.slice(0, 10) : "",
            dateFin:        enreg.date_fin   ? enreg.date_fin.slice(0, 10)   : "",
            lien:           enreg.lien ?? "",
      };
}

// Récupérer une page d'alertes
export async function getAlertes(offset = 0, limite = 10) {

      const reponse = await fetch(`${API_URL}/avis-alertes`);
      if (!reponse.ok) {
        throw new Error(`Erreur API : ${reponse.status} ${reponse.statusText}`);
      }

      const json    = await reponse.json();
      const tous    = json.data;                                           // le backend retourne { data: [...] }

      // Pagination côté frontend
      const tranche = tous.slice(offset, offset + limite);
      const total   = tous.length;

      const alertes = tranche.map(mapperAlerte);
      return { alertes, total };
}

// Récupérer une seule alerte par son identifiant
export async function getAlerteById(id) {

      const reponse = await fetch(`${API_URL}/avis-alertes`);
      if (!reponse.ok) {
        throw new Error(`Erreur API : ${reponse.status} ${reponse.statusText}`);
      }

      const json  = await reponse.json();
      const enreg = json.data.find((a) => String(a._id) === String(id));  // Cherche par id dans la liste

      if (!enreg) return null;

      return mapperAlerte(enreg);
}

// Récupérer la géométrie d'une alerte depuis le GeoJSON
export async function getGeometrieByTitre(titre) {

      const reponse = await fetch(GEOJSON_URL);
      if (!reponse.ok) {
        throw new Error(`Erreur GeoJSON : ${reponse.status} ${reponse.statusText}`);
      }

      const geojson = await reponse.json();
      const feature = geojson.features.find(
        (f) => f.properties.titre === titre
      );

      if (!feature) return null;
      return feature.geometry;
}