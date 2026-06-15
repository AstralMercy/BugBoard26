import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'CHIAVE_SEGRETA_SUPER_SICURA_2026_BUGBOARD';

// Controlla che l'utente sia loggato verificando il token bearer JWT
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Accesso negato. Token mancante." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Sessione scaduta o Token non valido." });
  }
};

// Controlla se l'utente loggato ha il ruolo specifico di amministratore
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: "Accesso negato. Privilegi Admin richiesti." });
  }
};