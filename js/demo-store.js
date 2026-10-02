(() => {
  "use strict";
  const KEY = "bright-future-demo-v3";
  const seed = () => ({
    version: 3,
    users: [
      {
        id: "admin",
        name: "Grace Wanjiru",
        role: "admin",
        campus: "All",
        view: true,
        edit: true,
        own: false,
        assigned: false,
        approvals: true,
        payroll: true,
        children: [],
        classes: [],
      },
      {
        id: "teacher",
        name: "Daniel Otieno",
        role: "teacher",
        campus: "Main",
        view: true,
        edit: true,
        own: true,
        assigned: true,
        approvals: true,
        payroll: false,
        children: [],
        classes: ["Grade 7A"],
      },
      {
        id: "staff",
        name: "Mercy Achieng",
        role: "staff",
        campus: "Main",
        view: true,
        edit: true,
        own: true,
        assigned: false,
        approvals: false,
        payroll: false,
        children: [],
        classes: [],
      },
      {
        id: "hr",
        name: "Peter Kamau",
        role: "hr",
        campus: "All",
        view: true,
        edit: true,
        own: false,
        assigned: false,
        approvals: true,
        payroll: true,
        children: [],
        classes: [],
      },
      {
        id: "parent",
        name: "Esther Njeri",
        role: "parent",
        campus: "Main",
        view: true,
        edit: false,
        own: true,
        assigned: false,
        approvals: false,
        payroll: false,
        children: ["S001", "S002"],
        classes: [],
      },
      {
        id: "student",
        name: "Amani Njeri",
        role: "student",
        campus: "Main",
        view: true,
        edit: false,
        own: true,
        assigned: false,
        approvals: false,
        payroll: false,
        student: "S001",
        children: [],
        classes: [],
      },
    ],
    students: [
      {
        id: "S001",
        name: "Amani Njeri",
        class: "Grade 7A",
        campus: "Main",
        rank: "8 of 28  /  approved for family viewing",
        fees: 42000,
        payments: [
          { date: "2026-09-04", amount: 25000, reference: "DEMO-017" },
        ],
      },
      {
        id: "S002",
        name: "Zuri Njeri",
        class: "Grade 4B",
        campus: "Main",
        rank: "12 of 26  /  approved for family viewing",
        fees: 36000,
        payments: [
          { date: "2026-09-04", amount: 30000, reference: "DEMO-018" },
        ],
      },
      {
        id: "S003",
        name: "Baraka Mwangi",
        class: "Grade 7A",
        campus: "Main",
        rank: "5 of 28",
        fees: 42000,
        payments: [],
      },
      {
        id: "S004",
        name: "Neema Ali",
        class: "Grade 8A",
        campus: "West",
        rank: "Not published",
        fees: 44000,
        payments: [],
      },
    ],
    notices: [
      {
        id: "N1",
        title: "Term 3 family conference",
        body: "Families are invited to discuss learner progress on 16 October. Please bring your questions for the class teacher.",
        audience: "public",
        campus: "All",
        published: true,
      },
    ],
    events: [
      {
        id: "E1",
        title: "Family conference",
        date: "2026-10-16",
        campus: "Main",
        published: true,
      },
      {
        id: "E2",
        title: "Term closes",
        date: "2026-11-20",
        campus: "All",
        published: true,
      },
    ],
    assignments: [
      {
        id: "A1",
        title: "Fractions practice",
        class: "Grade 7A",
        due: "2026-10-09",
        subject: "Mathematics",
      },
      {
        id: "A2",
        title: "Reading journal",
        class: "Grade 4B",
        due: "2026-10-12",
        subject: "English",
      },
    ],
    results: [
      {
        key: "S001:baseline",
        student: "S001",
        assignment: "Term 3 baseline",
        subject: "Mathematics",
        score: 76,
      },
      {
        key: "S002:baseline",
        student: "S002",
        assignment: "Term 3 baseline",
        subject: "English",
        score: 81,
      },
    ],
    classMatches: [{ source: "Classroom Mathematics 7A", school: "Grade 7A" }],
    source: [
      {
        id: "GC101",
        external: "gc-amani",
        name: "Amani Njeri",
        student: "S001",
        class: "Grade 7A",
        assignment: "Fractions checkpoint",
        subject: "Mathematics",
        score: 84,
        status: "Ready",
      },
      {
        id: "GC102",
        external: "gc-baraka",
        name: "Baraka Mwangi",
        student: "S003",
        class: "Grade 7A",
        assignment: "Fractions checkpoint",
        subject: "Mathematics",
        score: 91,
        status: "Ready",
        failOnce: true,
      },
      {
        id: "GC103",
        external: "gc-unmatched",
        name: "Unmatched sample learner",
        student: "",
        class: "Grade 7A",
        assignment: "Fractions checkpoint",
        subject: "Mathematics",
        score: 69,
        status: "Unmatched",
      },
    ],
    transfers: [],
    staff: [
      {
        id: "teacher",
        name: "Daniel Otieno",
        job: "Mathematics teacher",
        salary: 65000,
        campus: "Main",
        document:
          "Permanent teaching appointment. Annual leave allowance: 21 working days. Teaching load: Grade 7 Mathematics.",
      },
      {
        id: "staff",
        name: "Mercy Achieng",
        job: "School librarian",
        salary: 42000,
        campus: "Main",
        document:
          "Permanent school librarian appointment. Annual leave allowance: 21 working days. Responsibilities: library services and reading programmes.",
      },
      {
        id: "hr",
        name: "Peter Kamau",
        job: "HR officer",
        salary: 72000,
        campus: "Main",
        document:
          "Permanent HR officer appointment. Annual leave allowance: 21 working days. Responsibilities: staff records and payroll administration.",
      },
    ],
    payroll: [
      {
        staff: "teacher",
        month: "2026-10",
        gross: 65000,
        deduction: 6500,
        status: "Pending",
        published: false,
      },
      {
        staff: "staff",
        month: "2026-10",
        gross: 42000,
        deduction: 4200,
        status: "Paid",
        published: true,
      },
      {
        staff: "hr",
        month: "2026-10",
        gross: 72000,
        deduction: 7200,
        status: "Pending",
        published: false,
      },
    ],
    leave: [],
    activity: [],
    enquiries: [],
  });
  if (typeof module !== "undefined" && module.exports) {
    module.exports = seed;
    return;
  }
  const backend = window.SCHOOL_BACKEND === true;
  let cache = null,
    csrfToken = null,
    roleId = null;
  const publicPage = !location.pathname.endsWith("portal.html");
  async function request(path, data) {
    let response;
    try {
      response = await fetch(path, {
        method: data === undefined ? "GET" : "POST",
        credentials: "same-origin",
        headers:
          data === undefined
            ? {}
            : {
                "Content-Type": "application/json",
                "X-Demo-CSRF": csrfToken || "",
              },
        ...(data === undefined ? {} : { body: JSON.stringify(data) }),
      });
    } catch {
      throw Error(
        "The demo server could not be reached. Check your connection and retry. Your changes have not been confirmed.",
      );
    }
    const result = await response.json();
    if (!response.ok)
      throw Error(
        result.error || "The demo server could not complete this request.",
      );
    if (result.csrfToken) csrfToken = result.csrfToken;
    if (result.state) {
      cache = result.state;
      roleId = result.roleId;
    } else if (path === "/api/public")
      cache = { notices: result.notices, events: result.events };
    return result;
  }
  async function bootstrap() {
    await request(publicPage ? "/api/public" : "/api/state");
    return cache;
  }
  async function command(path, data) {
    const result = await request(path, data);
    listeners.forEach((f) => f());
    return result;
  }
  let fallback = null;
  const listeners = [];
  function read() {
    if (backend) {
      if (!cache) throw Error("The demo server is still loading.");
      return cache;
    }
    if (fallback) return fallback;
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      return saved?.version === 3 && saved.classMatches ? saved : seed();
    } catch {
      return fallback || seed();
    }
  }
  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      fallback = data;
    }
    listeners.forEach((f) => f());
    return data;
  }
  function mutate(fn) {
    if (backend) throw Error("Server demo changes require a server action.");
    const d = read();
    fn(d);
    return save(d);
  }
  function reset() {
    if (backend) return command("/api/reset", {});
    return save(seed());
  }
  const escape = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  function download(title, body) {
    const html =
      '<!doctype html><html lang="en"><meta charset="utf-8"><title>' +
      escape(title) +
      "</title><style>body{font:16px system-ui,sans-serif;max-width:760px;margin:50px auto;line-height:1.7;padding:24px}h1{color:#1a5f7a}table{width:100%;border-collapse:collapse}td,th{padding:10px;border-bottom:1px solid #ccc;text-align:left}</style><h1>Bright Future Academy</h1><p>Fictional sample document. No legal or payment validity</p><h2>" +
      escape(title) +
      "</h2>" +
      body +
      "</html>";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".html";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function addEnquiry(fields) {
    if (!fields.name || !fields.message)
      throw Error("Complete your sample name and enquiry.");
    if (backend) return command("/api/enquiry", fields);
    return mutate((d) =>
      d.enquiries.push({
        ...fields,
        id: Date.now(),
        date: new Date().toISOString(),
      }),
    );
  }
  window.SchoolDemo = {
    backend,
    get roleId() {
      return roleId;
    },
    ready: backend ? bootstrap() : Promise.resolve(),
    retry: bootstrap,
    selectRole: (id) =>
      backend ? command("/api/role", { id }) : Promise.resolve(),
    action: (type, data) => command("/api/action", { type, data }),
    temporary: () => Boolean(fallback),
    read,
    mutate,
    reset,
    escape,
    download,
    addEnquiry,
    subscribe: (f) => listeners.push(f),
  };
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) listeners.forEach((f) => f());
  });
})();
