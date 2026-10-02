const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");
let child;
async function run() {
  if (!process.env.DEMO_BASE_URL)
    child = spawn(process.execPath, ["server.cjs", "--backend"], {
      env: { ...process.env, PORT: "0", HOST: "127.0.0.1", NODE_ENV: "test" },
      stdio: ["ignore", "pipe", "pipe"],
    });
  const base =
    process.env.DEMO_BASE_URL ||
    (await new Promise((resolve, reject) => {
      let output = "";
      const timer = setTimeout(
        () => reject(Error("Server startup timeout")),
        10000,
      );
      child.stdout.on("data", (chunk) => {
        output += chunk;
        const match = output.match(/http:\/\/localhost:\d+/);
        if (match) {
          clearTimeout(timer);
          resolve(match[0]);
        }
      });
      child.stderr.on("data", (chunk) => {
        clearTimeout(timer);
        reject(Error(chunk.toString()));
      });
      child.on("error", reject);
    }));
  function visitor() {
    let cookie = "",
      csrfToken = "";
    return {
      async request(path, data, headers = {}) {
        const response = await fetch(base + path, {
          method: data == null ? "GET" : "POST",
          headers: {
            Cookie: cookie,
            ...(data == null
              ? {}
              : {
                  "Content-Type": "application/json",
                  "X-Demo-CSRF": csrfToken,
                }),
            ...headers,
          },
          body: data == null ? undefined : JSON.stringify(data),
        });
        if (response.headers.get("set-cookie"))
          cookie = response.headers.get("set-cookie").split(";")[0];
        const body = await response.json();
        if (body.csrfToken) csrfToken = body.csrfToken;
        return { status: response.status, body };
      },
    };
  }
  const v = visitor(),
    other = visitor();
  let r = await v.request("/api/state");
  assert.equal(r.status, 200);
  assert.equal(r.body.roleId, "admin");
  assert.equal(
    (await v.request("/api/reset", {}, { "X-Demo-CSRF": "" })).status,
    403,
  );
  assert.equal(
    (await v.request("/api/reset", {}, { Origin: "https://other.example.org" }))
      .status,
    403,
  );
  const action = (type, data = {}) => v.request("/api/action", { type, data });
  const role = (id) => v.request("/api/role", { id });
  await role("parent");
  r = await v.request("/api/state");
  assert.deepEqual(
    r.body.state.students.map((x) => x.id),
    ["S001", "S002"],
  );
  assert.equal(r.body.state.staff.length, 0);
  assert.equal(r.body.state.payroll.length, 0);
  assert.equal(r.body.state.source.length, 0);
  assert.equal(
    (
      await action("result", {
        student: "S003",
        assignment: "Illegal",
        subject: "Mathematics",
        score: 100,
      })
    ).status,
    403,
  );
  await role("teacher");
  r = await v.request("/api/state");
  assert.deepEqual(
    r.body.state.students.map((x) => x.id),
    ["S001", "S003"],
  );
  assert.equal(r.body.state.students[0].fees, undefined);
  assert.equal(r.body.state.staff.length, 1);
  assert.equal(
    (await action("payroll", { staff: "staff", operation: "paid" })).status,
    403,
  );
  assert.equal(
    (
      await action("result", {
        student: "S004",
        assignment: "Illegal",
        subject: "Math",
        score: 70,
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await action("result", {
        student: "S001",
        assignment: "Invalid",
        subject: "Math",
        score: 101,
      })
    ).status,
    400,
  );
  assert.equal((await action("transfer", { retry: false })).status, 409);
  await action("preview");
  r = await action("transfer", { retry: false });
  assert.equal(r.status, 200);
  assert.equal(
    r.body.state.results.filter((x) => x.key.startsWith("classroom:")).length,
    1,
  );
  r = await action("transfer", { retry: true });
  assert.equal(
    r.body.state.results.filter((x) => x.key.startsWith("classroom:")).length,
    2,
  );
  r = await action("transfer", { retry: false });
  assert.equal(
    r.body.state.results.filter((x) => x.key.startsWith("classroom:")).length,
    2,
  );
  assert.ok(
    r.body.state.transfers.some((x) => x.outcome === "Duplicate prevented"),
  );
  await role("staff");
  r = await action("leave", {
    from: "2026-10-15",
    to: "2026-10-16",
    reason: "Sample appointment",
  });
  assert.equal(r.status, 200);
  const leaveId = r.body.state.leave[0].id;
  assert.equal(
    (await action("leave-decision", { id: leaveId, status: "Approved" }))
      .status,
    403,
  );
  await role("hr");
  r = await action("leave-decision", { id: leaveId, status: "Approved" });
  assert.equal(r.status, 200);
  await role("staff");
  r = await v.request("/api/state");
  assert.equal(r.body.state.leave[0].status, "Approved");
  assert.equal(r.body.state.staff.length, 1);
  assert.equal(r.body.state.staff[0].id, "staff");
  await role("admin");
  r = await v.request("/api/state");
  const teacher = r.body.state.users.find((x) => x.id === "teacher");
  await action("user", { ...teacher, edit: false });
  await role("teacher");
  assert.equal(
    (
      await action("assignment", {
        title: "Blocked",
        subject: "Math",
        due: "2026-10-20",
        class: "Grade 7A",
      })
    ).status,
    403,
  );
  await role("admin");
  await action("notice", {
    title: "Server notice",
    body: "Server published sample",
    audience: "public",
    campus: "All",
    published: true,
  });
  r = await v.request("/api/public");
  assert.ok(r.body.notices.some((x) => x.title === "Server notice"));
  assert.equal(r.body.users, undefined);
  assert.ok(
    !(await other.request("/api/public")).body.notices.some(
      (x) => x.title === "Server notice",
    ),
  );
  await v.request("/api/enquiry", {
    name: "Sample visitor",
    message: "Sample server enquiry",
  });
  r = await v.request("/api/state");
  assert.equal(r.body.state.enquiries.length, 1);
  assert.equal(
    (await other.request("/api/state")).body.state.enquiries.length,
    0,
  );
  await v.request("/api/reset", {});
  r = await v.request("/api/state");
  assert.equal(r.body.state.results.length, 2);
  assert.equal(r.body.state.leave.length, 0);
  assert.equal((await fetch(base + "/backend/demo.cjs")).status, 404);
  assert.equal(
    (await fetch(base + "/node_modules/playwright/package.json")).status,
    404,
  );
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base + "/portal.html");
    await page.locator("#nav button").first().waitFor();
    assert.equal(await page.evaluate(() => SchoolDemo.backend), true);
    await page.selectOption("#role", "teacher");
    await page.waitForFunction(() => SchoolDemo.roleId === "teacher");
    await page
      .locator("#nav")
      .getByRole("button", { name: "Grade transfers", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Preview proposed transfers" })
      .click();
    await page
      .getByRole("button", { name: "Approve & transfer matched grades" })
      .click();
    await page.waitForFunction(() =>
      SchoolDemo.read().source.some((r) => r.status === "Transferred"),
    );
    assert.deepEqual(errors, []);
    await page.reload();
    await page.locator("#nav button").first().waitFor();
    assert.equal(await page.evaluate(() => SchoolDemo.roleId), "teacher");
    assert.ok(
      await page.evaluate(() =>
        SchoolDemo.read().results.some((r) => r.key.startsWith("classroom:")),
      ),
    );
    await page.goto(base + "/admissions.html");
    const form = page.locator("form[data-enquiry]");
    await form.locator('[name="name"]').fill("Server sample visitor");
    await form.locator('[name="message"]').fill("Server sample enquiry");
    await form.getByRole("button", { name: "Save sample enquiry" }).click();
    await page.waitForFunction(() =>
      document
        .querySelector('[role="status"]')
        .textContent.includes("No email was sent"),
    );
    await page.goto(base + "/portal.html");
    await page.locator("#nav button").first().waitFor();
    await page.selectOption("#role", "admin");
    await page.waitForFunction(() => SchoolDemo.roleId === "admin");
    await page
      .locator("#nav")
      .getByRole("button", { name: "Reporting", exact: true })
      .click();
    assert.match(
      await page.locator("main").innerText(),
      /Server sample enquiry/,
    );
    async function changeRole(id) {
      await page.selectOption("#role", id);
      await page.waitForFunction((value) => SchoolDemo.roleId === value, id);
    }
    const section = (name) =>
      page.locator("#nav").getByRole("button", { name, exact: true }).click();
    await changeRole("staff");
    await section("My staff services");
    const leave = page.locator('form[data-form="leave"]');
    await leave.locator('[name="from"]').fill("2026-10-20");
    await leave.locator('[name="to"]').fill("2026-10-21");
    await leave.locator('[name="reason"]').fill("Server browser leave");
    await leave.getByRole("button", { name: "Submit leave request" }).click();
    await page.waitForFunction(() => SchoolDemo.read().leave.length === 1);
    await changeRole("hr");
    await section("People & payroll");
    await page.getByRole("button", { name: "Approve", exact: true }).click();
    await page.waitForFunction(
      () => SchoolDemo.read().leave[0].status === "Approved",
    );
    await page
      .locator('[data-action="publish-payslip"][data-id="teacher"]')
      .click();
    await page.waitForFunction(
      () =>
        SchoolDemo.read().payroll.find((p) => p.staff === "teacher").published,
    );
    await changeRole("teacher");
    await section("My staff services");
    const downloadEvent = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download payslip" }).click();
    assert.match((await downloadEvent).suggestedFilename(), /payslip/);
    await changeRole("parent");
    await section("Children & fees");
    await page.locator("#child").selectOption("S002");
    assert.match(await page.locator("main").innerText(), /6,000/);
    await page.setViewportSize({ width: 375, height: 812 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    assert.deepEqual(errors, []);
    const failurePage = await context.newPage();
    await failurePage.route("**/api/state", (route) => route.abort());
    await failurePage.goto(base + "/portal.html");
    await failurePage.getByRole("button", { name: "Retry loading" }).waitFor();
    assert.match(
      await failurePage.locator("main").innerText(),
      /could not be reached/,
    );
    await failurePage.unroute("**/api/state");
    await failurePage.getByRole("button", { name: "Retry loading" }).click();
    await failurePage.locator("#nav button").first().waitFor();
    assert.equal(await failurePage.evaluate(() => SchoolDemo.backend), true);
  } finally {
    await browser.close();
  }
  console.log(
    "PASS: backend session isolation, scoped reads, permission denial, CSRF, validation, review, actual grade transfer/retry/duplicates, leave approval, read-only controls, publishing, enquiries, reset, private-file exclusion and browser-to-API integration.",
  );
}
run()
  .then(() => child?.kill())
  .catch((error) => {
    console.error(error);
    child?.kill();
    process.exitCode = 1;
  });
