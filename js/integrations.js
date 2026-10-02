(() => {
  "use strict";
  // Mock adapter contract: mutate only supplied source rows and SIS result/history arrays.
  // A real deployment replaces this with a server endpoint that rechecks identity and approval.
  window.SchoolIntegration = {
    transfer(d, rows, retry) {
      rows
        .filter((r) => (retry ? r.status === "Failed" : r.student))
        .forEach((r) => {
          let outcome;
          if (!r.student) outcome = "Unmatched  /  skipped";
          else if (d.results.some((x) => x.key === "classroom:" + r.id)) {
            outcome = "Duplicate prevented";
            r.status = "Transferred";
          } else if (r.failOnce && !retry) {
            r.status = "Failed";
            r.failOnce = false;
            outcome = "Temporary simulated SIS error";
          } else {
            const learner = d.students.find((s) => s.id === r.student);
            if (
              !learner ||
              learner.class !== r.class ||
              d.classMatches[0].school !== r.class
            ) {
              r.status = "Unmatched";
              outcome = "Class match missing";
            } else {
              d.results.push({
                key: "classroom:" + r.id,
                student: r.student,
                assignment: r.assignment,
                subject: r.subject,
                score: r.score,
              });
              r.status = "Transferred";
              outcome = "Transferred to SIS";
            }
          }
          d.transfers.unshift({
            date: new Date().toLocaleString("en-KE"),
            source: r.id,
            class: r.class,
            outcome,
          });
        });
    },
  };
})();
