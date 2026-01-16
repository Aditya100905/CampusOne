import { Kafka } from "kafkajs";
import { FacultyImport } from "../models/import.model.js";
import { registerFacultyService } from "../services/registerFaculty.service.js";

const kafka = new Kafka({
  clientId: "campusone-faculty",
  brokers: ["localhost:9092"],
});

export const startFacultyConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "faculty-import-group" });

  await consumer.connect();
  await consumer.subscribe({ topic: "faculty-import" });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { importId, rowNumber, faculty } = JSON.parse(message.value.toString());

      const start = Date.now();

      try {
        const created = await registerFacultyService(faculty);

        await FacultyImport.updateOne(
          { _id: importId },
          {
            $inc: { processed: 1, success: 1 },
            $push: { createdObjects: created }
          }
        );
      } catch (err) {
        await FacultyImport.updateOne(
          { _id: importId },
          { 
            $inc: { processed: 1, failed: 1 },
            $push: { errors: { row: rowNumber, reason: err.message } }
          }
        );
      }

      const record = await FacultyImport.findById(importId);
      if (record.processed === record.total) {
        await FacultyImport.updateOne(
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
