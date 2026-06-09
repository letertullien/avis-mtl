import mongoose from "mongoose";

// Schéma d'une notification envoyée
const notificationSchema = new mongoose.Schema({
  title:           { type: String, required: true },   // Titre de la notification
  body:            { type: String, required: true },   // Corps de la notification
  url:             { type: String, default: "/" },     // URL de destination
  sentAt:          { type: Date, default: Date.now },  // Date d'envoi
  recipientsCount: { type: Number, default: 0 },       // Nombre total d'abonnés
  successCount:    { type: Number, default: 0 },       // Envois réussis
  failureCount:    { type: Number, default: 0 },       // Envois échoués
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;