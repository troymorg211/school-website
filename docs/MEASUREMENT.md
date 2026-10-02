# Measurement setup for a real deployment

No analytics SDK, tracking ID, Search Console verification, or tracking requests are configured in this demo. Administrator reporting figures are explicitly sample metrics.

1. The demo canonical hostname is https://bright-future-school-demo.onrender.com; sitemap.xml and robots.txt use it. For a school's own deployment replace it with the school-owned domain. Keep portal/admin excluded; production portal pages must require authentication and use noindex. Robots exclusion alone does not protect private information.
2. Create a GA4 property and web stream for that hostname. Use the actual measurement ID from the school-owned account; do not invent an ID. Load any approved analytics tag on public pages only, after the school's consent/privacy requirements are implemented.
3. Use a strict event allowlist: public page route, admission enquiry success count, and public resource identifier. Do not send form field values, email addresses, names, student IDs, marks, parent links, staff records, salaries or portal URLs containing identifiers. Exclude portal.html/admin.html entirely from analytics. Never send the local demo store to analytics.
4. Add the property in Google Search Console, verify domain ownership with the actual DNS record supplied for that property, and submit the real sitemap. Inspect public page indexing and mobile usability. Do not claim verification until it succeeds.
5. Replace sample report cards with aggregate server or analytics totals. Test events in the provider's diagnostic view and verify network payloads contain no private values before activation.

Authoritative setup references: https://support.google.com/analytics/answer/9304153 and https://support.google.com/webmasters/answer/9008080 . These are configuration references, not claims of active services.
