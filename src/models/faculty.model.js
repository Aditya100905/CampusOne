import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
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
        // TODO: Add validation to ensure department belongs to the institution
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true
        },
        designation: {
            type: String,
            required: true,
            trim: true
        },
        isInCharge: {
            type: Boolean,
            default: false
        },
        // TODO: Add validation to ensure courses belong to the department
        courses: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }],
        dateOfJoining: {
            type: Date,
            required: true
        },
    },
    {
        timestamps: true
    }
);

const Faculty = mongoose.model("Faculty", facultySchema);
export default Faculty;