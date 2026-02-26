import fs from "fs";
import Papa from "papaparse";
import { FacultyImport, StudentImport } from "../models/import.model.js";
import { kafkaProducer } from "../kafka/producer.js";
import logger from "../utils/logger.js";

const fsPromises = fs.promises;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const importStudents = async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({
      message: "Bulk student import is disabled in production environment"
    });
  }
  const filePath = req.file?.path;
  if (!filePath) {
    return res.status(400).json({
      message: "No file uploaded"
    });
  }

  try {
    const stats = await fsPromises.stat(filePath);
    if (stats.size > MAX_FILE_SIZE) {
      await fsPromises.unlink(filePath);
      return res.status(413).json({
        message: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      });
    }
  } catch (statError) {
    logger.error("File stat error:", statError);
    return res.status(500).json({
      message: "Could not process file"
    });
  }
  
  try {
    const csvData = await fsPromises.readFile(filePath, "utf8");
    let { data: rows } = Papa.parse(csvData, { header: true });

    rows = rows.filter(row =>
      row && Object.values(row).some(v => v && v.toString().trim() !== "")
    );
    const total = rows.length;

    const importRecord = await StudentImport.create({
      total,
      processed: 0,
      success: 0,
      failed: 0,
      status: "processing",
      startedAt: new Date(),
    });
    const importId = importRecord._id.toString();

    if (!kafkaProducer) {
      return res.status(500).json({
        message: "Kafka producer not initialized"
      });
    }

    for (let i = 0; i < total; i++) {
      await kafkaProducer.send({
        topic: "student-import",
        messages: [
          {
            value: JSON.stringify({
              importId,
              rowNumber: i + 1,
              student: rows[i],
            }),
          },
        ],
      });
    }

    logger.info(`Student import queued: ${importId} with ${total} records`);
    return res.json({
      message: "Student import queued successfully",
      importId,
      total,
    });
  } catch (error) {
    logger.error("Student import failed:", error);
    return res.status(500).json({
      message: "Student import failed"
    });
  } finally {
    try {
      if (filePath && fs.existsSync(filePath)) {
        await fsPromises.unlink(filePath);
        logger.info("Student CSV deleted");
      }
    } catch (err) {
      logger.error("File deletion error:", err);
    }
  }
};

export const importFaculty = async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({
      message: "Bulk faculty import is disabled in production environment"
    });
  }
  const filePath = req.file?.path;
  if (!filePath) {
    return res.status(400).json({
      message: "No file uploaded"
    });
  }
  try {
    const stats = await fsPromises.stat(filePath);
    if (stats.size > MAX_FILE_SIZE) {
      await fsPromises.unlink(filePath);
      return res.status(413).json({
        message: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      });
    }
  } catch (statError) {
    logger.error("File stat error:", statError);
    return res.status(500).json({
      message: "Could not process file"
    });
  }
  
  try {
    const csvData = await fsPromises.readFile(filePath, "utf8");

    let { data: rows } = Papa.parse(csvData, { header: true });

    rows = rows.filter(row =>
      row && Object.values(row).some(v => v && v.toString().trim() !== "")
    );
    const total = rows.length;

    const importRecord = await FacultyImport.create({
      total,
      processed: 0,
      success: 0,
      failed: 0,
      status: "processing",
      startedAt: new Date(),
    });

    const importId = importRecord._id.toString();
    if (!kafkaProducer) {
      return res.status(500).json({
        message: "Kafka producer not initialized"
      });
    }

    for (let i = 0; i < total; i++) {
      await kafkaProducer.send({
        topic: "faculty-import",
        messages: [
          {
            value: JSON.stringify({
              importId,
              rowNumber: i + 1,
              faculty: rows[i],
            }),
          },
        ],
      });
    }
    logger.info(`Faculty import queued: ${importId} with ${total} records`);
    return res.json({
      message: "Faculty import queued successfully",
      importId,
      total,
    });
  } catch (error) {
    logger.error("Faculty import failed:", error);
    return res.status(500).json({
      message: "Faculty import failed"
    });
  } finally {
    try {
      if (filePath && fs.existsSync(filePath)) {
        await fsPromises.unlink(filePath);
        logger.info("Faculty CSV deleted");
      }
    } catch (err) {
      logger.error("File deletion error:", err);
    }
  }
};