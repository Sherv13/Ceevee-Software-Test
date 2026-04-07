# Ceevee Playwright Test Suite

Primary feature tested: Optimize for a Job (JD URL Import) from https://cv-ai.work/docs.

## Included
- Automated Playwright tests: tests/optimization-feature.spec.ts
- Test strategy doc: TEST_STRATEGY.md

## Requirements
- Node.js 18+
- npm

## Quick Start
```bash
npm install
npx playwright install chromium
```

## Run
```bash
npm test
```

Optional:
```bash
npm run test:headed
npm run test:ui
npm run report
```

## Optional Live E2E
To run authenticated tests, create .env from .env.example and set:
- CVAI_BASE_URL (default: https://cv-ai.work)
- CVAI_USERNAME
- CVAI_PASSWORD
- CVAI_TEST_JOB_URL

Without credentials, live tests are auto-skipped.

## PowerShell Note
If npm.ps1 is blocked, use:
```powershell
npm.cmd test
```
