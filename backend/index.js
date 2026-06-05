import express        from "express";
import cors           from "cors";
import dotenv         from "dotenv";
import { connecterDB } from "./db/connexion.js";
import avisRoutes     from "./routes/avis.js";
import subRoutes      from "./routes/subscriptions.js";
import notifRoutes    from "./routes/notifications.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

// Middlewares
const originesAutorisees = process.env.FRONTEND_URL.split(",");
app.use(cors({
  origin: originesAutorisees
}));

app.use(express.json());

// Routes
app.use("/", avisRoutes);
app.use("/", subRoutes);
app.use("/", notifRoutes);

// Démarrage
connecterDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  });
});