(function () {
  const supportForm = document.getElementById("supportForm");
  if (!supportForm) return;

  /**
   * Build an email draft URL from the contact form without submitting data.
   * @param {FormData} details Contact details and the user's message.
   * @returns {string} An encoded mailto URL for the user's email app.
   */
  function buildSupportEmail(details) {
    const read = function (field) { return String(details.get(field) || "").trim(); };
    const requestType = read("type");
    const subject = (requestType ? requestType + ": " : "") + read("subject");
    const body = [
      "Support request details",
      "",
      "Name: " + (read("name") || "-"),
      "Email: " + (read("email") || "-"),
      "Request type: " + (requestType || "-"),
      "",
      "Message:",
      read("message") || "-"
    ].join("\n");
    return "mailto:support@budgetgo.ai?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  }

  supportForm.addEventListener("submit", function (event) {
    event.preventDefault();
    window.location.href = buildSupportEmail(new FormData(supportForm));
  });
})();
