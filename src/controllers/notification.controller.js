import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Notification from '../models/notification.model.js';

const createNotification = asyncHandler(async (req, res) => {
    const { title, message, forBatch, emails, recipientBatch, type } = req.body;
    if (!title || !message) {
        throw new ApiError("Title and message are required", 400);
    }
    if (!forBatch) {
        if (!emails || emails.length === 0) {
            throw new ApiError("Emails are required when it's not for Students", 400);
        }
    }
    if (forBatch && !recipientBatch) {
        throw new ApiError("Recipient batch is required when it's for Students", 400);
    }
    const notification = await Notification.create({
        title,
        message,
        forBatch,
        emails,
        recipientBatch,
        createdBy: req.user._id,
        type
    });
    res.status(201).json(new ApiResponse("Notification created successfully", 201, notification));
});

const modifyActiveStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
        throw new ApiError("isActive must be a boolean", 400);
    }
    const notification = await Notification.findById(id);
    if (!notification) {
        throw new ApiError("Notification not found", 404);
    }
    notification.isActive = isActive;
    await notification.save();
    res.json(new ApiResponse("Notification status updated successfully", 200, notification));
});

const deleteNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification) {
        throw new ApiError("Notification not found", 404);
    }
    await Notification.findByIdAndDelete(id);
    res.json(new ApiResponse("Notification deleted successfully", 200));
});

const getNotificationByBatch = asyncHandler(async (req, res) => {
    const { batch } = req.params;
    const notifications = await Notification.find({ recipientBatch: batch, isActive: true }).sort({ createdAt: -1 });
    res.json(new ApiResponse("Notifications retrieved successfully", 200, notifications));
});

const getNotificationByEmail = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const notifications = await Notification.find({ emails: email, isActive: true }).sort({ createdAt: -1 });
    res.json(new ApiResponse("Notifications retrieved successfully", 200, notifications));
});

export {
    createNotification,
    modifyActiveStatus,
    deleteNotification,
    getNotificationByBatch,
    getNotificationByEmail
};