import { Kafka, Partitioners } from "kafkajs";
import logger from "../utils/logger.js";

let kafkaProducer = null;

// Disable Kafka in Production
if (process.env.NODE_ENV !== "production") {
  const kafka = new Kafka({
    clientId: "campusone",
  brokers: ["localhost:9092"],
    createPartitioner: Partitioners.LegacyPartitioner,
  });

  kafkaProducer = kafka.producer();

  try {
    await kafkaProducer.connect();
    logger.info("📨 Kafka Producer connected (dev)");
  } catch (err) {
    logger.warn({ err }, "⚠️ Kafka connection failed (dev)");
  }
} else {
  logger.info("🚫 Kafka disabled in production");
}

export { kafkaProducer };
