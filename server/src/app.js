import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import catalogRoutes from "./routes/catalog.js";
import wardrobeRoutes from "./routes/wardrobe.js";
import outfitRoutes from "./routes/outfits.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

app.set("trust proxy", 1); // în spatele proxy-ului (Render/Railway) rate-limit vede IP-ul real
// imaginile din catalog sunt cerute de aplicație (alt origin pe web), deci CORP trebuie să fie cross-origin
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors()); // aplicația mobilă nu folosește cookie-uri, deci nu e nevoie de credentials
app.use(express.json({ limit: "100kb" }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

app.use("/catalog", express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), "../public/catalog"), { maxAge: "7d" }));
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/wardrobe", wardrobeRoutes);
app.use("/api/outfits", outfitRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
