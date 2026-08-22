import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { env } from "./config/env";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import customerRoutes from "./routes/customer.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import filterRoutes from "./routes/filter.routes";
import { ApiError } from "./utils/apiResponse";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

/*
|--------------------------------------------------------------------------
| Security Middleware
|--------------------------------------------------------------------------
*/

app.use(
  helmet()
);

app.use(
  cors({
    origin: "*", // 🚀 Sabhi frontends ko allow kar do taaki CORS error kabhi na aaye
    credentials: true
  })
);

/*
|--------------------------------------------------------------------------
| Rate Limiting
|--------------------------------------------------------------------------
*/

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

app.use("/api", apiLimiter);

/*
|--------------------------------------------------------------------------
| Body Parsers
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "1mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb"
  })
);

/*
|--------------------------------------------------------------------------
| Health Check & Routes
|--------------------------------------------------------------------------
*/

app.use("/health", healthRoutes);

app.use(
  "/api/v1/auth",
  authRoutes
);

app.use(
  "/api/v1/customers",
  customerRoutes
);

app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/filters", filterRoutes);

/*
|--------------------------------------------------------------------------
| API Root
|--------------------------------------------------------------------------
*/

app.get("/api/v1", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Advanced CRM API v1",
    version: "1.0.0"
  });
});

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/


app.get('/favicon.ico', (_req, res) => { res.status(204).end(); });

app.use((req, res, next) => {
  const error = new ApiError(404, `Route not found - ${req.originalUrl}`);
  next(error);
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

export default app;