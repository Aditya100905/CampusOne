import mongoose from "mongoose";

const bookAllocationSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
    },
    allocatedTo: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    allocatedDate: {
        type: Date,
        default: Date.now,
    },
    returnDate: {
        type: Date,
    },
});

const BookAllocation = mongoose.model('BookAllocation', bookAllocationSchema);

export default BookAllocation;