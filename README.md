# CampusOne

## 🔐 User Authentication & Profile Routes

Base Path: `/user`

| Method | Endpoint | Access | Description |
|------|--------|--------|------------|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login user |
| POST | `/forgot-password` | Public | Send password reset email |
| POST | `/reset-password/:token` | Public | Reset password using token |
| GET | `/verify-email/:token` | Public | Verify user email |
| GET | `/current-user` | Protected (User JWT) | Get currently logged-in user |
| POST | `/logout` | Protected (User JWT) | Logout user |
| POST | `/send-email-verification` | Protected (User JWT) | Send email verification link |
| POST | `/update-avatar` | Protected (User JWT) | Update user avatar |

---

## 🏫 Institution Authentication & Profile Routes

Base Path: `/institution`

| Method | Endpoint | Access | Description |
|------|--------|--------|------------|
| POST | `/register` | Public | Register institution |
| POST | `/login` | Public | Login institution |
| POST | `/forgot-password` | Public | Send password reset email |
| POST | `/reset-password/:token` | Public | Reset institution password |
| GET | `/verify-email/:token` | Public | Verify institution email |
| GET | `/current-institution` | Protected (Institution JWT) | Get current institution |
| POST | `/logout` | Protected (Institution JWT) | Logout institution |
| POST | `/send-email-verification` | Protected (Institution JWT) | Send email verification |
| POST | `/update-avatar` | Protected (Institution JWT) | Update institution avatar |

---

## 👨‍🏫 Faculty Management Routes

Base Path: `/faculty`

| Method | Endpoint | Access | Description |
|------|--------|--------|------------|
| GET | `/:facultyId` | Public | Get faculty by ID |
| POST | `/create-faculty` | Protected (Institution JWT) | Create faculty |
| PUT | `/edit-faculty/:facultyId` | Protected (Institution JWT) | Edit faculty (institution) |
| PUT | `/edit-facultyById/:facultyId` | Protected (User JWT) | Edit faculty (user) |
| GET | `/institution/:institutionId` | Protected (Institution JWT) | Get faculties by institution |
| GET | `/department/:departmentId` | Protected (Institution JWT) | Get faculties by department |
| DELETE | `/delete-faculty/:facultyId` | Protected (Institution JWT) | Delete faculty |
| PUT | `/update-department/:facultyId` | Protected (Institution JWT) | Update faculty department |
| PUT | `/update-courses/:facultyId` | Protected (Institution JWT) | Update faculty courses |
| PUT | `/update-coursesById/:facultyId` | Protected (User JWT) | Update faculty courses (user) |
| PUT | `/toggle-in-charge/:facultyId` | Protected (Institution JWT) | Toggle faculty in-charge status |

---

## 🏢 Department Management Routes

Base Path: `/department`

| Method | Endpoint | Access | Description |
|------|--------|--------|------------|
| GET | `/institution/:institutionId` | Public | Get departments by institution |
| GET | `/:departmentId` | Public | Get department by ID |
| POST | `/create-department` | Protected (Institution JWT) | Create department |
| PUT | `/update-department/:departmentId` | Protected (Institution JWT) | Update department |
| DELETE | `/delete-department/:departmentId` | Protected (Institution JWT) | Delete department |

---

## 📘 Course Management Routes

Base Path: `/course`

| Method | Endpoint | Access | Description |
|------|--------|--------|------------|
| GET | `/department/:departmentId` | Public | Get courses by department |
| GET | `/:courseId` | Public | Get course by ID |
| POST | `/` | Protected (Institution JWT) | Create course |
| PUT | `/:courseId` | Protected (Institution JWT) | Update course |
| DELETE | `/:courseId` | Protected (Institution JWT) | Delete course |

---

## 🔑 Authentication Summary

- **User JWT** → Required for user-level actions  
- **Institution JWT** → Required for admin/institution-level actions  
- **Multer** → Used for avatar uploads

---

## 🔑 Environment Variables
```
PORT=
FRONTEND_URL=
MONGODB_URI=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
JWT_SECRET=
MAILJET_API_KEY=
MAILJET_SECRET=
MAILJET_FROM_EMAIL=
MAILJET_FROM_NAME=
NODE_ENV=
BACKEND_URL=
```

## 👨‍💻 Author

**Vansh Verma**  
Full Stack Developer  

---


