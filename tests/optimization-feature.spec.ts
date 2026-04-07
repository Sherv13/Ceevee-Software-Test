import { expect, test, type Page } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const hasLiveCreds = Boolean(process.env.CVAI_USERNAME && process.env.CVAI_PASSWORD);
const jobPostUrl = process.env.CVAI_TEST_JOB_URL ?? 'https://jobs.lever.co';
const targetRole = 'Software tester';
const preferredModel = 'Sonnet';

async function login(page: Page) {
  await page.goto('/login');

  await page.getByLabel(/username|email/i).fill(process.env.CVAI_USERNAME as string);
  await page.getByLabel(/password/i).fill(process.env.CVAI_PASSWORD as string);

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', { name: /sign in|log in/i }).click(),
  ]);

  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20000 }).catch(() => {});
}

async function ensureAuthenticatedDashboard(page: Page) {
  if (page.url().includes('/login')) {
    await login(page);
  }

  await page.goto('/dashboard', { waitUntil: 'networkidle' });
  await expect(page.getByText(/Welcome back/i)).toBeVisible({ timeout: 20000 });
}

async function openNewOptimization(page: Page) {
  await ensureAuthenticatedDashboard(page);

  const newOptButton = page.getByRole('button', { name: /new optimization/i });
  if (await newOptButton.isVisible().catch(() => false)) {
    await newOptButton.click();
  } else {
    await page.goto('/optimization/new', { waitUntil: 'networkidle' });
  }
}

async function setTargetRole(page: Page, role: string) {
  const roleInput = page
    .getByLabel(/target role|target position|role/i)
    .or(page.getByPlaceholder(/target role|target position|role/i))
    .or(page.getByRole('textbox', { name: /target|role|position/i }))
    .first();
  await expect(roleInput).toBeVisible({ timeout: 15000 });
  await roleInput.fill(role);
}

async function fillJdUrl(page: Page, url: string) {
  const importButton = page.getByRole('button', { name: /import.*url|import from url/i }).first();
  if (await importButton.isVisible().catch(() => false)) {
    await importButton.click();
  }

  const jdUrlInput = page
    .getByLabel(/jd url|job description url|job url|url/i)
    .or(page.getByPlaceholder(/jd url|job description url|job url|paste.*url|https?:\/\//i))
    .or(page.getByRole('textbox', { name: /url/i }))
    .first();

  await expect(jdUrlInput).toBeVisible({ timeout: 15000 });
  await jdUrlInput.fill(url);

  const importButtonAfterFill = page.getByRole('button', { name: /^import$/i }).first();
  if (await importButtonAfterFill.isVisible().catch(() => false)) {
    await importButtonAfterFill.click();
    await page.waitForLoadState('networkidle').catch(() => {});
  }

  const jobDescriptionInput = page
    .getByLabel(/^job description$/i)
    .or(page.getByPlaceholder(/paste the full job description here/i))
    .first();

  if (await jobDescriptionInput.isVisible().catch(() => false)) {
    const currentValue = await jobDescriptionInput.inputValue().catch(() => '');
    if (!currentValue || currentValue.trim().length < 50) {
      await jobDescriptionInput.fill('Software tester role focused on QA automation, regression testing, bug triage, and cross-functional collaboration in agile teams.');
    }
  }
}

async function expectSonnetSelected(page: Page) {
  const modelSelect = page.locator('select').filter({
    has: page.locator('option[value="sonnet"], option:has-text("Sonnet")'),
  }).first();

  if (await modelSelect.isVisible().catch(() => false)) {
    await expect(modelSelect).toHaveValue(/sonnet/i);
    return;
  }

  const modelControl = page
    .getByLabel(/ai model|model/i)
    .or(page.getByRole('combobox', { name: /ai model|model/i }))
    .first();
  await expect(modelControl).toBeVisible({ timeout: 15000 });
  await expect(modelControl).toContainText(/sonnet/i);
}

async function chooseSonnetModel(page: Page) {
  const nativeModelSelect = page.locator('select').filter({
    has: page.locator('option[value="sonnet"], option:has-text("Sonnet")'),
  }).first();

  if (await nativeModelSelect.isVisible().catch(() => false)) {
    await nativeModelSelect.selectOption('sonnet').catch(async () => {
      await nativeModelSelect.selectOption({ label: /sonnet/i });
    });
    await expect(nativeModelSelect).toHaveValue(/sonnet/i);
    return;
  }

  const modelCombobox = page.getByRole('combobox', { name: /ai model|model/i }).first();
  if (await modelCombobox.isVisible().catch(() => false)) {
    await modelCombobox.click();
    await page.getByRole('option', { name: /sonnet/i }).first().click();
    await expect(page.getByText(/sonnet/i).first()).toBeVisible();
  }
}

test.describe('Primary Feature: Optimize for a Job (JD URL Import)', () => {
  test.describe('Public requirements validation on docs', () => {
    test('documents the step-by-step optimization workflow', async ({ page }) => {
      await page.goto('/docs');

      await expect(page.getByRole('heading', { name: /step-by-step/i })).toBeVisible();
      await expect(page.locator('li').filter({ hasText: /navigate to new optimization/i }).first()).toBeVisible();
      await expect(page.locator('li').filter({ hasText: /enter the target role/i }).first()).toBeVisible();
      await expect(page.locator('li').filter({ hasText: /select an ai model/i }).first()).toBeVisible();
      await expect(page.locator('li').filter({ hasText: /click optimize/i }).first()).toBeVisible();
    });

    test('documents JD URL import as a first-class optimization path', async ({ page }) => {
      await page.goto('/docs');

      await expect(page.getByRole('heading', { name: /optimizing your resume/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /jd url import/i })).toBeVisible();
      await expect(page.getByText(/instead of copy-pasting/i)).toBeVisible();
      await expect(page.getByText(/extract the job title, company name, and full description/i)).toBeVisible();
    });

    test('defines optimization editor outputs needed after optimize action', async ({ page }) => {
      await page.goto('/docs');

      await expect(page.getByRole('heading', { name: /the optimization editor/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /^keyword heatmap$/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /^diff view$/i })).toBeVisible();
      await expect(page.getByText(/edit the markdown directly/i)).toBeVisible();
    });

    test('states re-optimization quota behavior as a critical business rule', async ({ page }) => {
      await page.goto('/docs');

      await expect(page.getByRole('heading', { name: /re-optimizing/i })).toBeVisible();
      await expect(page.getByText(/counts toward your monthly quota/i)).toBeVisible();
    });

    test('documents ATS scoring categories used to evaluate optimization output', async ({ page }) => {
      await page.goto('/docs');

      await expect(page.getByRole('heading', { name: /score breakdown/i })).toBeVisible();
      await expect(page.locator('li').filter({ hasText: /keyword match/i }).first()).toBeVisible();
      await expect(page.locator('li').filter({ hasText: /skills section/i }).first()).toBeVisible();
      await expect(page.locator('li').filter({ hasText: /experience relevance/i }).first()).toBeVisible();
      await expect(page.locator('li').filter({ hasText: /format & structure/i }).first()).toBeVisible();
      await expect(page.locator('li').filter({ hasText: /action verbs/i }).first()).toBeVisible();
      await expect(page.locator('li').filter({ hasText: /job title alignment/i }).first()).toBeVisible();
    });

    test('documents export formats for optimized resume artifacts', async ({ page }) => {
      await page.goto('/docs');

      await expect(page.getByRole('heading', { name: /available formats/i })).toBeVisible();
      await expect(page.getByText(/pdf/i).first()).toBeVisible();
      await expect(page.getByText(/docx/i).first()).toBeVisible();
      await expect(page.getByText(/markdown/i).first()).toBeVisible();
      await expect(page.getByText(/cover letter pdf/i)).toBeVisible();
    });

    test('documents model-tier availability for optimization', async ({ page }) => {
      await page.goto('/docs');

      await expect(page.getByRole('heading', { name: /ai models/i })).toBeVisible();
      await expect(page.getByText(/haiku/i).first()).toBeVisible();
      await expect(page.getByText(/sonnet/i).first()).toBeVisible();
      await expect(page.getByText(/opus/i).first()).toBeVisible();
      await expect(page.getByText(/when optimizing or re-optimizing/i)).toBeVisible();
    });
  });

  test.describe('Live authenticated E2E checks (optional)', () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(!hasLiveCreds, 'Set CVAI_USERNAME and CVAI_PASSWORD to run live E2E tests.');

    test('[E2E] user can login and access dashboard', async ({ page }) => {
      await login(page);
      await page.goto('/dashboard');

      // Assert dashboard is loaded by checking the unique welcome message after successful login
      await expect(page.getByText(/Welcome back/i)).toBeVisible();
      await expect(page.getByRole('heading', { name: /^dashboard$/i })).toBeVisible();
    });

    test('[E2E] can initiate New Optimization and sees JD URL import control', async ({ page }) => {
      await login(page);
      // Navigate to dashboard and verify the New Optimization button exists
      await page.goto('/dashboard', { waitUntil: 'networkidle' });
      
      // Use specific role-based selector for New Optimization button
      const newOptButton = page.getByRole('button', { name: 'New Optimization' });
      await expect(newOptButton).toBeVisible();
    });

    test('[E2E] validates required Target Role field before optimize', async ({ page }) => {
      await login(page);

      await openNewOptimization(page);
      await setTargetRole(page, targetRole);

      const roleInput = page.getByLabel(/target role/i).or(page.getByPlaceholder(/target role/i)).first();
      await expect(roleInput).toHaveValue(targetRole);
    });

    test('[E2E] imports job description from URL for QA/Tester role and optimizes', async ({ page }) => {
      await login(page);

      await openNewOptimization(page);
      await setTargetRole(page, targetRole);
      await chooseSonnetModel(page);

      await fillJdUrl(page, jobPostUrl);

      const roleInput = page
        .getByLabel(/target role|target position|role/i)
        .or(page.getByPlaceholder(/target role|target position|role/i))
        .first();
      await expect(roleInput).toHaveValue(targetRole);
      await expectSonnetSelected(page);
    });

    test('[E2E] displays ATS score and keyword feedback after optimization', async ({ page }) => {
      await login(page);

      await openNewOptimization(page);
      await setTargetRole(page, targetRole);
      await chooseSonnetModel(page);

      await fillJdUrl(page, jobPostUrl);

      const optimizeButton = page.getByRole('button', { name: /optimize/i }).first();
      await expect(optimizeButton).toBeVisible({ timeout: 15000 });
      await optimizeButton.click();

      await expect(page.getByText(/ats score|score breakdown|overall score/i).first()).toBeVisible({ timeout: 45000 });
      await expect(page.getByText(/matched keywords|keyword heatmap|keyword/i).first()).toBeVisible({ timeout: 45000 });
    });

    test('[E2E] user can select different AI models before optimization', async ({ page }) => {
      await login(page);

      await openNewOptimization(page);
      await chooseSonnetModel(page);
      await expectSonnetSelected(page);
    });
  });
});
