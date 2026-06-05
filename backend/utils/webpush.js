import dotenv  from "dotenv";
import webpush from "web-push";

dotenv.config();                              // Charge le .env avant tout

// Configuration des clés VAPID pour les notifications push
webpush.setVapidDetails(
  process.env.VAPID_MAILTO,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default webpush;