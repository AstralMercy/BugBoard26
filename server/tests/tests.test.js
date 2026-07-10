import { describe, expect, test } from '@jest/globals';
import {
  canUserTransitionStatus,
  filterIssues,
  validateCommentPayload,
  validateIssuePayload,
} from '../utils/tests.js';

const TITLE_ERROR = 'Il titolo deve contenere da 5 a 100 caratteri.';
const DESCRIPTION_ERROR = 'La descrizione non può essere vuota.';
const TYPE_ERROR = 'Il tipo della issue non è valido.';
const PRIORITY_ERROR = 'La priorità della issue non è valida.';
const COMMENT_EMPTY_ERROR = 'Il commento non può essere vuoto.';
const COMMENT_LENGTH_ERROR = 'Il commento non può superare 1000 caratteri.';
const ISSUE_ID_ERROR = "L'identificativo della issue deve essere un intero positivo.";

describe('validateIssuePayload', () => {
  test.each([
    ['accetta il titolo al limite minimo', 'abcde', 'Descrizione valida', 'bug', 'Low', true, []],
    ['accetta il titolo al limite massimo', 'a'.repeat(100), 'Descrizione valida', 'feature', 'Critical', true, []],
    ['rifiuta un titolo di quattro caratteri', 'abcd', 'Descrizione valida', 'bug', 'High', false, [TITLE_ERROR]],
    ['rifiuta un titolo di 101 caratteri', 'a'.repeat(101), 'Descrizione valida', 'bug', 'High', false, [TITLE_ERROR]],
    ['rifiuta una descrizione composta da spazi', 'Titolo valido', '   ', 'bug', 'Medium', false, [DESCRIPTION_ERROR]],
    ['rifiuta una tipologia non prevista', 'Titolo valido', 'Descrizione valida', 'task', 'Low', false, [TYPE_ERROR]],
    ['rifiuta una priorità con valore non previsto', 'Titolo valido', 'Descrizione valida', 'feature', 'Urgent', false, [PRIORITY_ERROR]],
    [
      'accumula tutti gli errori del payload',
      '',
      '',
      'task',
      'Urgent',
      false,
      [TITLE_ERROR, DESCRIPTION_ERROR, TYPE_ERROR, PRIORITY_ERROR],
    ],
    [
      'gestisce titolo e descrizione non testuali',
      null,
      42,
      'bug',
      'Low',
      false,
      [TITLE_ERROR, DESCRIPTION_ERROR],
    ],
  ])('%s', (_label, title, description, type, priority, valid, errors) => {
    expect(validateIssuePayload(title, description, type, priority)).toEqual({ valid, errors });
  });
});

describe('filterIssues', () => {
  const issues = [
    {
      id: 1,
      title: 'Errore salvataggio profilo',
      description: 'La richiesta restituisce errore 500',
      status: 'Open',
      priority: 'High',
    },
    {
      id: 2,
      title: 'Esportazione report',
      description: 'Aggiungere il formato PDF',
      status: 'In Progress',
      priority: 'Medium',
    },
    {
      id: 3,
      title: 'Sessione scaduta',
      description: 'Il profilo non viene salvato',
      status: 'Closed',
      priority: 'High',
    },
    {
      id: 4,
      title: 'Aggiornare il tema',
      description: 'Migliorare il contrasto della dashboard',
      status: 'Open',
      priority: 'Low',
    },
  ];

  test.each([
    ['restituisce tutte le issue senza filtri', issues, {}, [1, 2, 3, 4]],
    ['ricerca nel titolo senza distinguere maiuscole e minuscole', issues, { search: 'ERRORE' }, [1]],
    ['ricerca anche nella descrizione', issues, { search: 'profilo' }, [1, 3]],
    ['filtra per stato con uguaglianza esatta', issues, { status: 'Open' }, [1, 4]],
    ['filtra per priorità con uguaglianza esatta', issues, { priority: 'High' }, [1, 3]],
    [
      'combina ricerca, stato e priorità con operatore logico AND',
      issues,
      { search: 'profilo', status: 'Open', priority: 'High' },
      [1],
    ],
    ['restituisce un array vuoto se nessuna issue coincide', issues, { search: 'inesistente' }, []],
    ['gestisce in modo sicuro un elenco non valido', null, { status: 'Open' }, []],
    ['considera assenti i filtri quando il secondo parametro è nullo', issues, null, [1, 2, 3, 4]],
    [
      'gestisce campi testuali mancanti nell\'oggetto issue',
      [{ id: 5, status: 'Open', priority: 'Low' }],
      { search: 'profilo' },
      [],
    ],
  ])('%s', (_label, issuesList, filters, expectedIds) => {
    expect(filterIssues(issuesList, filters).map((issue) => issue.id)).toEqual(expectedIds);
  });
});

describe('validateCommentPayload', () => {
  test.each([
    ['accetta un commento ordinario associato a una issue valida', 'Fix in revisione.', 1, true, []],
    ['accetta il testo al limite massimo', 'a'.repeat(1000), 42, true, []],
    ['rifiuta un commento composto da soli spazi', '   ', 3, false, [COMMENT_EMPTY_ERROR]],
    ['rifiuta un commento di 1001 caratteri', 'a'.repeat(1001), 3, false, [COMMENT_LENGTH_ERROR]],
    ['rifiuta un identificativo uguale a zero', 'Commento valido', 0, false, [ISSUE_ID_ERROR]],
    ['rifiuta un identificativo non intero', 'Commento valido', 1.5, false, [ISSUE_ID_ERROR]],
    [
      'accumula gli errori del testo e dell\'identificativo',
      '',
      -1,
      false,
      [COMMENT_EMPTY_ERROR, ISSUE_ID_ERROR],
    ],
    ['gestisce un testo non tipizzato come stringa', null, 2, false, [COMMENT_EMPTY_ERROR]],
  ])('%s', (_label, text, issueId, valid, errors) => {
    expect(validateCommentPayload(text, issueId)).toEqual({ valid, errors });
  });
});

describe('canUserTransitionStatus', () => {
  test.each([
    ['consente Open -> In Progress a un utente ordinario', 'Open', 'In Progress', 'user', false, true],
    ['consente Open -> Closed all\'autore', 'Open', 'Closed', 'user', true, true],
    ['consente In Progress -> Resolved a un amministratore', 'In Progress', 'Resolved', 'admin', false, true],
    ['nega In Progress -> Closed a un utente non autore', 'In Progress', 'Closed', 'user', false, false],
    ['nega Closed -> In Progress anche a un amministratore', 'Closed', 'In Progress', 'admin', true, false],
    ['nega Resolved -> Open all\'autore', 'Resolved', 'Open', 'user', true, false],
    ['consente Closed -> Resolved all\'autore', 'Closed', 'Resolved', 'user', true, true],
    ['nega una transizione verso uno stato sconosciuto', 'Open', 'Archived', 'admin', true, false],
    ['nega una transizione da uno stato sconosciuto', 'Todo', 'Closed', 'admin', true, false],
  ])('%s', (_label, currentStatus, nextStatus, userRole, isAuthor, expected) => {
    expect(canUserTransitionStatus(currentStatus, nextStatus, userRole, isAuthor)).toBe(expected);
  });
});
