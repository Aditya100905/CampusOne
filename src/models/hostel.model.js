import mongoose, { Schema } from "mongoose";

const hostelSchema = new Schema(
{
    institutionId: {
        type: Schema.Types.ObjectId,
        ref: "Institution",
        required: true,
        index: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    gender: {
        type: String,
        enum: ["male", "female", "co-ed"],
        required: true
    },

    wardenId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    totalRooms: {
        type: Number,
        default: 0
    },

    description: String
},
{ timestamps: true }
);

hostelSchema.index({ institutionId: 1, name: 1 }, { unique: true });

export const Hostel = mongoose.model("Hostel", hostelSchema);