import fs from "fs";
import Papa from "papaparse";
import { FacultyImport, StudentImport } from "../models/import.model.js";
import { kafkaProducer } from "../kafka/producer.js";

export const importStudents = async (req, res) => {
  const filePath = req.file.path;
  const csvData = fs.readFileSync(filePath, "utf8");
  let { data: rows } = Papa.parse(csvData, { header: true });

  rows = rows.filter(row => {
    if (!row) return false;
    return Object.values(row).some(v => v && v.toString().trim() !== "");
  });

  const total = rows.length;

  const importRecord = await StudentImport.create({
    total,
    processed: 0,
    success: 0,
    failed: 0,
    status: "processing",
    startedAt: new Date()
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
    message: "Student import queued",
    importId,
    total,
  });
};

export const importFaculty = async (req, res) => {
  const filePath = req.file.path;
  const csvData = fs.readFileSync(filePath, "utf8");
  let { data: rows } = Papa.parse(csvData, { header: true });

  rows = rows.filter(row => {
    if (!row) return false;
    return Object.values(row).some(v => v && v.toString().trim() !== "");
  });
  const total = rows.length;

  const record = await FacultyImport.create({
    total,
    status: "processing",
    startedAt: new Date()
  });

  const importId = record._id.toString();

  for (let i = 0; i < total; i++) {
    const row = rows[i];
    await kafkaProducer.send({
      topic: "faculty-import",
      messages: [
        {
          value: JSON.stringify({
            importId,
            rowNumber: i + 1,
            faculty: row,
          })
        }
      ]
    });
  }

  return res.json({
    message: "Faculty import queued",
    importId,
    total
  });
};