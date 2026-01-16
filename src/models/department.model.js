import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Institution',
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        code: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        headOfDepartment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Faculty',
            default: null
        },
        contactEmail: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Department = mongoose.model('Department', departmentSchema);
export default Department;