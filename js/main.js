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
const brand =
  '<span class="crest" aria-hidden="true">BFA</span><span class="brand-name">Bright Future<small>ACADEMY · KENYA</small></span>';
header.innerHTML = `<div class="demo-strip"><div class="container"><span>Fictional school · Working demo</span><div class="utility-links"><a href="calendar.html">School calendar</a><a href="admissions.html#enquiry">Plan a visit</a></div></div></div><div class="container header-row"><a class="brand" href="index.html" aria-label="Bright Future Academy home">${brand}</a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="public-nav">Menu</button><nav id="public-nav" aria-label="Main navigation">${navItems.map(([url, label]) => `<a href="${url}" ${currentPage === url ? 'aria-current="page"' : ""}>${label}</a>`).join("")}<a class="portal-link" href="portal.html">School portal</a></nav></div>`;
document.querySelector("[data-footer]").innerHTML =
  `<div class="container footer-grid"><div><a class="brand" href="index.html" aria-label="Bright Future Academy home">${brand}</a><p>A bright start. A future full of possibility.<br>Early years, primary and junior school.</p><p>Nairobi Main · Nakuru West</p></div><div><h3>Get to know us</h3><a href="about.html">Our school</a><a href="academics.html">Learning stages</a><a href="admissions.html">Admissions & visits</a><a href="gallery.html">Campus & school life</a><a href="portal.html">School portal</a></div><div><h3>Stay connected</h3><a href="news.html">School news</a><a href="calendar.html">Dates for your diary</a><a href="contact.html">Contact the school office</a><p>Demo contact: hello@brightfuture.example.org<br>Monday–Friday · 8:00–16:00 EAT</p><p data-storage-note>No messages are sent. Changes stay in this browser. Please use sample information only.</p></div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} Bright Future Academy · Fictional school demonstration.</span><span>Illustrative stock photography · Campus and contact details are placeholders.</span></div>`;
document.body.insertAdjacentHTML(
  "beforeend",
  `<button class="whatsapp-button" type="button" aria-label="WhatsApp enquiries" aria-controls="whatsapp-chat" aria-haspopup="dialog"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a9.8 9.8 0 0 0-8.5 14.7L2 22l5.5-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3.2.8.9-3.1-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.7s-.3-.1-.5.2l-.7.8c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.2-2.8c-.1-.2.1-.3.2-.4l.4-.5c.1-.1.2-.3.1-.5l-.7-1.6c-.1-.2-.2-.2-.4-.2H9c-.2 0-.4.1-.6.3-.2.2-.7.7-.7 1.7s.7 1.9.8 2c.1.2 1.4 2.2 3.5 3.1 2.1.9 2.1.6 2.5.6.4 0 1.4-.6 1.6-1.2.2-.6.2-1 .1-1.1l-.3-.2z"/></svg><span>WhatsApp enquiries</span></button><dialog class="chat-dialog" id="whatsapp-chat" aria-labelledby="chat-title"><div class="chat-head"><div><h2 id="chat-title">Bright Future admissions</h2><small>WhatsApp contact preview</small></div><button type="button" class="close-button" data-close aria-label="Close enquiries">×</button></div><div class="chat-body"><p>Hello! What would you like to know about Bright Future?</p><a href="admissions.html?enquiry=admissions#enquiry">I'd like to discuss admissions</a><a href="admissions.html?enquiry=visit#enquiry">I'd like to plan a school visit</a><a href="contact.html#enquiry">I have a school question</a><p class="form-note">Demo preview: choose a topic to save a sample enquiry. No live WhatsApp number is connected and nothing is sent.</p></div></dialog>`,
);
const menu = document.querySelector(".menu-toggle");
const chat = document.querySelector("#whatsapp-chat");
document
  .querySelector(".whatsapp-button")
  .addEventListener("click", () => chat.showModal());
document
  .querySelectorAll("dialog [data-close]")
  .forEach((button) =>
    button.addEventListener("click", () => button.closest("dialog").close()),
  );
document.querySelectorAll("dialog").forEach((dialog) =>
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const box = dialog.getBoundingClientRect();
      if (
        event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom
      )
        dialog.close();
    }
  }),
);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
    menu.setAttribute("aria-expanded", "false");
    document.querySelector("#public-nav").classList.remove("open");
    menu.focus();
  }
});
document.querySelectorAll("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    document
      .querySelectorAll("[data-filter]")
      .forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
    document.querySelectorAll("[data-category]").forEach((item) => {
      item.hidden =
        button.dataset.filter !== "all" &&
        item.dataset.category !== button.dataset.filter;
    });
  }),
);
const viewer = document.querySelector("#image-viewer");
document.querySelectorAll("[data-image]").forEach((button) =>
  button.addEventListener("click", () => {
    const photo = viewer.querySelector("img");
    photo.src = button.dataset.image;
    photo.alt = "Stock photograph: " + button.dataset.caption;
    viewer.querySelector("p").textContent =
      button.dataset.caption + " · Illustrative stock photograph";
    viewer.showModal();
  }),
);
const enquiryTopic = new URLSearchParams(location.search).get("enquiry");
if (enquiryTopic && document.querySelector('[name="type"]'))
  document.querySelector('[name="type"]').value =
    enquiryTopic === "visit" ? "School visit request" : "Admissions enquiry";
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
              `<article class="news-row"><div><span class="small-label">School announcement</span><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p></div><span class="campus-tag">${esc(n.campus || "All campuses")}</span></article>`,
          )
          .join("")
      : '<p class="empty-state">There are no published public notices. An administrator can publish a public sample announcement in the portal.</p>';
  });
  const events = (state?.events || [])
    .filter((e) => e.published)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  document.querySelectorAll("[data-events]").forEach((el) => {
    const limit = Number(el.dataset.limit) || events.length;
    el.innerHTML = events.length
      ? events
          .slice(0, limit)
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
  const footerText = document.querySelector("[data-storage-note]");
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
