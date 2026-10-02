# Bright Future Academy reusable school demo

A fictional Kenyan school website and six-role portal. Every person, record, address and metric is sample data. No real authentication, email delivery, Google connection, payroll payment or analytics is active.

## Preview

Install Node.js, then run:

```sh
npm install
npm start
```

Open http://localhost:8000. Choose **Explore the portal**, then use the demo account selector. No registration or password is needed. For browser verification run `npx playwright install chromium`, `npm run check`, and `npm test` while the preview server is running.

## Demonstrate

1. Administrator: change sample access and assignments, publish a notice or calendar entry, inspect activity and labelled sample reports.
2. Teacher: inspect assigned classes, manage assessments, review mocked Classroom grades and transfer them into sample SIS results. Resolve unmatched rows, retry failures and repeat a transfer to see duplicate prevention.
3. Staff and HR/payroll: request leave as staff, approve it as HR, then return to staff. Publish a sample payslip and download it from the employee view.
4. Parent: switch linked children, view fee statements, payments and progress, and download revision papers. Student sees only their own learning records.

Use the guided demo for the short outreach walkthrough. Reset restores the initial data for this browser.

## Persistence and boundaries

Changes are stored in this browser's localStorage, isolated from other visitors and devices. People sharing the same browser profile share this demo; reset between presentations. Browser storage can be cleared or unavailable. This is demonstration role switching, not production authentication. Browser users can inspect all seeded data, so never put real student, family, employee, credential or payroll data into this implementation.

Public pages only display published public notices and events. Portal controls and data filters model own-record, family, class, campus, edit, approval and payroll scopes. These client-side checks illustrate policy, not a security boundary. Documents are populated, printable HTML downloads labelled sample data. HR can edit employment summaries, publish payslips and mark sample payroll paid; these actions never initiate payments.

`js/integrations.js` contains the mock transfer adapter separately from portal rendering. It processes scoped source rows and records transfer outcomes using stable source keys to prevent duplicates; the portal checks review and approval permissions before invoking it. Replace it with an authenticated server adapter for a real school; confirm the SIS API and authorised Google Workspace permissions first.

## Static hosting

Upload the HTML files, css/ and js/ folders, robots.txt and sitemap.xml to any static host. No application server or build is needed. `server.cjs` is a local preview only. Replace the reserved example.org sitemap hostname with your deployment domain and add its absolute Sitemap URL to robots.txt. Verify every route and HTTPS before sharing the outreach link. No outreach is sent by this demo.

## Production requirements

Add authenticated server sessions, a database, server-enforced row-level permissions, audit logs, backups, monitoring, and appropriate privacy/retention controls before using real records. Replace all fictional branding and records with school-approved content and consented media. Confirm the school's SIS API, grade semantics, Workspace permissions and OAuth scopes before implementing Classroom adapters. Keep server credentials outside the browser; implement idempotent transfer keys, matching, validation, review, error recovery and durable history on the server. Payroll needs approved calculations, lawful deductions and a payment provider; the demo does not pay anyone. Enquiry delivery needs a protected server endpoint, validation, spam controls and a privacy notice.

See docs/MEASUREMENT.md for analytics and Search Console setup. Tracking is inactive and portal records must never be included in analytics.
