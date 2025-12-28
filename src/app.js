import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import institutionRoutes from './routes/institution.routes.js';
import userRoutes from './routes/user.routes.js';
import facultyRoutes from './routes/faculty.routes.js';
import departmentRoutes from './routes/department.routes.js';

const app = express();
const PORT = process.env.PORT ;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

app.use('/api/institutions', institutionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/faculties', facultyRoutes);
app.use("/api/departments", departmentRoutes);

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