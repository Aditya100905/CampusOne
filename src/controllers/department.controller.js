import Department from "../models/department.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createDepartment = asyncHandler(async (req, res) => {
  const { institutionId, name, code, contactEmail } = req.body;

  if (!institutionId || !name || !code || !contactEmail) {
    throw new ApiError("All fields are required", 400);
  }

  const exists = await Department.findOne({ code });
  if (exists) {
    throw new ApiError("Department with this code already exists", 409);
  }

  const department = await Department.create({
    institutionId,
    name,
    code,
    contactEmail,
  });

  res.json(
    new ApiResponse("Department created successfully", 201, department)
  );
});

const getDepartmentsByInstitution = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;

  const departments = await Department.find({
    institutionId: institutionId,
  }).populate("headOfDepartment", "designation userId");

  res.json(
    new ApiResponse("Departments fetched successfully", 200, departments)
  );
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;

  const department = await Department.findById(departmentId).populate(
    "headOfDepartment"
  );

  if (!department) {
    throw new ApiError("Department not found", 404);
  }

  res.json(
    new ApiResponse("Department fetched successfully", 200, department)
  );
});

const updateDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;

  const department = await Department.findByIdAndUpdate(
    departmentId,
    req.body,
    { new: true }
  );

  if (!department) {
    throw new ApiError("Department not found", 404);
  }

  res.json(
    new ApiResponse("Department updated successfully", 200, department)
  );
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;

  const department = await Department.findByIdAndDelete(departmentId);

  if (!department) {
    throw new ApiError("Department not found", 404);
  }

  res.json(
    new ApiResponse("Department deleted successfully", 200)
  );
});

export {
  createDepartment,
  getDepartmentsByInstitution,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
