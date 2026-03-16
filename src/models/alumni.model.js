import mongoose from "mongoose";

const alumniSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    graduationYear: {
        type: Number,
        required: true,
    },
    degree: {
        type: String,
        required: true,
    },
    // branchCode - admissionYear
    batch: {
        type: String,
        required: true,
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
    },
    companies: [
        {
            name: {
                type: String,
                required: true,
            },
            position: {
                type: String,
                required: true,
            },
            startDate: {
                type: Date,
                required: true,
            },
            endDate: {
                type: Date,
            },
        }
    ],
    linkedIn: {
        type: String,
    },
    github: {
        type: String,
    },
    resumeLink: {
        type: String,
    },
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // to be verified by the admin before showing on the website
    isVerified: {
        type: Boolean,
        default: false,
    },
});

const Alumni = mongoose.model("Alumni", alumniSchema);

export default Alumni;