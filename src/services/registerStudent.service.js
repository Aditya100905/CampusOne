import { Student } from "../models/student.model.js";
import { User } from "../models/user.model.js";
import { Institution } from "../models/institution.model.js";
import { Branch } from "../models/branch.model.js";

export const registerStudentService = async (payload) => {
  const {
    name,
    email,
    phone,
    password,
    institutionCode,
    branchCode,
    enrollmentNumber,
    dob,
    semester,
    admissionYear,
    hostelStatus,
    guardianDetails,
  } = payload;

  if (
    !name || !email || !phone || !password ||
    !institutionCode || !branchCode ||!dob ||
    !semester || !admissionYear || !enrollmentNumber
  ) {
    throw new Error("Required fields missing");
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) throw new Error("Email in use");

  const existingPhone = await User.findOne({ phone });
  if (existingPhone) throw new Error("Phone in use");

  const institution = await Institution.findOne({ code: institutionCode });
  if (!institution) throw new Error("Invalid institution code");

  const branch = await Branch.findOne({ code: branchCode });
  if (!branch) throw new Error("Invalid branch code");

  let parsedGuardian = [];
  if (guardianDetails) {
    try {
      const parsed = JSON.parse(guardianDetails);
      parsedGuardian = Array.isArray(parsed) ? parsed : [parsed];
    } catch (err) {
      throw new Error("Invalid guardian details format");
    }
  }

  let user;
  let student;

  try {
    user = await User.create({
      name,
      email,
      phone,
      dob,
      password,
      role: "Student",
      avatar: process.env.BACKEND_URL + "/user.png",
    });

    student = await Student.create({
      userId: user._id,
      institutionId: institution._id,
      branchId: branch._id,
      enrollmentNumber,
      semester: Number(semester),
      admissionYear: Number(admissionYear),
      hostelStatus: hostelStatus ?? false,
      guardianDetails: parsedGuardian,
    });
    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;
    delete sanitizedUser.accessToken;

    return {
      user: sanitizedUser,
      student
    };
  } catch (err) {
    if (user) await User.deleteOne({ _id: user._id });
    throw err;
  }
};
