import dotenv from "dotenv";

dotenv.config();

const requiredEnvironmentVariables = [
  "MONGODB_URI",
  "JWT_SECRET"
];

for (const variable of requiredEnvironmentVariables) {
  if (!process.env[variable]) {
    console.warn(
      `[WARNING] Environment variable ${variable} is missing: ${variable}`
    );
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT) || 5000,

  MONGODB_URI:
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/advanced_crm",

  CLIENT_URL:
    process.env.CLIENT_URL ||
    "http://localhost:3000",

  JWT_SECRET:
    process.env.JWT_SECRET || "development-secret-change-before-production"
};