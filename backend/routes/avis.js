import express from "express";

const router = express.Router();

// GET /avis-alertes — Récupère les avis depuis l'API de la Ville
router.get("/avis-alertes", async (req, res) => {

  try {
    // Appel à l'API de la Ville de Montréal
    const reponse = await fetch("https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=fc6e5f85-7eba-451c-8243-bdf35c2ab336&limit=100");
    const donnees = await reponse.json();

    // On vérifie que la réponse est valide
    if (!donnees.success || !donnees.result) {
      return res.status(500).json({ error: "Erreur API", message: "Structure inattendue" });
    }

    const avis = donnees.result.records;
    res.json({ data: avis });

  } catch (erreur) {
    res.status(500).json({ error: "Erreur serveur", message: erreur.message });
  }

});

export default router;