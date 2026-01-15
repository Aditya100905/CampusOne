import Student from "../models/student.model.js";
import { User } from "../models/user.model.js";
import { Institution } from "../models/institution.model.js";
import Department from "../models/department.model.js";
import Course from "../models/course.model.js";

export const registerStudentService = async (payload) => {
  const {
    name,
    email,
    phone,
    password,
    institutionCode,
    departmentCode,
    enrollmentNumber,
    courseCodes,
    semester,
    admissionYear,
    hostelStatus,
    guardianDetails,
  } = payload;

  if (
    !name || !email || !phone || !password ||
    !institutionCode || !departmentCode ||
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

  const department = await Department.findOne({ code: departmentCode });
  if (!department) throw new Error("Invalid department code");

  let courses = [];
  if (courseCodes) {
    const codesArray = courseCodes.split(",").map(c => c.trim());
    courses = await Course.find({ code: { $in: codesArray } });
    if (courses.length !== codesArray.length) {
      throw new Error("Some course codes are invalid");
    }
  }

  let user;
  try {
    user = await User.create({
      name,
      email,
      phone,
      password,
      role: "Student",
      avatar: process.env.BACKEND_URL + "/user.png",
    });

    await Student.create({
      userId: user._id,
      institutionId: institution._id,
      departmentId: department._id,
      enrollmentNumber,
      courseIds: courses.map(c => c._id),
      semester,
      admissionYear,
      hostelStatus: hostelStatus ?? false,
      guardianDetails: guardianDetails ? JSON.parse(guardianDetails) : {},
    });

  } catch (err) {
    if (user) await User.deleteOne({ _id: user._id });
    throw err;
  }
};
