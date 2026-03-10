import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true
        },

        token: {
            type: String,
            required: true
        },

        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 }
        }
    },
    {
        timestamps: true
    }
);

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);