import Drive from "../models/drive.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Institution } from "../models/institution.model.js";

const createDrive = asyncHandler(async (req, res) => {
    const { companyName, institution, position, jobDescription, driveDate, batch, eligibilityCriteria } = req.body;
    const handledBy = req.user._id;

    if (!institution) {
        throw new ApiError("Institution is required", 400);
    }

    if (!companyName || !position || !driveDate || !batch) {
        throw new ApiError("companyName, position, driveDate and batch are required", 400);
    }

    const institutionData = await Institution.findById(institution);
    if (!institutionData) {
        throw new ApiError("Institution not found", 404);
    }

    const existingDrive = await Drive.findOne({ companyName, position, driveDate, batch });
    if (existingDrive) {
        throw new ApiError("A drive with the same companyName, position, driveDate and batch already exists", 400);
    }

    const newDrive = new Drive({
        companyName,
        position,
        jobDescription,
        driveDate,
        batch,
        handledBy,
        eligibilityCriteria,
        institution
    });

    await newDrive.save();

    res.status(201).json(new ApiResponse("Drive created successfully", 201, newDrive));
});

const updateDrive = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { companyName, position, jobDescription, driveDate, batch, status, eligibilityCriteria } = req.body;

    const drive = await Drive.findById(id);
    if (!drive) {
        throw new ApiError("Drive not found", 404);
    }

    if (companyName) drive.companyName = companyName;
    if (position) drive.position = position;
    if (jobDescription) drive.jobDescription = jobDescription;
    if (driveDate) drive.driveDate = driveDate;
    if (batch) drive.batch = batch;
    if (status) drive.status = status;
    if (eligibilityCriteria) drive.eligibilityCriteria = eligibilityCriteria;

    await drive.save();

    res.json(new ApiResponse("Drive updated successfully", 200, drive));
});

const updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['upcoming', 'completed', 'cancelled'].includes(status)) {
        throw new ApiError("Invalid status value", 400);
    }

    const drive = await Drive.findById(id);
    if (!drive) {
        throw new ApiError("Drive not found", 404);
    }

    drive.status = status;
    await drive.save();

    res.json(new ApiResponse("Drive status updated successfully", 200, drive));
});

const updateResults = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { results } = req.body;

    if (!Array.isArray(results)) {
        throw new ApiError("Results must be an array", 400);
    }

    const drive = await Drive.findById(id);
    if (!drive) {
        throw new ApiError("Drive not found", 404);
    }

    drive.results = results;
    await drive.save();

    res.json(new ApiResponse("Drive results updated successfully", 200, drive));
});

const deleteDrive = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const drive = await Drive.findById(id);
    if (!drive) {
        throw new ApiError("Drive not found", 404);
    }

    await Drive.findByIdAndDelete(id);

    res.json(new ApiResponse("Drive deleted successfully", 200));
});

const getDriveById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const drive = await Drive.findById(id);
    if (!drive) {
        throw new ApiError("Drive not found", 404);
    }

    res.json(new ApiResponse("Drive fetched successfully", 200, drive));
});

const getDrivesByBatch = asyncHandler(async (req, res) => {
    const { batch } = req.params;

    const drives = await Drive.find({ batch });
    res.json(new ApiResponse("Drives fetched successfully", 200, drives));
});

const getDrivesByInstitution = asyncHandler(async (req, res) => {
    const { institutionId } = req.params;

    const drives = await Drive.find({ institution: institutionId });
    res.json(new ApiResponse("Drives fetched successfully", 200, drives));
});

export {
    createDrive,
    updateDrive,
    updateStatus,
    updateResults,
    deleteDrive,
    getDrivesByInstitution,
    getDriveById,
    getDrivesByBatch
};