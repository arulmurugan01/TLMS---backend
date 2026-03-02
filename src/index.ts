import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import routes from "./routes";
import { errorHandler, notFound } from "./middlewares/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware 
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// API Routes
app.use("/api", routes);

// Error Handlers 
app.use(notFound);
app.use(errorHandler);

// Database + Server Start
AppDataSource.initialize()
  .then(() => {
    console.log("MySQL database connected.");
    app.listen(PORT, () => {
      console.log(`TLMS Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });

export default app;
