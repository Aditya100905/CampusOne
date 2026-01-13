import Student from "../models/student.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const createStudent = asyncHandler(async (req, res) => {
    const {
        userId,
        institutionId,
        departmentId,
        enrollmentNumber,
        courseIds,
        semester,
        admissionYear,
        hostelStatus,
        guardianDetails
    } = req.body;

    if (
        !userId ||
        !institutionId ||
        !departmentId ||
        !enrollmentNumber ||
        !semester ||
        !admissionYear
    ) {
        throw new ApiError("All required fields must be provided", 400);
    }

    const exists = await Student.findOne({
        $or: [{ userId }, { enrollmentNumber }]
    });

    if (exists) {
        throw new ApiError(
            "Student already exists with this user or enrollment number",
            409
        );
    }

    const student = await Student.create({
        userId,
        institutionId,
        departmentId,
        enrollmentNumber,
        courseIds: courseIds || [],
        semester,
        admissionYear,
        hostelStatus: hostelStatus ?? false,
        guardianDetails: guardianDetails || []
    });

    res.json(
        new ApiResponse("Student created successfully", 201, student)
    );
});

const registerStudent = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        phone,
        password,
        institutionId,
        departmentId,
        enrollmentNumber,
        courseIds,
        semester,
        admissionYear,
        hostelStatus,
        guardianDetails
    } = req.body;

    if (!name || !email || !phone || !password ||
        !institutionId || !departmentId || !enrollmentNumber ||
        !semester || !admissionYear
    ) {
        throw new ApiError("All required fields must be provided", 400);
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) throw new ApiError("Email already in use", 400);

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) throw new ApiError("Phone already in use", 400);

    const user = await User.create({
        name,
        email,
        phone,
        password,
        role: "student",
        avatar: process.env.BACKEND_URL + "/user.png",
    });

    const student = await Student.create({
        userId: user._id,
        institutionId,
        departmentId,
        enrollmentNumber,
        courseIds: courseIds || [],
        semester,
        admissionYear,
        hostelStatus: hostelStatus ?? false,
        guardianDetails: guardianDetails || {},
    });

    const cleanUser = await User.findById(user._id)
        .select("-password -resetPasswordToken -emailVerificationToken");

    return res.status(201).json(
        new ApiResponse("Student registered successfully", 201, {
            user: cleanUser,
            student,
        })
    );
});

const editStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    delete req.body.userId;
    delete req.body.institutionId;
    if (req.body.enrollmentNumber) {
        throw new ApiError("Enrollment number cannot be changed", 400);
    }

    const student = await Student.findByIdAndUpdate(
        studentId,
        req.body,
        { new: true }
    );

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    res.json(
        new ApiResponse("Student updated successfully", 200, student)
    );
});

const getStudentsByInstitution = asyncHandler(async (req, res) => {
    const { institutionId } = req.params;

    const students = await Student.find({ institutionId })
        .populate("userId", "name email phone")
        .populate("departmentId", "name")
        .populate("courseIds", "name code");

    res.json(
        new ApiResponse("Students fetched successfully", 200, students)
    );
});

const getStudentsByDepartment = asyncHandler(async (req, res) => {
    const { departmentId } = req.params;

    const students = await Student.find({ departmentId })
        .populate("userId", "name email")
        .populate("courseIds", "name code");

    res.json(
        new ApiResponse("Students fetched successfully", 200, students)
    );
});

const getStudentById = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    const student = await Student.findById(studentId)
        .populate("userId", "name email phone")
        .populate("institutionId", "name")
        .populate("departmentId", "name")
        .populate("courseIds", "name code");

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    res.json(
        new ApiResponse("Student fetched successfully", 200, student)
    );
});

const deleteStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    const student = await Student.findByIdAndDelete(studentId);

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    res.json(
        new ApiResponse("Student deleted successfully", 200)
    );
});

const updateStudentDepartment = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { departmentId } = req.body;

    if (!departmentId) {
        throw new ApiError("Department ID is required", 400);
    }

    const student = await Student.findByIdAndUpdate(
        studentId,
        { departmentId },
        { new: true }
    );

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    res.json(
        new ApiResponse("Department updated successfully", 200, student)
    );
});

const updateStudentCourses = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { courseIds } = req.body;

    if (!Array.isArray(courseIds)) {
        throw new ApiError("courseIds must be an array", 400);
    }

    const student = await Student.findByIdAndUpdate(
        studentId,
        { courseIds },
        { new: true }
    );

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    res.json(
        new ApiResponse("Courses updated successfully", 200, student)
    );
});

const updateHostelStatus = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { hostelStatus } = req.body;

    if (typeof hostelStatus !== "boolean") {
        throw new ApiError("hostelStatus must be boolean", 400);
    }

    const student = await Student.findByIdAndUpdate(
        studentId,
        { hostelStatus },
        { new: true }
    );

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    res.json(
        new ApiResponse(
            `Hostel status ${hostelStatus ? "enabled" : "disabled"}`,
            200,
            student
        )
    );
});

export {
    createStudent,
    registerStudent,
    editStudent,
    getStudentsByInstitution,
    getStudentsByDepartment,
    getStudentById,
    deleteStudent,
    updateStudentDepartment,
    updateStudentCourses,
    updateHostelStatus
};
