import { test, expect } from '@playwright/test';

const APP_URL = process.env.PLAYWRIGHT_BASE_URL
  || 'http://127.0.0.1:5173';
const API_URL = process.env.API_BASE_URL
  || 'http://127.0.0.1:5000';
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const testUser = {
  nome: 'Playwright',
  cognome: 'E2E',
  username: `playwright_${runId}`,
  email: `playwright.${runId}@bugboard26.test`,
  password: `Playwright-${runId}!`,
};

function appPath(pathname) {
  return new URL(pathname, APP_URL).toString();
}

function apiPath(pathname) {
  return new URL(pathname, API_URL).toString();
}

function isResponse(response, method, pathname) {
  const actualPath = new URL(response.url()).pathname.replace(/\/$/, '');
  return response.request().method() === method
    && actualPath === pathname.replace(/\/$/, '');
}

function uniqueId(testInfo, purpose) {
  const random = Math.random().toString(36).slice(2, 8);
  return `E2E-${purpose}-${Date.now()}-${testInfo.workerIndex}-${random}`;
}

async function provisionTestUser(request) {
  const response = await request.post(apiPath('/api/auth/register'), {
    data: testUser,
  });

  if (!response.ok()) {
    throw new Error(
      `Creazione utente E2E fallita (${response.status()}): `
      + await response.text(),
    );
  }
}

async function loginAsTestUser(page) {
  await page.goto(appPath('/login'));

  const email = page.getByLabel(/email/i)
    .or(page.locator('input[name="email"], input[type="email"]'))
    .first();
  const password = page.getByLabel(/password/i)
    .or(page.locator('input[name="password"], input[type="password"]'))
    .first();
  const submit = page.getByRole('button', {
    name: /accedi|sign in|login/i,
  });

  await email.fill(testUser.email);
  await password.fill(testUser.password);

  const [loginResponse] = await Promise.all([
    page.waitForResponse((response) => (
      isResponse(response, 'POST', '/api/auth/login')
    )),
    page.waitForURL(/\/home(?:[/?#]|$)/),
    submit.click(),
  ]);

  expect(loginResponse.ok()).toBeTruthy();
}

async function readAuthToken(page) {
  return page.evaluate(() => {
    const tokenKeys = [
      'token',
      'accessToken',
      'authToken',
      'jwt',
    ];

    for (const key of tokenKeys) {
      const value = localStorage.getItem(key);
      if (value) return value.replace(/^"|"$/g, '');
    }

    for (let index = 0; index < localStorage.length; index += 1) {
      const raw = localStorage.getItem(localStorage.key(index));
      if (!raw) continue;

      try {
        const value = JSON.parse(raw);
        for (const key of tokenKeys) {
          if (typeof value?.[key] === 'string') return value[key];
          if (typeof value?.auth?.[key] === 'string') {
            return value.auth[key];
          }
        }
      } catch {
        if (raw.split('.').length === 3) return raw;
      }
    }

    return null;
  });
}

async function authHeaders(page) {
  const token = await readAuthToken(page);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function responseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function issueFrom(payload) {
  return payload?.issue
    || payload?.data?.issue
    || payload?.data
    || payload;
}

async function createIssueByApi(page, fields) {
  const response = await page.context().request.post(
    apiPath('/api/issues'),
    {
      headers: await authHeaders(page),
      data: fields,
    },
  );

  if (!response.ok()) {
    throw new Error(
      `Setup issue fallito (${response.status()}): ${await response.text()}`,
    );
  }
  const issue = issueFrom(await responseJson(response));
  const id = issue?.id || issue?.issueId || issue?.issue_id;
  expect(id, 'La POST /api/issues deve restituire l\'id creato.')
    .toBeTruthy();
  return { ...fields, ...issue, id };
}

async function updateStatusByApi(page, issueId, status) {
  const response = await page.context().request.put(
    apiPath(`/api/issues/${issueId}/status`),
    {
      headers: await authHeaders(page),
      data: { status },
    },
  );

  if (!response.ok()) {
    throw new Error(
      `Setup stato fallito (${response.status()}): ${await response.text()}`,
    );
  }
}

async function selectMatchingOption(select, acceptedPatterns) {
  const options = await select.locator('option').evaluateAll((nodes) => (
    nodes.map((node) => ({
      label: (node.textContent || '').trim(),
      value: node.value,
    }))
  ));

  const option = options.find(({ label, value }) => (
    acceptedPatterns.some((pattern) => (
      pattern.test(label) || pattern.test(value)
    ))
  ));

  expect(option, `Opzione non trovata: ${acceptedPatterns.join(', ')}`)
    .toBeTruthy();
  await select.selectOption(option.value);
}

function searchInput(page) {
  return page.getByPlaceholder(/cerca bug|cerca.*titolo|search/i)
    .or(page.locator('input[type="search"], input[name="search"]'))
    .first();
}

function statusFilter(page) {
  return page.getByLabel(/filtra per stato|status filter/i)
    .or(page.locator(
      'select[name="status"], [data-testid="status-filter"]',
    ))
    .or(page.getByText(/filtra per stato/i)
      .locator('..').locator('select'))
    .first();
}

function priorityFilter(page) {
  return page.getByLabel(/filtra per priorit|priority filter/i)
    .or(page.locator(
      'select[name="priority"], [data-testid="priority-filter"]',
    ))
    .or(page.getByText(/filtra per priorit/i)
      .locator('..').locator('select'))
    .first();
}

async function openIssueFromDashboard(page, title) {
  await page.goto(appPath('/home'));
  await searchInput(page).fill(title);

  const result = page.getByText(title, { exact: true }).first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page.getByText(/discussione\s*\/\s*commenti|commenti/i))
    .toBeVisible();
}

test.describe('BugBoard26 - flussi E2E principali', () => {
  test.beforeAll(async ({ request }) => {
    await provisionTestUser(request);
  });

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('crea una issue completa e torna alla Home', async ({
    page,
  }, testInfo) => {
    const marker = uniqueId(testInfo, 'create');
    const title = `${marker} errore salvataggio profilo`;
    const description = [
      'Il salvataggio restituisce errore 500.',
      'Atteso: profilo persistito e conferma visibile.',
    ].join(' ');

    await page.goto(appPath('/create-issue'));
    await expect(page).toHaveURL(/\/create-issue(?:[/?#]|$)/);

    const form = page.locator('form');
    const titleInput = form.getByPlaceholder(/errore 500.*profilo/i);
    const descriptionInput = form.getByPlaceholder(
      /descrivi il comportamento/i,
    );
    const typeSelect = form.locator('select').nth(0);
    const prioritySelect = form.locator('select').nth(1);
    const submit = form.getByRole('button', {
      name: /invia segnalazione|crea.*issue|submit/i,
    });

    await titleInput.fill(title);
    await descriptionInput.fill(description);
    await selectMatchingOption(typeSelect, [/^bug\b/i]);
    await selectMatchingOption(prioritySelect, [/^high\b/i, /alta/i]);

    const creationPromise = page.waitForResponse((response) => (
      isResponse(response, 'POST', '/api/issues')
    ));
    await submit.click();
    const creationResponse = await creationPromise;

    expect(creationResponse.status()).toBe(201);
    expect(creationResponse.request().postData() || '').toContain(title);
    await expect(page).toHaveURL(/\/home(?:[/?#]|$)/);

    await searchInput(page).fill(title);
    const createdTitle = page.getByText(title, { exact: true });
    await expect(createdTitle).toBeVisible();

    const record = createdTitle.locator(
      'xpath=ancestor::*[self::tr or @role="row" '
      + 'or @data-testid="issue-row"][1]',
    );
    if (await record.count()) {
      await expect(record).toContainText(/open|todo/i);
    }
  });

  test('combina ricerca reattiva, stato e priorita', async ({
    page,
  }, testInfo) => {
    const marker = uniqueId(testInfo, 'filters');
    const matching = await createIssueByApi(page, {
      title: `${marker} target`,
      description: 'Issue che deve superare tutti i filtri.',
      type: 'bug',
      priority: 'High',
    });
    const wrongStatus = await createIssueByApi(page, {
      title: `${marker} stato-non-coerente`,
      description: 'Stessa priorita ma stato Closed.',
      type: 'bug',
      priority: 'High',
    });
    const wrongPriority = await createIssueByApi(page, {
      title: `${marker} priorita-non-coerente`,
      description: 'Stesso stato ma priorita Low.',
      type: 'bug',
      priority: 'Low',
    });
    await updateStatusByApi(page, wrongStatus.id, 'Closed');

    await page.goto(appPath('/home'));
    const search = searchInput(page);
    await search.fill(marker);

    await expect(page.getByText(matching.title, { exact: true }))
      .toBeVisible();
    await expect(page.getByText(wrongStatus.title, { exact: true }))
      .toBeVisible();
    await expect(page.getByText(wrongPriority.title, { exact: true }))
      .toBeVisible();

    await selectMatchingOption(statusFilter(page), [
      /^open$/i,
      /^todo\b/i,
    ]);
    await selectMatchingOption(priorityFilter(page), [
      /^high\b/i,
      /alta/i,
    ]);

    await expect(page.getByText(matching.title, { exact: true }))
      .toBeVisible();
    await expect(page.getByText(wrongStatus.title, { exact: true }))
      .toHaveCount(0);
    await expect(page.getByText(wrongPriority.title, { exact: true }))
      .toHaveCount(0);
    await search.fill(`${marker}-nessun-risultato`);
    await expect(page.getByText(matching.title, { exact: true }))
      .toHaveCount(0);
    await expect(page.getByText(
      /nessuna issue|nessun bug|nessun ticket|nessun risultato|assenza dati/i,
    )).toBeVisible();
  });

  test('aggiunge un commento e aggiorna subito la timeline', async ({
    page,
  }, testInfo) => {
    const marker = uniqueId(testInfo, 'comment');
    const issue = await createIssueByApi(page, {
      title: `${marker} collaborazione`,
      description: 'Issue predisposta per verificare la discussione.',
      type: 'bug',
      priority: 'Low',
    });
    const message = `${marker}: analisi completata, fix in revisione.`;

    await openIssueFromDashboard(page, issue.title);

    const commentInput = page.getByPlaceholder(
      /scrivi un aggiornamento|commento|messaggio/i,
    ).or(page.locator(
      'textarea[name="comment"], input[name="comment"]',
    )).first();
    const send = page.getByRole('button', {
      name: /^invia$|pubblica|aggiungi commento/i,
    }).last();

    await expect(page.getByText(message, { exact: true })).toHaveCount(0);
    await commentInput.fill(message);

    const commentPromise = page.waitForResponse((response) => (
      isResponse(
        response,
        'POST',
        `/api/issues/${issue.id}/comments`,
      )
    ));
    await send.click();
    const commentResponse = await commentPromise;

    expect([200, 201]).toContain(commentResponse.status());
    await expect(page.getByText(message, { exact: true })).toBeVisible();
    await expect(commentInput).toHaveValue('');
  });

  test('chiude una issue e mostra il CustomAlert di notifica', async ({
    page,
  }, testInfo) => {
    const marker = uniqueId(testInfo, 'close');
    const issue = await createIssueByApi(page, {
      title: `${marker} transizione di stato`,
      description: 'Issue predisposta nello stato iniziale Open.',
      type: 'bug',
      priority: 'Critical',
    });

    await openIssueFromDashboard(page, issue.title);

    const status = page.getByLabel(/cambia stato|status/i)
      .or(page.locator(
        'select[name="status"], [data-testid="issue-status"]',
      ))
      .or(page.getByText(/cambia stato/i)
        .locator('..').locator('select'))
      .first();

    const updatePromise = page.waitForResponse((response) => (
      isResponse(
        response,
        'PUT',
        `/api/issues/${issue.id}/status`,
      )
    ));
    await selectMatchingOption(status, [/^closed$/i, /risolt/i]);
    const updateResponse = await updatePromise;

    expect(updateResponse.ok()).toBeTruthy();
    expect(updateResponse.request().postData() || '')
      .toMatch(/closed/i);
    await expect(status.locator('option:checked'))
      .toHaveText(/closed|risolt/i);

    const customAlert = page.getByRole('alert')
      .or(page.locator('[data-testid="custom-alert"], .custom-alert'))
      .or(page.getByText(
        /notifica.*segnalator|segnalator.*notifica/i,
      ))
      .filter({
        hasText: /risolt|closed|notifica|segnalator|successo/i,
      })
      .first();

    await expect(customAlert).toBeVisible();
    await expect(customAlert).toContainText(/risolt|closed|successo/i);
    await expect(customAlert)
      .toContainText(/notifica|segnalator/i);
  });
});
