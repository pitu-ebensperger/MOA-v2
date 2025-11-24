import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import { errorHandler, NotFoundError } from "./src/utils/error.utils.js";
import rateLimit from "express-rate-limit";
import { validateEnv } from "./src/utils/env.js";

dotenv.config();
validateEnv();

const app = express();

// Compresión HTTP (gzip/deflate) para responses >1KB
app.use(compression({
  threshold: 1024, // Solo comprimir responses mayores a 1KB
  level: 6, // Nivel de compresión (0-9, default: 6)
  filter: (req, res) => {
    // No comprimir si el cliente explícitamente lo solicita
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Usar el filtro por defecto de compression
    return compression.filter(req, res);
  }
}));

// Middleware global
app.use(express.json({ limit: '10mb' })); // Límite de payload

// CORS configuration
const isProd = (process.env.NODE_ENV || 'development') === 'production';
const defaultDevOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];
const envOrigins = (process.env.CORS_ORIGIN || process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = isProd ? envOrigins : (envOrigins.length ? envOrigins : defaultDevOrigins);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: Origin not allowed: ${origin}`));
  },
  credentials: true,
}));

// Rate limiting
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000); // 15 minutes
const maxRequests = Number(process.env.RATE_LIMIT_MAX || 200);
const authMaxRequests = Number(process.env.AUTH_RATE_LIMIT_MAX || 10);
const rateLimitEnabled = process.env.RATE_LIMIT_ENABLED !== undefined
  ? process.env.RATE_LIMIT_ENABLED === 'true'
  : isProd;

const generalLimiter = rateLimit({ windowMs, max: maxRequests, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs, max: authMaxRequests, standardHeaders: true, legacyHeaders: false });

// Apply general limiter to all routes (omit in development unless explicitly enabled)
if (rateLimitEnabled) {
  app.use(generalLimiter);
} else if (!isProd) {
  console.warn('[RateLimit] General limiter deshabilitado en modo desarrollo');
}

/* ----------------------------- Rutas ----------------------------- */

import categoriesRouter from "./routes/categoriesRoutes.js";
import productsRouter from "./routes/productsRoutes.js";
import userRoutes from "./routes/usersRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import home from "./routes/homeRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

// Ruta base para tests
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "API funcionando",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Registro de rutas en orden de prioridad
app.use(healthRoutes);      // Health check (no auth required)
app.use(home);              // Rutas home (/)
if (rateLimitEnabled) {
  app.use(['/login', '/register'], authLimiter); // Rate limit auth endpoints
}
app.use(authRoutes);        // Rutas de autenticación (/login, /register, etc.)
app.use(userRoutes);        // Rutas de usuario (/usuario, /auth/perfil)
app.use(categoriesRouter);  // Rutas de categorías (/categorias)
app.use(productsRouter);    // Rutas de productos (/productos)
app.use(wishlistRoutes);    // Rutas de wishlist (/wishlist)
app.use(cartRoutes);        // Rutas de carrito (/cart)
app.use(orderRoutes);       // Rutas de órdenes (/orders)
app.use(addressRoutes);     // Rutas de direcciones (/api/direcciones)
app.use(adminRoutes);       // Rutas de admin (/admin/*)
app.use(configRoutes);      // Rutas de configuración (/config)

// Manejo de rutas no encontradas - debe estar después de todas las rutas
app.use((req, res, next) => {
  next(new NotFoundError(`La ruta ${req.originalUrl} no existe`));
});

// Middleware de manejo de errores (debe ser el último)
app.use(errorHandler);

export default app;
