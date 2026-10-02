# Demo verification

The rejected green/photo-free design and its screenshots have been superseded. The current design brief is SCHOOL-DESIGN-BRIEF.md; implementation and evaluation use the requested blue-and-gold photographic school direction.

## Functional checks

`npm run check` validates all shipped JavaScript and the Node backend. `npm test` drives browser-local public pages and all six role portals through real Chromium controls. `npm run test:backend` starts an isolated Node server and verifies API behavior and browser-to-server workflows. Set `DEMO_BASE_URL` to an existing deployment to run the same backend suite against that live service.

After the photographic school refinement, syntax, public/portal workflow and access suites, the backend suite and `npm run test:school` all passed. The school-specific check verifies category filters, photo enlargement, keyboard Escape and focus return, WhatsApp visit routing and the saved enquiry in the administrator office view. Public route tests verify local school photos actually load. Independent implementation browser checks passed all eight public pages plus the portal at 320, 375, 760, 1024 and 1440px.

Independent design evaluation passed after a second browser review. The reviewer verified the 52px mobile WhatsApp button, 3.25:1 control-border contrast and responsive calendar photo crop; no required revisions remain. Report: school-evaluation.md. Desktop/mobile screenshots are school-home-viewport.png and school-mobile-viewport.png, with full-page and additional route captures alongside them. A different-provider evaluator was unavailable; the review used a separate session of the available model.

The suites cover:

- Public navigation, mobile menu, metadata, publication, calendar and enquiries.
- Six role dashboards, role-specific navigation, permissions, campus and linked-family scope.
- Grade review, transfer, unmatched learner resolution, class matching, intentional failure, retry and duplicate prevention.
- Assessment and assignment edits, staff leave requests, HR approval and decline.
- Employment summaries, payroll status, published payslips and populated document downloads.
- Parent child switching, scoped fees, learning resources and student own records.
- Visitor isolation, reset, guided walkthrough, keyboard Escape and storage/network recovery.
- Server input validation, CSRF, cross-origin denial, revoked permissions and private source exclusion.

## Hosting

Render live URL: https://bright-future-school-demo.onrender.com. Health returned HTTP 200 with `status: ok` and `mode: temporary-demo` on 2 October 2026. The service was initially deployed from render-backend; the revised Blueprint targets main with automatic commit deployment. GitHub source and deployment settings must both track main.

The full backend suite also passed against that live Render URL, including HTTP permission and CSRF denial, independent visitor isolation, grade transfers/retry/duplicates, real browser enquiries, leave approval, payslip downloads, mobile parent selection and failed-loading recovery. This run verified the backend before the new public design was deployed; the final design requires its own post-deployment check.

## Boundaries

This is a fictional, temporary-per-visitor demo. Selectable personas demonstrate permissions and are not production authentication. Stock photographs are placeholders. Google Classroom/SIS transport, real email, actual WhatsApp delivery, payroll payments and analytics remain inactive. Production requirements are in README.md and SECURITY.md.
