import CampusLogs from "../models/campusLogs.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Student } from "../models/student.model.js";


const addCampusLog = asyncHandler(async (req, res) => {
    const { enrollmentNumber, institutionId, outTime, reason, place, outOfStation } = req.body;

    if (!enrollmentNumber || !institutionId || !reason || !place) {
        throw new ApiError(
            "enrollmentNumber, institutionId, reason and place are required",
            400
        );
    }

    const student = await Student.findOne({
        enrollmentNumber,
        institutionId,
    });

    if (!student) {
        throw new ApiError(
            "Student not found with the given enrollment number",
            404
        );
    }
    const campusLog = await CampusLogs.create({
        userId: student._id,
        institutionId,
        outTime: outTime ? new Date(outTime) : new Date(),
        reason,
        place,
        outOfStation,
    });

    res
        .status(201)
        .json(new ApiResponse("Campus log added successfully", 201, campusLog));
});

const getCampusLogsByRollNumber = asyncHandler(async (req, res) => {
    const { enrollmentNumber, institutionId } = req.params;

    const student = await Student.findOne({
        enrollmentNumber,
        institutionId,
    });

    if (!student) {
        throw new ApiError(
            "Student not found with the given enrollment number",
            404
        );
    }

    const campusLogs = await CampusLogs.find({
        userId: student._id,
        institutionId,
    }).populate("institutionId", "name");

    if (!campusLogs.length) {
        throw new ApiError("No campus logs found for the user", 404);
    }

    res.json(new ApiResponse("Campus logs fetched successfully", 200, campusLogs));
});

const updateCampusLog = asyncHandler(async (req, res) => {
    const { logId } = req.params;
    const { inTime, reason, place, outOfStation } = req.body;
    const campusLog = await CampusLogs.findById(logId);
    if (!campusLog) {
        throw new ApiError("Campus log not found", 404);
    }
    if (inTime !== undefined) {
        campusLog.inTime = new Date();
    }
    if (reason) campusLog.reason = reason;
    if (place) campusLog.place = place;
    if (outOfStation !== undefined) campusLog.outOfStation = outOfStation;
    await campusLog.save();
    res.json(
        new ApiResponse("Campus log updated successfully", 200, campusLog)
    );
});


const getLogsByDateRange = asyncHandler(async (req, res) => {
    const { institutionId } = req.params;
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        throw new ApiError("startDate and endDate query parameters are required", 400);
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
        throw new ApiError("Invalid date format", 400);
    }
    const campusLogs = await CampusLogs.find({
        institutionId,
        outTime: { $gte: start, $lte: end },
    }).populate("userId", "enrollmentNumber name");
    res.json(
        new ApiResponse("Campus logs fetched successfully", 200, campusLogs)
    );
});

const getActiveOutLogs = asyncHandler(async (req, res) => {
    const { institutionId } = req.params;
    const activeLogs = await CampusLogs.find({
        institutionId,
        inTime: null,
    }).populate("userId", "enrollmentNumber name");

    res.json(
        new ApiResponse("Active campus logs fetched successfully", 200, activeLogs)
    );
});

export {
    addCampusLog,
    getCampusLogsByRollNumber,
    updateCampusLog,
    getLogsByDateRange,
    getActiveOutLogs,
};