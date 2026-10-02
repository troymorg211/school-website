const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const base = process.env.DEMO_URL || "http://localhost:8000";

async function run() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 375, height: 812 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base + "/gallery.html");
    for (const category of ["learning", "spaces", "activities", "all"]) {
      await page.locator(`[data-filter="${category}"]`).click();
      const visible = await page
        .locator("[data-category]")
        .evaluateAll((items) =>
          items
            .filter((item) => !item.hidden)
            .map((item) => item.dataset.category),
        );
      assert.ok(visible.length > 0, `${category} filter contains photographs`);
      if (category !== "all")
        assert.ok(visible.every((value) => value === category));
    }
    const photo = page.locator("[data-image]").first();
    const expectedPhoto = await photo.getAttribute("data-image");
    await photo.click();
    const viewer = page.locator("#image-viewer");
    await viewer.waitFor({ state: "visible" });
    assert.equal(
      await viewer.locator("img").getAttribute("src"),
      expectedPhoto,
    );
    assert.ok((await viewer.locator("img").getAttribute("alt")).length > 0);
    await page.keyboard.press("Escape");
    await viewer.waitFor({ state: "hidden" });
    assert.equal(
      await photo.evaluate((element) => element === document.activeElement),
      true,
    );

    await page.getByRole("button", { name: "WhatsApp enquiries" }).click();
    const chat = page.locator("#whatsapp-chat");
    await chat.waitFor({ state: "visible" });
    await page.keyboard.press("Escape");
    await chat.waitFor({ state: "hidden" });
    await page.getByRole("button", { name: "WhatsApp enquiries" }).click();
    await chat
      .getByRole("link", { name: "I'd like to plan a school visit" })
      .click();
    await page.waitForURL(/\/admissions\.html\?enquiry=visit/, {
      waitUntil: "load",
    });
    const form = page.locator("form[data-enquiry]");
    assert.equal(
      await form.locator('[name="type"]').inputValue(),
      "School visit request",
    );
    await form.locator('[name="name"]').fill("Sample visit family");
    await form.locator('[name="message"]').fill("School UI visit workflow");
    await form.getByRole("button", { name: "Save sample enquiry" }).click();
    await page.waitForFunction(() =>
      document
        .querySelector('[role="status"]')
        .textContent.includes("No email was sent"),
    );
    await page.goto(base + "/portal.html");
    await page.locator("#nav button").first().waitFor();
    await page.locator("#role").selectOption("admin");
    await page.waitForFunction(
      () => !SchoolDemo.backend || SchoolDemo.roleId === "admin",
    );
    await page
      .locator("#nav")
      .getByRole("button", { name: "Reporting", exact: true })
      .click();
    assert.match(
      await page.locator("main").innerText(),
      /School UI visit workflow/,
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS: school gallery filters, enlarged photos, Escape/focus, WhatsApp visit journey and saved enquiry visible to the school office.",
    );
  } finally {
    await browser.close();
  }
}
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
