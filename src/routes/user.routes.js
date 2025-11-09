import { Router } from 'express';
import { loginUser, registerUser,updateUser,logoutUser } from '../controllers/user.controllers.js';
const router = Router();

router.post('/register', registerUser); 
router.put('/users/:id', updateUser);
router.post('/login', loginUser);
router.post('/logout',logoutUser)

export default router;