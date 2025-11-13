import express from 'express';
import 'dotenv/config';
import cors from 'cors';

import rolRoutes from './routes/rol.routes.js';
import userRoutes from './routes/user.routes.js';
import personRoutes from './routes/person.routes.js';
import pruebaRoutes from './routes/prueba.routes.js';
import categoriaProductosRoutes from './routes/categoriaProductos.route.js';
import certificacionRoutes from './routes/certificacion.routes.js';
import productoRoutes from './routes/productos.route.js';
import resenasRoutes from './routes/resenas.route.js';
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', rolRoutes);
app.use('/api', userRoutes);
app.use('/api', personRoutes);
app.use('/api', pruebaRoutes);
app.use('/api', categoriaProductosRoutes);
app.use('/api', certificacionRoutes);
app.use('/api', productoRoutes);
app.use('/api', resenasRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server started on port', PORT);
});
