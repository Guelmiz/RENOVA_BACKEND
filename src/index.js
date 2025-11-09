import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import rolRoutes from './routes/rol.routes.js';
import userRoutes from './routes/user.routes.js';
import personRoutes from './routes/person.routes.js';
import pruebaRoutes from './routes/prueba.routes.js';
import categoriaProductosRoutes from './routes/categoriaProductos.route.js'

const app = express();

app.use(express.json());

app.use('/api', rolRoutes);
app.use('/api', userRoutes);
app.use('/api', personRoutes);
app.use ('/api',pruebaRoutes);
app.use ('/api',categoriaProductosRoutes);
app.listen(3000);
console.log('Server started on port', 3000);