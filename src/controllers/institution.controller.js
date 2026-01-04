import crypto from "crypto";
import { Institution } from "../models/institution.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import sendEmail from "../utils/sendEmail.js";
import { cookiesOptions } from "../utils/cookiesOptions.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";

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
  institution.accessToken = accessToken;
  await institution.save({ validateBeforeSave: false });

  const loggedInInstitution = await Institution.findById(institution._id)
    .select("-password -resetPasswordToken -emailVerificationToken");

  res
    .cookie("accessToken", accessToken, cookiesOptions)
    .json(
      new ApiResponse("Login successful", 200, {
        institution: loggedInInstitution,
        accessToken,
      })
    );
});

const logoutInstitution = asyncHandler(async (req, res) => {
  await Institution.findByIdAndUpdate(
    req.institution._id,
    { $unset: { accessToken: 1 } },
    { new: true }
  );

  res
    .clearCookie("accessToken", cookiesOptions)
    .json(new ApiResponse("Logged out successfully", 200));
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

export {
  registerInstitution,
  loginInstitution,
  logoutInstitution,
  getCurrentInstitution,
  forgotInstitutionPassword,
  resetInstitutionPassword,
  sendInstitutionEmailVerification,
  verifyInstitutionEmail,
  updateInstitutionAvatar
};
