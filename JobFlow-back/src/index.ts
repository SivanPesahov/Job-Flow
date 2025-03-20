import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import { connectDB } from "./config/db";
import { verifyToken } from "./middleware/auth.middleware";
import authRoutes from "./routes/auth.routes";
import jobRoutes from "./routes/job.routes";
import linkedinRoutes from "./routes/linkedin.routes";
import aiRoutes from "./routes/openai.routes";
import userRoutes from "./routes/user.routes";

const PORT = process.env.PORT || 3000;

const app = express();

async function main() {
  await connectDB();

  app.use(express.json());
  app.use(cors());
  app.use(express.static("public"));
  app.use("/api/auth", authRoutes);
  app.use("/api/user", verifyToken, userRoutes);
  app.use("/api/job", verifyToken, jobRoutes);
  app.use("/api/linkedin", linkedinRoutes);
  app.use("/api/openai", verifyToken, aiRoutes);

  app.get("*", (req, res) => {
    res.sendFile(
      path.join(path.resolve(__dirname, ".."), "public", "index.html")
    );
  });
  app.listen(PORT, () => {
    console.log(`index: Server listening on`, PORT);
  });
}

main();
