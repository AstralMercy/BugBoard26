import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import issueRoutes from './routes/issueRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurazione dei middleware di comunicazione di base
app.use(cors());
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