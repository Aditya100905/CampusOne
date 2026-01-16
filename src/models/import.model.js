import mongoose from "mongoose";

const studentImportSchema = new mongoose.Schema({
  total: {
    type: Number,
    required: true
  },
  processed: {
    type: Number,
    default: 0
  },
  success: {
    type: Number,
    default: 0
  },
  failed: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "error"],
    default: "pending"
  },
  createdObjects: [
    {
      user: { type: Object, default: {} },
      student: { type: Object, default: {} }
    }
  ],
  errors: [
    {
      row: Number,
      reason: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  finishedAt: Date
});

const facultyImportSchema = new mongoose.Schema({
  total: Number,
  processed: { type: Number, default: 0 },
  success: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "error"],
    default: "pending"
  },
  createdObjects: [
    {
      user: { type: Object, default: {} },
      faculty: { type: Object, default: {} }
    }
  ],
  errors: [
    {
      row: Number,
      reason: String
    }
  ],
  startedAt: { type: Date, default: Date.now },
  finishedAt: Date,
  durationMs: Number
});

export const FacultyImport = mongoose.model("FacultyImport", facultyImportSchema);

export const StudentImport = mongoose.model("StudentImport", studentImportSchema);
