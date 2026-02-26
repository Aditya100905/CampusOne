import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import institutionRoutes from './routes/institution.routes.js';
import userRoutes from './routes/user.routes.js';
import facultyRoutes from './routes/faculty.routes.js';
import departmentRoutes from './routes/department.routes.js';
import courseRoutes from './routes/course.routes.js';
import studentRoutes from './routes/student.routes.js';
import importRoutes from './routes/import.route.js';
import branchRoutes from './routes/branch.routes.js';
import timetableRoutes from './routes/timetable.routes.js';
import sessionRoutes from './routes/attendenceSession.routes.js';
import attendenceRecord from './routes/attendenceRecord.routes.js';
import marksRoutes from './routes/marksRecord.routes.js';
import admissionRoutes from './routes/admissionApplication.routes.js';
import responsibilityRoutes from './routes/responsibility.routes.js';
import assignmentRoutes from './routes/responsibilityAssignment.routes.js';
import applicationRoutes from './routes/application.routes.js';
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import pinoHttp from "pino-http";
import logger from "./utils/logger.js";
import crypto from "crypto";

const app = express();

app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL?.split(','),
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
}));

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));
app.use(mongoSanitize());
if (process.env.NODE_ENV !== "production") {
  app.use(pinoHttp({ logger }));
}
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static('public'));

app.use('/api/institutions', institutionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/faculties', facultyRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/courses", courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/import', importRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/timetableSlots', timetableRoutes);
app.use('/api/attendance', sessionRoutes);
app.use('/api/attendanceRecords', attendenceRecord);
app.use('/api/marks', marksRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/responsibility', responsibilityRoutes);
app.use('/api/assign-responsibility',assignmentRoutes);
app.use('/api/application', applicationRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    code: 404,
    requestId: req.id
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    code: err.statusCode || 500,
  });
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

export default app;