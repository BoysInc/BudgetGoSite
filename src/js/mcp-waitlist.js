(function () {
      const form = document.getElementById("waitlist");
      const input = document.getElementById("waitlist-email");
      const status = document.getElementById("waitlist-status");
      if (!form || !input || !status) return;

      // Set data-endpoint on the form to POST signups to a list provider.
      // Without one, the form falls back to a prefilled email to support.
      const endpoint = form.dataset.endpoint;

      const show = function (message, ok) {
        status.textContent = message;
        status.className = "waitlist-status " + (ok ? "ok" : "err");
      };

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const email = input.value.trim();
        if (!input.checkValidity() || !email) {
          show("Please enter a valid email address.", false);
          input.focus();
          return;
        }

        if (!endpoint) {
          const subject = encodeURIComponent("BudgetGo MCP waitlist");
          const body = encodeURIComponent("Please add " + email + " to the BudgetGo MCP waitlist.");
          window.location.href = "mailto:support@budgetgo.ai?subject=" + subject + "&body=" + body;
          show("Your email app should open with your request ready to send.", true);
          return;
        }

        const button = form.querySelector("button");
        button.disabled = true;
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ email: email, list: "mcp" })
        })
          .then(function (response) {
            if (!response.ok) throw new Error(String(response.status));
            form.reset();
            show("You're on the list. We'll email you when the MCP is ready.", true);
          })
          .catch(function () {
            show("Something went wrong. Please try again.", false);
          })
          .finally(function () {
            button.disabled = false;
          });
      });
    })();
