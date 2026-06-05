import express      from "express";
import Abonnement   from "../db/abonnement.js";

const router = express.Router();

// GET /vapid-public-key — Retourne la clé publique VAPID au frontend
router.get("/vapid-public-key", (req, res) => {
  res.json({ data: process.env.VAPID_PUBLIC_KEY });
});

// POST /subscribe — Enregistre un nouvel abonnement push
router.post("/subscribe", async (req, res) => {
  const { subscription } = req.body;

  // Vérification que les données sont présentes
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({ error: "Données manquantes", message: "subscription invalide" });
  }

  try {
    // Vérifie si l'abonnement existe déjà
    const existant = await Abonnement.findOne({ endpoint: subscription.endpoint });

    if (existant) {
      return res.status(200).json({ data: "Abonnement déjà existant" });
    }

    // Crée le nouvel abonnement
    const nouvelAbonnement = new Abonnement({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth:   subscription.keys.auth,
      },
    });

    await nouvelAbonnement.save();
    res.status(201).json({ data: "Abonnement enregistré avec succès" });

  } catch (erreur) {
    res.status(500).json({ error: "Erreur serveur", message: erreur.message });
  }
});

// POST /unsubscribe — Supprime un abonnement push
router.post("/unsubscribe", async (req, res) => {
  const { endpoint } = req.body;

  if (!endpoint) {
    return res.status(400).json({ error: "Données manquantes", message: "endpoint requis" });
  }

  try {
    const supprime = await Abonnement.findOneAndDelete({ endpoint });

    if (!supprime) {
      return res.status(404).json({ error: "Introuvable", message: "Abonnement non trouvé" });
    }

    res.json({ data: "Désabonnement réussi" });

  } catch (erreur) {
    res.status(500).json({ error: "Erreur serveur", message: erreur.message });
  }
});

export default router;