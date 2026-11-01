import { expect, test } from '@playwright/test';

const SESSION_FILE = 'e2e/.auth/session.json';
const LOGIN_ROUTE = '/login';
const PATIENTS_ROUTE = '/pacientes';

test('inicia sesión y llega a la lista de pacientes', async ({ page, context }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) {
    throw new Error('Faltan E2E_EMAIL y E2E_PASSWORD en .env.e2e.local');
  }

  await page.goto(LOGIN_ROUTE);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(new RegExp(`${PATIENTS_ROUTE}$`));
  await context.storageState({ path: SESSION_FILE });
});
