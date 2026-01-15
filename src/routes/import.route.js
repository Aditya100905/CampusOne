import express from "express";
import multer from "multer";
import { importStudents } from "../controllers/import.controller.js";

const upload = multer({ dest: "uploads/" });

const router = express.Router();
router.post("/students", upload.single("file"), importStudents);

export default router;
