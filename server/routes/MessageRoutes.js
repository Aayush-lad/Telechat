import { Router } from "express";
import { addMessage ,getMessages,addImageMessage, getInitialContactsWithMessage,searchMessages} from "../controllers/MessageController.js";
import multer from "multer";





const router = Router();

router.post("/add-message",addMessage);
router.get("/get-messages/:from/:to",getMessages);
router.post("/add-image-message",addImageMessage);
router.get("/get-current-contacts/:from",getInitialContactsWithMessage)
router.get("/search-messages/:from/:to/:search/:image/:audio/:message", searchMessages);




export default router;