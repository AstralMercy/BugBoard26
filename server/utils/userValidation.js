const ALLOWED_ROLES = new Set(['normale', 'admin']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function validateAdminUserCreation(payload) {
  const data = payload && typeof payload === 'object' ? payload : {};
  const nome = typeof data.nome === 'string' ? data.nome.trim() : '';
  const cognome = typeof data.cognome === 'string' ? data.cognome.trim() : '';
  const username = typeof data.username === 'string' ? data.username.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const password = typeof data.password === 'string' ? data.password : '';
  const role = typeof data.role === 'string' ? data.role : '';
  const errors = [];

  if (!nome || !cognome || !username || !email || !password || !role) {
    errors.push('Tutti i campi sono obbligatori.');
  }
  if (email && !EMAIL_PATTERN.test(email)) {
    errors.push('Indirizzo e-mail non valido.');
  }
  if (password && !PASSWORD_PATTERN.test(password)) {
    errors.push('La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola, un numero e un simbolo.');
  }
  if (role && !ALLOWED_ROLES.has(role)) {
    errors.push('Ruolo non valido.');
  }

  return {
    valid: errors.length === 0,
    errors,
    value: { nome, cognome, username, email, password, role },
  };
}
