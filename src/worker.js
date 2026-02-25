import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import logger from "./utils/logger.js";
import { dbConnect } from "./db/index.js";
import { startStudentConsumer } from "./kafka/studentConsumer.js";
import { startFacultyConsumer } from "./kafka/facultyConsumer.js";

const startWorker = async () => {
  try {
    await dbConnect();
    logger.info("📦 Worker MongoDB connected");
    
    if (process.env.NODE_ENV === "production") {
      logger.warn("🚫 Worker disabled in production");
      process.exit(0);
    }

    await startStudentConsumer();
    logger.info("⚙️ Worker Student Kafka Consumer running");

    await startFacultyConsumer();
    logger.info("⚙️ Worker Faculty Kafka Consumer running");

  } catch (error) {
    logger.error({ err: error }, "🔴 Worker failed");
    process.exit(1);
  }
};

startWorker();
