import { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./CarteAlerteDetail.module.css";



// ── Correction du bug d'icône Leaflet avec Vite 
delete L.Icon.Default.prototype._getIconUrl; 
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});




function CarteAlerteDetail({ geometrie, titre }) {

  //  Validation des coordonnées  
  function coordonneesValides(coords) {
        if (!coords || coords.length === 0) return false;             // Retourner faux si coord === 0 

    
        if (typeof coords[0] === "number") { 
          return coords[0] !== 0 && coords[1] !== 0;                 // retourner les coords du lieu si elles sont !==0
        }

        return coords[0][0] !== 0 && coords[0][1] !== 0;             // Pour un LineString : coords = [[lng, lat], [lng, lat], ...]
  }

  
  if (!geometrie || !coordonneesValides(geometrie.coordinates)) {   // Erreur si pas de géométrie ou coordonnées 
    return (
      <p className={styles.sansLocalisation}>
        Aucune localisation disponible pour cette alerte.
      </p>
    );
  }

 
  // GeoJSON utilise [longitude, latitude] mais Leaflet attend [latitude, longitude]
  function inverser(coord) {
    return [coord[1], coord[0]];
  }

  // ── Calcul du centre de la carte ──────────────────────────────────────────
 
  function calculerCentre() {
    if (geometrie.type === "Point") {
      return inverser(geometrie.coordinates);
    }
    const milieu = Math.floor(geometrie.coordinates.length / 2);
    return inverser(geometrie.coordinates[milieu]);
  }

  const centre = calculerCentre();

  return (
    <div className={styles.conteneurCarte}>
      <MapContainer
        center={centre}
        zoom={16}
        className={styles.carte}
        scrollWheelZoom={false} // désactive le zoom avec la molette pour éviter les accidents
      >
        {/* Tuiles OpenStreetMap — gratuites, pas de clé API requise */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Point : affiche un marqueur à la position exacte de l'alerte */}
        {geometrie.type === "Point" && (
          <Marker position={centre}>
            <Popup>{titre}</Popup>
          </Marker>
        )}

        {/* LineString : affiche un tracé coloré sur la rue concernée */}
        {geometrie.type === "LineString" && (
          <Polyline
            positions={geometrie.coordinates.map(inverser)}
            color="#fe0217"
            weight={10}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default CarteAlerteDetail;































// ── Correction du bug d'icône Leaflet avec Vite ───────────────────────────
// Par défaut Leaflet cherche ses icônes via une URL interne qui ne fonctionne
// pas avec Vite (les assets sont renommés au build). On supprime la méthode
// problématique et on pointe directement vers les icônes CDN unpkg.