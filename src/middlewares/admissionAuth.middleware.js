import { AdmissionApplication } from "../models/admissionApplication.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const validateAdmissionJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) throw new ApiError("Token missing", 401);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.id) throw new ApiError("Invalid token", 401);

        const user = await AdmissionApplication.findById(decoded.id).select("-password -resetPasswordToken -emailVerificationToken");
        if (!user) throw new ApiError("User not found", 401);

        if (!user.active) throw new ApiError("User disabled", 403);
        req.user = user;
        next();
    } catch (err) {
        throw new ApiError("Token expired", 401);
    }
});

