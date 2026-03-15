import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    author: {
        type: String,
        required: true,
    },
    publishedDate: {
        type: Date,
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    isIssued: {
        type: Boolean,
        default: false,
    },
    floorNumber: {
        type: Number,
        required: true,
    },
    rackNo: {
        type: Number,
        required: true,
    },
    isFacultyReserved: {
        type: Boolean,
        default: false,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
});

const Book = mongoose.model('Book', bookSchema);

export default Book;