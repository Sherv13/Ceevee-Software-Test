# Primary Feature Under Test

## Feature
Optimize for a Job using JD URL Import.

## Why this feature
This is the product's core value path: users provide a target role and job description (or URL), then Ceevee generates an optimized resume with ATS-oriented feedback.

## Scope
In scope:
- JD URL import controls and behavior
- Optimization workflow steps
- Optimization editor outputs (keyword heatmap, diff view, markdown editing)
- ATS score breakdown categories
- Export formats and model-tier availability
- Re-optimization quota rule (requirements-level assertion)

Out of scope:
- Full AI content quality evaluation
- Payment and billing workflows
- Pro-tier features not required by this core path

## Test Design
### Public requirements validation (always runnable)
These tests assert that documented requirements are present and explicit on /docs:
- JD URL Import section and behavior
- Optimization editor outputs
- Re-optimization quota rule
- ATS scoring categories
- Export formats
- AI model-tier availability
- Step-by-step optimization flow

Purpose: keep product intent and critical acceptance criteria visible and testable without credentials.

## Risk Coverage Matrix
- Functional risk: wrong/missing JD import behavior in documented flow
- Process risk: optimization workflow steps documented incorrectly
- Analytics risk: ATS/keyword guidance unclear or missing in docs
- Output risk: export/model options not documented for users
- Business rule risk: re-optimize quota behavior not communicated

## Exit Criteria
- All public requirements tests pass
- No high-severity failures in core optimization path
