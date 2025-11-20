import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import path from "path";
import rolRoutes from './routes/rol.routes.js';
import userRoutes from './routes/user.routes.js';
import personRoutes from './routes/person.routes.js';
import pruebaRoutes from './routes/prueba.routes.js';
import categoriaProductosRoutes from './routes/categoriaProductos.route.js';
import certificacionRoutes from './routes/certificacion.routes.js';
import productoRoutes from './routes/productos.route.js';
import resenasRoutes from './routes/resenas.route.js';
import productoPruebaRoutes from './routes/prueba_producto.routes.js';
import productoCertificacionRoutes from './routes/producto_certifacion.routes.js';
const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: false,
}))

const __dirname = process.cwd();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());

app.use('/api', rolRoutes);
app.use('/api', userRoutes);
app.use('/api', personRoutes);
app.use('/api', pruebaRoutes);
app.use('/api', categoriaProductosRoutes);
app.use('/api', certificacionRoutes);
app.use('/api', productoRoutes);
app.use('/api', resenasRoutes);
app.use('/api', productoPruebaRoutes);
app.use('/api', productoCertificacionRoutes);
const PORT = process.env.PORT || 4000;
console.log("PORT env:", process.env.PORT);   
app.listen(PORT, () => {
  console.log('Server started on port', PORT);
});
