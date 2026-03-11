import crypto from "crypto";
import { Institution } from "../models/institution.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import sendEmail from "../utils/sendEmail.js";
import { cookiesOptions } from "../utils/cookiesOptions.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import { Faculty } from "../models/faculty.model.js";
import Department from "../models/department.model.js";
import { Student } from "../models/student.model.js";
import { Branch } from '../models/branch.model.js';
import mongoose from "mongoose";
import { User } from '../models/user.model.js';
import Course from "../models/course.model.js";
import jwt from "jsonwebtoken";
import { RefreshToken } from "../models/refreshToken.model.js";

const registerInstitution = asyncHandler(async (req, res) => {
  const {
    name,
    code,
    address,
    establishedYear,
    contactEmail,
    contactPhone,
    password,
    type,
  } = req.body;

  if (
    !name ||
    !code ||
    !address ||
    !establishedYear ||
    !contactEmail ||
    !contactPhone ||
    !password ||
    !type
  ) {
    throw new ApiError("All fields are required", 400);
  }

  const emailExists = await Institution.findOne({ contactEmail });
  if (emailExists) {
    throw new ApiError("Email already in use", 409);
  }

  const codeExists = await Institution.findOne({ code });
  if (codeExists) {
    throw new ApiError("Institution code already in use", 409);
  }

  const phoneExists = await Institution.findOne({ contactPhone });
  if (phoneExists) {
    throw new ApiError("Contact phone already in use", 409);
  }

  const nameExists = await Institution.findOne({ name });
  if (nameExists) {
    throw new ApiError("Institution name already in use", 409);
  }

  const institution = await Institution.create({
    name,
    code,
    address,
    establishedYear,
    contactEmail,
    contactPhone,
    password,
    type,
    avatar: process.env.BACKEND_URL + "/user.png",
  });

  const createdInstitution = await Institution.findById(institution._id)
    .select("-password -resetPasswordToken -emailVerificationToken");

  res.json(
    new ApiResponse(
      "Institution registered successfully",
      201,
      createdInstitution
    )
  );
});

const loginInstitution = asyncHandler(async (req, res) => {
  const { contactEmail, code, password } = req.body;

  if (!contactEmail && !code) {
    throw new ApiError("Email or Institution Code is required", 400);
  }

  const institution = await Institution.findOne({
    $or: [{ contactEmail }, { code }],
  });

  if (!institution) {
    throw new ApiError("Institution not found", 404);
  }

  const isMatch = await institution.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiError("Invalid credentials", 401);
  }

  const accessToken = institution.generateAccessToken();
  const refreshToken = institution.generateRefreshToken();

  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await RefreshToken.create({
    institutionId: institution._id,
    token: hashedToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const loggedInInstitution = await Institution.findById(institution._id)
    .select("-password -resetPasswordToken -emailVerificationToken");

  res
    .cookie("accessToken", accessToken, cookiesOptions)
    .cookie("refreshToken", refreshToken, {
      ...cookiesOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse("Login successful", 200, {
        institution: loggedInInstitution,
      })
    );
});

const logoutInstitution = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    await RefreshToken.deleteOne({ token: hashedToken, institutionId: req.institution._id });
  }

  res
    .clearCookie("accessToken", cookiesOptions)
    .clearCookie("refreshToken", cookiesOptions)
    .json(new ApiResponse("Logged out successfully", 200));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new ApiError("Refresh token missing", 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError("Invalid or expired refresh token", 401);
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const storedToken = await RefreshToken.findOne({
    token: hashedToken,
    institutionId: decoded.id,
    expiresAt: { $gt: new Date() }
  });

  if (!storedToken) {
    throw new ApiError("Invalid refresh token", 401);
  }

  const institution = await Institution.findById(decoded.id).select("-password");

  if (!institution) {
    throw new ApiError("Institution not found", 404);
  }
  await RefreshToken.deleteOne({ token: hashedToken, institutionId: req.institution._id });

  const newAccessToken = institution.generateAccessToken();
  const newRefreshToken = institution.generateRefreshToken();

  const newHashedToken = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  await RefreshToken.create({
    institutionId: institution._id,
    token: newHashedToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  res
    .cookie("accessToken", newAccessToken, cookiesOptions)
    .cookie("refreshToken", newRefreshToken, {
      ...cookiesOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(new ApiResponse("Token refreshed", 200));
});

const updateInstitution = asyncHandler(async (req, res) => {
  const institutionId = req.institution._id;

  const {
    name,
    code,
    address,
    establishedYear,
    contactEmail,
    contactPhone,
    type
  } = req.body;

  if (contactEmail) {
    const emailExists = await Institution.findOne({
      contactEmail,
      _id: { $ne: institutionId }
    });

    if (emailExists) {
      throw new ApiError("Email already in use", 409);
    }
  }

  if (code) {
    const codeExists = await Institution.findOne({
      code,
      _id: { $ne: institutionId }
    });

    if (codeExists) {
      throw new ApiError("Institution code already in use", 409);
    }
  }

  if (contactPhone) {
    const phoneExists = await Institution.findOne({
      contactPhone,
      _id: { $ne: institutionId }
    });

    if (phoneExists) {
      throw new ApiError("Contact phone already in use", 409);
    }
  }

  if (name) {
    const nameExists = await Institution.findOne({
      name,
      _id: { $ne: institutionId }
    });

    if (nameExists) {
      throw new ApiError("Institution name already in use", 409);
    }
  }

  const updates = {};
  if (name) updates.name = name;
  if (code) updates.code = code;
  if (address) updates.address = address;
  if (establishedYear) updates.establishedYear = establishedYear;
  if (contactEmail) updates.contactEmail = contactEmail;
  if (contactPhone) updates.contactPhone = contactPhone;
  if (type) updates.type = type;

  if (Object.keys(updates).length === 0) {
    throw new ApiError("No valid fields provided for update", 400);
  }

  const updatedInstitution = await Institution.findByIdAndUpdate(
    institutionId,
    updates,
    {
      new: true,
      runValidators: true,
      select: "-password -resetPasswordToken -emailVerificationToken"
    }
  );

  if (!updatedInstitution) {
    throw new ApiError("Institution not found", 404);
  }

  res.json(
    new ApiResponse(
      "Institution updated successfully",
      200,
      updatedInstitution
    )
  );
});

const getAllInstitutions = asyncHandler(async (req, res) => {
  const institutions = await Institution.find();

  res.json(
    new ApiResponse(
      "Institutions fetched successfully",
      200,
      institutions
    )
  );
});

const getInstitutionById = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;
  const institution = await Institution.findById(institutionId);

  if (!institution)
    throw new ApiError("Institution not found", 404);

  res.json(
    new ApiResponse(
      "Institution fetched successfully",
      200,
      institution
    )
  )
});

const getCurrentInstitution = asyncHandler(async (req, res) => {
  const institution = await Institution.findById(req.institution._id)
    .select("-password -resetPasswordToken -emailVerificationToken");

  if (!institution) {
    throw new ApiError("Institution not found", 404);
  }

  res.json(
    new ApiResponse("Institution fetched successfully", 200, institution)
  );
});

const forgotInstitutionPassword = asyncHandler(async (req, res) => {
  const { contactEmail } = req.body;

  if (!contactEmail) {
    throw new ApiError("Email is required", 400);
  }

  const institution = await Institution.findOne({ contactEmail });
  if (!institution) {
    throw new ApiError("Institution not found", 404);
  }

  const resetToken = institution.getResetPasswordToken();
  await institution.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/institution/reset-password/${resetToken}`;

  await sendEmail({
    email: contactEmail,
    subject: "Institution Password Reset",
    message: `Click the link to reset your password:\n\n${resetUrl}\n\nThis link is valid for 15 minutes.`,
  });

  res.json(new ApiResponse("Password reset email sent", 200));
});

const resetInstitutionPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    throw new ApiError("New password is required", 400);
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const institution = await Institution.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!institution) {
    throw new ApiError("Invalid or expired token", 400);
  }

  institution.password = newPassword;
  institution.resetPasswordToken = null;
  institution.resetPasswordExpires = null;

  await institution.save();

  res.json(new ApiResponse("Password reset successful", 200));
});

const sendInstitutionEmailVerification = asyncHandler(async (req, res) => {
  const institution = await Institution.findById(req.institution._id);

  if (!institution) {
    throw new ApiError("Institution not found", 404);
  }

  if (institution.isEmailVerified) {
    throw new ApiError("Email already verified", 400);
  }

  const verificationToken = institution.getVerificationToken();
  await institution.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.FRONTEND_URL}/institution/verify-email/${verificationToken}`;

  await sendEmail({
    email: institution.contactEmail,
    subject: "Verify Institution Email",
    message: `Verify your institution email:\n\n${verifyUrl}\n\nValid for 15 minutes.`,
  });

  res.json(new ApiResponse("Verification email sent", 200));
});

const verifyInstitutionEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const institution = await Institution.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpires: { $gt: Date.now() },
  });

  if (!institution) {
    throw new ApiError("Invalid or expired token", 400);
  }

  institution.isEmailVerified = true;
  institution.emailVerificationToken = null;
  institution.emailVerificationTokenExpires = null;

  await institution.save();

  res.json(new ApiResponse("Email verified successfully", 200));
});

const updateInstitutionAvatar = asyncHandler(async (req, res, next) => {
  const institutionId = req.institution._id;

  if (!req.file) {
    throw new ApiError("No file uploaded", 400);
  }

  const institution = await Institution.findById(institutionId);
  if (!institution) {
    throw new ApiError("Institution not found", 404);
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: "institution-avatars",
      format: "webp",
      transformation: [{ width: 300, height: 300, crop: "fill" }],
    },
    async (error, result) => {
      if (error) {
        return next(new ApiError("Failed to upload avatar", 500));
      }

      const updatedInstitution = await Institution.findByIdAndUpdate(
        institutionId,
        {
          avatar: result.secure_url,
        },
        {
          new: true,
          select:
            "-password -accessToken -resetPasswordToken -emailVerificationToken",
        }
      );

      res.json(
        new ApiResponse(
          "Institution avatar updated successfully",
          200,
          updatedInstitution
        )
      );
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

const deleteInstitution = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const institution = await Institution.findById(institutionId).session(session);
    if (!institution) throw new ApiError("Institution not found", 404);

    // Deletion hierarchy:
    // Institution
    //     ├─ Branch
    //     ├─ Department
    //     │   └─ Course
    //     ├─ Faculty
    //     │   └─ User
    //     └─ Student
    //         └─ User

    // gather userIds of students/faculty in institution
    const facultyUserIds = await Faculty.distinct("userId", { institutionId }).session(session);
    const studentUserIds = await Student.distinct("userId", { institutionId }).session(session);

    // courses via department
    const departments = await Department.find({ institutionId }, '_id').session(session);
    const departmentIds = departments.map(d => d._id);

    await Course.deleteMany({ departmentId: { $in: departmentIds } }).session(session);

    // faculty + student delete
    await Faculty.deleteMany({ institutionId }).session(session);
    await Student.deleteMany({ institutionId }).session(session);

    // branch + department delete
    await Branch.deleteMany({ institutionId }).session(session);
    await Department.deleteMany({ institutionId }).session(session);

    // institution delete
    await Institution.findByIdAndDelete(institutionId).session(session);

    // delete users linked to this institution
    await User.deleteMany({
      _id: { $in: [...facultyUserIds, ...studentUserIds] }
    }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json(new ApiResponse("Institution deleted successfully", 200));
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

const checkInstitutionCodeExists = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) {
    throw new ApiError("Institution code is required", 400);
  }
  const exists = await Institution.findOne({ code });
  res.json(
    new ApiResponse(
      exists ? "Institution code already exists" : "Institution code available",
      200,
      { exists: !!exists }
    )
  );
});


export {
  registerInstitution,
  loginInstitution,
  logoutInstitution,
  refreshAccessToken,
  getCurrentInstitution,
  forgotInstitutionPassword,
  resetInstitutionPassword,
  sendInstitutionEmailVerification,
  verifyInstitutionEmail,
  updateInstitutionAvatar,
  updateInstitution,
  getAllInstitutions,
  getInstitutionById,
  deleteInstitution,
  checkInstitutionCodeExists
};
