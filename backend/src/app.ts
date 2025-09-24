import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import { apiLimiter } from "./middleware/rateLimit";
import { config } from "./config/env";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import articleRoutes from "./routes/articles";
import commentRoutes from "./routes/comments";

export async function createApp() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB:", config.mongoUri);
  } catch (err) {
    console.error(" Failed to connect to MongoDB:", err);
    process.exit(1);
  }

  const app = express();

  app.set("trust proxy", 1);
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(helmet({ crossOriginResourcePolicy: false }));

  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api/articles")) {
      const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
      const payload = isWrite ? { body: req.body } : { query: req.query, params: req.params };
      console.log(`[${req.method}] ${req.path}`, payload);
    }
    next();
  });

  app.use("/api", apiLimiter);

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/articles", articleRoutes);
  app.use("/api/comments", commentRoutes);

  app.use("/api/*", (_req, res) => res.status(404).json({ error: "Not found" }));

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err?.name === "CastError") {
      return res.status(400).json({ error: "Invalid identifier", field: err.path });
    }
    if (err?.name === "ValidationError") {
      return res.status(400).json({ error: "ValidationError", details: err.errors });
    }
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
