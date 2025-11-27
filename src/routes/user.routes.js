import { Router } from 'express';
import { loginUser, registerUser,updateUser,logoutUser,uploadUserImage } from '../controllers/user.controllers.js';
import { requireAuth } from '../middlewares/auth.js';
import { upload } from "../middlewares/upload.js";
const router = Router();

router.post('/register',registerUser);
router.put('/users/:id', updateUser);
router.post('/login', loginUser);
router.post('/logout',requireAuth, logoutUser)
router.post("/usuarios/:id/imagen", upload.single("imagen"), uploadUserImage);
export default router;