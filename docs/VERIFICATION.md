# Verification and delivery gate

Verified 2 October 2026. `npm run check` and `npm test` pass. Browser tests use real Chromium pages and controls, not mocked UI functions. An independent same-model design review passed; a different-provider evaluator was unavailable in this environment.

## Functional evidence

- PASS: eight public routes, meaningful metadata, working links and mobile menu.
- PASS: six role dashboards and every portal navigation section; no browser JavaScript errors.
- PASS: transfer updates SIS results; retry recovers the intentionally failed item; repeating the transfer preserves result count and records duplicate prevention.
- PASS: missing learner matching, changed class mapping invalidates review, wrong class mapping cannot transfer grades, assignment creation/editing and assessment validation/save.
- PASS: staff leave request, HR approval, staff receiving the approved status; decline path verified too.
- PASS: payslip publication, payroll payment-status tracking, staff record editing and saved employment summary reflected in employee download.
- PASS: populated fee statement, past paper, payslip, employment summary, progress report, revision guide and prospectus downloads.
- PASS: parent linked-child switch, other-family exclusion and student own-record scope.
- PASS: changed permissions, revoked viewing, campus and approval restrictions, payroll navigation removal and changed student role/link.
- PASS: public publishing, calendar updates, notice drafts excluded, local enquiries and separate browser-context isolation.
- PASS: reset restores initial results, users, leave and enquiries; guide next/previous/finish, information panel and Escape work.
- PASS: blocked browser storage retains changes in memory and explains page-session duration; delayed script loading shows an actual loading message.
- PASS: 320, 375, 768, 1024 and 1440px independent layout review; no page overflow. Wide tables scroll inside their containers.
- PASS: computed text contrast checked on rendered public and portal screens; keyboard focus and Escape verified.
- PASS: local preview response headers include CSP, nosniff, referrer and permissions policies; workflows also pass with those headers enabled.

Evidence is in tests/workflows.cjs, tests/access.cjs and the independent evaluation report. Desktop/mobile screenshots are generated in test-results/ when tests run; review screenshots are in docs/. All sample figures, persons and records are explicitly fictional. No live provider requests or credentials are configured.

## Anti-slop hard gate

- R-02 PASS: source scan finds no em dashes in shipped UI text.
- R-03 PASS: browser layout checks find no document overflow at the tested widths.
- R-17 PASS: reporting numbers explicitly say illustrative sample metrics; financial and school records are sample data.
- R-18 PASS: no testimonials or invented customer endorsements are present.
- R-23 PASS: fictional branding and records are authorised by the brief; no third-party photos, avatars or unverifiable logos are used.
- R-24 PASS: all public local links return HTTP 200 and all portal sections are reachable.
- R-25 PASS: rendered text contrast review passes; core palette ratios include ink/ivory 12.11:1, green/white 11.67:1 and dark/gold 5.38:1.
- R-26 PASS: controls have actions; saved browser workflow checks cover navigation, forms, edits, publication, documents, approvals, transfer/retry, guide and reset.
- R-27 PASS: initial script loading, scoped empty states, invalid scores/dates, failed transfer, temporary-storage notice and success feedback are exercised.
- R-28 PASS: no generic filler FAQ is present.
- R-32 PASS: visible focus rules, labelled fields, semantic headings/navigation, keyboard interaction and Escape are verified.
- R-33 PASS: features are written in source files; formatting only uses a formatter.
- R-34 PASS: the school prospectus has an intentional light theme and no broken theme toggle.
- R-35 PASS: the app runs locally and syntax plus browser workflow checks pass.
- R-36 PASS: no fabricated compliance, live-connection, performance or customer claims appear.
- R-37 PASS: brief and DESIGN.md declare school audience, prospectus direction and ENERGY 2 / RHYTHM 2 / MOTION 1.
- R-38 PASS: fictional sample content is requested by the user and visibly labelled; no concealed fabricated testimony or activity is used.

## Purpose gate

- R-01 PASS: no decorative gradients or glows; green separates navigation and gold marks primary actions.
- R-04 PASS: text labels convey tasks; no generic AI icons or decorative emoji.
- R-06 PASS: Georgia prospectus headings and system sans table text have written readability/identity reasons.
- R-07 PASS: no decorative background grids or dot patterns.
- R-08 PASS: no decorative arrows distributed across controls.
- R-09 PASS: demo labels convey the actual sample-data state, without decorative pill badges.
- R-10 PASS: no glassmorphism.
- R-12 PASS: restrained feedback-message shadow marks its temporary overlay elevation.
- R-13 PASS: no glow treatments.
- R-14 PASS: panels group specific tasks; curriculum and news use editorial rows instead of an interchangeable feature-card grid.
- R-19 PASS: no looping or template entrance animations; reduced-motion handling is present on public pages.
- R-22 PASS: no generic illustration assets.

## Liveliness and craftsmanship gate

- Dials PASS: ENERGY 2 / RHYTHM 2 / MOTION 1 declared before implementation and maintained.
- Focal point PASS: public headings lead admissions; each portal page leads with the current school task.
- Whitespace PASS: section spacing separates curriculum, notices and portal entry; forms group related records.
- Accent PASS: gold is reserved for primary actions with legible dark text.
- Identity PASS: repeated editorial Georgia headings, forest green navigation and paper surfaces carry the school identity.
- Design read PASS: school prospectus and task-focused portals were declared before generation.
- C-1 PASS: major choices have written reasons in DESIGN.md.
- C-2 PASS: authorised actions perform real changes to demo state or produce populated downloads.
- C-3 PASS: public sections and role-specific navigation follow the school brief's tasks.
- C-4 PASS: tested desktop/mobile, keyboard, empty, validation, failure, loading and blocked-storage states hold up.
- C-5 PASS: facts are labelled sample data; no unsupported testimonials or production claims.
- R-05 PASS: public editorial layouts vary with content; portal tables support record comparison.
- R-11 PASS: controlled small input/button radii and flat page sections, without universal pills.
- R-15 PASS: calls to action identify admissions, portal roles, school records or documents; the requested Explore the portal label is retained.
- R-16 PASS: no AI marketing buzzwords in UI copy.
- R-20 PASS: school editorial identity is coherent across public and portal screens, confirmed by independent review.
- R-21 PASS: light paper theme is intentionally tied to the school prospectus and printable records.
- R-29 PASS: green/ivory palette plus gold accent; status text uses restrained semantic color.
- R-30 PASS: no popular product clone or copied template identity.
- R-31 PASS: color, typography, layout, spacing, panels and asset choices have one-line reasons in DESIGN.md.

## Limits

This verification proves the fictional demo, not production authentication. Every fictional seed is inspectable and visitors can deliberately select any persona. Real Classroom/SIS connections, email, payroll payment and analytics remain inactive. Static and Render deployment instructions, actual-domain sitemap replacement, measurement setup and production requirements are in README.md, RENDER.md, MEASUREMENT.md and SECURITY.md.

## Render backend verification

- PASS: `npm run test:backend` starts a real temporary Node server and checks HTTP endpoints and Chromium integration.
- PASS: separate cookie sessions cannot read or alter one another's changes; public responses contain only published public content.
- PASS: server read scopes exclude other families, unassigned students, student fees from teacher records and other employees' payroll.
- PASS: server denies permissionless payroll changes, out-of-class assessments, read-only edits and unreviewed transfers.
- PASS: CSRF and cross-origin writes are rejected; invalid scores are rejected before mutation.
- PASS: server-owned grade transfer, retry and duplicate prevention update the authoritative state.
- PASS: server leave request/HR approval, notice publishing, enquiry storage and session reset work.
- PASS: backend and dependency source routes return 404; server mode loads scoped data through the API and survives page reload.
- PASS: backend UI submits leave, HR approves it, published teacher payslip downloads work, parent child switches work on mobile, and interrupted server loading recovers through retry.
- PASS: independent backend review confirms six roles at phone/desktop widths, public and portal failure recovery, server enquiries and scoped parent data; report is backend-evaluation.md.
- PASS: browser-local workflow and access tests still pass after adding server mode.
- PASS: Render Blueprint uses verified Node service fields, PORT binding on 0.0.0.0, health check and free plan; runtime mode is explicit.

Live Render deployment remains unverified because no authenticated Render account connection is available. The implementation and Blueprint are ready for account connection using the deployment link in RENDER.md. Temporary server data expires after two hours of inactivity or restart, as chosen by the user.
