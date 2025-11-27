-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('ENVIADA', 'REVISADA', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "TipoArchivo" AS ENUM ('RUC', 'Carta_autorizacion', 'Correo_corporativo', 'otro');

-- CreateEnum
CREATE TYPE "EstadoCarrito" AS ENUM ('Activo', 'Guardado', 'Convertido');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('pendiente', 'entregado', 'cancelado');

-- CreateEnum
CREATE TYPE "EstadoTicket" AS ENUM ('pendiente', 'entregado', 'cancelado');

-- CreateEnum
CREATE TYPE "EstadoResena" AS ENUM ('pendiente', 'aprobado', 'rechazado');

-- CreateTable
CREATE TABLE "Rol" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificacion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prueba" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "realizadoHace" DATE,

    CONSTRAINT "Prueba_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaProducto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoriaProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Persona" (
    "id" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "telefono" INTEGER,
    "fechaNacimiento" DATE,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombreUsuario" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passHash" TEXT NOT NULL,
    "estadoSesion" BOOLEAN NOT NULL DEFAULT false,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaSesion" TIMESTAMP(3),
    "personaId" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudRepresentante" (
    "id" TEXT NOT NULL,
    "enviadoPor" TEXT NOT NULL,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'ENVIADA',
    "motivo" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaRevisado" TIMESTAMP(3),
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "SolicitudRepresentante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoSoporte" (
    "id" TEXT NOT NULL,
    "tipo" "TipoArchivo" NOT NULL DEFAULT 'otro',
    "ruta" TEXT NOT NULL,
    "fechaSubida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "solicitudId" TEXT NOT NULL,

    CONSTRAINT "DocumentoSoporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioRol" (
    "id" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "usuarioId" TEXT NOT NULL,
    "rolId" TEXT NOT NULL,

    CONSTRAINT "UsuarioRol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "stock" INTEGER,
    "precio" DECIMAL(12,2),
    "descripcion" TEXT,
    "activo" BOOLEAN,
    "publicadoPorId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImagenProducto" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "fechaSubida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productoId" TEXT NOT NULL,

    CONSTRAINT "ImagenProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductoCertificacion" (
    "id" TEXT NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productoId" TEXT NOT NULL,
    "certificacionId" TEXT NOT NULL,

    CONSTRAINT "ProductoCertificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductoPrueba" (
    "id" TEXT NOT NULL,
    "fechaRealizacion" DATE,
    "resultado" TEXT,
    "productoId" TEXT NOT NULL,
    "pruebaId" TEXT NOT NULL,

    CONSTRAINT "ProductoPrueba_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carrito" (
    "id" TEXT NOT NULL,
    "estado" "EstadoCarrito" NOT NULL DEFAULT 'Activo',
    "totalProductos" INTEGER NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "descuento" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaModificacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "Carrito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarritoProducto" (
    "id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precioUnitario" DECIMAL(12,2) NOT NULL,
    "totalProducto" DECIMAL(12,2) NOT NULL,
    "fechaAgregado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "carritoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,

    CONSTRAINT "CarritoProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'pendiente',
    "fechaPedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(12,2) NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "carritoId" TEXT NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoProducto" (
    "id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(12,2) NOT NULL,
    "totalProducto" DECIMAL(12,2) NOT NULL,
    "fechaAgregado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pedidoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,

    CONSTRAINT "PedidoProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketRetiro" (
    "id" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "puntoRetiro" TEXT,
    "codigoRetiro" TEXT,
    "estado" "EstadoTicket" NOT NULL DEFAULT 'pendiente',
    "pedidoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "TicketRetiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resena" (
    "id" TEXT NOT NULL,
    "calificacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "fechaResena" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoResena" NOT NULL DEFAULT 'pendiente',
    "moderado" BOOLEAN NOT NULL DEFAULT false,
    "productoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "Resena_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_key" ON "Rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Certificacion_nombre_key" ON "Certificacion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Prueba_nombre_key" ON "Prueba"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaProducto_nombre_key" ON "CategoriaProducto"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_personaId_idx" ON "Usuario"("personaId");

-- CreateIndex
CREATE INDEX "SolicitudRepresentante_usuarioId_idx" ON "SolicitudRepresentante"("usuarioId");

-- CreateIndex
CREATE INDEX "DocumentoSoporte_solicitudId_idx" ON "DocumentoSoporte"("solicitudId");

-- CreateIndex
CREATE INDEX "UsuarioRol_usuarioId_idx" ON "UsuarioRol"("usuarioId");

-- CreateIndex
CREATE INDEX "UsuarioRol_rolId_idx" ON "UsuarioRol"("rolId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioRol_usuarioId_rolId_key" ON "UsuarioRol"("usuarioId", "rolId");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_titulo_key" ON "Producto"("titulo");

-- CreateIndex
CREATE INDEX "Producto_publicadoPorId_idx" ON "Producto"("publicadoPorId");

-- CreateIndex
CREATE INDEX "Producto_categoriaId_idx" ON "Producto"("categoriaId");

-- CreateIndex
CREATE INDEX "ImagenProducto_productoId_idx" ON "ImagenProducto"("productoId");

-- CreateIndex
CREATE INDEX "ProductoCertificacion_productoId_idx" ON "ProductoCertificacion"("productoId");

-- CreateIndex
CREATE INDEX "ProductoCertificacion_certificacionId_idx" ON "ProductoCertificacion"("certificacionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductoCertificacion_productoId_certificacionId_key" ON "ProductoCertificacion"("productoId", "certificacionId");

-- CreateIndex
CREATE INDEX "ProductoPrueba_productoId_idx" ON "ProductoPrueba"("productoId");

-- CreateIndex
CREATE INDEX "ProductoPrueba_pruebaId_idx" ON "ProductoPrueba"("pruebaId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductoPrueba_productoId_pruebaId_key" ON "ProductoPrueba"("productoId", "pruebaId");

-- CreateIndex
CREATE INDEX "Carrito_usuarioId_idx" ON "Carrito"("usuarioId");

-- CreateIndex
CREATE INDEX "CarritoProducto_carritoId_idx" ON "CarritoProducto"("carritoId");

-- CreateIndex
CREATE INDEX "CarritoProducto_productoId_idx" ON "CarritoProducto"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "CarritoProducto_carritoId_productoId_key" ON "CarritoProducto"("carritoId", "productoId");

-- CreateIndex
CREATE INDEX "Pedido_usuarioId_idx" ON "Pedido"("usuarioId");

-- CreateIndex
CREATE INDEX "Pedido_carritoId_idx" ON "Pedido"("carritoId");

-- CreateIndex
CREATE INDEX "PedidoProducto_pedidoId_idx" ON "PedidoProducto"("pedidoId");

-- CreateIndex
CREATE INDEX "PedidoProducto_productoId_idx" ON "PedidoProducto"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "PedidoProducto_pedidoId_productoId_key" ON "PedidoProducto"("pedidoId", "productoId");

-- CreateIndex
CREATE INDEX "TicketRetiro_pedidoId_idx" ON "TicketRetiro"("pedidoId");

-- CreateIndex
CREATE INDEX "TicketRetiro_usuarioId_idx" ON "TicketRetiro"("usuarioId");

-- CreateIndex
CREATE INDEX "Resena_productoId_idx" ON "Resena"("productoId");

-- CreateIndex
CREATE INDEX "Resena_usuarioId_idx" ON "Resena"("usuarioId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudRepresentante" ADD CONSTRAINT "SolicitudRepresentante_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoSoporte" ADD CONSTRAINT "DocumentoSoporte_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "SolicitudRepresentante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_publicadoPorId_fkey" FOREIGN KEY ("publicadoPorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaProducto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagenProducto" ADD CONSTRAINT "ImagenProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoCertificacion" ADD CONSTRAINT "ProductoCertificacion_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoCertificacion" ADD CONSTRAINT "ProductoCertificacion_certificacionId_fkey" FOREIGN KEY ("certificacionId") REFERENCES "Certificacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoPrueba" ADD CONSTRAINT "ProductoPrueba_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoPrueba" ADD CONSTRAINT "ProductoPrueba_pruebaId_fkey" FOREIGN KEY ("pruebaId") REFERENCES "Prueba"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carrito" ADD CONSTRAINT "Carrito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarritoProducto" ADD CONSTRAINT "CarritoProducto_carritoId_fkey" FOREIGN KEY ("carritoId") REFERENCES "Carrito"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarritoProducto" ADD CONSTRAINT "CarritoProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_carritoId_fkey" FOREIGN KEY ("carritoId") REFERENCES "Carrito"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoProducto" ADD CONSTRAINT "PedidoProducto_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoProducto" ADD CONSTRAINT "PedidoProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketRetiro" ADD CONSTRAINT "TicketRetiro_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketRetiro" ADD CONSTRAINT "TicketRetiro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
