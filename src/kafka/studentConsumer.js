import { Kafka } from "kafkajs";
import { StudentImport } from "../models/import.model.js";
import { registerStudentService } from "../services/registerStudent.service.js";


const kafka = new Kafka({
  clientId: "campusone-student",
  brokers: ["localhost:9092"],
});

export const startStudentConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "student-import-group" });

  await consumer.connect();
  await consumer.subscribe({ topic: "student-import" });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { importId, rowNumber, student } = JSON.parse(message.value.toString());

      const start = Date.now();

      try {
        const created = await registerStudentService(student);

        await StudentImport.updateOne(
          { _id: importId },
          {
            $inc: { processed: 1, success: 1 },
            $push: { createdObjects: created }
          }
        );
      } catch (err) {
        await StudentImport.updateOne(
          { _id: importId },
          { 
            $inc: { processed: 1, failed: 1 },
            $push: { errors: { row: rowNumber, reason: err.message } }
          }
        );
      }

      const record = await StudentImport.findById(importId);
      if (record.processed === record.total) {
        await StudentImport.updateOne(
          { _id: importId },
          {
            status: "completed",
            finishedAt: new Date(),
            durationMs: Date.now() - start
          }
        );
      }
    }
  });
};
