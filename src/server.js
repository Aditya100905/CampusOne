import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { dbConnect } from "./db/index.js";
import { kafkaProducer } from "./kafka/producer.js"; 

const PORT = process.env.PORT;

const startServer = async () => {
  const { default: app } = await import("./app.js");

  try {
    await dbConnect();
    console.log("📦 MongoDB connected");

    await kafkaProducer.connect();  
    console.log("📨 Kafka Producer connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("🔴 Startup failed:", error);
  }
};

startServer();
