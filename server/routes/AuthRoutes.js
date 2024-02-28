import {Router} from 'express'
import { checkUser,getAllUsers,onBoardUser,getUser } from '../controllers/AuthController.js'


const router = Router();

router.post('/checkuser', checkUser);
router.post('/onboard-user',onBoardUser)
router.get("/get-contacts",getAllUsers);
router.get("/user-details/:id",getUser);
export default router;
