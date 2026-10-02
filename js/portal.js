(() => {
  "use strict";
  const S = window.SchoolDemo,
    e = S.escape,
    $ = (id) => document.getElementById(id);
  let uid = new URLSearchParams(location.search).get("role") || "admin",
    page = "home",
    child = "S001",
    editRecord = null,
    preview = false,
    guideStep = 0;
  const labels = {
    admin: "Administrator",
    teacher: "Teacher",
    staff: "Other staff",
    hr: "HR / payroll",
    parent: "Parent",
    student: "Student",
  };
  const user = () =>
    S.read().users.find((x) => x.id === uid) || S.read().users[0];
  const money = (n) => "KES " + Number(n).toLocaleString("en-KE");
  function feedback(message) {
    $("feedback").textContent = message;
    clearTimeout(feedback.timer);
    feedback.timer = setTimeout(() => ($("feedback").textContent = ""), 6500);
  }
  function guard(action) {
    const u = user();
    if (!u.view)
      throw Error(
        "Viewing access is removed. Ask the administrator to restore it.",
      );
    if (["edit", "approve", "payroll"].includes(action) && !u.edit)
      throw Error("This account has view-only access.");
    if (action === "approve" && !u.approvals)
      throw Error("Approval authority is required.");
    if (
      action === "payroll" &&
      (!u.payroll || !["admin", "hr"].includes(u.role))
    )
      throw Error("Payroll permission is required.");
  }
  function update(action, fn, description) {
    guard(action);
    S.mutate((d) => {
      fn(d);
      d.activity.unshift({
        date: new Date().toLocaleString("en-KE"),
        actor: user().name,
        description,
      });
    });
    feedback(description);
  }
  function visibleStudents(d) {
    const u = user();
    return d.students.filter(
      (s) =>
        (u.campus === "All" || s.campus === u.campus) &&
        (u.role === "parent"
          ? u.children.includes(s.id)
          : u.role === "student"
            ? u.student === s.id
            : u.role === "teacher"
              ? !u.assigned || u.classes.includes(s.class)
              : ["admin", "hr"].includes(u.role)),
    );
  }
  function permittedClasses() {
    const d = S.read(),
      u = user();
    return [
      ...new Set(
        d.students
          .filter(
            (s) =>
              (u.campus === "All" || u.campus === s.campus) &&
              (!u.assigned || u.classes.includes(s.class)),
          )
          .map((s) => s.class),
      ),
    ];
  }
  function table(
    head,
    rows,
    empty = "No records match your current access. The administrator can update campus, class or account permissions.",
  ) {
    return rows.length
      ? '<div class="table-wrap"><table><thead><tr>' +
          head.map((h) => '<th scope="col">' + h + "</th>").join("") +
          "</tr></thead><tbody>" +
          rows
            .map(
              (r) =>
                "<tr>" + r.map((c) => "<td>" + c + "</td>").join("") + "</tr>",
            )
            .join("") +
          "</tbody></table></div>"
      : '<p class="empty">' + e(empty) + "</p>";
  }
  const btn = (action, text, id = "", primary = false) =>
    "<button " +
    (primary ? 'class="primary" ' : "") +
    'data-action="' +
    action +
    '" data-id="' +
    e(id) +
    '">' +
    text +
    "</button>";
  const opt = (values, selected) =>
    values
      .map(
        (v) =>
          "<option " +
          (v === selected ? "selected " : "") +
          'value="' +
          e(v) +
          '">' +
          e(v) +
          "</option>",
      )
      .join("");
  const field = (name, label, value = "", type = "text") =>
    "<label>" +
    label +
    '<input name="' +
    name +
    '" type="' +
    type +
    '" value="' +
    e(value) +
    '" required></label>';
  function roleNav() {
    const r = user().role;
    return [
      ["home", "My workspace"],
      ...(r === "admin"
        ? [
            ["users", "Accounts & access"],
            ["content", "School publishing"],
            ["integration", "Grade transfers"],
            ["hr", "People & payroll"],
            ["reporting", "Reporting"],
            ["activity", "Activity history"],
          ]
        : r === "teacher"
          ? [
              ["classes", "Classes & assessments"],
              ["integration", "Grade transfers"],
              ["services", "My staff services"],
            ]
          : r === "hr"
            ? [
                ["hr", "People & payroll"],
                ["services", "My staff services"],
              ]
            : r === "staff"
              ? [["services", "My staff services"]]
              : r === "parent"
                ? [
                    ["family", "Children & fees"],
                    ["learning", "Learning & progress"],
                  ]
                : [["learning", "Learning & timetable"]]),
      ["notices", "Notices & calendar"],
    ].filter(([id]) => id !== "hr" || user().payroll);
  }
  function render() {
    const d = S.read(),
      u = user();
    $("role").innerHTML = d.users
      .map(
        (x) =>
          '<option value="' +
          x.id +
          '" ' +
          (x.id === uid ? "selected" : "") +
          ">" +
          labels[x.role] +
          "  /  " +
          e(x.name) +
          "</option>",
      )
      .join("");
    const nav = roleNav();
    if (!nav.some((x) => x[0] === page)) page = "home";
    $("nav").innerHTML = nav
      .map(
        ([id, label]) =>
          '<button data-page="' +
          id +
          '" ' +
          (page === id ? 'aria-current="page"' : "") +
          ">" +
          label +
          "</button>",
      )
      .join("");
    let html =
      "<h1>" +
      e(nav.find((x) => x[0] === page)[1]) +
      '</h1><p class="muted">' +
      e(u.name) +
      " · " +
      labels[u.role] +
      " · " +
      e(u.campus) +
      " campus access</p>";
    if (!u.view) {
      $("content").innerHTML =
        html +
        '<p class="empty">Viewing access is removed for this account. Switch to Administrator / Accounts & access to restore access.</p>';
      return;
    }
    if (page === "home") {
      const intros = {
        admin:
          "Manage the people who can access school information. Start with account permissions, then switch roles to see the change.",
        teacher:
          "Review your assigned learners and assessments. Preview the mock Classroom grades before approving a transfer.",
        hr: "Review leave requests and publish individual payslips. Payroll is visible only with explicit clearance.",
        staff:
          "Request leave and retrieve your own employment documents and published payslip.",
        parent: "Follow your linked children's progress and fees in one place.",
        student: "Check your lessons, homework and learning progress.",
      };
      html +=
        '<p class="lead">' +
        intros[u.role] +
        '</p><div class="actions">' +
        roleNav()
          .slice(1, 3)
          .map(
            ([id, label]) =>
              '<button class="primary" data-page="' +
              id +
              '">' +
              label +
              "</button>",
          )
          .join("") +
        "</div><h2>School dates ahead</h2>" +
        events(d) +
        "<h2>For your attention</h2>" +
        notices(d);
    }
    if (page === "users") {
      html +=
        "<p>Changes take effect immediately when you switch to the affected account. Scope controls restrict the records shown; editing and approval checks are also enforced on demo operations.</p>" +
        table(
          ["Sample account", "Clearance", "Scope", "Manage"],
          d.users.map((x) => [
            e(x.name) + "<br>" + labels[x.role],
            (x.view ? "View" : "No view") +
              " / " +
              (x.edit ? "Edit" : "Read only") +
              (x.approvals ? " / Approve" : ""),
            e(x.campus) +
              (x.own ? " / Own records" : "") +
              (x.assigned ? " / Assigned classes" : ""),
            btn("edit-user", "Edit access", x.id),
          ]),
        );
      if (editRecord) {
        const x = d.users.find((x) => x.id === editRecord);
        html +=
          '<form class="form" data-form="user"><h2>Access for ' +
          e(x.name) +
          '</h2><input type="hidden" name="id" value="' +
          x.id +
          '"><label>Campus<select name="campus">' +
          opt(["All", "Main", "West"], x.campus) +
          '</select></label><label>Role<select name="role">' +
          opt(Object.keys(labels), x.role) +
          "</select></label>" +
          ["view", "edit", "own", "assigned", "approvals", "payroll"]
            .map(
              (k) =>
                '<label class="check"><input type="checkbox" name="' +
                k +
                '" ' +
                (x[k] ? "checked" : "") +
                ">" +
                {
                  view: "View records",
                  edit: "Edit records",
                  own: "Own records only",
                  assigned: "Assigned class only",
                  approvals: "Approval authority",
                  payroll: "HR / payroll clearance",
                }[k] +
                "</label>",
            )
            .join("") +
          '<label>Student learner link<select name="student"><option value="">No learner linked</option>' +
          d.students
            .map(
              (s) =>
                '<option value="' +
                s.id +
                '" ' +
                (x.student === s.id ? "selected" : "") +
                ">" +
                e(s.name) +
                "</option>",
            )
            .join("") +
          '</select></label><label>Linked children<select name="children" multiple>' +
          d.students
            .map(
              (s) =>
                '<option value="' +
                s.id +
                '" ' +
                (x.children.includes(s.id) ? "selected" : "") +
                ">" +
                e(s.name) +
                "</option>",
            )
            .join("") +
          '</select></label><label>Assigned classes<select name="classes" multiple>' +
          ["Grade 7A", "Grade 4B", "Grade 8A"]
            .map(
              (c) =>
                "<option " +
                (x.classes.includes(c) ? "selected" : "") +
                ">" +
                c +
                "</option>",
            )
            .join("") +
          '</select></label><p class="muted wide">Roles are editable sample personas. Link a learner when choosing the student role. Hold Ctrl / Command to select multiple children or classes. Payroll clearance grants payroll screens to administrators and HR only.</p><button class="primary">Save permissions</button></form>';
      }
    }
    if (page === "content") {
      html +=
        contentForm(d) +
        table(
          ["Notice / audience", "Publication", "Edit"],
          d.notices.map((n) => [
            e(n.title) + "<br>" + e(n.audience) + " · " + e(n.campus),
            n.published ? "Published" : "Draft",
            btn("edit-notice", "Edit", n.id),
          ]),
        ) +
        calendarForm(d) +
        table(
          ["Event", "Date / campus", "Edit"],
          d.events.map((n) => [
            e(n.title),
            e(n.date) + " / " + e(n.campus),
            btn("edit-event", "Edit", n.id),
          ]),
        );
    }
    if (page === "notices")
      html +=
        "<h2>Announcements</h2>" + notices(d) + "<h2>Calendar</h2>" + events(d);
    if (page === "family" || page === "learning") {
      const children = visibleStudents(d);
      if (!children.some((c) => c.id === child)) child = children[0]?.id;
      const s = children.find((c) => c.id === child);
      if (!s) {
        html +=
          '<p class="empty">No learner is linked to this account. The administrator can update family links.</p>';
      } else {
        html +=
          (u.role === "parent"
            ? '<label>Choose child <select id="child">' +
              children
                .map(
                  (c) =>
                    '<option value="' +
                    c.id +
                    '" ' +
                    (c.id === child ? "selected" : "") +
                    ">" +
                    e(c.name) +
                    "  /  " +
                    e(c.class) +
                    "</option>",
                )
                .join("") +
              "</select></label>"
            : "") +
          "<h2>" +
          e(s.name) +
          " · " +
          e(s.class) +
          "</h2>";
        if (page === "family") {
          const paid = s.payments.reduce((a, p) => a + p.amount, 0);
          html +=
            '<div class="summary"><div>Term fees<strong>' +
            money(s.fees) +
            "</strong></div><div>Paid<strong>" +
            money(paid) +
            "</strong></div><div>Balance<strong>" +
            money(s.fees - paid) +
            "</strong></div></div>" +
            btn("statement", "Download fee statement", s.id, true) +
            "<h2>Payment history</h2>" +
            table(
              ["Date", "Receipt reference", "Amount"],
              s.payments.map((p) => [
                e(p.date),
                e(p.reference),
                money(p.amount),
              ]),
            );
        } else {
          html +=
            "<p>Approved class ranking: " +
            e(s.rank) +
            "</p>" +
            table(
              ["Assessment", "Subject", "Score / 100"],
              d.results
                .filter((r) => r.student === s.id)
                .map((r) => [e(r.assignment), e(r.subject), e(r.score)]),
            ) +
            btn("report", "Download progress report", s.id) +
            "<h2>Assignments</h2>" +
            table(
              ["Task", "Subject", "Due"],
              d.assignments
                .filter((a) => a.class === s.class)
                .map((a) => [e(a.title), e(a.subject), e(a.due)]),
            ) +
            "<h2>Weekly timetable</h2>" +
            table(
              ["Day", "08:30 - 09:30", "10:00 - 11:00", "11:30 - 12:30"],
              [
                ["Monday", "Mathematics", "English", "Integrated science"],
                ["Tuesday", "Kiswahili", "Social studies", "Creative arts"],
                ["Wednesday", "Mathematics", "English", "Physical education"],
                ["Thursday", "Science", "Kiswahili", "Life skills"],
                ["Friday", "English", "Mathematics", "Library"],
              ],
            ) +
            "<h2>Revision shelf</h2><p>Fictional teaching materials, available to this learner's family.</p>" +
            btn("paper", "Download mathematics past paper", s.id, true) +
            " " +
            btn("revision", "Download revision guide", s.id);
        }
      }
    }
    if (page === "classes") {
      const learners = visibleStudents(d);
      html +=
        "<p>Assigned classes: " +
        e(permittedClasses().join(", ") || "None") +
        "</p>" +
        table(
          ["Learner", "Admission number", "Class"],
          learners.map((s) => [e(s.name), e(s.id), e(s.class)]),
        ) +
        "<h2>Assignments</h2>" +
        table(
          ["Task", "Class / due", "Edit"],
          d.assignments
            .filter((a) => permittedClasses().includes(a.class))
            .map((a) => [
              e(a.title),
              e(a.class) + " / " + e(a.due),
              btn("edit-assignment", "Edit", a.id),
            ]),
        ) +
        assignmentForm(d) +
        '<h2>Record an assessment</h2><form data-form="result" class="form"><label>Learner<select name="student">' +
        learners
          .map((s) => '<option value="' + s.id + '">' + e(s.name) + "</option>")
          .join("") +
        "</select></label>" +
        field("assignment", "Assessment title") +
        field("subject", "Subject") +
        field("score", "Score out of 100", "", "number") +
        '<button class="primary">Save assessment</button></form>' +
        table(
          ["Learner", "Assessment", "Score"],
          d.results
            .filter((r) => learners.some((s) => s.id === r.student))
            .map((r) => [
              e(learners.find((s) => s.id === r.student)?.name),
              e(r.assignment),
              e(r.score),
            ]),
        );
    }
    if (page === "integration") {
      const rows = sourceRows(d);
      html +=
        "<h2>Class matching</h2>" +
        table(
          ["Mock Classroom class", "School class"],
          d.classMatches.map((c) => [e(c.source), e(c.school)]),
        ) +
        '<form class="form" data-form="class-match"><label>Mock source class<input name="source" value="Classroom Mathematics 7A" readonly></label><label>School class<select name="school">' +
        opt(permittedClasses(), d.classMatches[0].school) +
        '</select></label><button>Save class match</button><p class="muted wide">Both class and learner identities must match before grades reach SIS results.</p></form>';
      html +=
        '<p class="lead">Classroom to school results</p><p>Simulated source: Mathematics / Fractions checkpoint. No live Google or SIS connection. Matching uses a sample external ID linked to a school admission number and class.</p>' +
        table(
          [
            "Classroom learner / external ID",
            "School match",
            "Mark",
            "Transfer state",
          ],
          rows.map((r) => [
            e(r.name) + "<br><small>" + e(r.external) + "</small>",
            r.student
              ? e(d.students.find((s) => s.id === r.student)?.name) +
                " / " +
                e(r.class)
              : "Missing learner match",
            r.score + "/100",
            e(r.status),
          ]),
        ) +
        '<div class="actions">' +
        btn("preview", "Preview proposed transfers", "", true) +
        (preview
          ? btn("transfer", "Approve & transfer matched grades", "", true)
          : "") +
        btn("retry", "Retry failed items") +
        "</div>";
      if (preview)
        html +=
          '<p class="empty">Review: ' +
          rows.filter((r) => r.student && r.status !== "Transferred").length +
          " matched items can be processed. Existing source keys are skipped. Unmatched learners stay out of SIS results. One sample item simulates a temporary SIS error; retry processes it safely.</p>";
      const unmatched = rows.filter((r) => !r.student);
      if (unmatched.length)
        html +=
          '<h2>Resolve a missing match</h2><form class="form" data-form="match"><label>Source learner<select name="source">' +
          unmatched
            .map(
              (r) => '<option value="' + r.id + '">' + e(r.name) + "</option>",
            )
            .join("") +
          '</select></label><label>School learner<select name="student">' +
          visibleStudents(d)
            .filter((s) => s.class === "Grade 7A")
            .map(
              (s) =>
                '<option value="' +
                s.id +
                '">' +
                e(s.name) +
                " / " +
                s.id +
                "</option>",
            )
            .join("") +
          '</select></label><button>Save match</button><p class="muted wide">This fictional learner is deliberately unmatched. Choose a match only to explore the workflow; no live identity is verified.</p></form>';
      html +=
        "<h2>Transfer history</h2>" +
        table(
          ["Time", "Outcome", "Source"],
          d.transfers
            .filter(
              (t) => permittedClasses().includes(t.class) || u.role === "admin",
            )
            .map((t) => [e(t.date), e(t.outcome), e(t.source)]),
        );
    }
    if (page === "services") html += services(d, u);
    if (page === "hr") html += hr(d, u);
    if (page === "activity")
      html += table(
        ["Time", "Sample actor", "Action"],
        d.activity.map((a) => [e(a.date), e(a.actor), e(a.description)]),
      );
    if (page === "reporting")
      html +=
        "<p>Illustrative sample metrics for September 2026. Tracking is not configured and these are not measured visitors.</p>" +
        table(
          ["Sample measure", "Illustrative value"],
          [
            ["Public page views", "1,240"],
            ["Admissions enquiries", "36"],
            ["Resource downloads", "82"],
          ],
        ) +
        "<h2>This browser's enquiries</h2><p>Only enquiries entered by this visitor appear below. They have not been sent to the school.</p>" +
        table(
          ["Submitted", "Name", "Enquiry"],
          d.enquiries.map((q) => [
            e(q.date?.slice(0, 10)),
            e(q.name),
            e(q.message),
          ]),
        ) +
        '<p class="muted">See deployment documentation for Google Analytics and Search Console setup. Private portal records must never be included in analytics events.</p>';
    if (S.temporary())
      html +=
        '<p class="empty">Browser storage is unavailable. Changes last only for this page session.</p>';
    $("content").innerHTML = html;
    if (!u.edit) {
      $("content")
        .querySelectorAll("form")
        .forEach((f) => f.remove());
      $("content")
        .querySelectorAll("[data-action]")
        .forEach((b) => {
          if (
            b.dataset.action.startsWith("edit-") ||
            [
              "transfer",
              "retry",
              "approve-leave",
              "reject-leave",
              "mark-paid",
              "publish-payslip",
            ].includes(b.dataset.action)
          )
            b.remove();
        });
    }
    if (!u.approvals)
      $("content")
        .querySelectorAll(
          "[data-action=transfer],[data-action=retry],[data-action=approve-leave],[data-action=reject-leave]",
        )
        .forEach((b) => b.remove());
  }
  function notices(d) {
    const u = user(),
      ns = d.notices.filter(
        (n) =>
          n.published &&
          (n.audience === "All" ||
            n.audience === "public" ||
            n.audience === u.role) &&
          (n.campus === "All" || u.campus === "All" || n.campus === u.campus),
      );
    return ns.length
      ? ns
          .map(
            (n) =>
              '<article class="notice"><h3>' +
              e(n.title) +
              "</h3><p>" +
              e(n.body) +
              "</p></article>",
          )
          .join("")
      : '<p class="empty">No published notices for your role and campus.</p>';
  }
  function events(d) {
    const u = user();
    return table(
      ["School event", "Date", "Campus"],
      d.events
        .filter(
          (n) =>
            n.published &&
            (n.campus === "All" || u.campus === "All" || n.campus === u.campus),
        )
        .map((n) => [e(n.title), e(n.date), e(n.campus)]),
    );
  }
  function contentForm(d) {
    const n = d.notices.find((n) => n.id === editRecord) || {};
    return (
      '<form class="form" data-form="notice"><h2>' +
      (n.id ? "Edit notice" : "Publish a notice") +
      '</h2><input name="id" type="hidden" value="' +
      e(n.id || "") +
      '">' +
      field("title", "Notice title", n.title) +
      '<label>Audience<select name="audience">' +
      opt(
        ["public", "All", "teacher", "staff", "hr", "parent", "student"],
        n.audience,
      ) +
      '</select></label><label class="wide">Notice text<textarea required name="body" rows="3">' +
      e(n.body || "") +
      '</textarea></label><label>Campus<select name="campus">' +
      opt(["All", "Main", "West"], n.campus) +
      '</select></label><label class="check"><input name="published" type="checkbox" ' +
      (n.published === false ? "" : "checked") +
      '>Publish now</label><button class="primary">Save notice</button></form>'
    );
  }
  function calendarForm(d) {
    const n = d.events.find((n) => n.id === editRecord) || {};
    return (
      '<form class="form" data-form="event"><h2>' +
      (n.id ? "Edit event" : "Add calendar event") +
      '</h2><input name="id" type="hidden" value="' +
      e(n.id || "") +
      '">' +
      field("title", "Event title", n.title) +
      field("date", "Date", n.date, "date") +
      '<label>Campus<select name="campus">' +
      opt(["All", "Main", "West"], n.campus) +
      '</select></label><label class="check"><input name="published" type="checkbox" ' +
      (n.published === false ? "" : "checked") +
      '>Publish on calendar</label><button class="primary">Save event</button></form>'
    );
  }
  function assignmentForm(d) {
    const a = d.assignments.find((a) => a.id === editRecord) || {};
    return (
      '<form class="form" data-form="assignment"><h2>' +
      (a.id ? "Edit assignment" : "Add assignment") +
      '</h2><input name="id" type="hidden" value="' +
      e(a.id || "") +
      '">' +
      field("title", "Task title", a.title) +
      field("subject", "Subject", a.subject) +
      field("due", "Due date", a.due, "date") +
      '<label>Class<select name="class">' +
      opt(permittedClasses(), a.class) +
      '</select></label><button class="primary">Save assignment</button></form>'
    );
  }
  function sourceRows(d) {
    return d.source.filter((r) => permittedClasses().includes(r.class));
  }
  function services(d, u) {
    const own = d.staff.find((s) => s.id === u.id);
    if (!own)
      return '<p class="empty">This account has no employment record.</p>';
    return (
      "<p>" +
      e(own.job) +
      " · " +
      e(own.campus) +
      " campus</p><h2>Employment documents</h2>" +
      btn("employment", "Download employment summary", u.id) +
      "<h2>My payslips</h2>" +
      table(
        ["Month", "Payment status", "Download"],
        d.payroll
          .filter((p) => p.staff === u.id && p.published)
          .map((p) => [
            e(p.month),
            e(p.status),
            btn("payslip", "Download payslip", p.staff),
          ]),
        "No published payslip yet. HR can publish a sample payslip for this account.",
      ) +
      '<h2>Request leave</h2><form class="form" data-form="leave">' +
      field("from", "First day", "", "date") +
      field("to", "Last day", "", "date") +
      '<label class="wide">Reason<textarea name="reason" required rows="2" placeholder="Use fictional information only"></textarea></label><button class="primary">Submit leave request</button></form>' +
      table(
        ["Dates", "Reason", "Approval"],
        d.leave
          .filter((l) => l.staff === u.id)
          .map((l) => [
            e(l.from) + "  /  " + e(l.to),
            e(l.reason),
            e(l.status),
          ]),
        "No leave requests yet. Submit the form above to request sample leave.",
      )
    );
  }
  function hr(d, u) {
    if (!u.payroll)
      return '<p class="empty">HR / payroll clearance has been removed. Ask the administrator to restore it.</p>';
    let staff = d.staff.filter(
      (s) =>
        (u.campus === "All" || u.campus === s.campus) &&
        (!u.own || u.id === s.id),
    );
    let html =
      "<h2>Staff records</h2>" +
      table(
        ["Employee", "Appointment / campus", "Monthly gross", "Edit"],
        staff.map((s) => [
          e(s.name),
          e(s.job) + " / " + e(s.campus),
          money(s.salary),
          btn("edit-staff", "Edit record", s.id) +
            "<br>" +
            btn("employment", "Employment summary", s.id),
        ]),
      );
    const s = staff.find((s) => s.id === editRecord);
    if (s)
      html +=
        '<form class="form" data-form="staff"><h2>Edit ' +
        e(s.name) +
        '</h2><input type="hidden" name="id" value="' +
        s.id +
        '">' +
        field("job", "Appointment", s.job) +
        field("salary", "Monthly gross (KES)", s.salary, "number") +
        '<label class="wide">Employment summary<textarea name="document" required rows="4">' +
        e(s.document || "Sample appointment summary pending.") +
        "</textarea></label>" +
        '<label>Campus<select name="campus">' +
        opt(["Main", "West"], s.campus) +
        '</select></label><button class="primary">Save staff record</button></form>';
    html +=
      "<h2>October 2026 payroll</h2>" +
      table(
        ["Employee", "Gross / deductions / net", "Payment", "Payslip"],
        d.payroll
          .filter((p) => staff.some((s) => s.id === p.staff))
          .map((p) => [
            e(d.staff.find((s) => s.id === p.staff)?.name),
            money(p.gross) +
              " / " +
              money(p.deduction) +
              " / " +
              money(p.gross - p.deduction),
            e(p.status) + "<br>" + btn("mark-paid", "Mark paid", p.staff),
            p.published
              ? btn("payslip", "Download sample", p.staff)
              : btn("publish-payslip", "Publish payslip", p.staff),
          ]),
      ) +
      "<h2>Leave awaiting review</h2>" +
      table(
        ["Employee", "Dates / reason", "Status / decision"],
        d.leave
          .filter((l) => staff.some((s) => s.id === l.staff))
          .map((l) => [
            e(d.staff.find((s) => s.id === l.staff)?.name),
            e(l.from) + "  /  " + e(l.to) + "<br>" + e(l.reason),
            e(l.status) +
              (l.status === "Pending"
                ? '<div class="actions">' +
                  btn("approve-leave", "Approve", l.id) +
                  btn("reject-leave", "Decline", l.id) +
                  "</div>"
                : ""),
          ]),
      );
    return html;
  }
  function transfer(retry) {
    if (!preview && !retry)
      throw Error("Preview the grades before transferring.");
    update(
      "approve",
      (d) => {
        if (!["admin", "teacher"].includes(user().role))
          throw Error("This role cannot transfer grades.");
        window.SchoolIntegration.transfer(d, sourceRows(d), retry);
      },
      retry
        ? "Failed transfers retried. Review history for the outcome."
        : "Matched grades reviewed and processed. Review failed items below.",
    );
  }
  function accessibleStaff(id, d) {
    const u = user(),
      s = d.staff.find((x) => x.id === id);
    return (
      s &&
      (id === u.id ||
        (["admin", "hr"].includes(u.role) &&
          u.payroll &&
          !u.own &&
          (u.campus === "All" || u.campus === s.campus)))
    );
  }
  function documentAction(action, id) {
    guard("view");
    const d = S.read(),
      u = user();
    if (["payslip", "employment"].includes(action)) {
      if (!accessibleStaff(id, d))
        throw Error("This employment record is outside your access.");
      const s = d.staff.find((s) => s.id === id);
      if (action === "employment")
        S.download(
          "Employment summary  /  " + s.name,
          "<p>Employee: " +
            e(s.name) +
            "</p><p>Appointment: " +
            e(s.job) +
            "</p><p>Campus: " +
            e(s.campus) +
            "</p><h3>Employment summary</h3><p>" +
            e(s.document || "No employment summary has been published yet.") +
            "</p>",
        );
      else {
        const p = d.payroll.find((p) => p.staff === id);
        if (!p.published) throw Error("This payslip has not been published.");
        S.download(
          "Payslip " + p.month + "  /  " + s.name,
          "<p>Employee: " +
            e(s.name) +
            "</p><table><tr><th>Item</th><th>KES</th></tr><tr><td>Gross earnings</td><td>" +
            e(p.gross) +
            "</td></tr><tr><td>Sample deductions</td><td>" +
            e(p.deduction) +
            "</td></tr><tr><td>Net pay</td><td>" +
            e(p.gross - p.deduction) +
            "</td></tr></table><p>Payment status: " +
            e(p.status) +
            ". Fictional deductions; not a statutory payroll calculation.</p>",
        );
      }
    } else {
      const s = visibleStudents(d).find((s) => s.id === id);
      if (!s) throw Error("This learner is outside your access.");
      if (action === "statement")
        S.download(
          "Fee statement  /  " + s.name,
          "<p>Learner: " +
            e(s.name) +
            " / " +
            e(s.id) +
            "</p><p>Term 3, 2026 · " +
            e(s.class) +
            "</p><p>Term fees: " +
            money(s.fees) +
            "<br>Payments: " +
            money(s.payments.reduce((a, p) => a + p.amount, 0)) +
            "<br>Balance: " +
            money(s.fees - s.payments.reduce((a, p) => a + p.amount, 0)) +
            "</p>" +
            table(
              ["Date", "Reference", "Amount"],
              s.payments.map((p) => [
                e(p.date),
                e(p.reference),
                money(p.amount),
              ]),
            ),
        );
      else if (action === "report")
        S.download(
          "Progress report  /  " + s.name,
          "<p>" +
            e(s.name) +
            " / " +
            e(s.class) +
            "</p><p>" +
            e(s.rank) +
            "</p>" +
            table(
              ["Assessment", "Subject", "Mark / 100"],
              d.results
                .filter((r) => r.student === id)
                .map((r) => [e(r.assignment), e(r.subject), e(r.score)]),
            ) +
            "<p>Sample teacher comment: Continue practising multi-step calculations and explain your reasoning clearly.</p>",
        );
      else if (action === "paper")
        S.download(
          "Mathematics sample past paper",
          "<p>Revision practice · 45 minutes · 30 marks</p><ol><li>Simplify 18/24. Show your working. (4 marks)</li><li>A library has 240 books. Three eighths are fiction. How many are fiction? (6 marks)</li><li>Find the perimeter of a rectangular garden measuring 12 m by 7 m. (4 marks)</li><li>Solve 3x + 8 = 29. (6 marks)</li><li>A bus travels 150 km in 3 hours. Calculate average speed and explain your units. (5 marks)</li><li>Write 0.625 as a fraction in simplest form. (5 marks)</li></ol><p>Answer guide: 3/4; 90 books; 38 m; x=7; 50 km/h; 5/8.</p>",
        );
      else
        S.download(
          "Revision guide",
          "<h3>Fractions and proportions</h3><p>Find a common denominator before adding fractions. Example: 1/3 + 1/4 = 4/12 + 3/12 = 7/12.</p><h3>Practise</h3><ol><li>Calculate 2/5 + 3/10.</li><li>Find 25% of 160.</li><li>Explain why 4/6 and 2/3 are equivalent.</li></ol><p>Answers: 7/10; 40; divide numerator and denominator by 2.</p>",
        );
    }
    feedback(
      "Sample document downloaded. Open the HTML file to view or print.",
    );
  }
  $("content").addEventListener("click", (ev) => {
    const b = ev.target.closest("button");
    if (!b) return;
    if (b.dataset.page) {
      page = b.dataset.page;
      editRecord = null;
      render();
      return;
    }
    const a = b.dataset.action,
      id = b.dataset.id;
    try {
      if (a?.startsWith("edit-")) {
        guard("edit");
        editRecord = id;
        render();
      } else if (a === "preview") {
        guard("view");
        preview = true;
        render();
        feedback("Transfer preview is ready. Review matches before approval.");
      } else if (a === "transfer" || a === "retry") {
        transfer(a === "retry");
        render();
      } else if (["publish-payslip", "mark-paid"].includes(a)) {
        update(
          "payroll",
          (d) => {
            if (!accessibleStaff(id, d))
              throw Error("Staff record outside your scope.");
            const p = d.payroll.find((p) => p.staff === id);
            if (a === "publish-payslip") p.published = true;
            else p.status = "Paid";
          },
          a === "mark-paid"
            ? "Payroll marked paid."
            : "Sample payslip published to the employee.",
        );
        render();
      } else if (["approve-leave", "reject-leave"].includes(a)) {
        guard("payroll");
        update(
          "approve",
          (d) => {
            const l = d.leave.find((l) => String(l.id) === id);
            if (!l || !accessibleStaff(l.staff, d))
              throw Error("Leave outside your scope.");
            l.status = a === "approve-leave" ? "Approved" : "Declined";
          },
          "Leave request " +
            (a === "approve-leave" ? "approved." : "declined."),
        );
        render();
      } else if (a) documentAction(a, id);
    } catch (err) {
      feedback(err.message);
    }
  });
  $("content").addEventListener("change", (ev) => {
    if (ev.target.id === "child") {
      child = ev.target.value;
      render();
    }
  });
  $("content").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const f = ev.target,
      data = new FormData(f),
      v = Object.fromEntries(data),
      kind = f.dataset.form;
    try {
      update(
        kind === "staff" ? "payroll" : "edit",
        (d) => {
          const u = user();
          if (kind === "user") {
            if (u.role !== "admin")
              throw Error("Administrator access required.");
            const target = d.users.find((x) => x.id === v.id);
            ["view", "edit", "own", "assigned", "approvals", "payroll"].forEach(
              (k) => (target[k] = data.has(k)),
            );
            target.role = v.role;
            target.student = v.student;
            target.campus = v.campus;
            target.children = data.getAll("children");
            target.classes = data.getAll("classes");
          } else if (["notice", "event"].includes(kind)) {
            if (u.role !== "admin")
              throw Error("Administrator access required.");
            const list = kind === "notice" ? d.notices : d.events,
              r = {
                ...v,
                id: v.id || kind + Date.now(),
                published: data.has("published"),
              };
            const i = list.findIndex((x) => x.id === r.id);
            i < 0 ? list.push(r) : (list[i] = r);
          } else if (kind === "assignment") {
            if (u.role !== "teacher" || !permittedClasses().includes(v.class))
              throw Error("Assigned teacher class required.");
            const a = { ...v, id: v.id || "A" + Date.now() },
              i = d.assignments.findIndex((x) => x.id === a.id);
            i < 0 ? d.assignments.push(a) : (d.assignments[i] = a);
          } else if (kind === "result") {
            if (
              u.role !== "teacher" ||
              !visibleStudents(d).some((s) => s.id === v.student)
            )
              throw Error("Learner is outside your assigned class.");
            if (Number(v.score) < 0 || Number(v.score) > 100)
              throw Error("Enter a score between 0 and 100.");
            const key =
                v.student + ":manual:" + v.assignment.toLowerCase().trim(),
              r = { ...v, key, score: Number(v.score) },
              i = d.results.findIndex((x) => x.key === key);
            i < 0 ? d.results.push(r) : (d.results[i] = r);
          } else if (kind === "leave") {
            if (!d.staff.some((s) => s.id === u.id))
              throw Error("Staff access required.");
            if (v.to < v.from)
              throw Error("Last day must be on or after the first day.");
            d.leave.push({
              ...v,
              id: Date.now(),
              staff: u.id,
              status: "Pending",
            });
          } else if (kind === "staff") {
            if (!accessibleStaff(v.id, d))
              throw Error("Staff record is outside your campus access.");
            if (Number(v.salary) < 0) throw Error("Salary cannot be negative.");
            Object.assign(
              d.staff.find((s) => s.id === v.id),
              {
                job: v.job,
                salary: Number(v.salary),
                campus: v.campus,
                document: v.document,
              },
            );
            const p = d.payroll.find((p) => p.staff === v.id);
            p.gross = Number(v.salary);
            p.deduction = Math.round(p.gross * 0.1);
          } else if (kind === "class-match") {
            if (
              !["admin", "teacher"].includes(u.role) ||
              !permittedClasses().includes(v.school)
            )
              throw Error("Choose a class within your access.");
            d.classMatches[0].school = v.school;
            preview = false;
          } else if (kind === "match") {
            if (!["admin", "teacher"].includes(u.role))
              throw Error("Teacher or administrator access required.");
            const r = sourceRows(d).find((r) => r.id === v.source),
              s = visibleStudents(d).find((s) => s.id === v.student);
            if (!r || !s || s.class !== r.class)
              throw Error("Choose a learner in the same assigned class.");
            r.student = s.id;
            r.status = "Ready";
            preview = false;
          }
        },
        {
          user: "Account permissions saved.",
          notice: "Notice saved.",
          event: "Calendar event saved.",
          assignment: "Assignment saved.",
          result: "Assessment saved.",
          leave: "Leave request submitted for HR approval.",
          staff: "Staff record and sample payroll updated.",
          "class-match": "Class match saved. Preview transfers again.",
          match: "Sample match saved. Preview transfers again.",
        }[kind],
      );
      editRecord = null;
      render();
    } catch (err) {
      feedback(err.message);
    }
  });
  $("nav").addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-page]");
    if (b) {
      page = b.dataset.page;
      editRecord = null;
      render();
    }
  });
  $("role").addEventListener("change", () => {
    uid = $("role").value;
    closePanels();
    page = "home";
    editRecord = null;
    preview = false;
    render();
    feedback("Now exploring " + labels[user().role] + ".");
  });
  $("info").addEventListener("click", () => {
    $("info-panel").hidden = !$("info-panel").hidden;
    $("info").setAttribute("aria-expanded", String(!$("info-panel").hidden));
  });
  $("reset").addEventListener("click", () => {
    if (
      confirm(
        "Reset all changes in this browser to the original fictional sample records?",
      )
    ) {
      S.reset();
      uid = "admin";
      page = "home";
      editRecord = null;
      preview = false;
      render();
      feedback("Original sample data restored.");
    }
  });
  const steps = [
    [
      "admin",
      "users",
      "1 / 4 · Central administrator control",
      "Edit a sample account's access, then switch to that account to see its records and actions change.",
    ],
    [
      "teacher",
      "integration",
      "2 / 4 · Teacher grade transfer",
      "Preview and approve grades. One sample item fails; retry it, then repeat to see duplicate prevention.",
    ],
    [
      "hr",
      "hr",
      "3 / 4 · Staff HR and payroll",
      "Publish a payslip, then explore Other staff to download it or submit leave. Return to HR to approve the request.",
    ],
    [
      "parent",
      "family",
      "4 / 4 · Parent access",
      "Switch between two linked children, view fee statements and explore learning progress. Other families remain outside this account.",
    ],
  ];
  function closePanels() {
    $("guide-panel").hidden = true;
    $("info-panel").hidden = true;
    $("guide").setAttribute("aria-expanded", "false");
    $("info").setAttribute("aria-expanded", "false");
  }
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") closePanels();
  });
  function showGuide() {
    const [role, section, title, body] = steps[guideStep];
    uid = role;
    page = section;
    editRecord = null;
    render();
    $("guide-panel").hidden = false;
    $("guide").setAttribute("aria-expanded", "true");
    $("guide-panel").innerHTML =
      "<h2>" +
      title +
      "</h2><p>" +
      body +
      '</p><div class="actions">' +
      (guideStep ? '<button id="previous-step">Previous</button>' : "") +
      '<button class="primary" id="next-step">' +
      (guideStep === 3 ? "Finish demo" : "Next step") +
      "</button></div>";
  }
  $("guide").addEventListener("click", () => {
    guideStep = 0;
    showGuide();
  });
  $("guide-panel").addEventListener("click", (ev) => {
    if (ev.target.id === "previous-step") {
      guideStep--;
      showGuide();
    }
    if (ev.target.id === "next-step") {
      if (guideStep === 3) {
        $("guide-panel").hidden = true;
        $("guide").setAttribute("aria-expanded", "false");
        feedback("Guided demo complete. Continue exploring any role.");
      } else {
        guideStep++;
        showGuide();
      }
    }
  });
  S.subscribe(render);
  render();
})();
