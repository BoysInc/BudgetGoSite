# BudgetGo blog: content plan and workflow

## Workflow

1. **Draft.** Write the post to `content/blog/<slug>.html` with `status: draft`,
   then run `python3 scripts/build_blog.py`. Drafts build to `blog/<slug>.html`
   with `noindex` and are left out of the blog index, categories, feed, sitemap
   and llms.txt.
2. **Review.** Preview at `http://127.0.0.1:4174/blog/<slug>.html`
   (start the server with `start-preview.command` or `python3 dev_server.py`).
3. **Publish (only after approval).** Set `status: published`, set `published`
   (and `updated`) to the publish date, run the build again, then commit with
   `feat(blog): publish <short title>` and push.

Never commit or push a draft. Mark the topic below as done (`[x]`) with its slug once published.

## Standards (what top budgeting-app blogs do)

- **Search intent first.** One clear target keyword per post, in the H1, the SEO title,
  the description and the first paragraph. Titles promise something concrete:
  "(With the Math)", "(With a 2026 Example)", "Explained", "Step by Step".
- **Answer early.** A "Key takeaways" box at the top, short sections under clear H2s,
  and a 2–4 question FAQ at the end. Aim for 900–1,600 words.
- **Show the product.** Use BudgetGo phone mockups from `src/images/app-live/mockup-*.webp`
  in `<figure class="article-figure">` blocks. Competitors rarely show their app.
- **Link internally.** Link each post to 2+ other posts, plus the relevant guide or homepage section.
- **One `<!-- cta -->`** after the second or third H2. The template adds the end CTA, author box and related posts.
- **Accurate claims only.** Check every product claim against `llms.txt`, `index.html` and `AGENTS.md`.
  BudgetGo supports one active budget at a time, or tracking with no budget. No invented
  statistics, testimonials or ratings. Cite a reputable source for any outside figure.
- **Voice.** Plain, friendly, confident. Short sentences. No hype.
- **Never say "iPhone".** Don't describe BudgetGo as an iPhone app or write "on iPhone" anywhere in posts, titles, descriptions or alt text.

## Categories

`inside-budgetgo`, `budgeting`, `spending`, `saving`

## Topic backlog (work top to bottom)

### Inside BudgetGo (feature deep dives)
- [ ] how-budgetgo-insight-stories-work (drafted)
- [ ] how-budgetgo-categorizes-transactions (drafted)
- [ ] ways-to-add-spending-to-budgetgo (drafted)
- [ ] safe-to-spend-and-spending-forecast: "Safe to Spend: How BudgetGo Forecasts the Rest of Your Month"
- [ ] track-subscriptions-and-recurring-bills: "How BudgetGo Finds Your Subscriptions and Bills Before They Hit"
- [ ] track-apple-pay-spending-automatically: "How to Track Apple Pay Spending Automatically"
- [ ] track-spending-from-bank-sms-alerts: "Turn Bank SMS Alerts Into a Spending Tracker (Apple Shortcuts Guide)"
- [ ] import-bank-statement-pdf-csv: "How to Import a Bank Statement (PDF, CSV or Excel) Into a Budget App"
- [ ] voice-expense-tracking: "Voice Expense Tracking: Log Spending by Just Saying It"
- [ ] cash-flow-explained: "Cash Flow, Explained: Money In vs Money Out (With an Example)"
- [ ] top-merchants-where-your-money-goes: "Your Top Merchants Say More About Your Budget Than Your Categories"
- [ ] end-of-period-budget-review: "The 5-Minute End-of-Month Budget Review"
- [ ] budget-or-just-track: "Should You Set a Budget or Just Track Your Spending?"
- [ ] budgetgo-privacy-ai: "How BudgetGo Uses AI Without Selling Your Data"

### Budgeting
- [x] 50-30-20-rule
- [ ] zero-based-budgeting: "Zero-Based Budgeting, Explained (With a Monthly Example)"
- [ ] how-to-make-a-budget: "How to Make a Budget From Scratch in 5 Steps"
- [ ] envelope-budgeting-digital: "Envelope Budgeting, Without the Envelopes"
- [ ] pay-yourself-first: "Pay Yourself First: How It Works and How Much to Save"
- [ ] budget-for-irregular-income: "How to Budget With an Irregular Income"
- [ ] budget-for-couples: "How to Budget as a Couple Without Fighting About Money"
- [ ] monthly-budget-categories: "The Budget Categories You Actually Need (and the Ones You Don't)"
- [ ] holiday-budget: "How to Make a Holiday Budget (With an Example)"

### Spending
- [x] how-to-track-spending
- [ ] lifestyle-creep: "Lifestyle Creep: What It Is and How to Spot It in Your Spending"
- [ ] how-much-to-spend-on-groceries: "How Much Should You Spend on Groceries? (With the Math)"
- [ ] how-much-to-spend-eating-out: "How Much Should You Spend on Eating Out?"
- [ ] impulse-spending: "How to Stop Impulse Spending Without Feeling Deprived"
- [ ] coffee-and-small-purchases: "The Real Cost of Small Daily Purchases"
- [ ] weekly-money-check-in: "The Weekly Money Check-In That Takes 5 Minutes"

### Saving
- [x] find-and-cancel-subscriptions
- [ ] emergency-fund-how-much: "How Much Should Be in Your Emergency Fund?"
- [ ] sinking-funds: "Sinking Funds: How to Save for Big Expenses Without Stress"
- [ ] save-money-on-a-tight-budget: "How to Save Money on a Tight Budget: 12 Ideas That Work"
- [ ] how-much-of-paycheck-to-save: "How Much of Your Paycheck Should You Save?"
- [ ] no-spend-challenge: "How to Do a No-Spend Challenge (and Make It Stick)"

### Comparisons (high intent; verify competitor facts on their official sites the same day)
- [ ] best-budgeting-apps: "The Best Budgeting Apps, Compared"
- [ ] budgetgo-vs-ynab: "BudgetGo vs YNAB: Which Budgeting App Fits You?"
- [ ] budgetgo-vs-copilot-money
- [ ] budgetgo-vs-monarch-money
- [ ] budgetgo-vs-rocket-money
