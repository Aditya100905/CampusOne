import mongoose, { Schema } from "mongoose";

const roomSchema = new Schema(
    {
        hostelId: {
            type: Schema.Types.ObjectId,
            ref: "Hostel",
            required: true
        },

        roomNumber: {
            type: String,
            required: true,
            trim: true
        },

        capacity: {
            type: Number,
            default: 2
        },

        currentOccupancy: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

roomSchema.index({ hostelId: 1, roomNumber: 1 }, { unique: true });

export const Room = mongoose.model("Room", roomSchema);