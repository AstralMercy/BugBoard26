import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../data/db.js';
import { JWT_SECRET } from '../config/env.js';

const router = express.Router();

// POST /api/auth/login -> Accesso al sistema con rilascio del Token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: "E-mail e password sono obbligatorie." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const result = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [normalizedEmail]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Credenziali errate." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenziali errate." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.json({
      token,
      user: { nome: user.nome, cognome: user.cognome, username: user.username, role: user.role }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Errore interno del database." });
  }
});

export default router;
