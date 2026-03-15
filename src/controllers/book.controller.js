import mongoose from "mongoose";
import Book from "../models/book.model.js";
import BookAllocation from "../models/bookAllocation.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addBook = asyncHandler(async (req, res) => {
    const { title, code, author, publishedDate, department, floorNumber, rackNo, isFacultyReserved, instituteId } = req.body;

    const existingBook = await Book.findOne({ code });
    if (existingBook) {
        throw new ApiError("Book with same code already exists", 409);
    }
    if (!instituteId) {
        throw new ApiError("Institute ID is required", 400);
    }

    const book = await Book.create({
        title,
        code,
        author,
        publishedDate,
        department,
        floorNumber,
        rackNo,
        isFacultyReserved: isFacultyReserved || false,
        institute: instituteId,
    });

    return ApiResponse("Book added successfully", 201, book);
});

const getAllBooks = asyncHandler(async (req, res) => {
    const { instituteId } = req.params;
    const books = await Book.find({ institute: instituteId });
    if (books.length === 0) {
        throw new ApiError("No books found", 404);
    }
    return ApiResponse("Books fetched successfully", 200, books);
});

const getBooks = asyncHandler(async (req, res) => {
    const { instituteId } = req.params;
    const { department, author, title } = req.query;

    const filter = {};
    filter.institute = instituteId;
    if (department) {
        filter.department = department;
    }
    if (author) {
        filter.author = author;
    }
    if (title) {
        filter.title = { $regex: title, $options: 'i' };
    }

    const books = await Book.find(filter);
    if (books.length === 0) {
        throw new ApiError("No books found", 404);
    }
    return ApiResponse("Books fetched successfully", 200, books);
});

const getBookById = asyncHandler(async (req, res) => {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
        throw new ApiError("Book not found", 404);
    }

    return ApiResponse("Book fetched successfully", 200, book);
});

const updateBook = asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    const { title, code, author, publishedDate, department, floorNumber, rackNo, isFacultyReserved } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
        throw new ApiError("Book not found", 404);
    }

    if (code && code !== book.code) {
        const existingBook = await Book.findOne({ code });
        if (existingBook) {
            throw new ApiError("Book with same code already exists", 409);
        }
    }

    book.title = title || book.title;
    book.code = code || book.code;
    book.author = author || book.author;
    book.publishedDate = publishedDate || book.publishedDate;
    book.department = department || book.department;
    floorNumber !== undefined ? floorNumber : book.floorNumber
    rackNo !== undefined ? rackNo : book.rackNo;
    if (isFacultyReserved !== undefined) {
        book.isFacultyReserved = isFacultyReserved;
    }

    await book.save();

    return ApiResponse("Book updated successfully", 200, book);
});

const changeAvailability = asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    const { isAvailable } = req.body;
    if (isAvailable === undefined) {
        throw new ApiError("isAvailable field is required", 400);
    }
    const book = await Book.findById(bookId);
    if (!book) {
        throw new ApiError("Book not found", 404);
    }

    book.isAvailable = isAvailable;
    await book.save();

    return ApiResponse("Book availability updated successfully", 200, book);
});

const issueBook = asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    const { allocatedTo } = req.body;
    if (!allocatedTo) {
        throw new ApiError("Allocation details are required", 400);
    }
    const book = await Book.findById(bookId);
    if (!book) {
        throw new ApiError("Book not found", 404);
    }
    if (book.isIssued) {
        throw new ApiError("Book is already issued", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        book.isIssued = true;
        await book.save({ session });

        const bookAllocation = await BookAllocation.create([{
            book: book._id,
            allocatedTo,
        }], { session });

        await session.commitTransaction();
        session.endSession();

        return ApiResponse("Book issued successfully", 200, bookAllocation[0]);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});

const returnBook = asyncHandler(async (req, res) => {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
        throw new ApiError("Book not found", 404);
    }
    if (!book.isIssued) {
        throw new ApiError("Book is not issued", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        book.isIssued = false;
        await book.save({ session });

        const bookAllocation = await BookAllocation.findOne({ book: book._id, returnDate: { $eq: null } }).session(session);
        if (bookAllocation) {
            bookAllocation.returnDate = new Date();
            await bookAllocation.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        return ApiResponse("Book returned successfully", 200, book);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});

export { addBook, getAllBooks, getBooks, getBookById, updateBook, changeAvailability, issueBook, returnBook };