import express    from "express";
import Abonnement from "../db/abonnement.js";
import Notification from "../db/notification.js";
import webpush    from "../utils/webpush.js";

const router = express.Router();

// POST /send-notification — Envoie une notification à tous les abonnés
router.post("/send-notification", async (req, res) => {
  const { title, body, url } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "Données manquantes", message: "title et body requis" });
  }

  try {
    const abonnements = await Abonnement.find();

    if (abonnements.length === 0) {
      return res.status(404).json({ error: "Aucun abonné", message: "Aucun abonnement trouvé" });
    }

    const contenu = JSON.stringify({
      title,
      body,
      url: url || "/",
    });

    let succes  = 0;
    let echecs  = 0;

    for (const abonnement of abonnements) {
      const subscription = {
        endpoint: abonnement.endpoint,
        keys: {
          p256dh: abonnement.keys.p256dh,
          auth:   abonnement.keys.auth,
        },
      };

      try {
        await webpush.sendNotification(subscription, contenu);
        succes++;

      } catch (erreur) {
        if (erreur.statusCode === 410 || erreur.statusCode === 404) {
          await Abonnement.findOneAndDelete({ endpoint: abonnement.endpoint });
        }
        echecs++;
      }
    }

    // Sauvegarde l'historique de la notification dans MongoDB
    await Notification.create({
      title,
      body,
      recipientsCount: abonnements.length,
      successCount:    succes,
      failureCount:    echecs,
    });

    res.json({
      data: {
        message:         "Notifications envoyées",
        succes,
        echecs,
        total:           abonnements.length,
      },
    });

  } catch (erreur) {
    res.status(500).json({ error: "Erreur serveur", message: erreur.message });
  }
});

// GET /notifications — Retourne l'historique des notifications envoyées
router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ sentAt: -1 });  // Plus récentes en premier
    res.json({ data: notifications });
  } catch (erreur) {
    res.status(500).json({ error: "Erreur serveur", message: erreur.message });
  }
});

export default router;