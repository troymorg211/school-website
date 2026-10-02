# Bright Future Academy reusable school demo

A fictional Kenyan school website and six-role portal. Every person, record, address and metric is sample data. No real authentication, email delivery, Google connection, payroll payment or analytics is active.

## Preview

Install Node.js, then run:

```sh
npm install
npm start
```

Open http://localhost:8000. Choose **Explore the portal**, then use the demo account selector. No registration or password is needed. For browser verification run `npx playwright install chromium`, `npm run check`, and `npm test` while the preview server is running.

To preview the Render backend locally instead, run `npm run start:backend` (stop the other server first). Run `npm run test:backend` to start an isolated temporary server and verify API permissions, session isolation and browser-to-backend workflows automatically.

## Render backend

`render.yaml` defines a Node web service that serves both the public website and its same-origin backend. The backend has no production package dependencies. Build: `npm ci --omit=dev`. Start: `npm start`. Health check: `/api/health`. The service listens on Render's `PORT` at `0.0.0.0`; `DEMO_BACKEND=server` enables server mode. No external API keys are needed for this fictional demo.

[Deploy this repository to Render](https://render.com/deploy?repo=https://github.com/troymorg211/school-website/tree/render-backend)

Connect the repository in your Render account and review the free web-service Blueprint before deployment. Automatic deployment is disabled in the reusable Blueprint; deploy later commits manually or enable automatic deployments in your own service settings. See [docs/RENDER.md](docs/RENDER.md) for deployment and verification. Render is not claimed live until an actual service URL is created and checked.

## Demonstrate

1. Administrator: change sample access and assignments, publish a notice or calendar entry, inspect activity and labelled sample reports.
2. Teacher: inspect assigned classes, manage assessments, review mocked Classroom grades and transfer them into sample SIS results. Resolve unmatched rows, retry failures and repeat a transfer to see duplicate prevention.
3. Staff and HR/payroll: request leave as staff, approve it as HR, then return to staff. Publish a sample payslip and download it from the employee view.
4. Parent: switch linked children, view fee statements, payments and progress, and download revision papers. Student sees only their own learning records.

Use the guided demo for the short outreach walkthrough. Reset restores the initial data for this browser.

## Persistence and boundaries

In browser-local mode, changes are stored in localStorage. In Render/server mode, an HttpOnly cookie identifies each visitor's temporary in-memory sandbox; changes expire after two hours of inactivity or a service restart. No database or persistent disk is used. People sharing one browser profile share its sandbox; reset between presentations. Separate visitors cannot alter each other's state. This is demonstration role switching, not production authentication. Browser users can inspect the fictional seed data and deliberately choose any sample role, so never put real student, family, employee, credential or payroll data into this implementation.

Public pages only display published public notices and events. Portal controls model own-record, family, class, campus, edit, approval and payroll scopes. The Render backend also checks scopes and permissions on server reads and writes, validates inputs and uses CSRF protection. Direct API calls cannot edit records outside the selected persona's permissions. The persona itself remains deliberately selectable. Documents are populated, printable HTML downloads labelled sample data. HR can edit employment summaries, publish payslips and mark sample payroll paid; these actions never initiate payments.

`js/integrations.js` contains the mock transfer adapter separately from portal rendering. In server mode the backend invokes it only after checking scope, approval authority and a current review. The server owns transfer results and stable source keys prevent duplicate grades; browser-supplied marks are not accepted as Classroom grades. Replace the mock source with a real authorised integration only after confirming the SIS API and Google Workspace permissions.

## Static hosting

Upload the HTML files, css/ and js/ folders, robots.txt and sitemap.xml to any static host for browser-local mode. The static `js/runtime-config.js` keeps that mode active. Use the Node service on Render for server mode. Replace the reserved example.org sitemap hostname with your deployment domain and add its absolute Sitemap URL to robots.txt. Verify every route and HTTPS before sharing the outreach link. No outreach is sent by this demo.

## Production requirements

Add authenticated server sessions, a database, server-enforced row-level permissions, audit logs, backups, monitoring, and appropriate privacy/retention controls before using real records. Replace all fictional branding and records with school-approved content and consented media. Confirm the school's SIS API, grade semantics, Workspace permissions and OAuth scopes before implementing Classroom adapters. Keep server credentials outside the browser; implement idempotent transfer keys, matching, validation, review, error recovery and durable history on the server. Payroll needs approved calculations, lawful deductions and a payment provider; the demo does not pay anyone. Enquiry delivery needs a protected server endpoint, validation, spam controls and a privacy notice.

See docs/MEASUREMENT.md for analytics and Search Console setup. Tracking is inactive and portal records must never be included in analytics.
