import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../data/db.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import { validateAdminUserCreation } from '../utils/userValidation.js';

const router = express.Router();

// POST /api/users/create-user -> Creazione account interna effettuata dall'Admin (Punto 1)
router.post('/create-user', verifyToken, isAdmin, async (req, res) => {
  const validation = validateAdminUserCreation(req.body);

  if (!validation.valid) {
    return res.status(400).json({ message: validation.errors[0], errors: validation.errors });
  }

  const { nome, cognome, username, email, password, role } = validation.value;

  try {
    const userCheck = await query(
      'SELECT 1 FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)',
      [email, username],
    );
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ message: "Email o username già esistenti." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await query(
      'INSERT INTO users (nome, cognome, username, email, password, role) VALUES ($1, $2, $3, $4, $5, $6)',
      [nome, cognome, username, email, hashedPassword, role]
    );

    return res.status(201).json({ message: "Account dipendente registrato correttamente." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Errore durante la scrittura su NeonDB." });
  }
});

export default router;
