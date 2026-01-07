import mongoose from "mongoose";

const guardianDetailSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        contactNumber: {
            type: String,
            required: true,
            trim: true
        },
        relation: {
            type: String,
            required: true,
            trim: true
        }
    },
    { _id: false }
);

const studentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Institution',
            required: true
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true
        },
        enrollmentNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        courseIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }],
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
        guardianDetails: [guardianDetailSchema]
    },
    {
        timestamps: true
    }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;