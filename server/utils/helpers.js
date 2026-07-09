const ISSUE_TYPES = new Set(['bug', 'feature']);
const ISSUE_PRIORITIES = new Set(['Low', 'Medium', 'High', 'Critical']);
const TERMINAL_STATUSES = new Set(['Closed', 'Resolved']);

const STATUS_TRANSITIONS = new Map([
  ['Open', new Set(['In Progress', 'Closed', 'Resolved'])],
  ['In Progress', new Set(['Closed', 'Resolved'])],
  ['Closed', new Set(['Resolved'])],
  ['Resolved', new Set()],
]);

/**
 * Valida i dati essenziali necessari per creare una issue.
 *
 * @param {string} title titolo della issue
 * @param {string} description descrizione della issue
 * @param {string} type tipologia della issue
 * @param {string} priority priorità della issue
 * @returns {{ valid: boolean, errors: string[] }} esito e messaggi di errore
 */
export function validateIssuePayload(title, description, type, priority) {
  const errors = [];
  const normalizedTitle = typeof title === 'string' ? title.trim() : '';
  const normalizedDescription = typeof description === 'string' ? description.trim() : '';

  if (normalizedTitle.length < 5 || normalizedTitle.length > 100) {
    errors.push('Il titolo deve contenere da 5 a 100 caratteri.');
  }

  if (normalizedDescription.length === 0) {
    errors.push('La descrizione non può essere vuota.');
  }

  if (!ISSUE_TYPES.has(type)) {
    errors.push('Il tipo della issue non è valido.');
  }

  if (!ISSUE_PRIORITIES.has(priority)) {
    errors.push('La priorità della issue non è valida.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Filtra una collezione di issue senza modificarne il contenuto.
 * I valori vuoti e il valore convenzionale "All" disabilitano il filtro.
 *
 * @param {Array<object>} issuesList elenco delle issue
 * @param {{ search?: string, status?: string, priority?: string }} filters filtri
 * @returns {Array<object>} issue che soddisfano tutti i filtri attivi
 */
export function filterIssues(issuesList, filters) {
  if (!Array.isArray(issuesList)) {
    return [];
  }

  const safeFilters = filters && typeof filters === 'object' ? filters : {};
  const search = typeof safeFilters.search === 'string'
    ? safeFilters.search.trim().toLowerCase()
    : '';
  const status = safeFilters.status;
  const priority = safeFilters.priority;
  const hasStatusFilter = typeof status === 'string' && status !== '' && status !== 'All';
  const hasPriorityFilter = typeof priority === 'string' && priority !== '' && priority !== 'All';

  return issuesList.filter((issue) => {
    const title = typeof issue?.title === 'string' ? issue.title.toLowerCase() : '';
    const description = typeof issue?.description === 'string'
      ? issue.description.toLowerCase()
      : '';

    const matchesSearch = search === ''
      || title.includes(search)
      || description.includes(search);
    const matchesStatus = !hasStatusFilter || issue?.status === status;
    const matchesPriority = !hasPriorityFilter || issue?.priority === priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });
}

/**
 * Valida il testo di un commento e l'identificativo della issue associata.
 *
 * @param {string} text testo del commento
 * @param {number} issueId identificativo numerico della issue
 * @returns {{ valid: boolean, errors: string[] }} esito e messaggi di errore
 */
export function validateCommentPayload(text, issueId) {
  const errors = [];
  const normalizedText = typeof text === 'string' ? text.trim() : '';

  if (normalizedText.length === 0) {
    errors.push('Il commento non può essere vuoto.');
  }

  if (normalizedText.length > 1000) {
    errors.push('Il commento non può superare 1000 caratteri.');
  }

  if (!Number.isInteger(issueId) || issueId <= 0) {
    errors.push("L'identificativo della issue deve essere un intero positivo.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Verifica una transizione di stato e l'autorizzazione richiesta per gli stati
 * terminali. Le transizioni verso Closed o Resolved sono riservate all'autore
 * della issue o a un amministratore.
 *
 * @param {string} currentStatus stato corrente
 * @param {string} nextStatus stato richiesto
 * @param {string} userRole ruolo dell'utente
 * @param {boolean} isAuthor indica se l'utente è autore della issue
 * @returns {boolean} true se la transizione è valida e autorizzata
 */
export function canUserTransitionStatus(currentStatus, nextStatus, userRole, isAuthor) {
  const allowedNextStatuses = STATUS_TRANSITIONS.get(currentStatus);

  if (!allowedNextStatuses || !allowedNextStatuses.has(nextStatus)) {
    return false;
  }

  if (TERMINAL_STATUSES.has(nextStatus)) {
    return userRole === 'admin' || isAuthor === true;
  }

  return true;
}
