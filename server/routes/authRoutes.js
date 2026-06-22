import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../data/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'CHIAVE_SEGRETA_SUPER_SICURA_2026_BUGBOARD';

// POST /api/auth/register -> Registrazione autonoma di un utente
router.post('/register', async (req, res) => {
  const { nome, cognome, username, email, password } = req.body;

  if (!nome || !cognome || !username || !email || !password) {
    return res.status(400).json({ message: "Tutti i campi sono obbligatori!" });
  }

  try {
    const userCheck = await query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email o Username già registrati." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await query(
      'INSERT INTO users (nome, cognome, username, email, password, role) VALUES ($1, $2, $3, $4, $5, $6)',
      [nome, cognome, username, email, hashedPassword, 'normale']
    );

    return res.status(201).json({ message: "Utente registrato con successo!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Errore interno del database." });
  }
});

// POST /api/auth/login -> Accesso al sistema con rilascio del Token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Credenziali errate." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenziali errate." });
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