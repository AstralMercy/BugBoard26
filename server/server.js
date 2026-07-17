import './config/env.js';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import issueRoutes from './routes/issueRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set(
  configuredOrigins?.length ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS
);

// Configurazione dei middleware di comunicazione di base
app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.has(origin));
  },
}));
app.use(express.json());

// Rende la cartella degli upload accessibile tramite link URL dal frontend
app.use('/uploads', express.static('uploads'));

// Smistamento dei canali API del sistema BugBoard26
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/issues', issueRoutes);

// Avvio formale dell'applicazione server
app.listen(PORT, () => {
  console.log(`Server connesso sulla porta ${PORT}`);
});
