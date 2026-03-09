import mongoose from "mongoose";
import { Hostel } from "../models/hostel.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createHostel = asyncHandler(async (req, res) => {

    const { name, gender, description } = req.body;

    if (!name) {
        throw new ApiError(400, "Hostel name is required");
    }

    if (!gender) {
        throw new ApiError(400, "Gender is required");
    }

    if (!["male", "female", "co-ed"].includes(gender)) {
        throw new ApiError(400, "Invalid gender value");
    }

    const existingHostel = await Hostel.findOne({
        institutionId: req.user.institutionId,
        name
    });

    if (existingHostel) {
        throw new ApiError(400, "Hostel with the same name already exists");
    }

    const hostel = await Hostel.create({
        institutionId: req.user.institutionId,
        name,
        gender,
        description
    });

    res.status(201).json(
        new ApiResponse(201, hostel, "Hostel created successfully")
    );
});

const getHostels = asyncHandler(async (req, res) => {

    const hostels = await Hostel.find({
        institutionId: req.user.institutionId
    });

    res.json(new ApiResponse(200, hostels));
});

const getHostelById = asyncHandler(async (req, res) => {

    const { hostelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
        throw new ApiError(400, "Invalid hostel ID");
    }

    const hostel = await Hostel.findOne({
        _id: hostelId,
        institutionId: req.user.institutionId
    });

    if (!hostel) {
        throw new ApiError(404, "Hostel not found");
    }

    res.json(new ApiResponse(200, hostel));
});

export {
    createHostel,
    getHostels,
    getHostelById
};