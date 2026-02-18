import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import mediaRoutes from "./routes/media.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: false,
  }),
);

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/media", mediaRoutes);

const port = Number(process.env.PORT || 4000);

await connectDB(process.env.MONGODB_URI);
app.listen(port, () =>
  console.log(`✅ API running on http://localhost:${port}`),
);
