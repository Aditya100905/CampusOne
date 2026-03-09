import mongoose from "mongoose";
import { Hostel } from "../models/hostel.model.js";
import { Room } from "../models/room.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createRoom = asyncHandler(async (req, res) => {

    const { hostelId, roomNumber, capacity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
        throw new ApiError(400, "Invalid hostelId");
    }

    if (!roomNumber) {
        throw new ApiError(400, "Room number required");
    }

    if (!capacity || capacity <= 0) {
        throw new ApiError(400, "Capacity must be greater than 0");
    }

    const hostel = await Hostel.findOne({
        _id: hostelId,
        institutionId: req.user.institutionId
    });

    if (!hostel) {
        throw new ApiError(404, "Hostel not found");
    }

    const existingRoom = await Room.findOne({ hostelId, roomNumber });

    if (existingRoom) {
        throw new ApiError(
            400,
            "Room with this number already exists in the hostel"
        );
    }

    const room = await Room.create({
        hostelId,

        roomNumber,
        capacity
    });

    res.status(201).json(
        new ApiResponse(201, room, "Room created successfully")
    );
});

const updateRoom = asyncHandler(async (req, res) => {

    const { roomId } = req.params;
    const { roomNumber, capacity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
        throw new ApiError(400, "Invalid room ID");
    }

    const room = await Room.findOne({
        _id: roomId,
    });

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    if (roomNumber) {
        room.roomNumber = roomNumber;
    }

    if (capacity !== undefined) {

        if (capacity <= 0) {
            throw new ApiError(400, "Capacity must be greater than 0");
        }

        if (capacity < room.currentOccupancy) {
            throw new ApiError(
                400,
                "Capacity cannot be less than current occupancy"
            );
        }

        room.capacity = capacity;
    }

    await room.save();

    res.json(
        new ApiResponse(200, room, "Room updated successfully")
    );
});

const getRoomsByHostel = asyncHandler(async (req, res) => {

    const { hostelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hostelId)) {
        throw new ApiError(400, "Invalid hostelId");
    }

    const hostel = await Hostel.findOne({
        _id: hostelId,
        institutionId: req.user.institutionId
    });

    if (!hostel) {
        throw new ApiError(404, "Hostel not found");
    }

    const rooms = await Room.find({
        hostelId
    });
    res.json(new ApiResponse(200, rooms));
});

export {
    createRoom,
    updateRoom,
    getRoomsByHostel
};