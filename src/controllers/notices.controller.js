import { Notice } from "../models/notice.model.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const parseBodyField = (value, fallback = undefined) => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    return value;
};

const uploadNoticeAttachment = (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "notices",
                resource_type: "auto"
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve({
                    filename: file.originalname,
                    url: result.secure_url,
                    mimeType: file.mimetype,
                    size: file.size
                });
            }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
};

const createNotice = asyncHandler(async (req, res) => {
    const { title, content, publishDate, expireDate } = req.body;
    const targetAudience = parseBodyField(req.body.targetAudience, {});

    if (!title || !content || !expireDate) {
        throw new ApiError("Title, content and expire date are required", 400);
    }

    const institutionId = req.user.institutionId;
    const authorId = req.user._id;

    const uploadedAttachments = [];
    if (req.files?.length) {
        for (const file of req.files) {
            const uploaded = await uploadNoticeAttachment(file);
            uploadedAttachments.push(uploaded);
        }
    }

    const notice = await Notice.create({
        institutionId,
        title,
        content,
        authorId,
        attachments: uploadedAttachments,
        targetAudience,
        publishDate,
        expireDate
    });

    res.json(new ApiResponse("Notice created successfully", 201, notice));
});

const getNotices = asyncHandler(async (req, res) => {
    const institutionId = req.user.institutionId;
    const notices = await Notice.find({ institutionId }).sort({ publishDate: -1 });
    res.json(new ApiResponse("Notices fetched successfully", 200, notices));
});

const getNoticeById = asyncHandler(async (req, res) => {
    const institutionId = req.user.institutionId;
    const noticeId = req.params.noticeId;
    const notice = await Notice.findOne({ _id: noticeId, institutionId });

    if (!notice) {
        throw new ApiError("Notice not found", 404);
    }

    res.json(new ApiResponse("Notice fetched successfully", 200, notice));
});

const getNoticeByCourseId = asyncHandler(async (req, res) => {
    const institutionId = req.user.institutionId;
    const courseId = req.params.courseId;
    const notices = await Notice.find({
        institutionId,
        "targetAudience.courseIds": courseId
    }).sort({ publishDate: -1 });

    res.json(new ApiResponse("Course notices fetched successfully", 200, notices));
});

const getNoticeByDepartmentId = asyncHandler(async (req, res) => {
    const institutionId = req.user.institutionId;
    const departmentId = req.params.departmentId;
    const notices = await Notice.find({
        institutionId,
        "targetAudience.departmentIds": departmentId
    }).sort({ publishDate: -1 });

    res.json(new ApiResponse("Department notices fetched successfully", 200, notices));
});

const getNoticeByRole = asyncHandler(async (req, res) => {
    const institutionId = req.user.institutionId;
    const role = req.params.role;
    const notices = await Notice.find({
        institutionId,
        "targetAudience.roles": role
    }).sort({ publishDate: -1 });

    res.json(new ApiResponse("Role notices fetched successfully", 200, notices));
});

const updateNotice = asyncHandler(async (req, res) => {
    const institutionId = req.user.institutionId;
    const noticeId = req.params.noticeId;
    const { title, content, publishDate, expireDate } = req.body;
    const notice = await Notice.findOne({ _id: noticeId, institutionId });

    if (!notice) {
        throw new ApiError("Notice not found", 404);
    }

    notice.title = title || notice.title;
    notice.content = content || notice.content;

    const parsedTargetAudience = parseBodyField(req.body.targetAudience);
    if (parsedTargetAudience !== undefined) {
        notice.targetAudience = parsedTargetAudience;
    }

    notice.publishDate = publishDate || notice.publishDate;
    notice.expireDate = expireDate || notice.expireDate;

    const parsedAttachments = parseBodyField(req.body.attachments);
    const removeAttachmentUrls = parseBodyField(req.body.removeAttachmentUrls, []);

    let nextAttachments = Array.isArray(parsedAttachments)
        ? parsedAttachments
        : [...(notice.attachments || [])];

    if (Array.isArray(removeAttachmentUrls) && removeAttachmentUrls.length) {
        const removeUrlSet = new Set(removeAttachmentUrls);
        nextAttachments = nextAttachments.filter(
            (attachment) => attachment?.url && !removeUrlSet.has(attachment.url)
        );
    }

    if (req.files?.length) {
        for (const file of req.files) {
            const uploaded = await uploadNoticeAttachment(file);
            nextAttachments.push(uploaded);
        }
    }

    notice.attachments = nextAttachments;

    await notice.save();

    res.json(new ApiResponse("Notice updated successfully", 200, notice));
});

const deleteNotice = asyncHandler(async (req, res) => {
    const institutionId = req.user.institutionId;
    const noticeId = req.params.noticeId;
    const notice = await Notice.findOneAndDelete({ _id: noticeId, institutionId });

    if (!notice) {
        throw new ApiError("Notice not found", 404);
    }

    res.json(new ApiResponse("Notice deleted successfully", 200));
});

export {
    createNotice,
    getNotices,
    getNoticeById,
    getNoticeByCourseId,
    getNoticeByDepartmentId,
    getNoticeByRole,
    updateNotice,
    deleteNotice
}