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

export const StudentImport = mongoose.model("StudentImport", studentImportSchema);
