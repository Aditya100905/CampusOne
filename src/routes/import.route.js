import express from "express";
import multer from "multer";
import { importFaculty, importStudents } from "../controllers/import.controller.js";
import { FacultyImport, StudentImport } from "../models/import.model.js";

const upload = multer({ dest: "uploads/" });

const router = express.Router();
router.post("/students", upload.single("file"), importStudents);
router.post("/faculty", upload.single("file"), importFaculty);
router.get("/students/:id/status", async (req, res) => {
  const record = await StudentImport.findById(req.params.id);
  res.json(record);
});
router.get("/faculty/:id/status", async (req, res) => {
  const record = await FacultyImport.findById(req.params.id);
  res.json(record);
});

export default router;
