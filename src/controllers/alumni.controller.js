import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Alumni from "../models/alumni.model.js";
import { Institution } from '../models/institution.model.js';
import Department from "../models/department.model.js";


const createAlumni = asyncHandler(async (req, res) => {
    const { name, email, graduationYear, instituteId, degree, batch, department, companies, linkedIn, github, resumeLink } = req.body;
    const userId = req.user._id;

    if (!name || !email || !graduationYear || !instituteId || !degree || !batch || !department) {
        throw new ApiError("name, email, graduationYear, instituteId, degree, batch and department are required", 400);
    }

    const departmentData = await Department.findOne({ code: department, institutionId: instituteId });
    if (!departmentData) {
        throw new ApiError("Department not found for the given code and institution", 404);
    }

    const institution = await Institution.findById(instituteId);
    if (!institution) {
        throw new ApiError("Institution not found", 404);
    }

    const existingAlumni = await Alumni.findOne({ email });
    if (existingAlumni) {
        throw new ApiError("An alumni with the same email already exists", 400);
    }

    const newAlumni = await Alumni.create({
        name,
        email,
        graduationYear,
        degree,
        batch,
        department: departmentData._id,
        companies,
        linkedIn,
        github,
        resumeLink,
        userId,
        instituteId
    });

    res.status(201).json(new ApiResponse("Alumni created successfully", 201, newAlumni));
});

const verifyAlumni = asyncHandler(async (req, res) => {
    const alumniId = req.params.id;

    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
        throw new ApiError("Alumni not found", 404);
    }

    alumni.isVerified = true;
    await alumni.save();

    res.status(200).json(new ApiResponse("Alumni verified successfully", 200, alumni));
});

const getAlumniByInstitution = asyncHandler(async (req, res) => {
    const institutionId = req.params.institutionId;

    const alumniList = await Alumni.find({ instituteId: institutionId, isVerified: true }).populate("department", "name").populate("instituteId", "name");

    res.status(200).json(new ApiResponse("Alumni list retrieved successfully", 200, alumniList));
});

const getAlumniById = asyncHandler(async (req, res) => {
    const alumniId = req.params.id;

    const alumni = await Alumni.findById(alumniId).populate("department", "name").populate("instituteId", "name");
    if (!alumni) {
        throw new ApiError("Alumni not found", 404);
    }

    res.status(200).json(new ApiResponse("Alumni retrieved successfully", 200, alumni));
});

const updateAlumni = asyncHandler(async (req, res) => {
    const alumniId = req.params.id;
    const { companies, linkedIn, github, resumeLink } = req.body;

    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
        throw new ApiError("Alumni not found", 404);
    }

    if (alumni.userId.toString() !== req.user._id.toString()) {
        throw new ApiError("Unauthorized to update this alumni", 403);
    }

    alumni.companies = companies || alumni.companies;
    alumni.linkedIn = linkedIn || alumni.linkedIn;
    alumni.github = github || alumni.github;
    alumni.resumeLink = resumeLink || alumni.resumeLink;
    alumni.isVerified = false;

    await alumni.save();

    res.status(200).json(new ApiResponse("Alumni updated successfully", 200, alumni));
});

const getUnverifiedAlumni = asyncHandler(async (req, res) => {
    const institutionId = req.params.institutionId;

    const alumniList = await Alumni.find({ instituteId: institutionId, isVerified: false }).populate("department", "name").populate("instituteId", "name");

    res.status(200).json(new ApiResponse("Unverified alumni list retrieved successfully", 200, alumniList));
});

const deleteAlumni = asyncHandler(async (req, res) => {
    const alumniId = req.params.id;

    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
        throw new ApiError("Alumni not found", 404);
    }

    await Alumni.findByIdAndDelete(alumniId);

    res.status(200).json(new ApiResponse("Alumni deleted successfully", 200));
});

export {
    createAlumni,
    verifyAlumni,
    getAlumniByInstitution,
    getAlumniById,
    updateAlumni,
    getUnverifiedAlumni,
    deleteAlumni
};
