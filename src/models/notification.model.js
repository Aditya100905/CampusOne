import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    recipientBatch: {
        type: String,
    },
    forBatch: {
        type: Boolean,
        default: true,
    },
    emails: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ['general', 'drive', 'referral'],
        default: 'general',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;