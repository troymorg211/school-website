# Render backend handover

Live backend: https://bright-future-school-demo.onrender.com. Its `/api/health` returned HTTP 200 and `{"status":"ok","mode":"temporary-demo"}` on 2 October 2026. All implementation is on `main`. The existing service was initially deployed from `render-backend`; its deployment branch must be changed to `main` in Render settings for future commits. Render management tools are not exposed in this session.

## Deploy

1. Push the committed files to the GitHub repository used by Render.
2. Open [Deploy to Render](https://render.com/deploy?repo=https://github.com/troymorg211/school-website), sign in, connect the repository if requested, and review the Blueprint from `main`.
3. Deploy the free Node web service. It builds with `npm ci --omit=dev`, starts with `npm start`, and checks `/api/health`. The Blueprint supplies `DEMO_BACKEND=server`, `NODE_ENV=production` and Node 24.15.0. No real integration credentials are required.
4. Open the actual service URL Render supplies. Verify `/api/health` returns `status: ok`, the public banner says Server sandbox demo, and the portal information panel explains temporary server storage.
5. Follow the four-step guided demo, transfer/retry grades, submit and approve leave, publish a public notice, download a payslip and reset. Open a separate browser profile to verify visitor isolation.
6. Replace example.org sitemap URLs with this service's actual public hostname before outreach. Analytics remains inactive. Never enter real school records.

For a service created manually choose New > Web Service, connect the repository on `main`, use the commands above, choose Free, set the listed environment values and set health check `/api/health`. For an existing service, change its deployment branch to `main` before triggering the next deployment. Keep a single instance: temporary sessions live only in this process's memory. The Blueprint enables automatic deployment of commits to `main`; each deployment resets sample sessions.

## Temporary data

Each browser receives an unpredictable HttpOnly, SameSite cookie (Secure in production). Its sandbox expires after two hours of inactivity. Restarting/redeploying the service resets every in-memory sandbox. The free service can spin down while idle; the next cold start may take time and reset sample changes. No persistent school database is created. This is the user's selected temporary-per-visitor design.

Public pages fetch only published public content. Portal reads are scoped to the selected demo persona. The server validates mutation requests, editing and approval authority, campus/class/linked-family scopes, payroll clearance, current grade reviews and transfer keys. Requests use CSRF tokens and bounded JSON bodies. Reset affects only the current sandbox. Cookies must be enabled for server mode; network failures receive retry feedback without silently switching storage modes.

Selectable demo personas are not real authentication. A visitor may deliberately choose Administrator to inspect their own fictional sandbox. Production use still requires actual identity, durable storage, authenticated server sessions, school-approved policy and real integration credentials. Classroom, SIS transport, emails, payroll payment and analytics remain simulated or inactive.

## Verification

`npm run check` validates syntax. `npm test` checks browser-local mode against a running `npm start` server. `npm run test:school` checks the gallery and WhatsApp enquiry journey. `npm run test:backend` starts its own backend server, checks HTTP permission denial and isolation, and drives real Chromium pages through the API. The backend suite also passed against the actual Render URL using `DEMO_BASE_URL=https://bright-future-school-demo.onrender.com`. After switching the service to main, verify the redesigned public site has deployed at that URL.

Configuration references: [Render Node deployment](https://render.com/docs/deploy-node-express-app), [Blueprint fields](https://render.com/docs/blueprint-spec), [Deploy shortcut](https://render.com/docs/deploy-to-render), [port binding](https://render.com/docs/web-services#port-binding), and [free-service limitations](https://render.com/docs/free).
