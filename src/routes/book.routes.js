import { Router } from "express";
import { addBook, changeAvailability, getAllBooks, getBookById, getBooks, issueBook, returnBook, updateBook } from "../controllers/book.controller.js";
import { validateUserJWT } from '../middlewares/userAuth.middleware.js';

const router = Router();

router.get('/:instituteId', validateUserJWT, getAllBooks);
router.get('/search/:instituteId', validateUserJWT, getBooks);
router.get('/:bookId', validateUserJWT, getBookById);

router.post('/', validateUserJWT, addBook);
router.post('/:bookId/issue', validateUserJWT, issueBook);
router.post('/:bookId/return', validateUserJWT, returnBook);

router.put('/:bookId', validateUserJWT, updateBook);

router.patch('/availability/:bookId', validateUserJWT, changeAvailability);

export default router;