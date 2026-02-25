import mongoose from "mongoose";
import logger from "../utils/logger.js";

const DB_NAME = "CampusOne";

export const dbConnect = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`);
        logger.info({ host: connectionInstance.connection.host }, '✅ Connected to MongoDB');
    } catch (error) {
        logger.error({ err: error }, '🔴 Error connecting to MongoDB');
        process.exit(1);
    }
}
