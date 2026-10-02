const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const base = process.env.DEMO_URL || "http://localhost:8000";
const routes = [
  "index.html",
  "about.html",
  "academics.html",
  "admissions.html",
  "gallery.html",
  "news.html",
  "calendar.html",
  "contact.html",
];

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    acceptDownloads: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await fs.mkdir("test-results", { recursive: true });
  for (const route of routes) {
    console.log("Checking public page:", route);
    const response = await page.goto(`${base}/${route}`);
    assert.equal(response.status(), 200, route);
    assert.equal(await page.locator("h1").count(), 1, `${route} has one h1`);
    assert.ok(
      await page.locator('meta[name="description"]').getAttribute("content"),
    );
    for (const href of await page
      .locator("a[href]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")))) {
      if (href.startsWith("#"))
        assert.ok(await page.locator(href).count(), `${route}: ${href}`);
      else if (!/^(https?:|mailto:|tel:)/.test(href))
        assert.equal(
          (await context.request.get(`${base}/${href}`)).status(),
          200,
          href,
        );
    }
    await page.setViewportSize({ width: 375, height: 812 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${route} mobile overflow`,
    );
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    assert.equal(
      await page.locator(".menu-toggle").getAttribute("aria-expanded"),
      "true",
    );
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  await page.goto(`${base}/index.html`);
  await page.screenshot({
    path: "test-results/public-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({
    path: "test-results/public-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/portal.html`);
  await page.evaluate(() => SchoolDemo.reset());
  const roles = ["admin", "teacher", "staff", "hr", "parent", "student"];
  const switchRole = async (role) => page.locator("#role").selectOption(role);
  const section = async (label) =>
    page
      .locator("#nav")
      .getByRole("button", { name: label, exact: true })
      .click();
  const data = async () => page.evaluate(() => SchoolDemo.read());
  for (const role of roles) {
    await page.locator("#role").selectOption(role);
    assert.ok(await page.locator("main h1").textContent());
    assert.match(await page.locator("body").textContent(), /Sample data/);
    await page.setViewportSize({ width: 375, height: 812 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${role} mobile overflow`,
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  console.log("Checking grade transfers and teaching records");
  await switchRole("teacher");
  await section("Grade transfers");
  await page
    .getByRole("button", { name: "Preview proposed transfers", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Approve & transfer matched grades",
      exact: true,
    })
    .click();
  let state = await data();
  assert.equal(
    state.results.filter((r) => r.key.startsWith("classroom:")).length,
    1,
  );
  assert.equal(state.source.find((r) => r.id === "GC102").status, "Failed");
  await page
    .getByRole("button", { name: "Retry failed items", exact: true })
    .click();
  state = await data();
  assert.equal(
    state.results.filter((r) => r.key.startsWith("classroom:")).length,
    2,
  );
  await page
    .getByRole("button", {
      name: "Approve & transfer matched grades",
      exact: true,
    })
    .click();
  assert.equal(
    (await data()).results.filter((r) => r.key.startsWith("classroom:")).length,
    2,
    "Repeat transfer does not duplicate results",
  );
  assert.ok(
    (await data()).transfers.some((t) => t.outcome.includes("Duplicate")),
  );
  const matching = page.locator('form[data-form="match"]');
  await matching.locator('[name="student"]').selectOption("S001");
  await matching.getByRole("button", { name: "Save match" }).click();
  await page
    .getByRole("button", { name: "Preview proposed transfers" })
    .click();
  await page
    .getByRole("button", { name: "Approve & transfer matched grades" })
    .click();
  assert.equal(
    (await data()).source.find((r) => r.id === "GC103").status,
    "Transferred",
  );

  await section("Classes & assessments");
  assert.ok(
    !(await page.locator("main").innerText()).includes("Neema Ali"),
    "Teacher cannot see unassigned West learner",
  );
  const assignment = page.locator('form[data-form="assignment"]');
  await assignment.locator('[name="title"]').fill("Geometry practice");
  await assignment.locator('[name="subject"]').fill("Mathematics");
  await assignment.locator('[name="due"]').fill("2026-10-15");
  await assignment.getByRole("button", { name: "Save assignment" }).click();
  assert.ok(
    (await data()).assignments.some((a) => a.title === "Geometry practice"),
  );
  const result = page.locator('form[data-form="result"]');
  await result.locator('[name="student"]').selectOption("S001");
  await result.locator('[name="assignment"]').fill("Geometry practice");
  await result.locator('[name="subject"]').fill("Mathematics");
  await result.locator('[name="score"]').fill("101");
  await result.getByRole("button", { name: "Save assessment" }).click();
  assert.match(
    await page.locator("#feedback").textContent(),
    /between 0 and 100/,
  );
  await result.locator('[name="score"]').fill("88");
  await result.getByRole("button", { name: "Save assessment" }).click();
  assert.ok(
    (await data()).results.some(
      (r) => r.assignment === "Geometry practice" && r.score === 88,
    ),
  );

  await switchRole("staff");
  console.log("Checking staff, HR, and document workflows");
  await section("My staff services");
  assert.ok(
    !(await page.locator("main").innerText()).includes("Daniel Otieno"),
    "Staff only sees own employment",
  );
  const leave = page.locator('form[data-form="leave"]');
  await leave.locator('[name="from"]').fill("2026-10-15");
  await leave.locator('[name="to"]').fill("2026-10-14");
  await leave.locator('[name="reason"]').fill("Sample family appointment");
  await leave.getByRole("button", { name: "Submit leave request" }).click();
  assert.match(await page.locator("#feedback").textContent(), /on or after/);
  await leave.locator('[name="to"]').fill("2026-10-16");
  await leave.getByRole("button", { name: "Submit leave request" }).click();
  assert.equal((await data()).leave.at(-1).status, "Pending");
  await switchRole("hr");
  await section("People & payroll");
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  assert.equal((await data()).leave.at(-1).status, "Approved");
  await page
    .locator('button[data-action="publish-payslip"][data-id="teacher"]')
    .click();
  await switchRole("teacher");
  await section("My staff services");
  const payslipEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download payslip", exact: true })
    .click();
  const payslipDownload = await payslipEvent;
  const payslipText = await fs.readFile(await payslipDownload.path(), "utf8");
  assert.match(payslipText, /Daniel Otieno/);
  assert.match(payslipText, /65000/);
  await switchRole("staff");
  await section("My staff services");
  assert.match(await page.locator("main").innerText(), /Approved/);

  await switchRole("parent");
  console.log("Checking family scoping and central permissions");
  await section("Children & fees");
  assert.equal(await page.locator("#child option").count(), 2);
  assert.match(await page.locator("main").innerText(), /17,000/);
  await page.locator("#child").selectOption("S002");
  assert.match(await page.locator("main").innerText(), /6,000/);
  const statementEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download fee statement" }).click();
  assert.match(
    await fs.readFile(await (await statementEvent).path(), "utf8"),
    /Zuri Njeri/,
  );
  await section("Learning & progress");
  const paperEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download mathematics past paper" })
    .click();
  assert.match(
    await fs.readFile(await (await paperEvent).path(), "utf8"),
    /Simplify 18\/24/,
  );
  assert.ok(
    !(await page.locator("main").innerText()).includes("Baraka Mwangi"),
    "Parent cannot view another family",
  );
  await switchRole("student");
  await section("Learning & timetable");
  assert.match(await page.locator("main").innerText(), /Amani Njeri/);
  assert.ok(!(await page.locator("main").innerText()).includes("Zuri Njeri"));
  assert.match(await page.locator("main").innerText(), /84/);

  await switchRole("admin");
  await section("Accounts & access");
  await page
    .locator('button[data-action="edit-user"][data-id="teacher"]')
    .click();
  let access = page.locator('form[data-form="user"]');
  await access.locator('[name="edit"]').uncheck();
  await access.getByRole("button", { name: "Save permissions" }).click();
  await switchRole("teacher");
  await section("Classes & assessments");
  assert.equal(
    await page.getByRole("button", { name: "Save assignment" }).count(),
    0,
    "Read-only role hides editing",
  );
  await switchRole("admin");
  await section("Accounts & access");
  await page
    .locator('button[data-action="edit-user"][data-id="parent"]')
    .click();
  access = page.locator('form[data-form="user"]');
  await access.locator('[name="children"]').selectOption(["S002"]);
  await access.getByRole("button", { name: "Save permissions" }).click();
  await switchRole("parent");
  await section("Children & fees");
  assert.equal(await page.locator("#child option").count(), 1);
  assert.ok(!(await page.locator("main").innerText()).includes("Amani Njeri"));

  await switchRole("admin");
  await section("School publishing");
  console.log("Checking publishing, enquiries, isolation, guide and reset");
  const notice = page.locator('form[data-form="notice"]');
  await notice.locator('[name="title"]').fill("Outreach walkthrough notice");
  await notice
    .locator('[name="body"]')
    .fill("Sample published notice from this browser.");
  await notice.locator('[name="audience"]').selectOption("public");
  await notice.getByRole("button", { name: "Save notice" }).click();
  const eventForm = page.locator('form[data-form="event"]');
  await eventForm.locator('[name="title"]').fill("Sample campus visit");
  await eventForm.locator('[name="date"]').fill("2026-10-22");
  await eventForm.getByRole("button", { name: "Save event" }).click();
  await page.goto(`${base}/news.html`);
  assert.match(
    await page.locator("main").innerText(),
    /Outreach walkthrough notice/,
  );
  await page.goto(`${base}/calendar.html`);
  assert.match(await page.locator("main").innerText(), /Sample campus visit/);
  await page.goto(`${base}/admissions.html`);
  const enquiry = page.locator("form[data-enquiry]");
  await enquiry.locator('[name="name"]').fill("Sample visitor");
  await enquiry.locator('[name="message"]').fill("Sample visit enquiry");
  await enquiry.getByRole("button", { name: "Save sample enquiry" }).click();
  assert.match(
    await enquiry.locator('[role="status"]').textContent(),
    /No email was sent/,
  );
  assert.equal((await data()).enquiries.length, 1);
  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  await otherPage.goto(`${base}/portal.html`);
  assert.equal(
    await otherPage.evaluate(() => SchoolDemo.read().enquiries.length),
    0,
    "Changes isolated between visitor contexts",
  );
  await otherContext.close();
  await page.goto(`${base}/portal.html`);
  await page.getByRole("button", { name: "Guided demo" }).click();
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Next step" }).click();
  await page.getByRole("button", { name: "Finish demo" }).click();
  assert.equal(await page.locator("#guide-panel").isVisible(), false);
  await page.getByRole("button", { name: "Demo information" }).click();
  assert.match(
    await page.locator("#info-panel").innerText(),
    /No Google account/,
  );
  await switchRole("admin");
  await section("Accounts & access");
  await page.screenshot({
    path: "test-results/portal-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({
    path: "test-results/portal-mobile.png",
    fullPage: true,
  });
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset sample data" }).click();
  const reset = await data();
  assert.equal(reset.results.length, 2);
  assert.equal(reset.leave.length, 0);
  assert.equal(reset.enquiries.length, 0);
  assert.equal(reset.users.find((u) => u.id === "teacher").edit, true);
  assert.deepEqual(errors, [], "No browser JavaScript errors");
  await browser.close();
  console.log(
    "PASS: public routes, metadata, navigation, mobile menus, six roles, transfers, retries, matching, duplicate prevention, assignments, validation, leave cross-role approval, populated downloads, family scoping, permissions, publishing, enquiries, visitor isolation, guide, reset, mobile overflow and console.",
  );
}
run().catch((error) => {
  console.error(error);
  process.exit(1);
});
