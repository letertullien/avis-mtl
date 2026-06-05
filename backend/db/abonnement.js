import mongoose from "mongoose";

// Schéma d'un abonnement push
const abonnementSchema = new mongoose.Schema({
  endpoint:  { type: String, required: true, unique: true },  // URL unique de l'appareil
  keys: {
    p256dh:  { type: String, required: true },                 // Clé publique de chiffrement
    auth:    { type: String, required: true },                 // Clé d'authentification
  },
  createdAt: { type: Date, default: Date.now },                // Date d'abonnement
});

const Abonnement = mongoose.model("Abonnement", abonnementSchema);

export default Abonnement;