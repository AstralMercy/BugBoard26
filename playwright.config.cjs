const {
  defineConfig,
  devices,
} = require('@playwright/test');

const isCI = Boolean(process.env.CI);

module.exports = defineConfig({
  // Cartella contenente i test E2E.
  testDir: './e2e',

  // Esegue soltanto file come:
  // bugboard26.e2e.spec.js
  testMatch: '**/*.e2e.spec.js',

  // Timeout massimo di ogni scenario.
  timeout: 60_000,

  // Timeout delle singole asserzioni expect().
  expect: {
    timeout: 10_000,
  },

  // I test dello stesso file restano sequenziali.
  fullyParallel: false,

  // Impedisce di lasciare accidentalmente test.only in CI.
  forbidOnly: isCI,

  // I retry sono utili in CI, non durante lo sviluppo locale.
  retries: isCI ? 2 : 0,

  // NeonDB è condiviso: un solo worker evita interferenze fra fixture.
  workers: 1,

  reporter: [
    ['list'],
    ['html', {
      open: 'never',
      outputFolder: 'playwright-report',
    }],
  ],

  outputDir: 'test-results',

  use: {
    // Consente page.goto('/login').
    baseURL: 'http://127.0.0.1:5173',

    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Evita attese indefinite sulle azioni browser.
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  // Avvio automatico dei due livelli applicativi.
  webServer: [
    {
      name: 'BugBoard26 Backend',

      // Usa lo script già presente nel package.json del backend.
      command: 'npm --prefix server run dev',

      // Una risposta 401 conferma che Express e il middleware sono pronti.
      url: 'http://127.0.0.1:5000/api/issues',

      timeout: 120_000,
      reuseExistingServer: !isCI,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      name: 'BugBoard26 Frontend',

      // Avvia Vite sulla porta esatta prevista dai test.
      command: [
        'npm run dev --',
        '--host 127.0.0.1',
        '--port 5173',
        '--strictPort',
      ].join(' '),

      url: 'http://127.0.0.1:5173',

      timeout: 120_000,
      reuseExistingServer: !isCI,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
