import { defineConfig, devices } from "@playwright/test";

// Override with E2E_PORT if this port is taken on your machine.
const PORT = Number(process.env.E2E_PORT ?? 3291);

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Runs against the production build: `npm run build` first.
  webServer: { command: `npm run start -- -p ${PORT}`, url: `http://localhost:${PORT}`, reuseExistingServer: false },
});
