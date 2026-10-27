import { expect, test, type Page } from "@playwright/test";

const kpi = (page: Page, label: string) => page.getByRole("group", { name: label }).locator(".text-2xl");

test("briefing offers the three decision paths and navigates", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "What decision are you validating today?" })).toBeVisible();
  for (const name of ["Select my optimal location", "Build my 5-year financial model", "Stress-test my current strategy"]) {
    await expect(page.getByRole("heading", { name })).toBeVisible();
  }
  await page.getByRole("link", { name: /Select my optimal location/ }).click();
  await expect(page).toHaveURL(/\/location/);
  await expect(page.getByRole("heading", { name: "Multi-criteria site selection" })).toBeVisible();
});

test("priority weights re-rank markets and pick the modelled site", async ({ page }) => {
  await page.goto("/location");
  const firstMarket = page.locator("tbody tr").first().locator("td").nth(1).locator("div").first();
  await expect(firstMarket).toHaveText("Hyderabad Financial District");

  await page.getByRole("slider", { name: /Cost arbitrage/ }).fill("70");
  await expect(firstMarket).toHaveText(/Coimbatore|Kochi Infopark/);

  const weights = await page.getByRole("slider").evaluateAll((els) => els.slice(-5).map((e) => Number((e as HTMLInputElement).value)));
  expect(weights.reduce((a, b) => a + b, 0)).toBe(100);

  await page.locator("tbody tr", { hasText: "Chennai OMR" }).getByRole("button", { name: "Model" }).click();
  await page.getByRole("link", { name: "5-Year TCO" }).click();
  await expect(page.getByRole("combobox", { name: "Micro-market" })).toHaveValue("chennai-omr");
});

test("per-stage seniority mix is editable", async ({ page }) => {
  await page.goto("/location");
  await page.getByRole("tab", { name: "Day 1" }).click();
  await expect(page.getByRole("slider", { name: /L7\+/ })).toHaveValue("10");
  await page.getByRole("tab", { name: "Year 5" }).click();
  await expect(page.getByRole("slider", { name: /L7\+/ })).toHaveValue("4");
});

test("financial model renders KPIs, charts and the lease crossover", async ({ page }) => {
  await page.goto("/financials");
  await expect(kpi(page, "NPV of savings")).toHaveText(/^\$\d/);
  await expect(page.locator(".recharts-bar-rectangle").first()).toBeVisible();
  await expect(page.getByText(/Crossover: month \d+|never becomes cheaper than managed/)).toBeVisible();

  await page.getByRole("spinbutton", { name: "Year-3 HC" }).fill("2000");
  await page.getByRole("spinbutton", { name: "Year-5 HC" }).fill("3000");
  await expect(page.getByText(/Crossover: month \d+/)).toBeVisible();
});

test("stress signals move the KPIs and the Monte Carlo completes", async ({ page }) => {
  await page.goto("/stress-test");
  await expect(page.getByText("P(NPV < 0)")).toBeVisible({ timeout: 20_000 });
  await page.getByText("+28% offer inflation", { exact: false }).click();
  await page.getByRole("slider", { name: /Extra wage inflation/ }).fill("6");
  await expect(page.getByRole("group", { name: "NPV savings (stressed)" })).toContainText("vs baseline");
  await expect(page.getByText("Simulating")).toBeHidden({ timeout: 20_000 });
});

test("scenario survives a shared link", async ({ page, context }) => {
  await page.goto("/financials");
  await page.getByRole("combobox", { name: "Micro-market" }).selectOption("kochi");
  await expect(page).toHaveURL(/#s=/);
  const url = page.url();
  const fresh = await context.newPage();
  await fresh.goto(url);
  await expect(fresh.getByRole("combobox", { name: "Micro-market" })).toHaveValue("kochi");
});

test("exports download a PDF memo and an Excel workbook", async ({ page }) => {
  await page.goto("/");
  const [xlsx] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Excel/ }).click()]);
  expect(xlsx.suggestedFilename()).toMatch(/\.xlsx$/);
  const [pdf] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Board memo/ }).click()]);
  expect(pdf.suggestedFilename()).toMatch(/\.pdf$/);
});

test("no horizontal scroll at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of ["/", "/location", "/financials", "/stress-test"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

test("home dashboard reacts to presets, headcount and map clicks", async ({ page }) => {
  await page.goto("/");
  const cockpit = page.locator("#cockpit");
  const title = cockpit.getByRole("heading", { level: 2 }).first();
  await expect(title).toHaveText("GenAI scale-up");

  await page.getByRole("button", { name: /VLSI design hub/ }).click();
  await expect(title).toHaveText("VLSI design hub");
  await expect(cockpit.locator("ol li").first()).toContainText("Bengaluru");

  const npv = page.getByRole("group", { name: "NPV of savings" });
  const before = await npv.innerText();
  await page.getByRole("slider", { name: "Year-5 headcount" }).fill("2000");
  await expect(title).toHaveText("Custom scenario");
  await expect(npv).not.toHaveText(before);

  await page.getByRole("button", { name: /^Kochi Infopark, rank/ }).click();
  await expect(cockpit).toContainText("Modelled at Kochi Infopark");
});
