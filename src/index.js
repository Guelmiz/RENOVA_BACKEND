import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import rolRoutes from './routes/rol.routes.js';
import userRoutes from './routes/user.routes.js';
import personRoutes from './routes/person.routes.js'

const app = express();

app.use(express.json());

app.use('/api', rolRoutes);
app.use('/api', userRoutes);
app.use('/api', personRoutes);
app.listen(3000);
console.log('Server started on port', 3000);