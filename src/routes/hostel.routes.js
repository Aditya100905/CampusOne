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

router.post("/", validateInstitutionJWT, createHostel);
router.get("/", validateInstitutionJWT, getHostels);
router.get("/:hostelId", validateInstitutionJWT, getHostelById);

router.post("/rooms", validateInstitutionJWT, createRoom);
router.put("/rooms/:roomId", validateInstitutionJWT, updateRoom);
router.get("/:hostelId/rooms", validateInstitutionJWT, getRoomsByHostel);

router.post("/allocations", validateInstitutionJWT, allocateRoom);
router.patch("/allocations/:id/vacate", validateInstitutionJWT, vacateRoom);
router.get("/allocations/student/:studentId", validateInstitutionJWT, getStudentRoom);

export default router;