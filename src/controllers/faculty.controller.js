import { Faculty } from "../models/faculty.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Department from "../models/department.model.js";
import mongoose from "mongoose";
import { User } from '../models/user.model.js';
import Course from '../models/course.model.js';

const assertObjectId = (id, fieldName = "id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(`Invalid ${fieldName}`, 400);
  }
};

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

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
  assertObjectId(userId, "userId");
  assertObjectId(institutionId, "institutionId");
  assertObjectId(departmentId, "departmentId");

  const exists = await Faculty.findOne({ userId });
  if (exists) throw new ApiError("Faculty already exists for this user", 409);

  const dept = await Department.findOne({ _id: departmentId, institutionId });
  if (!dept) throw new ApiError("Department does not belong to institution", 400);

  if (courses && Array.isArray(courses)) {
    for (const c of courses) {
      if (!c.courseId || !c.semester || !c.batch) {
        throw new ApiError("Each course must include courseId, semester & batch", 400);
      }
      assertObjectId(c.courseId, "courseId");
    }
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


const editFaculty = asyncHandler(async (req, res) => {
  const { facultyId } = req.params;

  assertObjectId(facultyId, "facultyId");

  const faculty = await Faculty.findByIdAndUpdate(
    facultyId,
    {
      $set: {
        designation: req.body.designation,
        dateOfJoining: req.body.dateOfJoining
      }
    },
    { new: true, runValidators: true }
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

  assertObjectId(institutionId, "institutionId");

  const faculties = await Faculty.find({ institutionId })
    .populate("userId", "name email phone avatar")
    .populate("departmentId", "name")
    .populate("courses.courseId", "name code");

  res.json(
    new ApiResponse("Faculties fetched successfully", 200, faculties)
  );
});

const getFacultiesByDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;

  assertObjectId(departmentId, "departmentId");

  const faculties = await Faculty.find({ departmentId })
    .populate("userId", "name email phone avatar")
    .populate("courses.courseId", "name code");

  res.json(
    new ApiResponse("Faculties fetched successfully", 200, faculties)
  );
});

const getFacultyById = asyncHandler(async (req, res) => {
  const { facultyId } = req.params;

  assertObjectId(facultyId, "facultyId");

  const faculty = await Faculty.findById(facultyId)
    .populate("userId", "name email phone avatar")
    .populate("institutionId", "name")
    .populate("departmentId", "name")
    .populate("courses.courseId", "name code")
    .populate("prevCourses.courseId", "name code");

  if (!faculty) {
    throw new ApiError("Faculty not found", 404);
  }

  res.json(
    new ApiResponse("Faculty fetched successfully", 200, faculty)
  );
});

const deleteFaculty = asyncHandler(async (req, res) => {
  const { facultyId } = req.params;

  assertObjectId(facultyId, "facultyId");

  const facultyExists = await Faculty.findById(facultyId);
  if (!facultyExists) {
    throw new ApiError("Faculty not found", 404);
  }
  const user = await User.findById(facultyExists.userId);
  if (!user) {
    throw new ApiError("User not found for this faculty", 404);
  }
  //TODO: delete the avatar from the server storage as well
  await User.findByIdAndDelete(user._id);
  await Faculty.findByIdAndDelete(facultyId);

  res.json(
    new ApiResponse("Faculty deleted successfully", 200)
  );
});

const updateFacultyDepartment = asyncHandler(async (req, res) => {
  const { facultyId } = req.params;
  const { departmentId } = req.body;

  assertObjectId(facultyId, "facultyId");
  assertObjectId(departmentId, "departmentId");

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) throw new ApiError("Faculty not found", 404);

  const dept = await Department.findOne({ _id: departmentId, institutionId: faculty.institutionId });
  if (!dept) throw new ApiError("Department does not belong to this institution", 400);

  faculty.departmentId = departmentId;
  await faculty.save();

  res.json(
    new ApiResponse("Department updated successfully", 200, faculty)
  );
});

const addFacultyCourse = asyncHandler(async (req, res) => {
  const { facultyId } = req.params;
  const { course } = req.body;

  assertObjectId(facultyId, "facultyId");

  if (!course || !course.courseId || !course.semester || !course.batch) {
    throw new ApiError("Course must include courseId, semester & batch", 400);
  }
  assertObjectId(course.courseId, "courseId");

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) throw new ApiError("Faculty not found", 404);

  const courseDoc = await Course.findById(course.courseId);
  if (!courseDoc) throw new ApiError("Course not found", 404);

  const exists = faculty.courses.some(
    (c) =>
      c.courseId.toString() === course.courseId &&
      c.semester === course.semester &&
      c.batch === course.batch
  );

  if (exists) {
    throw new ApiError("Course already assigned to this faculty", 400);
  }
  await Faculty.updateOne(
    { _id: facultyId },
    { $push: { courses: course } }
  );

  const updatedFaculty = await Faculty.findById(facultyId);

  res.json(new ApiResponse("Course added successfully", 200, updatedFaculty));
});

const deleteFacultyCourse = asyncHandler(async (req, res) => {
  const { facultyId, courseId } = req.params;
  const { semester, batch } = req.body;

  assertObjectId(facultyId, "facultyId");
  assertObjectId(courseId, "courseId");

  if (!semester || !batch) {
    throw new ApiError("semester & batch are required", 400);
  }

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) throw new ApiError("Faculty not found", 404);

  const exists = faculty.courses.some(
    (c) =>
      c.courseId.toString() === courseId &&
      c.semester.toString() === semester.toString() &&
      c.batch === batch
  );

  if (!exists) {
    throw new ApiError(
      "Course not found in faculty's assigned courses for given semester & batch",
      404
    );
  }

  await Faculty.updateOne(
    { _id: facultyId },
    {
      $pull: {
        courses: {
          courseId,
          semester: Number(semester),
          batch
        }
      }
    }
  );

  const updatedFaculty = await Faculty.findById(facultyId);

  res.json(new ApiResponse("Course removed successfully", 200, updatedFaculty));
});

const deleteFacultyPrevCourse = asyncHandler(async (req, res) => {
  const { facultyId, courseId } = req.params;
  const { semester, batch } = req.body;
  assertObjectId(facultyId, "facultyId");
  assertObjectId(courseId, "courseId");

  if (!semester || !batch) {
    throw new ApiError("semester & batch are required", 400);
  }

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) throw new ApiError("Faculty not found", 404);

  const exists = faculty.prevCourses.some(
    (c) =>
      c.courseId.toString() === courseId &&
      c.semester.toString() === semester.toString() &&
      c.batch === batch
  );

  if (!exists) {
    throw new ApiError("Course not found in faculty's previous courses for given semester & batch", 404);
  }

  await Faculty.updateOne(
    { _id: facultyId },
    {
      $pull: {
        prevCourses: {
          courseId,
          semester: Number(semester),
          batch
        }
      }
    }
  );

  const updatedFaculty = await Faculty.findById(facultyId);

  res.json(new ApiResponse("Previous course removed successfully", 200, updatedFaculty));
})

const finishFacultyCourse = asyncHandler(async (req, res) => {
  const { facultyId, courseId } = req.params;
  const { batch } = req.body;

  assertObjectId(facultyId, "facultyId");
  assertObjectId(courseId, "courseId");
  if (!batch) throw new ApiError("batch required", 400);

  const objId = toObjectId(courseId);

  const updated = await Faculty.findOneAndUpdate(
    {
      _id: facultyId,
      "courses.courseId": objId,
      "courses.batch": batch
    },
    [
      {
        $set: {
          prevCourses: {
            $setUnion: [
              "$prevCourses",
              {
                $filter: {
                  input: "$courses",
                  as: "c",
                  cond: {
                    $and: [
                      { $eq: ["$$c.courseId", objId] },
                      { $eq: ["$$c.batch", batch] }
                    ]
                  }
                }
              }
            ]
          },
          courses: {
            $filter: {
              input: "$courses",
              as: "c",
              cond: {
                $not: {
                  $and: [
                    { $eq: ["$$c.courseId", objId] },
                    { $eq: ["$$c.batch", batch] }
                  ]
                }
              }
            }
          }
        }
      }
    ],
    { new: true, updatePipeline: true }
  );

  if (!updated)
    throw new ApiError("Faculty not found or batch-course not assigned", 404);

  res.json(new ApiResponse("Batch course finished successfully", 200, updated));
});

const modifyActiveStatus = asyncHandler(async (req, res) => {
  const { facultyId } = req.params;
  const { active } = req.body;

  if (typeof active !== "boolean") {
    throw new ApiError("Status must be boolean", 400);
  }

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw new ApiError("Faculty not found", 404);
  }

  const user = await User.findByIdAndUpdate(
    faculty.userId,
    { active: active },
    { new: true }
  );

  if (!user) {
    throw new ApiError("Associated user not found", 404);
  }

  const updatedFaculty = await Faculty.findById(facultyId).populate("userId");

  res.json(
    new ApiResponse(
      `Faculty has been ${active ? "activated" : "deactivated"}`,
      200,
      updatedFaculty
    )
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
  editFaculty,
  getFacultiesByInstitution,
  getFacultiesByDepartment,
  getFacultyById,
  deleteFaculty,
  updateFacultyDepartment,
  addFacultyCourse,
  deleteFacultyCourse,
  deleteFacultyPrevCourse,
  finishFacultyCourse,
  modifyActiveStatus,
  toggleFacultyInCharge,
};
