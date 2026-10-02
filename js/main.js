const navItems = [
  ["index.html", "Home"],
  ["about.html", "About"],
  ["academics.html", "Academics"],
  ["admissions.html", "Admissions"],
  ["news.html", "News"],
  ["calendar.html", "Calendar"],
  ["gallery.html", "Campus"],
  ["contact.html", "Contact"],
];
const currentPage = location.pathname.split("/").pop() || "index.html";
const header = document.querySelector("[data-header]");
header.innerHTML = `<div class="demo-strip"><div class="container">Fictional school · Sample data · Browser-local demo <a href="portal.html">Explore the portal</a></div></div><div class="container header-row"><a class="brand" href="index.html">Bright Future<span>Academy / Kenya</span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="public-nav">Menu</button><nav id="public-nav" aria-label="Main navigation">${navItems.map(([url, label]) => `<a href="${url}" ${currentPage === url ? 'aria-current="page"' : ""}>${label}</a>`).join("")}<a class="portal-link" href="portal.html">Explore the portal</a></nav></div>`;
document.querySelector("[data-footer]").innerHTML =
  `<div class="container footer-grid"><div><a class="brand" href="index.html">Bright Future<span>Academy / Kenya</span></a><p>A fictional school, with a working demonstration of connected school services.</p></div><div><a href="admissions.html">Admissions enquiries</a><a href="gallery.html">Our sample campuses</a><a href="portal.html">Explore role-based portals</a></div><div><p>Demo contact: hello@brightfuture.example.org</p><p>No messages are sent. Changes stay in this browser. Please use sample information only.</p></div></div>`;
const menu = document.querySelector(".menu-toggle");
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  document.querySelector("#public-nav").classList.toggle("open", open);
});
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function publicContent() {
  const state = window.SchoolDemo?.read();
  const notices = (state?.notices || []).filter(
    (n) => n.published && n.audience === "public",
  );
  document.querySelectorAll("[data-notices]").forEach((el) => {
    const limit = Number(el.dataset.limit) || notices.length;
    el.innerHTML = notices.length
      ? notices
          .slice(0, limit)
          .map(
            (n) =>
              `<article class="news-row"><div><span class="small-label">Published sample announcement</span><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p></div><span class="campus-tag">${esc(n.campus || "All campuses")}</span></article>`,
          )
          .join("")
      : '<p class="empty-state">There are no published public notices. An administrator can publish a public sample announcement in the portal.</p>';
  });
  const events = (state?.events || [])
    .filter((e) => e.published)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  document.querySelectorAll("[data-events]").forEach((el) => {
    el.innerHTML = events.length
      ? events
          .map(
            (e) =>
              `<article class="event-row"><time datetime="${esc(e.date)}">${esc(e.date)}</time><div><h3>${esc(e.title)}</h3><p>${esc(e.campus || "All campuses")} · Sample school event</p></div></article>`,
          )
          .join("")
      : '<p class="empty-state">No public events are published. Use the administrator calendar in the portal to add a sample event.</p>';
  });
}
function publicFailure(error) {
  document.querySelectorAll("[data-notices], [data-events]").forEach((el) => {
    el.innerHTML =
      '<p class="empty-state">' +
      esc(error.message) +
      '</p><button type="button" data-server-retry>Retry loading</button>';
  });
}
if (window.SchoolDemo?.backend) {
  document
    .querySelectorAll("[data-notices], [data-events]")
    .forEach(
      (el) =>
        (el.innerHTML = '<p role="status">Loading public sample records…</p>'),
    );
  window.SchoolDemo.ready.then(publicContent).catch(publicFailure);
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-server-retry]");
    if (!button) return;
    button.disabled = true;
    try {
      await window.SchoolDemo.retry();
      publicContent();
    } catch (error) {
      publicFailure(error);
    }
  });
  document.querySelector(".demo-strip .container").firstChild.textContent =
    "Fictional school · Sample data · Server sandbox demo ";
  const footerText = document.querySelector(
    "[data-footer] .footer-grid > div:last-child p:last-child",
  );
  footerText.textContent =
    "No messages are sent. Changes stay in your temporary server sandbox until restart or inactivity expiry. Please use sample information only.";
} else publicContent();
window.SchoolDemo?.subscribe(publicContent);
document.querySelectorAll("[data-enquiry]").forEach((form) =>
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = form.querySelector('[role="status"]');
    if (!form.reportValidity()) return;
    const fields = Object.fromEntries(new FormData(form));
    if (form.dataset.pending) return;
    form.dataset.pending = "true";
    const submit = form.querySelector('[type="submit"], button');
    submit.disabled = true;
    try {
      if (!window.SchoolDemo) throw new Error("Demo storage is unavailable");
      if (window.SchoolDemo.backend) await window.SchoolDemo.retry();
      await window.SchoolDemo.addEnquiry(fields);
      status.textContent = window.SchoolDemo.backend
        ? "Sample enquiry saved in your temporary server sandbox. No email was sent. The administrator can review it in the demo portal."
        : window.SchoolDemo.temporary()
          ? "Sample enquiry saved temporarily for this page only because browser storage is unavailable. No email was sent. Enable browser storage before trying the cross-page demonstration."
          : "Sample enquiry saved in this browser. No email was sent. The administrator can review it in the demo portal.";
      form.reset();
    } catch (error) {
      status.textContent = error.message;
    } finally {
      delete form.dataset.pending;
      submit.disabled = false;
    }
  }),
);
document
  .querySelectorAll("[data-prospectus]")
  .forEach((button) =>
    button.addEventListener("click", () =>
      window.SchoolDemo?.download(
        "Bright Future Academy sample prospectus",
        "<pre>BRIGHT FUTURE ACADEMY\nFictional school demonstration. Not a real admissions offer.\n\nSample campuses: Nairobi and Nakuru, Kenya.\nEarly Years: play, language and social learning.\nPrimary: literacy, mathematics, inquiry and creative arts.\nJunior School: applied learning, sciences and responsible digital practice.\n\nAdmissions demonstration: choose a stage, send a sample enquiry, plan a sample visit, and review a fictional offer.\nNo school fees, enrolment agreement or admission guarantee is established by this document.\n\nContact shown for demonstration: hello@brightfuture.example.org\nNo email is sent. Explore the portal to see role-based school services.</pre>",
      ),
    ),
  );
