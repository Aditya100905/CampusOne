import mongoose from "mongoose";

const guardianDetailSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    relation: { type: String, trim: true }
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true
    },

    enrollmentNumber: {
      type: String,
      required: true,
      trim: true
    },

    courseIds: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
      }],
      default: []
    },

    prevCourses: {
      type: [{
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true
        },
        semester: {
          type: Number,
          required: true
        }
      }],
      default: []
    },

    semester: {
      type: Number,
      required: true
    },

    admissionYear: {
      type: Number,
      required: true
    },

    hostelStatus: {
      type: Boolean,
      default: false
    },

    guardianDetails: {
      type: [guardianDetailSchema],
      default: []
    }
  },
  { timestamps: true }
);

studentSchema.index({ userId: 1 }, { unique: true });

studentSchema.index(
    { institutionId: 1, enrollmentNumber: 1 },
    { unique: true }
);
studentSchema.index({
  institutionId: 1,
  branchId: 1
});
// get student by BATCH(branchCode+admissionYear)
studentSchema.index({
    institutionId: 1,
    courseIds: 1,
    branchId: 1,
    admissionYear: 1
});
studentSchema.index({
    institutionId: 1,
    courseIds: 1
});
studentSchema.index({
    institutionId: 1,
    "prevCourses.courseId": 1
});

export const Student = mongoose.model("Student", studentSchema);
