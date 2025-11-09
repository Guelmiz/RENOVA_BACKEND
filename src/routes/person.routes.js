import { Router } from 'express';

const router = Router();

router.get('/personas',(req, res)=>{
    res.send('Hola')
})
export default router;