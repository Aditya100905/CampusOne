import Faculty from "../models/faculty.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const createFaculty = asyncHandler(async (req, res) => {
    const {
        userId,
        institutionId,
        departmentId,
        designation,
        courses,
        dateOfJoining,
    } = req.body;

    if (!userId || !institutionId || !departmentId || !designation || !dateOfJoining) {
        throw new ApiError("All required fields must be provided", 400);
    }

    const exists = await Faculty.findOne({ userId });
    if (exists) {
        throw new ApiError("Faculty already exists for this user", 409);
    }

    const faculty = await Faculty.create({
        userId,
        institutionId,
        departmentId,
        designation,
        courses: courses || [],
        dateOfJoining,
    });

    res.json(
        new ApiResponse("Faculty created successfully", 201, faculty)
    );
});

const registerFaculty = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        phone,
        password,
        institutionId,
        departmentId,
        designation,
        dateOfJoining,
        courses
    } = req.body;

    if (!name || !email || !phone || !password ||
        !institutionId || !departmentId || !designation || !dateOfJoining
    ) {
        throw new ApiError("All required fields must be provided", 400);
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) throw new ApiError("Email already in use", 400);

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) throw new ApiError("Phone number already in use", 400);

    const user = await User.create({
        name,
        email,
        phone,
        password,
        role: "faculty",
        avatar: process.env.BACKEND_URL + "/user.png",
    });

    const faculty = await Faculty.create({
        userId: user._id,
        institutionId,
        departmentId,
        designation,
        courses: courses || [],
        dateOfJoining,
    });

    const cleanUser = await User.findById(user._id)
        .select("-password -resetPasswordToken -emailVerificationToken")

    return res.status(201).json(
        new ApiResponse("Faculty registered successfully", 201, {
            user: cleanUser,
            faculty,
        })
    );
});

const editFaculty = asyncHandler(async (req, res) => {
    const { facultyId } = req.params;

    const faculty = await Faculty.findByIdAndUpdate(
        facultyId,
        req.body,
        { new: true }
    );

    if (!faculty) {
        throw new ApiError("Faculty not found", 404);
    }

    res.json(
        new ApiResponse("Faculty updated successfully", 200, faculty)
    );
});

const getFacultiesByInstitution = asyncHandler(async (req, res) => {
    const { institutionId } = req.params;

    const faculties = await Faculty.find({ institutionId })
        .populate("userId", "name email phone")
        .populate("departmentId", "name");

    res.json(
        new ApiResponse("Faculties fetched successfully", 200, faculties)
    );
});

const getFacultiesByDepartment = asyncHandler(async (req, res) => {
    const { departmentId } = req.params;

    const faculties = await Faculty.find({ departmentId })
        .populate("userId", "name email")
        .populate("courses", "name code");

    res.json(
        new ApiResponse("Faculties fetched successfully", 200, faculties)
    );
});

const getFacultyById = asyncHandler(async (req, res) => {
    const { facultyId } = req.params;

    const faculty = await Faculty.findById(facultyId)
        .populate("userId", "name email phone")
        .populate("institutionId", "name")
        .populate("departmentId", "name")
        .populate("courses", "name code");

    if (!faculty) {
        throw new ApiError("Faculty not found", 404);
    }

    res.json(
        new ApiResponse("Faculty fetched successfully", 200, faculty)
    );
});

const deleteFaculty = asyncHandler(async (req, res) => {
    const { facultyId } = req.params;

    const faculty = await Faculty.findByIdAndDelete(facultyId);

    if (!faculty) {
        throw new ApiError("Faculty not found", 404);
    }

    res.json(
        new ApiResponse("Faculty deleted successfully", 200)
    );
});

const updateFacultyDepartment = asyncHandler(async (req, res) => {
    const { facultyId } = req.params;
    const { departmentId } = req.body;

    if (!departmentId) {
        throw new ApiError("Department ID is required", 400);
    }

    const faculty = await Faculty.findByIdAndUpdate(
        facultyId,
        { departmentId },
        { new: true }
    );

    if (!faculty) {
        throw new ApiError("Faculty not found", 404);
    }

    res.json(
        new ApiResponse("Department updated successfully", 200, faculty)
    );
});

const updateFacultyCourses = asyncHandler(async (req, res) => {
    const { facultyId } = req.params;
    const { courses } = req.body;

    if (!Array.isArray(courses)) {
        throw new ApiError("Courses must be an array", 400);
    }

    const faculty = await Faculty.findByIdAndUpdate(
        facultyId,
        { courses },
        { new: true }
    );

    if (!faculty) {
        throw new ApiError("Faculty not found", 404);
    }

    res.json(
        new ApiResponse("Courses updated successfully", 200, faculty)
    );
});

const toggleFacultyInCharge = asyncHandler(async (req, res) => {
    const { facultyId } = req.params;
    const { isInCharge } = req.body;

    if (typeof isInCharge !== "boolean") {
        throw new ApiError("isInCharge must be boolean", 400);
    }

    const faculty = await Faculty.findByIdAndUpdate(
        facultyId,
        { isInCharge },
        { new: true }
    );

    if (!faculty) {
        throw new ApiError("Faculty not found", 404);
    }

    res.json(
        new ApiResponse(
            `Faculty ${isInCharge ? "marked" : "unmarked"} as in-charge`,
            200,
            faculty
        )
    );
});

export {
    createFaculty,
    registerFaculty,
    editFaculty,
    getFacultiesByInstitution,
    getFacultiesByDepartment,
    getFacultyById,
    deleteFaculty,
    updateFacultyDepartment,
    updateFacultyCourses,
    toggleFacultyInCharge,
};
