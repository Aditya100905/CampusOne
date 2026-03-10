import express from "express";

import {
    createHostel,
    getHostels,
    getHostelById
} from "../controllers/hostel.controller.js";

import {
    createRoom,
    getRoomsByHostel,
    updateRoom
} from "../controllers/room.controller.js";

import { validateInstitutionJWT } from '../middlewares/institutionAuth.middleware.js';

import {
    allocateRoom,
    vacateRoom,
    getStudentRoom
} from "../controllers/allocation.controller.js";

const router = express.Router();

// GET ROUTES
router.get("/", validateInstitutionJWT, getHostels);
router.get("/allocations/student/:studentId", validateInstitutionJWT, getStudentRoom);
router.get("/:hostelId/rooms", validateInstitutionJWT, getRoomsByHostel);
router.get("/:hostelId", validateInstitutionJWT, getHostelById);

// POST ROUTES
router.post("/", validateInstitutionJWT, createHostel);
router.post("/rooms", validateInstitutionJWT, createRoom);
router.post("/allocations", validateInstitutionJWT, allocateRoom);

// PUT ROUTES
router.put("/rooms/:roomId", validateInstitutionJWT, updateRoom);

// PATCH ROUTES
router.patch("/allocations/:id/vacate", validateInstitutionJWT, vacateRoom);

export default router;