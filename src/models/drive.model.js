import mongoose from 'mongoose';

const driveSchema = new mongoose.Schema({
    institution:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
    },
    jobDescription: {
        type: String,
    },
    driveDate: {
        type: Date,
        required: true,
    },
    batch: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['upcoming', 'completed', 'cancelled'],
        default: 'upcoming',
    },
    handledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    eligibilityCriteria: {
        type: String,
    },
    results: [
        {
            name: {
                type: String,
            },
            link: {
                type: String,
            }
        }
    ]
});

const Drive = mongoose.model("Drive", driveSchema);

export default Drive;