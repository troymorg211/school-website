# Demo security boundaries

The local preview sets a restrictive Content Security Policy, nosniff, same-origin referrer policy, frame-ancestor exclusion and disabled camera/microphone/geolocation permissions. Mirror these response headers on a static deployment; server.cjs is only a local preview server. Production deployments also need HTTPS and appropriate host configuration.

All names and records are fictional. Role switching is a UI demonstration and localStorage is visible to anyone using the browser. Never insert real school records or credentials. Documents and rendered user input are escaped before inclusion in HTML. Public rendering filters published public notices separately from portal data. Analytics and third-party scripts are absent.

Role, record scope, edit, approval and payroll checks run in demo operations. A real deployment must repeat authorisation on every server request and database read/write, using the authenticated user rather than any browser-provided role. Guard sensitive document downloads server-side. Do not treat robots.txt or hidden controls as access control.

Use server audit trails, safe uploads, protected sessions, request validation, rate limits, recoverable transactions, and privacy/retention requirements approved by the school before storing real information.
