const crypto = require("node:crypto");
const seed = require("../js/demo-store.js");
const grades = require("../js/integrations.js");
const sessions = new Map();
const TTL = 2 * 60 * 60 * 1000;
const roles = ["admin", "teacher", "staff", "hr", "parent", "student"];
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fail = (status, message) => {
  throw new ApiError(status, message);
};
function text(value, label, max = 1400) {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    fail(400, `${label} is required and must be at most ${max} characters.`);
  return value.trim();
}
function date(value, label) {
  const v = text(value, label, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(v) ||
    Number.isNaN(Date.parse(v)) ||
    new Date(v).toISOString().slice(0, 10) !== v
  )
    fail(400, `${label} must be a valid date.`);
  return v;
}
function number(value, label, max) {
  if (
    value === "" ||
    value == null ||
    !["number", "string"].includes(typeof value) ||
    !Number.isFinite(Number(value)) ||
    Number(value) < 0 ||
    Number(value) > max
  )
    fail(400, `${label} must be between 0 and ${max}.`);
  return Number(value);
}
function choice(value, choices, label) {
  if (!choices.includes(value)) fail(400, `Invalid ${label}.`);
  return value;
}
function list(value, allowed, label) {
  if (
    !Array.isArray(value) ||
    value.length > allowed.length ||
    value.some((v) => !allowed.includes(v))
  )
    fail(400, `Invalid ${label}.`);
  return [...new Set(value)];
}
const timestamp = () =>
  new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" });
function sessionFor(req, res) {
  const match = /(?:^|;\s*)school_demo=([a-f0-9]{64})(?:;|$)/.exec(
    req.headers.cookie || "",
  );
  let id = match?.[1],
    s = id && sessions.get(id);
  if (!s || s.expires < Date.now()) {
    for (const [key, value] of sessions)
      if (value.expires < Date.now()) sessions.delete(key);
    if (sessions.size >= 200)
      fail(503, "The demonstration is busy. Please try again shortly.");
    id = crypto.randomBytes(32).toString("hex");
    s = {
      data: seed(),
      roleId: "admin",
      csrfToken: crypto.randomBytes(32).toString("hex"),
      expires: Date.now() + TTL,
      review: null,
      window: Date.now(),
      writes: 0,
    };
    sessions.set(id, s);
  }
  s.expires = Date.now() + TTL;
  const secure =
    process.env.RENDER || process.env.NODE_ENV === "production"
      ? "; Secure"
      : "";
  res.setHeader(
    "Set-Cookie",
    `school_demo=${id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=7200${secure}`,
  );
  return s;
}
function csrf(req, s) {
  const token = req.headers["x-demo-csrf"];
  if (
    typeof token !== "string" ||
    !/^[a-f0-9]{64}$/.test(token) ||
    !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(s.csrfToken))
  )
    fail(403, "The demo session changed. Reload the page and try again.");
  if (req.headers["sec-fetch-site"] === "cross-site")
    fail(403, "Cross-site writes are not allowed.");
  if (req.headers.origin) {
    let origin;
    try {
      origin = new URL(req.headers.origin);
    } catch {
      fail(403, "Invalid request origin.");
    }
    if (origin.host !== req.headers.host)
      fail(403, "Cross-site writes are not allowed.");
  }
  if (Date.now() - s.window > 60000) {
    s.window = Date.now();
    s.writes = 0;
  }
  if (++s.writes > 120)
    fail(429, "Too many demo changes. Wait a minute and try again.");
}
function user(s) {
  return s.data.users.find((u) => u.id === s.roleId);
}
function guard(s, action) {
  const u = user(s);
  if (!u?.view) fail(403, "Viewing access is removed for this account.");
  if (action !== "view" && !u.edit)
    fail(403, "This account has view-only access.");
  if (action === "approve" && !u.approvals)
    fail(403, "Approval authority is required.");
  if (action === "payroll" && (!u.payroll || !["admin", "hr"].includes(u.role)))
    fail(403, "HR / payroll permission is required.");
  return u;
}
function students(s) {
  const u = user(s);
  return s.data.students.filter(
    (x) =>
      (u.campus === "All" || x.campus === u.campus) &&
      (u.role === "parent"
        ? u.children.includes(x.id)
        : u.role === "student"
          ? u.student === x.id
          : u.role === "teacher"
            ? !u.assigned || u.classes.includes(x.class)
            : u.role === "admin"),
  );
}
function classes(s) {
  return [...new Set(students(s).map((x) => x.class))];
}
function employees(s) {
  const u = user(s);
  return s.data.staff.filter(
    (x) =>
      x.id === u.id ||
      (["admin", "hr"].includes(u.role) &&
        u.payroll &&
        !u.own &&
        (u.campus === "All" || x.campus === u.campus)),
  );
}
function state(s) {
  const d = s.data,
    u = user(s),
    admin = u.role === "admin";
  const roster = d.users.map((x) =>
    x.id === u.id || (admin && u.view)
      ? structuredClone(x)
      : { id: x.id, name: x.name, role: x.role },
  );
  const empty = {
    version: 3,
    users: roster,
    students: [],
    notices: [],
    events: [],
    assignments: [],
    results: [],
    source: [],
    classMatches: [],
    transfers: [],
    staff: [],
    payroll: [],
    leave: [],
    activity: [],
    enquiries: [],
  };
  if (!u.view) return empty;
  const learners = students(s),
    ids = learners.map((x) => x.id),
    assigned = classes(s),
    staff = employees(s),
    staffIds = staff.map((x) => x.id);
  return {
    ...empty,
    students: learners.map((x) =>
      ["parent", "admin"].includes(u.role)
        ? structuredClone(x)
        : {
            id: x.id,
            name: x.name,
            class: x.class,
            campus: x.campus,
            rank: x.rank,
          },
    ),
    notices: d.notices.filter(
      (n) =>
        admin ||
        (n.published &&
          ["All", "public", u.role].includes(n.audience) &&
          (n.campus === "All" || u.campus === "All" || n.campus === u.campus)),
    ),
    events: d.events.filter(
      (n) =>
        admin ||
        (n.published &&
          (n.campus === "All" || u.campus === "All" || n.campus === u.campus)),
    ),
    assignments: d.assignments.filter((a) => assigned.includes(a.class)),
    results: d.results.filter((r) => ids.includes(r.student)),
    source: ["admin", "teacher"].includes(u.role)
      ? d.source.filter((r) => assigned.includes(r.class))
      : [],
    classMatches: ["admin", "teacher"].includes(u.role) ? d.classMatches : [],
    transfers: ["admin", "teacher"].includes(u.role)
      ? d.transfers.filter((t) => assigned.includes(t.class))
      : [],
    staff,
    payroll: d.payroll.filter(
      (p) =>
        staffIds.includes(p.staff) &&
        (p.staff !== u.id ||
          p.published ||
          (["admin", "hr"].includes(u.role) && u.payroll)),
    ),
    leave: d.leave.filter((l) => staffIds.includes(l.staff)),
    activity: admin ? d.activity : [],
    enquiries: admin ? d.enquiries : [],
  };
}
function envelope(s) {
  return {
    state: state(s),
    roleId: s.roleId,
    csrfToken: s.csrfToken,
    mode: "server",
    sessionExpiresAt: s.expires,
  };
}
function find(rows, id, label) {
  const row = rows.find((x) => String(x.id) === String(id));
  if (!row) fail(404, `${label} not found within this account's access.`);
  return row;
}
const reviewHash = (s) =>
  crypto
    .createHash("sha256")
    .update(
      JSON.stringify([
        s.roleId,
        classes(s),
        s.data.classMatches,
        s.data.source,
      ]),
    )
    .digest("hex");
function action(s, type, v) {
  if (!v || typeof v !== "object" || Array.isArray(v))
    fail(400, "Action data must be an object.");
  const u = guard(
    s,
    ["preview"].includes(type)
      ? "view"
      : ["transfer", "leave-decision"].includes(type)
        ? "approve"
        : ["staff", "payroll"].includes(type)
          ? "payroll"
          : "edit",
  );
  const d = s.data,
    actor = u.name;
  if (type === "user") {
    if (u.role !== "admin") fail(403, "Administrator access required.");
    const target = find(d.users, v.id, "Account");
    const next = {
      ...target,
      role: choice(v.role, roles, "role"),
      campus: choice(v.campus, ["All", "Main", "West"], "campus"),
      children: list(
        v.children,
        d.students.map((x) => x.id),
        "linked children",
      ),
      classes: list(
        v.classes,
        [...new Set(d.students.map((x) => x.class))],
        "classes",
      ),
    };
    for (const key of [
      "view",
      "edit",
      "own",
      "assigned",
      "approvals",
      "payroll",
    ]) {
      if (typeof v[key] !== "boolean") fail(400, `Invalid ${key} permission.`);
      next[key] = v[key];
    }
    next.student = v.student
      ? choice(
          v.student,
          d.students.map((x) => x.id),
          "student link",
        )
      : "";
    Object.assign(target, next);
    s.review = null;
  } else if (["notice", "event"].includes(type)) {
    if (u.role !== "admin") fail(403, "Administrator access required.");
    const rows = type === "notice" ? d.notices : d.events;
    const row = {
      id: v.id || crypto.randomUUID(),
      title: text(v.title, "Title", 160),
      campus: choice(v.campus, ["All", "Main", "West"], "campus"),
      published: v.published === true || v.published === "on",
    };
    if (type === "notice")
      Object.assign(row, {
        body: text(v.body, "Notice"),
        audience: choice(v.audience, ["public", "All", ...roles], "audience"),
      });
    else row.date = date(v.date, "Event date");
    if (v.id) Object.assign(find(rows, v.id, "School content"), row);
    else rows.push(row);
  } else if (type === "assignment") {
    if (u.role !== "teacher") fail(403, "Assigned teacher access required.");
    const row = {
      id: v.id || crypto.randomUUID(),
      title: text(v.title, "Task title", 160),
      subject: text(v.subject, "Subject", 80),
      due: date(v.due, "Due date"),
      class: choice(v.class, classes(s), "assigned class"),
    };
    if (v.id)
      Object.assign(
        find(
          d.assignments.filter((a) => classes(s).includes(a.class)),
          v.id,
          "Assignment",
        ),
        row,
      );
    else d.assignments.push(row);
  } else if (type === "result") {
    if (u.role !== "teacher") fail(403, "Assigned teacher access required.");
    const learner = find(students(s), v.student, "Learner");
    const assignment = text(v.assignment, "Assessment", 160),
      key = learner.id + ":manual:" + assignment.toLowerCase();
    const row = {
      key,
      student: learner.id,
      assignment,
      subject: text(v.subject, "Subject", 80),
      score: number(v.score, "Score", 100),
    };
    const old = d.results.find((r) => r.key === key);
    if (old) Object.assign(old, row);
    else d.results.push(row);
  } else if (type === "leave") {
    find(d.staff, u.id, "Employment record");
    const from = date(v.from, "First day"),
      to = date(v.to, "Last day");
    if (to < from) fail(400, "Last day must be on or after the first day.");
    d.leave.push({
      id: crypto.randomUUID(),
      staff: u.id,
      from,
      to,
      reason: text(v.reason, "Reason"),
      status: "Pending",
    });
  } else if (type === "staff") {
    const person = find(employees(s), v.id, "Employee");
    const row = {
      job: text(v.job, "Appointment", 160),
      salary: number(v.salary, "Salary", 5000000),
      campus: choice(v.campus, ["Main", "West"], "campus"),
      document: text(v.document, "Employment summary"),
    };
    Object.assign(person, row);
    const payroll = d.payroll.find((p) => p.staff === person.id);
    if (payroll) {
      payroll.gross = row.salary;
      payroll.deduction = Math.round(row.salary * 0.1);
    }
  } else if (type === "payroll") {
    find(employees(s), v.staff, "Employee");
    const p = d.payroll.find((p) => p.staff === v.staff);
    if (!p) fail(404, "Payroll record not found.");
    if (v.operation === "publish") p.published = true;
    else if (v.operation === "paid") p.status = "Paid";
    else fail(400, "Invalid payroll operation.");
  } else if (type === "leave-decision") {
    guard(s, "payroll");
    const l = find(
      d.leave.filter((x) => employees(s).some((e) => e.id === x.staff)),
      v.id,
      "Leave request",
    );
    if (l.status !== "Pending")
      fail(409, "This leave request was already reviewed.");
    l.status = choice(v.status, ["Approved", "Declined"], "leave decision");
  } else if (["preview", "transfer", "match", "class-match"].includes(type)) {
    if (!["admin", "teacher"].includes(u.role))
      fail(403, "Teacher or administrator access required.");
    if (type === "preview") s.review = reviewHash(s);
    else if (type === "class-match") {
      d.classMatches[0].school = choice(v.school, classes(s), "school class");
      s.review = null;
    } else if (type === "match") {
      const r = find(
          d.source.filter((x) => classes(s).includes(x.class)),
          v.source,
          "Source learner",
        ),
        learner = find(students(s), v.student, "Learner");
      if (learner.class !== r.class || r.status === "Transferred")
        fail(400, "Choose an untransferred learner in the same class.");
      r.student = learner.id;
      r.status = "Ready";
      s.review = null;
    } else {
      if (s.review !== reviewHash(s))
        fail(
          409,
          "Preview the current matches and grades before transferring.",
        );
      grades.transfer(
        d,
        d.source.filter((x) => classes(s).includes(x.class)),
        v.retry === true,
      );
      s.review = reviewHash(s);
    }
  } else fail(400, "Unknown demonstration action.");
  for (const [key, limit] of Object.entries({
    notices: 100,
    events: 100,
    assignments: 200,
    results: 300,
    leave: 100,
  })) {
    if (d[key].length > limit)
      fail(
        429,
        "This sample collection is full. Reset the demo before adding more records.",
      );
  }
  d.transfers = d.transfers.slice(0, 200);
  d.activity.unshift({
    date: timestamp(),
    actor,
    description: `${type} updated through the demo API.`,
  });
  d.activity = d.activity.slice(0, 200);
}
function publicState(s) {
  return {
    notices: s.data.notices.filter(
      (n) => n.published && n.audience === "public",
    ),
    events: s.data.events.filter((e) => e.published),
    csrfToken: s.csrfToken,
    mode: "server",
  };
}
function handle(req, res, pathname, body) {
  if (pathname === "/api/health" && req.method === "GET")
    return { status: "ok", mode: "temporary-demo" };
  const s = sessionFor(req, res);
  if (req.method === "GET" && pathname === "/api/public") return publicState(s);
  if (req.method === "GET" && pathname === "/api/state") return envelope(s);
  if (req.method !== "POST") fail(404, "API route not found.");
  csrf(req, s);
  if (pathname === "/api/role") {
    find(s.data.users, body.id, "Demo account");
    s.roleId = body.id;
    s.review = null;
    return envelope(s);
  }
  if (pathname === "/api/reset") {
    s.data = seed();
    s.roleId = "admin";
    s.review = null;
    return envelope(s);
  }
  if (pathname === "/api/enquiry") {
    const q = {
      id: crypto.randomUUID(),
      name: text(body.name, "Sample name", 70),
      message: text(body.message, "Enquiry", 1000),
      date: new Date().toISOString(),
    };
    for (const key of ["type", "stage", "campus"])
      if (body[key] != null) q[key] = text(body[key], key, 80);
    if (s.data.enquiries.length >= 100)
      fail(429, "Reset the demo before adding more sample enquiries.");
    s.data.enquiries.push(q);
    return { id: q.id, csrfToken: s.csrfToken, mode: "server" };
  }
  if (pathname === "/api/action") {
    const copy = { ...s, data: structuredClone(s.data) };
    action(copy, body.type, body.data || {});
    s.data = copy.data;
    s.review = copy.review;
    return envelope(s);
  }
  fail(404, "API route not found.");
}
module.exports = { handle, ApiError };
