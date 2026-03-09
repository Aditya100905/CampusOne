import mongoose from "mongoose";
import { Room } from "../models/room.model.js";
import { RoomAllocation } from "../models/allocation.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const allocateRoom = asyncHandler(async (req, res) => {

    const { studentId, roomId } = req.body;
    const existingAllocation = await RoomAllocation.findOne({
        studentId,
        status: "active"
    });

    if (existingAllocation) {
        throw new ApiError(400, "Student already has an active room allocation");
    }

    const session = await mongoose.startSession();

    let allocation;

    await session.withTransaction(async () => {

        const room = await Room.findOne({
            _id: roomId
        }).session(session);

        if (!room) {
            throw new ApiError(404, "Room not found");
        }

        if (room.currentOccupancy >= room.capacity) {
            throw new ApiError(400, "Room full");
        }
        room.currentOccupancy += 1;
        await room.save({ session });

        const created = await RoomAllocation.create([{
            studentId,
            roomId,
            allocatedBy: req.user._id,
        }], { session });

        allocation = created[0];

    });

    session.endSession();

    res.status(201).json(
        new ApiResponse(201, allocation, "Room allocated successfully")
    );
});

const vacateRoom = asyncHandler(async (req, res) => {

    const allocationId = req.params.id;
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
        const allocation = await RoomAllocation.findOne({
            _id: allocationId,
        }).session(session);

        if (!allocation) {
            throw new ApiError(404, "Allocation not found");
        }

        if (allocation.status === "vacated") {
            throw new ApiError(400, "Allocation already vacated");
        }
        allocation.status = "vacated";
        allocation.endDate = new Date();
        await allocation.save({ session });

        const room = await Room.findOne({
            _id: allocation.roomId,
        }).session(session);

        if (!room) {
            throw new ApiError(404, "Room not found");
        }

        room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
        await room.save({ session });

    });
    session.endSession();

    res.json(new ApiResponse(200, null, "Room vacated successfully"));
});

const getStudentRoom = asyncHandler(async (req, res) => {

    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new ApiError(400, "Invalid studentId");
    }

    const allocation = await RoomAllocation.findOne({
        studentId,
        status: "active",
    }).populate("roomId");

    res.json(new ApiResponse(200, allocation));
});

export {
    allocateRoom,
    vacateRoom,
    getStudentRoom
};