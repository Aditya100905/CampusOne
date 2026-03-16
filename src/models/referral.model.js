import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Alumni",
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
    referralLink: {
        type: String,
    },
    institution:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true,
    },
    // to be verified by the admin before showing on the website
    isVerified: {
        type: Boolean,
        default: false,
    },
    batch:{
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
},
{
    timestamps: true,
});

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;