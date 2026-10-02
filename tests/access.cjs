const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const base = process.env.DEMO_URL || "http://localhost:8000";

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    acceptDownloads: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}/portal.html`);
  await page.evaluate(() => SchoolDemo.reset());
  const role = async (id) => page.selectOption("#role", id);
  const section = async (name) =>
    page.locator("#nav").getByRole("button", { name, exact: true }).click();
  async function edit(id, changes) {
    await role("admin");
    await section("Accounts & access");
    await page.locator(`[data-action="edit-user"][data-id="${id}"]`).click();
    const form = page.locator('form[data-form="user"]');
    for (const [key, value] of Object.entries(changes)) {
      if (typeof value === "boolean")
        await form.locator(`[name="${key}"]`).setChecked(value);
      else await form.locator(`[name="${key}"]`).selectOption(value);
    }
    await form.getByRole("button", { name: "Save permissions" }).click();
  }
  await edit("teacher", { approvals: false });
  await role("teacher");
  await section("Grade transfers");
  await page
    .getByRole("button", { name: "Preview proposed transfers" })
    .click();
  assert.equal(await page.locator('[data-action="transfer"]').count(), 0);
  assert.equal(await page.locator('[data-action="retry"]').count(), 0);
  await edit("teacher", { campus: "West" });
  await role("teacher");
  await section("Classes & assessments");
  assert.ok(!(await page.locator("main").innerText()).includes("Amani Njeri"));
  await edit("teacher", { view: false });
  await role("teacher");
  assert.match(
    await page.locator("main").innerText(),
    /Viewing access is removed/,
  );
  assert.equal(await page.locator("main table").count(), 0);
  await edit("hr", { payroll: false });
  await role("hr");
  assert.equal(
    await page
      .locator("#nav")
      .getByRole("button", { name: "People & payroll" })
      .count(),
    0,
  );
  await edit("parent", { role: "student", student: "S002" });
  await role("parent");
  await section("Learning & timetable");
  assert.match(await page.locator("main").innerText(), /Zuri Njeri/);
  assert.ok(!(await page.locator("main").innerText()).includes("Amani Njeri"));
  await page.evaluate(() => SchoolDemo.reset());
  await role("hr");
  await section("People & payroll");
  await page.locator('[data-action="edit-staff"][data-id="staff"]').click();
  const staff = page.locator('form[data-form="staff"]');
  await staff.locator('[name="job"]').fill("Library coordinator");
  await staff
    .locator('[name="document"]')
    .fill(
      "Sample appointment summary: library coordinator, Main campus, permanent appointment.",
    );
  await staff.getByRole("button", { name: "Save staff record" }).click();
  await page.locator('[data-action="mark-paid"][data-id="teacher"]').click();
  assert.equal(
    await page.evaluate(
      () => SchoolDemo.read().payroll.find((p) => p.staff === "teacher").status,
    ),
    "Paid",
  );
  await role("staff");
  await section("My staff services");
  const documentEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download employment summary" })
    .click();
  assert.match(
    await fs.readFile(await (await documentEvent).path(), "utf8"),
    /library coordinator/,
  );
  await page.getByRole("button", { name: "Demo information" }).click();
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#info-panel").isVisible(), false);
  await page.keyboard.press("Tab");
  assert.ok(
    await page.evaluate(() => document.activeElement !== document.body),
  );
  await page.evaluate(() => SchoolDemo.reset());
  await role("admin");
  await section("Grade transfers");
  await page.getByRole("button", { name: "Preview proposed transfers" }).click();
  const classMatch = page.locator('form[data-form="class-match"]');
  await classMatch.locator('[name="school"]').selectOption("Grade 4B");
  await classMatch.getByRole("button", { name: "Save class match" }).click();
  assert.equal(await page.locator('[data-action="transfer"]').count(), 0, "Changed class match requires a new review");
  await page.getByRole("button", { name: "Preview proposed transfers" }).click();
  await page.getByRole("button", { name: "Approve & transfer matched grades" }).click();
  assert.equal(await page.evaluate(() => SchoolDemo.read().results.length), 2, "Wrong class mapping cannot add SIS grades");
  assert.ok(await page.evaluate(() => SchoolDemo.read().transfers.some(t => t.outcome === "Class match missing")));
  await page.evaluate(() => SchoolDemo.reset());
  await role("teacher");
  await section("Classes & assessments");
  await page.locator('[data-action="edit-assignment"][data-id="A1"]').click();
  const assignment = page.locator('form[data-form="assignment"]');
  await assignment.locator('[name="title"]').fill("Updated fractions practice");
  await assignment.getByRole("button", { name: "Save assignment" }).click();
  assert.equal(
    await page.evaluate(
      () => SchoolDemo.read().assignments.find((a) => a.id === "A1").title,
    ),
    "Updated fractions practice",
  );
  await role("admin");
  await section("School publishing");
  await page.locator('[data-action="edit-notice"][data-id="N1"]').click();
  const notice = page.locator('form[data-form="notice"]');
  await notice.locator('[name="published"]').uncheck();
  await notice.getByRole("button", { name: "Save notice" }).click();
  await page.locator('[data-action="edit-event"][data-id="E1"]').click();
  const calendar = page.locator('form[data-form="event"]');
  await calendar.locator('[name="date"]').fill("2026-10-17");
  await calendar.getByRole("button", { name: "Save event" }).click();
  assert.equal(
    await page.evaluate(
      () => SchoolDemo.read().events.find((e) => e.id === "E1").date,
    ),
    "2026-10-17",
  );
  await page.goto(`${base}/news.html`);
  assert.ok(
    !(await page.locator("main").innerText()).includes(
      "Term 3 family conference",
    ),
    "Draft notice not public",
  );
  await page.goto(`${base}/admissions.html`);
  const prospectusEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download sample prospectus" })
    .click();
  assert.match(
    await fs.readFile(await (await prospectusEvent).path(), "utf8"),
    /Early Years/,
  );
  await page.goto(`${base}/portal.html`);
  await role("parent");
  await section("Learning & progress");
  for (const name of ["Download progress report", "Download revision guide"]) {
    const event = page.waitForEvent("download");
    await page.getByRole("button", { name, exact: true }).click();
    assert.ok(
      (await fs.readFile(await (await event).path(), "utf8")).length > 600,
    );
  }
  await page.getByRole("button", { name: "Guided demo" }).click();
  await page.getByRole("button", { name: "Next step" }).click();
  await page.getByRole("button", { name: "Previous" }).click();
  assert.equal(await page.locator("#role").inputValue(), "admin");
  await page.keyboard.press("Escape");
  await role("staff");
  await section("My staff services");
  const decline = page.locator('form[data-form="leave"]');
  await decline.locator('[name="from"]').fill("2026-10-26");
  await decline.locator('[name="to"]').fill("2026-10-27");
  await decline.locator('[name="reason"]').fill("Sample decline path");
  await decline.getByRole("button", { name: "Submit leave request" }).click();
  await role("hr");
  await section("People & payroll");
  await page.getByRole("button", { name: "Decline", exact: true }).click();
  assert.equal(
    await page.evaluate(() => SchoolDemo.read().leave.at(-1).status),
    "Declined",
  );
  await page.evaluate(() => SchoolDemo.reset());
  assert.deepEqual(errors, []);

  const temporary = await browser.newContext();
  await temporary.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Storage denied", "QuotaExceededError");
    };
  });
  const tempPage = await temporary.newPage();
  await tempPage.goto(`${base}/portal.html`);
  await tempPage.selectOption("#role", "staff");
  await tempPage
    .locator("#nav")
    .getByRole("button", { name: "My staff services" })
    .click();
  const leave = tempPage.locator('form[data-form="leave"]');
  await leave.locator('[name="from"]').fill("2026-10-19");
  await leave.locator('[name="to"]').fill("2026-10-20");
  await leave.locator('[name="reason"]').fill("Sample temporary leave");
  await leave.getByRole("button", { name: "Submit leave request" }).click();
  assert.match(
    await tempPage.locator("main").innerText(),
    /Changes last only for this page session/,
  );
  assert.equal(
    await tempPage.evaluate(() => SchoolDemo.read().leave.length),
    1,
  );
  await tempPage.selectOption("#role", "hr");
  await tempPage
    .locator("#nav")
    .getByRole("button", { name: "People & payroll" })
    .click();
  await tempPage.getByRole("button", { name: "Approve", exact: true }).click();
  assert.equal(
    await tempPage.evaluate(() => SchoolDemo.read().leave[0].status),
    "Approved",
  );
  await temporary.close();
  const loadingContext = await browser.newContext();
  const loadingPage = await loadingContext.newPage();
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await loadingPage.route("**/js/portal.js", async (route) => {
    await gate;
    await route.continue();
  });
  await loadingPage.goto(`${base}/portal.html`, { waitUntil: "commit" });
  await loadingPage
    .getByText("Loading the sample workspace. Please wait.")
    .waitFor();
  release();
  await loadingPage.locator("#nav button").first().waitFor();
  await loadingContext.close();
  await browser.close();
  console.log(
    "PASS: revoked view, campus and approval scopes, payroll navigation, changed student role/link, editable employment document, payroll status, all document types, record edits, drafts, leave decline, guide previous, keyboard/Escape, real script-loading state, and blocked-storage fallback.",
  );
}
run().catch((error) => {
  console.error(error);
  process.exit(1);
});
