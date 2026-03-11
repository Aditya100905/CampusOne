import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import logger from "./utils/logger.js";
import { dbConnect } from "./db/index.js";

let kafkaProducer = null;
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
  const mod = await import("./kafka/producer.js");
  kafkaProducer = mod.kafkaProducer;
}

const PORT = process.env.PORT;

const startServer = async () => {
  const { default: app } = await import("./app.js");

  try {
    await dbConnect();
    logger.info("📦 MongoDB connected");
    
    if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
      await kafkaProducer.connect();
      logger.info("📨 Kafka Producer connected");
    }

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    logger.error({ err: error }, "🔴 Startup failed");
    process.exit(1);
  }
};

startServer();
