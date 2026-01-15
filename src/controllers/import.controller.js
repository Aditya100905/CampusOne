import fs from "fs";
import Papa from "papaparse";
import { StudentImport } from "../models/import.model.js";
import { kafkaProducer } from "../kafka/producer.js";

export const importStudents = async (req, res) => {
  const filePath = req.file.path;

  const csvData = fs.readFileSync(filePath, "utf8");
  const { data: rows } = Papa.parse(csvData, { header: true });

  const total = rows.length;

  const importRecord = await StudentImport.create({
    total,
    processed: 0,
    success: 0,
    failed: 0,
    status: "processing",
  });

  const importId = importRecord._id.toString();

  for (let i = 0; i < total; i++) {
    const row = rows[i];
    await kafkaProducer.send({
      topic: "student-import",
      messages: [
        {
          value: JSON.stringify({
            importId,
            rowNumber: i + 1,
            student: row,
          }),
        },
      ],
    });
  }

  return res.json({
    message: "Import started",
    importId,
    total,
  });
};
