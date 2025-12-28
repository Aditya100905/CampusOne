import crypto from "crypto";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import sendEmail from "../utils/sendEmail.js";
import { cookiesOptions } from "../utils/cookiesOptions.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password || !role) {
    throw new ApiError("All fields are required", 400);
  }

  const exists = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (exists) {
    throw new ApiError("User already exists", 409);
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
    avatar: process.env.BACKEND_URL + "/user.png",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -resetPasswordToken -emailVerificationToken"
  );

  res.json(
    new ApiResponse("User registered successfully", 201, createdUser)
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  if (!email && !phone) {
    throw new ApiError("Email or Phone is required", 400);
  }

  const user = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError("Invalid credentials", 401);
  }

  const accessToken = user.generateAccessToken();
  user.accessToken = accessToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select(
    "-password -resetPasswordToken -emailVerificationToken"
  );

  res
    .cookie("accessToken", accessToken, cookiesOptions)
    .json(
      new ApiResponse("Login successful", 200, {
        user: loggedInUser,
        accessToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { accessToken: 1 } },
    { new: true }
  );

  res
    .clearCookie("accessToken", cookiesOptions)
    .json(new ApiResponse("Logged out successfully", 200));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -resetPasswordToken -emailVerificationToken"
  );

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  res.json(new ApiResponse("User fetched successfully", 200, user));
});

const forgotUserPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError("Email is required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await sendEmail({
    email,
    subject: "Password Reset",
    message: `Click the link to reset your password:\n\n${resetUrl}\n\nValid for 15 minutes.`,
  });

  res.json(new ApiResponse("Password reset email sent", 200));
});

const resetUserPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    throw new ApiError("New password is required", 400);
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError("Invalid or expired token", 400);
  }

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  res.json(new ApiResponse("Password reset successful", 200));
});

const sendUserEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (user.isEmailVerified) {
    throw new ApiError("Email already verified", 400);
  }

  const verificationToken = user.getVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  await sendEmail({
    email: user.email,
    subject: "Verify Email",
    message: `Verify your email:\n\n${verifyUrl}\n\nValid for 15 minutes.`,
  });

  res.json(new ApiResponse("Verification email sent", 200));
});

const verifyUserEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError("Invalid or expired token", 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationTokenExpires = null;

  await user.save();

  res.json(new ApiResponse("Email verified successfully", 200));
});

const updateUserAvatar = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  if (!req.file) {
    throw new ApiError("No file uploaded", 400);
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: "user-avatars",
      format: "webp",
      transformation: [{ width: 300, height: 300, crop: "fill" }],
    },
    async (error, result) => {
      if (error) {
        return next(new ApiError("Failed to upload avatar", 500));
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { avatar: result.secure_url },
        {
          new: true,
          select:
            "-password -accessToken -resetPasswordToken -emailVerificationToken",
        }
      );

      res.json(
        new ApiResponse("Avatar updated successfully", 200, updatedUser)
      );
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  forgotUserPassword,
  resetUserPassword,
  sendUserEmailVerification,
  verifyUserEmail,
  updateUserAvatar,
};
