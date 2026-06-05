import mongoose from "mongoose";

export async function connecterDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connecté");
  } catch (err) {
    console.error("Erreur MongoDB :", err.message);
    process.exit(1);
  }
}