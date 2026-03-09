import mongoose, { Schema } from "mongoose";

const roomAllocationSchema = new Schema(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        roomId: {
            type: Schema.Types.ObjectId,
            ref: "Room",
            required: true,
            index: true
        },

        allocatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },

        startDate: {
            type: Date,
            default: Date.now
        },

        endDate: Date,

        status: {
            type: String,
            enum: ["active", "vacated"],
            default: "active",
            index: true
        }
    },
    { timestamps: true }
);

roomAllocationSchema.index(
    { studentId: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: "active" } }
);

export const RoomAllocation = mongoose.model(
    "RoomAllocation",
    roomAllocationSchema
);