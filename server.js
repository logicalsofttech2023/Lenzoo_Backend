import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import path from "path";
import admin from "firebase-admin";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swaggerConfig.js";
import { expireOldPurchases } from "./cron/expirePurchases.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
connectDB();
expireOldPurchases();

// Make uploads folder publicly accessible
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/ColorTestImages", express.static(path.join(__dirname, "ColorTestImages")));

// Initialize Firebase
// const serviceAccount = path.join(__dirname, "perfect-jodi-firebase.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// app.get("/", (req, res) => {
//   res.send("✅ API is running...");
// });

// Routes
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

// sweger api
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

// Serve React frontend from root-level dist folder
app.use(express.static(path.join(__dirname, "/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});


// Start Server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
