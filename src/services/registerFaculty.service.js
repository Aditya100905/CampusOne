import { User } from "../models/user.model.js";
import Faculty from "../models/faculty.model.js";
import { Institution } from "../models/institution.model.js";
import Department from "../models/department.model.js";
import Course from "../models/course.model.js";

export const registerFacultyService = async (payload) => {

    const {
        name,
        email,
        phone,
        password,
        institutionCode,
        departmentCode,
        designation,
        dateOfJoining,
        courseCodes,
        isInCharge
    } = payload;

    if (!name || !email || !phone || !password || !institutionCode || !departmentCode || !designation || !dateOfJoining) {
        throw new Error("Missing required fields");
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) throw new Error("Email already in use");

    const institution = await Institution.findOne({ code: institutionCode });
    if (!institution) throw new Error("Institution not found");

    const department = await Department.findOne({ code: departmentCode, institutionId: institution._id });
    if (!department) throw new Error("Department not found under institution");

    let courseIds = [];
    if (courseCodes && courseCodes.length) {
        const codes = courseCodes.split(",").map(s => s.trim());
        const courses = await Course.find({ code: { $in: codes }, departmentId: department._id });
        if (courses.length !== codes.length) throw new Error("Some course codes not found");
        courseIds = courses.map(c => c._id);
    }

    const [day, month, year] = dateOfJoining.split("-");
    const parsedDate = new Date(`${year}-${month}-${day}`);

    const user = await User.create({
        name, email, phone, password, role: "Faculty"
    });
    try {
        const faculty = await Faculty.create({
            userId: user._id,
            institutionId: institution._id,
            departmentId: department._id,
            designation,
            isInCharge: isInCharge === "true" || isInCharge === true,
            courses: courseIds,
            dateOfJoining: parsedDate,
        });
        const sanitizedUser = user.toObject();
        delete sanitizedUser.password;
        delete sanitizedUser.accessToken;

        return {
            user: sanitizedUser,
            faculty
        };
    } catch (err) {
        if (user) await User.deleteOne({ _id: user._id });
        throw err;
    }
};
