import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CustomAlert from '../components/CustomAlert'; // Inserito solo l'import

const ALLOWED_ROLES = new Set(['normale', 'admin']);
const DISPLAY_NAME_PATTERN = /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;
const USERNAME_PATTERN = /^[\p{L}\p{M}\p{N}._-]+$/u;
const JWT_PATTERN = /^([A-Za-z0-9_-]{1,512})\.([A-Za-z0-9_-]{1,2048})\.([A-Za-z0-9_-]{43})$/;
const MAX_NAME_LENGTH = 100;
const MAX_USERNAME_LENGTH = 64;
const MAX_TOKEN_LIFETIME_SECONDS = (2 * 60 * 60) + 60;

class InvalidLoginResponseError extends Error {
  constructor() {
    super('La risposta di autenticazione non è valida.');
    this.name = 'InvalidLoginResponseError';
  }
}

const isRecord = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
);

const sanitizeText = (value, pattern, maxLength) => {
  if (typeof value !== 'string') {
    throw new InvalidLoginResponseError();
  }

  const sanitizedValue = value.normalize('NFKC').trim();
  if (
    sanitizedValue.length === 0
    || sanitizedValue.length > maxLength
    || !pattern.test(sanitizedValue)
  ) {
    throw new InvalidLoginResponseError();
  }

  return sanitizedValue;
};

const sanitizeRole = (value) => {
  if (!ALLOWED_ROLES.has(value)) {
    throw new InvalidLoginResponseError();
  }

  // Restituisce esclusivamente valori definiti localmente, non la stringa remota.
  return value === 'admin' ? 'admin' : 'normale';
};

const decodeJwtSegment = (segment) => {
  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(base64 + padding);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    const value = JSON.parse(decoded);

    if (!isRecord(value)) {
      throw new InvalidLoginResponseError();
    }

    return value;
  } catch {
    throw new InvalidLoginResponseError();
  }
};

const sanitizeUser = (value) => {
  if (!isRecord(value)) {
    throw new InvalidLoginResponseError();
  }

  return {
    nome: sanitizeText(value.nome, DISPLAY_NAME_PATTERN, MAX_NAME_LENGTH),
    cognome: sanitizeText(value.cognome, DISPLAY_NAME_PATTERN, MAX_NAME_LENGTH),
    username: sanitizeText(value.username, USERNAME_PATTERN, MAX_USERNAME_LENGTH),
    role: sanitizeRole(value.role),
  };
};

const sanitizeToken = (value, user) => {
  if (typeof value !== 'string') {
    throw new InvalidLoginResponseError();
  }

  const sanitizedToken = value.trim();
  const match = JWT_PATTERN.exec(sanitizedToken);
  if (!match) {
    throw new InvalidLoginResponseError();
  }

  const header = decodeJwtSegment(match[1]);
  const payload = decodeJwtSegment(match[2]);
  const now = Math.floor(Date.now() / 1000);
  const payloadUsername = sanitizeText(payload.username, USERNAME_PATTERN, MAX_USERNAME_LENGTH);
  const payloadRole = sanitizeRole(payload.role);

  if (
    header.alg !== 'HS256'
    || header.typ !== 'JWT'
    || !Number.isSafeInteger(payload.id)
    || payload.id <= 0
    || !Number.isSafeInteger(payload.iat)
    || !Number.isSafeInteger(payload.exp)
    || payload.iat > now + 60
    || payload.exp <= now
    || payload.exp <= payload.iat
    || payload.exp - payload.iat > MAX_TOKEN_LIFETIME_SECONDS
    || payloadUsername !== user.username
    || payloadRole !== user.role
  ) {
    throw new InvalidLoginResponseError();
  }

  return sanitizedToken;
};

const sanitizeLoginResponse = (value) => {
  if (!isRecord(value)) {
    throw new InvalidLoginResponseError();
  }

  const user = sanitizeUser(value.user);
  return {
    token: sanitizeToken(value.token, user),
    user,
  };
};

const persistValidatedSession = ({ token, user }) => {
  const serializedUser = JSON.stringify(user);

  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.setItem('token', token);
    localStorage.setItem('user', serializedUser);
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error;
  }
};

const LoginPage = () => {
  // --- LOGICA JAVASCRIPT ---
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  // --- STATO PER IL POPUP PERSONALIZZATO ---
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '', type: 'success' });

  const triggerAlert = (message, type = 'success') => {
    setAlertConfig({ isOpen: true, message, type });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Nota il percorso aggiornato /api/auth/login coerente con Express
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.toLowerCase().includes('application/json')) {
          throw new InvalidLoginResponseError();
        }

        const data = await response.json();
        const validatedSession = sanitizeLoginResponse(data);
        persistValidatedSession(validatedSession);
        
        // Entra direttamente senza mostrare il popup di successo
        navigate('/home'); 
      } else {
        // Il testo remoto non viene mostrato né memorizzato senza validazione.
        const message = response.status === 401
          ? 'Errore di autenticazione: credenziali errate.'
          : 'Impossibile completare l’autenticazione.';
        triggerAlert(message, 'error');
      }
    } catch (error) {
      console.error('Errore durante il login:', error);
      const message = error instanceof InvalidLoginResponseError
        ? 'Il server ha restituito dati di autenticazione non validi. Accesso annullato.'
        : 'Impossibile connettersi al backend. Assicurati che Express sia acceso sulla porta 5000.';
      triggerAlert(message, 'error');
    }
  };

  // --- INTERFACCIA GRAFICA UNIFICATA IN STILE HOMEPAGE XL ---
  return (
    <div className="min-h-screen bg-[#1a1a1c] text-white flex flex-col justify-between overflow-y-auto">
      {/* Navbar in stato non loggato */}
      <Navbar isLoggedIn={false} />

      <main className="grow flex flex-col items-center justify-center px-4 py-12">
        
        {/* Card di Login coordinata con l'ecosistema BugBoard26 */}
        <div className="w-full max-w-xl bg-[#2a2a2d] p-6 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-800">
          
          {/* Header interno coordinato */}
          <div className="mb-10 text-left">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              Inserisci le tue credenziali per accedere ai progetti attivi
            </p>
          </div>

          <form className="space-y-6 md:space-y-7" onSubmit={handleSubmit}>
            
            {/* Campo Email */}
            <div>
              <label className="block text-[#00c2cb] text-[10px] md:text-xs font-black mb-3 tracking-[0.2em] uppercase">
                Email Utente *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="INSERISCI LA TUA EMAIL..."
                className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] focus:ring-1 focus:ring-[#00c2cb] placeholder-gray-600 text-sm md:text-base transition-all"
              />
            </div>

            {/* Campo Password */}
            <div>
              <label className="block text-[#00c2cb] text-[10px] md:text-xs font-black mb-3 tracking-[0.2em] uppercase">
                Password *
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="INSERISCI LA PASSWORD..."
                className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] focus:ring-1 focus:ring-[#00c2cb] placeholder-gray-600 text-sm md:text-base transition-all"
              />
            </div>

            {/* Bottone di Invio Solid ad alto contrasto */}
            <button
              type="submit"
              className="w-full py-4 bg-[#6495ED] hover:bg-[#5a86d6] text-[#1a1a1c] font-black text-sm md:text-base rounded-xl shadow-lg shadow-[#6495ED]/10 transition-all transform active:scale-95 uppercase tracking-widest"
            >
              Accedi
            </button>
          </form>

        </div>
      </main>
      
      {/* Piccolo spazio vuoto inferiore per bilanciare il flex-grow */}
      <div className="h-4"></div>

      {/* COMPONENTE ALERT INSERITO SENZA TOCCARE IL DESIGN ORIGINALE */}
      <CustomAlert 
        isOpen={alertConfig.isOpen} 
        message={alertConfig.message} 
        type={alertConfig.type} 
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })} 
      />
    </div>
  );
};

export default LoginPage;
