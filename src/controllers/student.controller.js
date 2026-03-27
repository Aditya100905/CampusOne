import mongoose from "mongoose";
import { Student } from "../models/student.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const assertObjectId = (id, field = "id") => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(`Invalid ${field}`, 400);
    }
};

const createStudent = asyncHandler(async (req, res) => {
    const {
        userId,
        institutionId,
        branchId,
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
        !branchId ||
        !enrollmentNumber ||
        !semester ||
        !admissionYear
    ) {
        throw new ApiError("All required fields must be provided", 400);
    }

    assertObjectId(userId, "userId");
    assertObjectId(institutionId, "institutionId");
    assertObjectId(branchId, "branchId");

    if (Array.isArray(courseIds)) {
        courseIds.forEach(id => assertObjectId(id, "courseId"));
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
        branchId,
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

const editStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { userId, name, phone, dob } = req.body;

    assertObjectId(studentId, "studentId");

    const student = await Student.findById(studentId);
    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    if (req.institution) {
        if (
            student.institutionId.toString() !==
            req.institution._id.toString()
        ) {
            throw new ApiError("Unauthorized to edit this student", 403);
        }
    }

    if (req.body.enrollmentNumber) {
        throw new ApiError("Enrollment number cannot be changed", 400);
    }

    if (req.body.avatar) {
        throw new ApiError("You do not have permission to change avatar", 400);
    }

    if (userId && (name || phone || dob)) {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError("User not found", 404);
        }

        if (student.userId.toString() !== user._id.toString()) {
            throw new ApiError("User does not belong to this student", 400);
        }

        await User.findByIdAndUpdate(
            userId,
            { $set: { name, phone, dob } },
            { runValidators: true }
        );
    }

    delete req.body.userId;
    delete req.body.institutionId;
    delete req.body.name;
    delete req.body.phone;
    delete req.body.dob;

    const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        { $set: req.body },
        { new: true, runValidators: true }
    );

    res.json(
        new ApiResponse("Student updated successfully", 200, updatedStudent)
    );
});

const getStudentsByInstitution = asyncHandler(async (req, res) => {
    const { institutionId } = req.params;

    assertObjectId(institutionId, "institutionId");

    const students = await Student.find({ institutionId })
        .populate("userId", "name email phone")
        .populate("branchId", "name")
        .populate("courseIds", "name code");

    res.json(
        new ApiResponse("Students fetched successfully", 200, students)
    );
});

const getStudentsByBranch = asyncHandler(async (req, res) => {
    const { branchId } = req.params;

    assertObjectId(branchId, "branchId");

    const students = await Student.find({ branchId, isActive: true })
        .populate("userId", "name email")
        .populate("courseIds", "name code");

    res.json(
        new ApiResponse("Students fetched successfully", 200, students)
    );
});

const getStudentById = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    assertObjectId(studentId, "studentId");

    const student = await Student.findById(studentId)
        .populate("userId", "name email phone")
        .populate("institutionId", "name")
        .populate("branchId", "name")
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

    assertObjectId(studentId, "studentId");

    const student = await Student.findById(studentId);
    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    const user = await User.findById(student.userId);
    if (!user) {
        throw new ApiError("User not found for this student", 404);
    }
    await Student.findByIdAndDelete(studentId);
    await User.findByIdAndDelete(user._id);
    res.json(
        new ApiResponse("Student deleted successfully", 200)
    );
});

const updateStudentBranch = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { branchId } = req.body;

    assertObjectId(studentId, "studentId");
    assertObjectId(branchId, "branchId");

    const student = await Student.findByIdAndUpdate(
        studentId,
        { branchId },
        { new: true }
    );

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    res.json(
        new ApiResponse("Branch updated successfully", 200, student)
    );
});

const addCourses = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { courseIds } = req.body;

    assertObjectId(studentId, "studentId");

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
        throw new ApiError("courseIds must be a non-empty array", 400);
    }

    courseIds.forEach(id => assertObjectId(id, "courseId"));

    const student = await Student.findById(studentId);
    if (!student) throw new ApiError("Student not found", 404);

    for (const cid of courseIds) {
        if (!student.courseIds.some(c => c.toString() === cid)) {
            student.courseIds.push(cid);
        }
    }

    await student.save();

    res.json(
        new ApiResponse("Courses added successfully", 200, student)
    );
});

const deleteCourses = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { courseIds } = req.body;

    assertObjectId(studentId, "studentId");

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
        throw new ApiError("courseIds must be a non-empty array", 400);
    }

    courseIds.forEach(id => assertObjectId(id, "courseId"));

    const student = await Student.findByIdAndUpdate(
        studentId,
        { $pull: { courseIds: { $in: courseIds } } },
        { new: true }
    );

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    res.json(
        new ApiResponse("Courses removed successfully", 200, student)
    );
});

const deleteStudentPrevCourses = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { courseIds } = req.body;

    assertObjectId(studentId, "studentId");

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
        throw new ApiError("courseIds must be a non-empty array", 400);
    }

    courseIds.forEach(id => assertObjectId(id, "courseId"));

    const student = await Student.findByIdAndUpdate(
        studentId,
        {
            $pull: {
                prevCourses: { courseId: { $in: courseIds } }
            }
        },
        { new: true }
    );

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    res.json(
        new ApiResponse("Previous courses removed successfully", 200, student)
    );
});

const finishCoursesById = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { courseIds } = req.body;

    assertObjectId(studentId, "studentId");

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
        throw new ApiError("courseIds must be a non-empty array", 400);
    }

    const objIds = courseIds.map(id => new mongoose.Types.ObjectId(id));

    const updated = await Student.findOneAndUpdate(
        {
            _id: studentId,
            courseIds: { $in: objIds }
        },
        [
            {
                $set: {
                    _toFinish: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$courseIds",
                                    as: "c",
                                    cond: { $in: ["$$c", objIds] }
                                }
                            },
                            as: "cf",
                            in: { courseId: "$$cf", semester: "$semester" }
                        }
                    }
                }
            },
            {
                $set: {
                    prevCourses: {
                        $setUnion: ["$prevCourses", "$_toFinish"]
                    },
                    courseIds: {
                        $filter: {
                            input: "$courseIds",
                            as: "c",
                            cond: { $not: { $in: ["$$c", objIds] } }
                        }
                    }
                }
            },
            { $unset: "_toFinish" }
        ],
        { new: true, updatePipeline: true }
    );

    if (!updated)
        throw new ApiError("Student not found or no matching courseIds", 404);

    res.json(new ApiResponse("Courses finished successfully", 200, updated));
});

const updateStudentSemester = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    assertObjectId(studentId, "studentId");

    const updated = await Student.findOneAndUpdate(
        { _id: studentId },
        [
            {
                $set: {
                    prevCourses: {
                        $concatArrays: [
                            "$prevCourses",
                            {
                                $map: {
                                    input: "$courseIds",
                                    as: "c",
                                    in: {
                                        courseId: "$$c",
                                        semester: "$semester"
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            { $set: { courseIds: [] } },
            { $set: { semester: { $add: ["$semester", 1] } } }
        ],
        {
            new: true,
            runValidators: true
        }
    );

    if (!updated) {
        throw new ApiError("Student not found", 404);
    }

    res.json(new ApiResponse("Semester updated successfully", 200, updated));
});


const updateHostelStatus = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { hostelStatus } = req.body;

    assertObjectId(studentId, "studentId");

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

const modifyActiveStatus = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { isActive } = req.body;

    assertObjectId(studentId, "studentId");

    if (typeof isActive !== "boolean") {
        throw new ApiError("isActive must be boolean", 400);
    }

    const student = await Student.findByIdAndUpdate(
        studentId,
        { isActive },
        { new: true }
    );

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    res.json(
        new ApiResponse(
            `Student has been ${isActive ? "activated" : "deactivated"}`,
            200,
            student
        )
    );
});

export {
    createStudent,
    editStudent,
    getStudentsByInstitution,
    getStudentsByBranch,
    getStudentById,
    deleteStudent,
    updateStudentBranch,
    addCourses,
    deleteCourses,
    deleteStudentPrevCourses,
    updateStudentSemester,
    updateHostelStatus,
    modifyActiveStatus,
    finishCoursesById
};
