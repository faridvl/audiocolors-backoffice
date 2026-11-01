import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

const E2E_ENV_FILE = '.env.e2e.local';
const DEFAULT_BASE_URL = 'http://localhost:3000';

// El repo es público: las credenciales viven solo en este archivo ignorado por git.
if (existsSync(E2E_ENV_FILE)) {
  process.loadEnvFile(E2E_ENV_FILE);
}

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? DEFAULT_BASE_URL,
  },
});
