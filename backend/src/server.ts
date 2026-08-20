import app from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(env.PORT, () => {
      console.log("");
      console.log("=================================");
      console.log("Advanced CRM Backend");
      console.log("=================================");
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log(`Server: http://localhost:${env.PORT}`);
      console.log(`Health: http://localhost:${env.PORT}/health`);
      console.log("=================================");
      console.log("");
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    process.exit(1);
  }
};

void startServer();