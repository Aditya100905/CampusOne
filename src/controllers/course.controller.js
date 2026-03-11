import Course from "../models/course.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Department from "../models/department.model.js";
import { Faculty } from "../models/faculty.model.js";
import mongoose from "mongoose";
import { Student } from "../models/student.model.js";
import { Institution } from "../models/institution.model.js";
import { TimetableSlot } from '../models/timetable.model.js';
import { AttendanceRecord } from '../models/attendenceRecord.model.js';
import { AttendanceSession } from '../models/attendenceSession.model.js';
import { MarksRecord } from '../models/marksRecord.model.js';

const assertObjectId = (id, field = "id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(`Invalid ${field}`, 400);
  }
};

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const createCourse = asyncHandler(async (req, res) => {
  const {
    departmentId,
    name,
    code,
    credits,
    semester,
    evaluationScheme,
    components
  } = req.body;

  if (!departmentId || !name || !code || credits === undefined || !semester) {
    throw new ApiError("Missing required fields", 400);
  }

  assertObjectId(departmentId, "departmentId");

  const exists = await Course.findOne({ code, departmentId });
  if (exists) throw new ApiError("Course with code already exists", 409);

  if (!["MID_END", "CT_END"].includes(evaluationScheme)) {
    throw new ApiError("Invalid evaluationScheme", 400);
  }

  let finalComponents = components;

  // Auto-add default component sets if not passed
  if (!components || components.length === 0) {
    if (evaluationScheme === "MID_END") {
      finalComponents = [
        { name: "MID", maxMarks: 30, weightage: 100, type: "THEORY" },
        { name: "END", maxMarks: 100, weightage: 70, type: "THEORY" }
      ];
    } else {
      finalComponents = [
        { name: "CT1", maxMarks: 20, weightage: 100, type: "THEORY" },
        { name: "CT2", maxMarks: 20, weightage: 100, type: "THEORY" },
        { name: "END", maxMarks: 100, weightage: 60, type: "THEORY" }
      ];
    }
  }

  for (const c of finalComponents) {
    if (!c.name || !c.maxMarks) throw new ApiError("Invalid component structure", 400);
  }

  const course = await Course.create({
    departmentId,
    name,
    code,
    credits,
    semester,
    evaluationScheme,
    components: finalComponents
  });

  res.json(new ApiResponse("Course created successfully", 201, course));
});

const getCoursesByDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;
  assertObjectId(departmentId, "departmentId");

  const courses = await Course.find({ departmentId });

  res.json(new ApiResponse("Courses fetched successfully", 200, courses));
});

const getCourseByInstitution = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;
  assertObjectId(institutionId, "institutionId");

  const courses = await Course.aggregate([
    {
      $lookup: {
        from: "departments",
        localField: "departmentId",
        foreignField: "_id",
        as: "department"
      }
    },
    { $unwind: "$department" },
    { $match: { "department.institutionId": toObjectId(institutionId) } }
  ]);

  res.json(new ApiResponse("Courses fetched", 200, courses));
});

const getCourseById = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  assertObjectId(courseId, "courseId");

  const course = await Course.findById(courseId).populate("departmentId", "name code");

  if (!course) throw new ApiError("Course not found", 404);

  res.json(new ApiResponse("Course fetched successfully", 200, course));
});

const updateCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const {
    code,
    departmentId,
    name,
    credits,
    semester,
    evaluationScheme,
    components
  } = req.body;
  assertObjectId(courseId, "courseId");

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError("Course not found", 404);

  if (evaluationScheme && evaluationScheme !== course.evaluationScheme) {
    const marksExist = await MarksRecord.findOne({ courseId });
    if (marksExist) {
      throw new ApiError("Cannot change evaluationScheme because marks exist", 400);
    }
  }

  if (components) {
    if (!Array.isArray(components) || components.length === 0) {
      throw new ApiError("Invalid components[]", 400);
    }

    for (const c of components) {
      if (!c.name || !c.maxMarks) {
        throw new ApiError("Each component must contain name & maxMarks", 400);
      }
    }

    course.components = components;
  }

  if (evaluationScheme) course.evaluationScheme = evaluationScheme;
  if (name) course.name = name;
  if (code) course.code = code;
  if (credits !== undefined) course.credits = credits;
  if (semester) course.semester = semester;
  if (departmentId) course.departmentId = departmentId;

  await course.save();
  res.json(new ApiResponse("Course updated", 200, course));
});

const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  assertObjectId(courseId, "courseId");


  // Course (delete)
  //   ├─ Faculty.courses[] (pull)
  //   ├─ Faculty.prevCourses[] (pull)
  //   ├─ Student.courseIds[] (pull)
  //   ├─ Student.prevCourses[] (pull)
  //   ├─ TimetableSlot (deleteMany)
  //   ├─ AttendanceSession (deleteMany)
  //   └─ AttendanceRecord (deleteMany)


  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const course = await Course.findById(courseId).session(session);
    if (!course) throw new ApiError("Course not found", 404);

    // Remove from Faculty current & previous
    await Faculty.updateMany(
      {},
      {
        $pull: {
          courses: { courseId },
          prevCourses: { courseId }
        }
      }
    ).session(session);

    // Remove from Student current & previous
    await Student.updateMany(
      {},
      {
        $pull: {
          courseIds: courseId,
          prevCourses: { courseId }
        }
      }
    ).session(session);

    // Delete timetable
    await TimetableSlot.deleteMany({ courseId }).session(session);

    // Delete attendance
    await AttendanceRecord.deleteMany({ courseId }).session(session);
    await AttendanceSession.deleteMany({ courseId }).session(session);

    // Delete Marks Record
    await MarksRecord.deleteMany({ courseId }).session(session);

    // Delete course itself
    await Course.findByIdAndDelete(courseId).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json(new ApiResponse("Course deleted successfully", 200));
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

const modifyStatus = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { isOpen } = req.body;

  assertObjectId(courseId, "courseId");

  if (isOpen === undefined) {
    throw new ApiError("isOpen field is required", 400);
  }
  const course = await Course.findByIdAndUpdate(
    courseId,
    { isOpen },
    { new: true }
  );

  if (!course) {
    throw new ApiError("Course not found", 404);
  }

  res.json(
    new ApiResponse("Course status updated successfully", 200, course)
  );
});

const finishCourseForFaculties = asyncHandler(async (req, res) => {
  const { courseId, institutionId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError("Course does not exist", 404);

  const institution = await Institution.findById(institutionId);
  if (!institution) throw new ApiError("Institution does not exist", 404);

  const count = await Faculty.countDocuments({
    institutionId,
    isActive: true,
    "courses.courseId": toObjectId(courseId)
  });

  await Faculty.updateMany(
    {
      institutionId,
      isActive: true,
      "courses.courseId": toObjectId(courseId)
    },
    [
      {
        $set: {
          prevCourses: {
            $concatArrays: [
              "$prevCourses",
              {
                $filter: {
                  input: "$courses",
                  cond: { $eq: ["$$this.courseId", toObjectId(courseId)] }
                }
              }
            ]
          },
          courses: {
            $filter: {
              input: "$courses",
              cond: { $ne: ["$$this.courseId", toObjectId(courseId)] }
            }
          }
        }
      }
    ], { updatePipeline: true }
  );

  res.json(new ApiResponse(
    "Course successfully finished for faculties",
    200,
    { affected: count }
  ));
});

const findFacultyByCourseId = asyncHandler(async (req, res) => {
  const { courseId, institutionId } = req.params;

  const courseExist = await Course.findById(courseId);
  if (!courseExist)
    throw new ApiError('Course do not exist', 404);

  const institutionExist = await Institution.findById(institutionId);
  if (!institutionExist)
    throw new ApiError('Institution do not exist', 404);

  const faculties = await Faculty.find({
    institutionId,
    isActive: true,
    "courses.courseId": toObjectId(courseId)
  }).populate("userId", "name avatar email phone").lean();
  if (faculties.length === 0) {
    throw new ApiError("No faculties found for this course", 404);
  }
  res.json(
    new ApiResponse("Faculties fetched successfully", 200, faculties)
  );
});

const findFacultyByPrevCourseId = asyncHandler(async (req, res) => {
  const { courseId, institutionId } = req.params;

  const courseExist = await Course.findById(courseId);
  if (!courseExist)
    throw new ApiError('Course do not exist', 404);

  const institutionExist = await Institution.findById(institutionId);
  if (!institutionExist)
    throw new ApiError('Institution do not exist', 404);

  const faculties = await Faculty.find({
    institutionId,
    isActive: true,
    "prevCourses.courseId": toObjectId(courseId)
  }).populate("userId", "name avatar").lean();
  if (faculties.length === 0) {
    throw new ApiError("No faculties found for this previous course", 404);
  }
  res.json(
    new ApiResponse("Faculties fetched successfully", 200, faculties)
  );
});

const deleteCourseAndPrevCourseFromFaculty = asyncHandler(async (req, res) => {
  const { courseId, institutionId } = req.params;

  const courseExist = await Course.findById(courseId);
  if (!courseExist) throw new ApiError("Course does not exist", 404);

  const institutionExist = await Institution.findById(institutionId);
  if (!institutionExist) throw new ApiError("Institution does not exist", 404);

  await Faculty.updateMany(
    {
      institutionId,
      "courses.courseId": toObjectId(courseId),
    },
    {
      $pull: { courses: { courseId: toObjectId(courseId) } },
    }
  );
  await Faculty.updateMany(
    {
      institutionId,
      "prevCourses.courseId": toObjectId(courseId),
    },
    {
      $pull: { prevCourses: { courseId: toObjectId(courseId) } },
    }
  );
  res.json(
    new ApiResponse(
      "Course removed from faculty course & prevCourse records",
      200
    )
  );
});

const findFacultiesByCourseAndBatch = asyncHandler(async (req, res) => {
  const { courseId, institutionId, batch } = req.params;

  const courseExist = await Course.findById(courseId);
  if (!courseExist)
    throw new ApiError('Course do not exist', 404);

  const institutionExist = await Institution.findById(institutionId);
  if (!institutionExist)
    throw new ApiError('Institution do not exist', 404);

  const faculties = await Faculty.find({
    institutionId,
    isActive: true,
    courses: {
      $elemMatch: {
        courseId: toObjectId(courseId),
        batch
      }
    }
  }).populate("userId", "name avatar").lean();
  if (faculties.length === 0) {
    throw new ApiError("No faculties found for this course and batch", 404);
  }
  res.json(
    new ApiResponse("Faculties fetched successfully", 200, faculties)
  );
});

const findFacultiesByPrevCourseAndBatch = asyncHandler(async (req, res) => {
  const { courseId, institutionId, batch } = req.params;
  const courseExist = await Course.findById(courseId);
  if (!courseExist)
    throw new ApiError('Course do not exist', 404);

  const institutionExist = await Institution.findById(institutionId);
  if (!institutionExist)
    throw new ApiError('Institution do not exist', 404);

  const faculties = await Faculty.find({
    institutionId,
    isActive: true,
    prevCourses: {
      $elemMatch: {
        courseId: toObjectId(courseId),
        batch
      }
    }
  }).populate("userId", "name avatar").lean();
  if (faculties.length === 0) {
    throw new ApiError("No faculties found for this previous course and batch", 404);
  }
  res.json(
    new ApiResponse("Faculties fetched successfully", 200, faculties)
  );
});

const findStudentByCourseId = asyncHandler(async (req, res) => {
  const { courseId, departmentId } = req.params;

  assertObjectId(courseId, "courseId");
  assertObjectId(departmentId, "departmentId");
  const courseExists = await Course.findById(courseId);
  if (!courseExists)
    throw new ApiError('Course not found', 404);
  const departmentExists = await Department.findById(departmentId);
  if (!departmentExists)
    throw new ApiError('Department not found', 404);

  const pipeline = [
    {
      $lookup: {
        from: "branches",
        localField: "branchId",
        foreignField: "_id",
        as: "branch"
      }
    },
    { $unwind: "$branch" },
    {
      $match: {
        "branch.departmentId": new mongoose.Types.ObjectId(departmentId),
        isActive: true,
        courseIds: new mongoose.Types.ObjectId(courseId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1,
        enrollmentNumber: 1,
        semester: 1,
        "user.name": 1,
        "user.avatar": 1,
        "branch.name": 1,
        "branch.code": 1
      }
    },
    { $sort: { "user.name": 1 } }
  ];

  const students = await Student.aggregate(pipeline);

  if (!students.length) {
    throw new ApiError("No students found for this course under department", 404);
  }

  res.json(
    new ApiResponse("Students fetched successfully", 200, students)
  );
});

const findStudentByPrevCourseId = asyncHandler(async (req, res) => {
  const { courseId, departmentId } = req.params;

  assertObjectId(courseId, "courseId");
  assertObjectId(departmentId, "departmentId");

  const pipeline = [
    {
      $lookup: {
        from: "branches",
        localField: "branchId",
        foreignField: "_id",
        as: "branch"
      }
    },
    { $unwind: "$branch" },
    {
      $match: {
        "branch.departmentId": new mongoose.Types.ObjectId(departmentId),
        isActive: true,
        prevCourses: {
          $elemMatch: {
            courseId: new mongoose.Types.ObjectId(courseId)
          }
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1,
        enrollmentNumber: 1,
        semester: 1,
        "user.name": 1,
        "user.avatar": 1,
        "branch.name": 1,
        "branch.code": 1
      }
    }
  ];

  const students = await Student.aggregate(pipeline);

  if (!students.length) {
    throw new ApiError("No previous students found for this course", 404);
  }

  res.json(
    new ApiResponse("Previous course students fetched", 200, students)
  );
});

const findStudentByInstitutionCourse = asyncHandler(async (req, res) => {
  const { courseId, institutionId } = req.params;

  const courseExist = await Course.findById(courseId);
  if (!courseExist)
    throw new ApiError('Course do not exist', 404);

  const institutionExist = await Institution.findById(institutionId);
  if (!institutionExist)
    throw new ApiError('Institution do not exist', 404);

  const students = await Student.find({
    institutionId,
    isActive: true,
    courseIds: toObjectId(courseId)
  })
    .populate("userId", "name avatar")
    .select("enrollmentNumber semester branchId batch")
    .lean();

  if (!students.length)
    throw new ApiError("No students found for this course", 404);

  res.json(new ApiResponse("Students fetched successfully", 200, students));
});


const findStudentByInstitutionPrevCourse = asyncHandler(async (req, res) => {
  const { courseId, institutionId } = req.params;

  const students = await Student.find({
    institutionId,
    isActive: true,
    prevCourses: { $elemMatch: { courseId: toObjectId(courseId) } }
  })
    .populate("userId", "name avatar")
    .select("enrollmentNumber semester branchId batch prevCourses")
    .lean();

  if (!students.length)
    throw new ApiError("No students found for this previous course", 404);

  res.json(new ApiResponse("Students fetched successfully", 200, students));
});

const deleteCourseAndPrevCourseFromStudent = asyncHandler(async (req, res) => {
  const { courseId, institutionId } = req.params;

  const courseExist = await Course.findById(courseId);
  if (!courseExist) throw new ApiError("Course do not exist", 404);

  const institutionExist = await Institution.findById(institutionId);
  if (!institutionExist) throw new ApiError("Institution do not exist", 404);

  await Student.updateMany(
    {
      institutionId,
      isActive: true,
      courseIds: toObjectId(courseId),
    },
    {
      $pull: { courseIds: toObjectId(courseId) },
    }
  );
  await Student.updateMany(
    {
      institutionId,
      isActive: true,
      "prevCourses.courseId": toObjectId(courseId),
    },
    {
      $pull: { prevCourses: { courseId: toObjectId(courseId) } },
    }
  );

  res.json(
    new ApiResponse(
      "Course removed from student course & prevCourse records",
      200
    )
  );
});

const checkCourseCodeExists = asyncHandler(async (req, res) => {
  const { departmentId, code } = req.body;
  if (!departmentId || !code) {
    throw new ApiError("Course code is required", 400);
  }
  const exists = await Course.findOne({ departmentId, code });

  res.json(
    new ApiResponse(
      exists ? "Course code already exists" : "Course code available",
      200,
      { exists: !!exists }
    )
  );
});

export {
  createCourse,
  getCoursesByDepartment,
  getCourseById,
  updateCourse,
  deleteCourse,
  modifyStatus,
  finishCourseForFaculties,
  getCourseByInstitution,
  findFacultyByCourseId,
  findFacultyByPrevCourseId,
  findFacultiesByCourseAndBatch,
  findFacultiesByPrevCourseAndBatch,
  deleteCourseAndPrevCourseFromFaculty,
  findStudentByCourseId,
  findStudentByPrevCourseId,
  findStudentByInstitutionCourse,
  findStudentByInstitutionPrevCourse,
  deleteCourseAndPrevCourseFromStudent,
  checkCourseCodeExists
};
