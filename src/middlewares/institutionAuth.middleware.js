import { Institution } from "../models/institution.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const validateInstitutionJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError("Access token not found", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const institution = await Institution.findById(decoded.id).select(
      "-password -accessToken -resetPasswordToken -emailVerificationToken"
    );

    if (!institution) {
      throw new ApiError("Invalid access token", 401);
    }

    req.institution = institution;
    next();
  } catch (error) {
    throw new ApiError("Invalid or expired access token", 401);
  }
});
