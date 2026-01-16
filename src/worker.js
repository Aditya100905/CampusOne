import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { dbConnect } from "./db/index.js";
import { startStudentConsumer } from "./kafka/studentConsumer.js";
import { startFacultyConsumer } from "./kafka/facultyConsumer.js";

const startWorker = async () => {
  try {
    await dbConnect();
    console.log("📦 Worker MongoDB connected");

    await startStudentConsumer();
    console.log("⚙️ Worker Student Kafka Consumer running");
    
    await startFacultyConsumer();
    console.log("⚙️ Worker Faculty Kafka Consumer running");

  } catch (error) {
    console.error("🔴 Worker failed:", error);
  }
};

startWorker();
