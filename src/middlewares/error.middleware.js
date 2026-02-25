import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
    logger.error({ err: err, path: req.path, method: req.method }, "Backend Error");

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            failedRows: Array.isArray(err.errors) ? err.errors : [err.errors],
        });
    }
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        failedRows: [{ field: "unknown", message: err.message }],
    });
};

export default errorHandler;
