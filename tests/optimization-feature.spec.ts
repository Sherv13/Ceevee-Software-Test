import { expect, test, type Page } from '@playwright/test';

const hasLiveCreds = Boolean(process.env.CVAI_EMAIL && process.env.CVAI_PASSWORD);
const jobPostUrl = process.env.CVAI_TEST_JOB_URL ?? 'https://jobs.lever.co';

async function login(page: Page) {
  await page.goto('/login');

  await page.getByLabel(/email/i).fill(process.env.CVAI_EMAIL as string);
  await page.getByLabel(/password/i).fill(process.env.CVAI_PASSWORD as string);

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', { name: /sign in|log in/i }).click(),
  ]);
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
    test.skip(!hasLiveCreds, 'Set CVAI_EMAIL and CVAI_PASSWORD to run live E2E tests.');

    test('can open New Optimization and sees JD URL import control', async ({ page }) => {
      await login(page);
      await page.goto('/dashboard');

      await page.getByRole('link', { name: /new optimization/i }).click();
      await expect(page.getByText(/import from url/i)).toBeVisible();
    });

    test('validates required fields before optimization', async ({ page }) => {
      await login(page);
      await page.goto('/dashboard');

      await page.getByRole('link', { name: /new optimization/i }).click();
      await page.getByRole('button', { name: /^optimize$/i }).click();

      await expect(page.getByText(/target role|required/i)).toBeVisible();
    });

    test('imports job description from URL and starts optimization', async ({ page }) => {
      await login(page);
      await page.goto('/dashboard');

      await page.getByRole('link', { name: /new optimization/i }).click();
      await page.getByLabel(/target role/i).fill('Software Tester Intern');

      await page.getByRole('button', { name: /import from url/i }).click();
      await page.getByLabel(/url|job url|job posting url/i).fill(jobPostUrl);
      await page.getByRole('button', { name: /import|fetch/i }).click();

      await expect(page.getByLabel(/job description/i)).not.toBeEmpty();

      await page.getByRole('button', { name: /^optimize$/i }).click();
      await expect(page).toHaveURL(/optimi|editor|resume/i);
    });

    test('exposes AI model selection in optimization form before submit', async ({ page }) => {
      await login(page);
      await page.goto('/dashboard');

      await page.getByRole('link', { name: /new optimization/i }).click();
      await expect(page.getByLabel(/ai model|model/i)).toBeVisible();
    });

    test('shows post-optimization analytics surfaces in editor', async ({ page }) => {
      await login(page);

      // The account must already have at least one optimization to make this stable.
      await page.goto('/dashboard');
      await page.getByRole('link', { name: /optimization|resume/i }).first().click();

      await expect(page.getByText(/ats score|score/i)).toBeVisible();
      await expect(page.getByText(/matched keywords/i)).toBeVisible();
      await expect(page.getByText(/missing keywords/i)).toBeVisible();
    });
  });
});
