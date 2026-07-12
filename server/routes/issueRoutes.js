import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { query } from '../data/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { CLOUDINARY_CONFIG } from '../config/env.js';

const router = express.Router();
const INITIAL_ISSUE_STATUS = 'to-do';
const ALLOWED_ISSUE_STATUSES = new Set(['to-do', 'In Progress', 'Closed', 'Resolved']);

// Configurazione di Cloudinary tramite le credenziali del file .env
cloudinary.config(CLOUDINARY_CONFIG);

// Usiamo la memoria RAM (memoryStorage) anziché il disco locale per i file temporanei
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 1. POST /api/issues -> Segnalazione nuova issue con caricamento su Cloudinary (Punto 2)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  const { title, description, type, priority } = req.body;

  if (!title || !description || !type || !priority) {
    return res.status(400).json({ message: "Titolo, descrizione, tipo e priorità sono obbligatori!" });
  }

  try {
    let imagePath = null;

    // Se l'utente ha selezionato un file, lo inviamo a Cloudinary tramite uno stream di buffer
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'bugboard26' }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(req.file.buffer);
      });
      // Salviamo l'URL sicuro e assoluto fornito direttamente da Cloudinary
      imagePath = uploadResult.secure_url;
    }

    // --- AGGIORNATO: Recuperiamo l'autore dal token e lo salviamo nella tabella ---
    const author = req.user.username;

    const result = await query(
      'INSERT INTO issues (title, description, type, priority, image_path, status, author) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, type, priority, imagePath, INITIAL_ISSUE_STATUS, author]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Errore nell'upload su Cloudinary:", error);
    return res.status(500).json({ message: "Errore nel salvataggio dell'issue." });
  }
});

// 2. GET /api/issues -> Vista riepilogativa con Filtri e Ordinamento dinamico su NeonDB (Punto 3)
router.get('/', verifyToken, async (req, res) => {
  const { status, priority, sort } = req.query;
  
  let queryText = 'SELECT * FROM issues WHERE 1=1';
  let queryParams = [];
  let paramIndex = 1;

  if (status && status !== 'All') {
    queryText += ` AND status = $${paramIndex}`;
    queryParams.push(status);
    paramIndex++;
  }

  if (priority && priority !== 'All') {
    queryText += ` AND priority = $${paramIndex}`;
    queryParams.push(priority);
    paramIndex++;
  }

  if (sort === 'title') {
    queryText += ' ORDER BY title ASC';
  } else if (sort === 'priority') {
    queryText += ' ORDER BY priority DESC';
  } else {
    queryText += ' ORDER BY id ASC';
  }

  try {
    const result = await query(queryText, queryParams);
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Errore nel recupero delle informazioni." });
  }
});

// 3. PUT /api/issues/:id/status -> Modifica dello stato di avanzamento di un bug (Punto 6)
router.put('/:id/status', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: "Stato mancante." });
  if (!ALLOWED_ISSUE_STATUSES.has(status)) {
    return res.status(400).json({ message: "Stato non valido." });
  }

  try {
    await query('UPDATE issues SET status = $1 WHERE id = $2', [status, id]);
    return res.json({ message: "Stato della segnalazione aggiornato con successo!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Impossibile aggiornare lo stato." });
  }
});

// 4. GET /api/issues/:id/comments -> Carica i commenti di uno specifico bug (Punto 5)
router.get('/:id/comments', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM comments WHERE issue_id = $1 ORDER BY created_at ASC', [id]);
    return res.json(result.rows);
  } catch {
    return res.status(500).json({ message: "Errore nel caricamento della chat." });
  }
});

// 5. POST /api/issues/:id/comments -> Inserisce un messaggio nella discussione (Punto 5)
router.post('/:id/comments', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const author = req.user.username;

  if (!text) return res.status(400).json({ message: "Il testo del messaggio non può essere vuoto." });

  try {
    const result = await query(
      'INSERT INTO comments (issue_id, author, text) VALUES ($1, $2, $3) RETURNING *',
      [id, author, text]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Errore nell'invio del commento." });
  }
});

export default router;
