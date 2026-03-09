import mongoose, { Schema } from "mongoose";

const noticeSchema = new Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true,
            index: true
        },

        title: {
            type: String,
            required: true
        },

        content: {
            type: String,
            required: true
        },

        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        attachments: [
            {
                filename: String,
                url: String,
                mimeType: String,
                size: Number
            }
        ],

        targetAudience: {
            roles: [String],
            departmentIds: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Department"
            }],
            courseIds: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course"
            }]
        },

        publishDate: {
            type: Date,
            default: Date.now
        },

        expireDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "published"
        },

        priority: {
            type: String,
            enum: ["normal", "important", "urgent"],
            default: "normal"
        },

        isPinned: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

noticeSchema.index({ institutionId: 1, publishDate: -1 });
noticeSchema.index({ expireDate: 1 });
noticeSchema.index({ "targetAudience.departmentIds": 1 });
noticeSchema.index({ "targetAudience.courseIds": 1 });

export const Notice = mongoose.model("Notice", noticeSchema);