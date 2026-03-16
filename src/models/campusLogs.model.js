import mongoose from "mongoose";

const campusLogsSchema = new mongoose.Schema(
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
        outTime: {
            type: Date,
            default: Date.now
        },
        inTime: {
            type: Date
        },
        reason: {
            type: String,
            required: true,
            trim: true
        },
        place: {
            type: String,
            required: true,
            trim: true
        },
        outOfStation: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const CampusLogs = mongoose.model("CampusLogs", campusLogsSchema);

export default CampusLogs;