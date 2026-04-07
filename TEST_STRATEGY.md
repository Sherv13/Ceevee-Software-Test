# Primary Feature Under Test

## Feature
Optimize for a Job using JD URL Import.

## Why this feature
This is the product's core value path: users provide a target role and job description (or URL), then Ceevee generates an optimized resume with ATS-oriented feedback.

## Scope
In scope:
- Entry into New Optimization flow
- JD URL import controls and behavior
- Required field validations before optimize
- Transition to optimization editor
- Post-optimization outputs (ATS and keyword surfaces)
- Re-optimization quota rule (requirements-level assertion)

Out of scope:
- Full AI content quality evaluation
- Payment and billing workflows
- Pro-tier features not required by this core path

## Test Design
### Layer 1: Public requirements validation (always runnable)
These tests assert that documented requirements are present and explicit on /docs:
- JD URL Import section and behavior
- Optimization editor outputs
- Re-optimization quota rule
- ATS scoring categories
- Export formats
- AI model-tier availability
- Step-by-step optimization flow

Purpose: keep product intent and critical acceptance criteria visible and testable without credentials.

### Layer 2: Live authenticated E2E (optional)
These tests require credentials and exercise real product behavior:
- User login and dashboard access
- New Optimization form entry
- Field-level required validation
- Import from URL and optimize (QA Tester role scenario)
- ATS score and keyword feedback display
- AI model selection interface

Purpose: verify real user workflow and UI integrations.

## Risk Coverage Matrix
- Functional risk: wrong/missing JD import fields
- Validation risk: optimize allowed with incomplete input
- Navigation risk: optimize action fails to open editor
- Analytics risk: ATS/keyword feedback not shown after optimize
- Business rule risk: re-optimize quota behavior not communicated
- Authentication risk: login fails or dashboard is inaccessible
- UI flow risk: New Optimization form is missing required controls

## Exit Criteria
- All public requirements tests pass
- Live E2E tests pass in an environment with valid credentials and sufficient account data
- No high-severity failures in core optimization path
- Login and dashboard access verified
- JD URL import and optimization workflow complete end-to-end
