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

const checkActiveStudentUser = async (studentId) => {
    const student = await Student.findById(studentId).populate("userId");

    if (!student) {
        throw new ApiError("Student not found", 404);
    }

    if (!student.userId || student.userId.isActive === false) {
        throw new ApiError("Associated user is inactive", 403);
    }

    return student;

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
        .populate("userId", "name email phone avatar")
        .populate("institutionId", "name")
        .populate("branchId", "name")
        .populate("courseIds", "name code")
        .populate("prevCourses.courseId", "name code");

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

    await checkActiveStudentUser(studentId);

    const student = await Student.findByIdAndUpdate(
        studentId,
        { branchId },
        { new: true }
    );

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

    const objCourseIds = courseIds.map(id => {
        assertObjectId(id, "courseId");
        return id;
    });

    await checkActiveStudentUser(studentId);

    const student = await Student.findByIdAndUpdate(
        studentId,
        {
            $addToSet: {
                courseIds: { $each: objCourseIds }
            }
        },
        { new: true }
    );

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

    const objCourseIds = courseIds.map(id => {
        assertObjectId(id, "courseId");
        return id;
    });

    await checkActiveStudentUser(studentId);

    const student = await Student.findByIdAndUpdate(
        studentId,
        {
            $pull: { courseIds: { $in: objCourseIds } }
        },
        { new: true }
    );

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

    const objCourseIds = courseIds.map(id => {
        assertObjectId(id, "courseId");
        return id;
    });

    await checkActiveStudentUser(studentId);

    const student = await Student.findByIdAndUpdate(
        studentId,
        {
            $pull: {
                prevCourses: { courseId: { $in: objCourseIds } }
            }
        },
        { new: true }
    );

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

    const objIds = courseIds.map(id => {
        assertObjectId(id, "courseId");
        return new mongoose.Types.ObjectId(id);
    });

    await checkActiveStudentUser(studentId);

    const updated = await Student.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(studentId),
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

    await checkActiveStudentUser(studentId);

    const updated = await Student.collection.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(studentId),
            courseIds: { $ne: [] }
        },
        [
            {
                $set: {
                    prevCourses: {
                        $concatArrays: [
                            { $ifNull: ["$prevCourses", []] },
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
        { returnDocument: "after" }
    );

    if (!updated.value) {
        throw new ApiError(
            "Student not found OR semester already updated",
            400
        );
    }

    res.json(new ApiResponse("Semester updated successfully", 200, updated.value));
});

const updateStudentsSemesterBulk = asyncHandler(async (req, res) => {
    const { branchId, admissionYear } = req.body;

    assertObjectId(branchId, "branchId");
    const students = await Student.find({
        branchId,
        admissionYear
    }).populate("userId").select("_id courseIds semester userId");

    if (!students.length) {
        throw new ApiError("No students found for given branch and year", 404);
    }
    const validStudents = [];
    const alreadyUpdated = [];
    const inactiveStudents = [];

    for (const s of students) {
        if (!s.userId || s.userId.isActive === false) {
            inactiveStudents.push(s._id);
        } else if (s.courseIds && s.courseIds.length > 0) {
            validStudents.push(s._id);
        } else {
            alreadyUpdated.push(s._id);
        }
    }
    if (validStudents.length === 0) {
        throw new ApiError(
            "No active students eligible for promotion",
            400
        );
    }
    const result = await Student.collection.updateMany(
        { _id: { $in: validStudents } },
        [
            {
                $set: {
                    prevCourses: {
                        $concatArrays: [
                            { $ifNull: ["$prevCourses", []] },
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
        ]
    );
    res.json(
        new ApiResponse("Bulk semester update completed", 200, {
            totalStudents: students.length,
            updatedCount: result.modifiedCount,
            skippedCount: alreadyUpdated.length,
            inactiveCount: inactiveStudents.length,
            skippedStudents: alreadyUpdated,
            inactiveStudents
        })
    );
});

const addCoursesByEnrollmentNumbers = asyncHandler(async (req, res) => {
    const { enrollmentNumbers, courseIds } = req.body;
    if (
        !Array.isArray(enrollmentNumbers) || enrollmentNumbers.length === 0 ||
        !Array.isArray(courseIds) || courseIds.length === 0
    ) {
        throw new ApiError("Invalid input format", 400);
    }

    const objCourseIds = courseIds.map(id => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(`Invalid courseId: ${id}`, 400);
        }
        return new mongoose.Types.ObjectId(id);
    });
    const students = await Student.find({
        enrollmentNumber: { $in: enrollmentNumbers }
    })
        .populate("userId")
        .select("_id userId");

    const activeStudentIds = students
        .filter(s => s.userId?.isActive)
        .map(s => new mongoose.Types.ObjectId(s._id));

    if (activeStudentIds.length === 0) {
        throw new ApiError("No active students found", 404);
    }

    const result = await Student.collection.updateMany(
        { _id: { $in: activeStudentIds } },
        {
            $addToSet: {
                courseIds: { $each: objCourseIds }
            }
        }
    );

    res.json(new ApiResponse("Courses added successfully", 200, {
        matched: result.matchedCount ?? result.n,
        modified: result.modifiedCount ?? result.nModified
    }));
});

const finishCoursesByEnrollmentNumbers = asyncHandler(async (req, res) => {
    const { enrollmentNumbers, courseIds } = req.body;

    if (
        !Array.isArray(enrollmentNumbers) || enrollmentNumbers.length === 0 ||
        !Array.isArray(courseIds) || courseIds.length === 0
    ) {
        throw new ApiError("Invalid input format", 400);
    }

    const objCourseIds = courseIds.map(id => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(`Invalid courseId: ${id}`, 400);
        }
        return new mongoose.Types.ObjectId(id);
    });
    const students = await Student.find({
        enrollmentNumber: { $in: enrollmentNumbers }
    })
        .populate("userId")
        .select("_id userId");

    const activeStudentIds = students
        .filter(s => s.userId?.isActive)
        .map(s => new mongoose.Types.ObjectId(s._id));

    if (activeStudentIds.length === 0) {
        throw new ApiError("No active students found", 404);
    }
    const result = await Student.collection.updateMany(
        {
            _id: { $in: activeStudentIds },
            courseIds: { $in: objCourseIds }
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
                                    cond: { $in: ["$$c", objCourseIds] }
                                }
                            },
                            as: "cf",
                            in: {
                                courseId: "$$cf",
                                semester: "$semester"
                            }
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
                            cond: { $not: { $in: ["$$c", objCourseIds] } }
                        }
                    }
                }
            },
            { $unset: "_toFinish" }
        ]
    );

    if ((result.matchedCount ?? result.n) === 0) {
        throw new ApiError("No matching active students/courses found", 404);
    }

    res.json(new ApiResponse("Courses finished successfully", 200, {
        matched: result.matchedCount ?? result.n,
        modified: result.modifiedCount ?? result.nModified
    }));
});

const updateStudentsSemesterByEnrollmentNumbers = asyncHandler(async (req, res) => {
    const { enrollmentNumbers } = req.body;

    if (!Array.isArray(enrollmentNumbers) || enrollmentNumbers.length === 0) {
        throw new ApiError("enrollmentNumbers must be a non-empty array", 400);
    }

    const students = await Student.find({
        enrollmentNumber: { $in: enrollmentNumbers }
    })
        .populate("userId")
        .select("_id courseIds semester userId");

    if (!students.length) {
        throw new ApiError("No students found for given enrollment numbers", 404);
    }

    const validStudents = [];
    const alreadyUpdated = [];
    const inactiveStudents = [];

    for (const s of students) {
        if (!s.userId || s.userId.isActive === false) {
            inactiveStudents.push(s._id);
        } else if (s.courseIds && s.courseIds.length > 0) {
            validStudents.push(s._id);
        } else {
            alreadyUpdated.push(s._id);
        }
    }

    if (validStudents.length === 0) {
        throw new ApiError("No active students eligible for promotion", 400);
    }

    const result = await Student.collection.updateMany(
        { _id: { $in: validStudents } },
        [
            {
                $set: {
                    prevCourses: {
                        $concatArrays: [
                            { $ifNull: ["$prevCourses", []] },
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
        ]
    );

    res.json(
        new ApiResponse("Bulk semester update completed", 200, {
            totalStudents: students.length,
            updatedCount: result.modifiedCount,
            skippedCount: alreadyUpdated.length,
            inactiveCount: inactiveStudents.length,
            skippedStudents: alreadyUpdated,
            inactiveStudents
        })
    );

});

const bulkDeactivateStudentsByEnrollmentNumbers = asyncHandler(async (req, res) => {
    const { enrollmentNumbers } = req.body;

    if (!Array.isArray(enrollmentNumbers) || enrollmentNumbers.length === 0) {
        throw new ApiError("enrollmentNumbers must be a non-empty array", 400);
    }

    const students = await Student.find({
        enrollmentNumber: { $in: enrollmentNumbers }
    }).select("_id userId");

    if (!students.length) {
        throw new ApiError("No students found", 404);
    }

    const userIds = students
        .map(s => s.userId)
        .filter(Boolean);

    if (userIds.length === 0) {
        throw new ApiError("No valid users found for these students", 400);
    }

    const result = await User.updateMany(
        { _id: { $in: userIds } },
        { $set: { isActive: false } }
    );

    res.json(
        new ApiResponse("Students deactivated successfully", 200, {
            totalStudents: students.length,
            usersDeactivated: result.modifiedCount
        })
    );

});

const bulkDeactivateStudentsByBranchAndYear = asyncHandler(async (req, res) => {
    const { branchId, admissionYear } = req.body;

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
        throw new ApiError("Invalid branchId", 400);
    }

    const students = await Student.find({ branchId, admissionYear }).select("userId");

    if (students.length === 0) {
        throw new ApiError("No students found for given branch and admission year", 404);
    }

    const userIds = students
        .map(s => s.userId)
        .filter(Boolean);

    if (userIds.length === 0) {
        throw new ApiError("No valid users found for these students", 400);
    }

    const result = await User.updateMany(
        { _id: { $in: userIds } },
        { $set: { isActive: false } }
    );

    res.json(
        new ApiResponse("Students deactivated successfully", 200, {
            totalStudents: students.length,
            usersDeactivated: result.modifiedCount
        })
    );
});

const addCoursesByBranchAndYearOfAdmission = asyncHandler(async (req, res) => {
    const { branchId, admissionYear, courseIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
        throw new ApiError("Invalid branchId", 400);
    }

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
        throw new ApiError("courseIds must be a non-empty array", 400);
    }

    const objCourseIds = courseIds.map(id => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(`Invalid courseId: ${id} `, 400);
        }
        return new mongoose.Types.ObjectId(id);
    });
    const students = await Student.find({ branchId, admissionYear })
        .populate("userId")
        .select("_id userId");

    const activeStudentIds = students
        .filter(s => s.userId?.isActive)
        .map(s => new mongoose.Types.ObjectId(s._id));

    if (activeStudentIds.length === 0) {
        throw new ApiError("No active students found", 404);
    }

    const result = await Student.collection.updateMany(
        { _id: { $in: activeStudentIds } },
        {
            $addToSet: {
                courseIds: { $each: objCourseIds }
            }
        }
    );

    res.json(new ApiResponse("Courses added successfully", 200, {
        matched: result.matchedCount ?? result.n,
        modified: result.modifiedCount ?? result.nModified
    }));
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
            `Hostel status ${hostelStatus ? "enabled" : "disabled"} `,
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
            `Student has been ${isActive ? "activated" : "deactivated"} `,
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
    finishCoursesById,
    updateStudentsSemesterBulk,
    addCoursesByEnrollmentNumbers,
    finishCoursesByEnrollmentNumbers,
    addCoursesByBranchAndYearOfAdmission,
    updateStudentsSemesterByEnrollmentNumbers,
    bulkDeactivateStudentsByEnrollmentNumbers,
    bulkDeactivateStudentsByBranchAndYear,
};
