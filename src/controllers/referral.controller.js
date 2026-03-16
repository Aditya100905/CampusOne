import Alumni from '../models/alumni.model.js';
import Referral from '../models/referral.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Institution } from '../models/institution.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const createReferral = asyncHandler(async (req, res) => {
    const { companyName, position, jobDescription, institution, referralLink, batch } = req.body;
    if (!companyName || !position || !batch) {
        throw new ApiError("Company name, position, and batch are required", 400);
    }
    const user = req.user;
    if (!user) {
        throw new ApiError("Unauthorized", 401);
    }
    const alumni = await Alumni.findOne({ userId: user._id });
    if (!alumni) {
        throw new ApiError("Alumni profile not found", 404);
    }
    const institutionData = await Institution.findById(institution);
    if (!institutionData) {
        throw new ApiError("Institution not found", 404);
    }

    const existingReferral = await Referral.findOne({ referrer: alumni._id, companyName, position, batch });
    if (existingReferral) {
        throw new ApiError("You have already referred this position for the specified batch", 400);
    }

    const referral = await Referral.create({
        referrer: alumni._id,
        companyName,
        position,
        jobDescription,
        institution,
        referralLink,
        batch
    });
    res.status(201).json(new ApiResponse("Referral created successfully", 201, referral));
});

const getReferralsByInstitution = asyncHandler(async (req, res) => {
    const { institutionId } = req.params;
    const referrals = await Referral.find({ institution: institutionId, isVerified: true }).populate('referrer','name email').sort({ createdAt: -1 });
    if (!referrals) {
        throw new ApiError("No referrals found for this institution", 404);
    }
    res.status(200).json(new ApiResponse("Referrals retrieved successfully", 200, referrals));
});

const updateReferralVerification = asyncHandler(async (req, res) => {
    const { referralId } = req.params;
    const { isVerified } = req.body;
    const referral = await Referral.findById(referralId);
    if (!referral) {
        throw new ApiError("Referral not found", 404);
    }
    referral.isVerified = isVerified;
    await referral.save();
    res.status(200).json(new ApiResponse("Referral verification status updated successfully", 200));
});

const modifyActiveStatus = asyncHandler(async (req, res) => {
    const { referralId } = req.params;
    const { isActive } = req.body;
    const referral = await Referral.findById(referralId);
    if (!referral) {
        throw new ApiError("Referral not found", 404);
    }
    referral.isActive = isActive;
    await referral.save();
    res.status(200).json(new ApiResponse("Referral active status updated successfully", 200));
});

const updateReferral = asyncHandler(async (req, res) => {
    const { referralId } = req.params;
    const { companyName, position, jobDescription, referralLink } = req.body;
    const referral = await Referral.findById(referralId);
    if (!referral) {
        throw new ApiError("Referral not found", 404);
    }
    if (companyName) referral.companyName = companyName;
    if (position) referral.position = position;
    if (jobDescription) referral.jobDescription = jobDescription;
    if (referralLink) referral.referralLink = referralLink;

    await referral.save();
    res.status(200).json(new ApiResponse("Referral updated successfully", 200, referral));
});

const deleteReferral = asyncHandler(async (req, res) => {
    const { referralId } = req.params;
    const referral = await Referral.findById(referralId);
    if (!referral) {
        throw new ApiError("Referral not found", 404);
    }
    await Referral.findByIdAndDelete(referralId);
    res.status(200).json(new ApiResponse("Referral deleted successfully", 200));
});


export { 
    createReferral, 
    getReferralsByInstitution, 
    updateReferralVerification, 
    modifyActiveStatus, 
    updateReferral, 
    deleteReferral 
};