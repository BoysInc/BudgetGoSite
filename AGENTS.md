# BudgetGo Site

This repository contains BudgetGo's public website: its homepage, automation
and MCP pages, support page, and legal pages. BudgetGo is an agentic
personal-finance app that helps users track spending and find ways to save.
It combines user-tracked expenses with connected-account and bank-statement
data. AI helps categorize transactions and surface insights, while users
retain control over their financial records, categories, and allocations.

## Things to know about BudgetGo

BudgetGo supports at most one active budget at a time. Users can also track
expenses without a budget. Keep website copy, examples, and product visuals
accurate for both modes. Do not imply simultaneous active budgets unless the
product requirements explicitly change.

This is a static HTML, CSS, and JavaScript site. Root HTML files contain the
pages; shared styles live in `styles.css`, with additional styles in `src/css/`.
Scripts live in `src/js/`, data in `src/data/`, and assets in `src/images/`.
Follow the existing structure; do not introduce a framework or build tool
unless the task requires it.

Use `python3 dev_server.py` for local preview at `http://127.0.0.1:4174`.
The server supports auto refresh and reuses an existing compatible server.
Use `--port <port>` if another process occupies that port.

## Communication

Keep explanations simple, short, and direct. Avoid overly verbose language.

## Commits

Use [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
for every commit:

```text
<type>[optional scope]: <short description>
```

Use `feat` for new functionality and `fix` for bug fixes. Keep the description
short and specific. Add an optional body after a blank line when context is
needed.

## Pull Requests

Use a concise Conventional Commit-style PR title. Every PR description must
include:

```text
## What
<What changed?>

## Why
<Why is this change needed?>
```

Keep both sections concise and specific. **What** describes the implementation
or behavior changed; **Why** explains the user, product, or technical reason.

## Branches

Name branches as `<type>/<short-description>` using kebab case, for example
`feat/product-tour` or `fix/mobile-navigation`. Use a conventional type such
as `feat`, `fix`, `docs`, `chore`, or `refactor`. Never use the `codex/` prefix.

## Code

Never add outlines to objects or UI elements. Use a visible non-outline treatment
for keyboard focus.

Follow standard separation of concerns. Use HTML for semantic structure, CSS
for presentation, and JavaScript for behavior. Keep rendering and event
handling separate from calculations, data transformations, and state logic.
Give each file and function one clear responsibility, and split large
implementations into focused modules.

Keep pages responsive and controls keyboard accessible. Preserve visible
focus states, meaningful labels, and reduced-motion support. Keep shared
navigation, footer content, and product claims consistent across pages.
When adding or changing public page URLs, update the relevant links,
`sitemap.xml`, and `llms.txt`.

### Reuse and DRY

Before writing a function, style, or UI component, read the relevant code and
search for an existing implementation. Reuse or extend suitable code instead
of recreating it. Follow DRY when shared code has the same purpose and
behavior; use a separate implementation when reuse would blur responsibilities.

Use JSDoc for reusable JavaScript functions whose purpose, inputs, or return
values need explanation. Document the contract and rationale when useful;
do not restate self-evident implementation details.

## Tests

Do not write or add any tests, including unit, functional, integration, or
end-to-end tests, unless the user explicitly asks you to.

Do not use the Maestro plugin or MCP to run anything unless the user explicitly
asks you to.

## Running Processes and Screenshots

Never kill, stop, restart, or otherwise disrupt the user's running processes
to test something else. This includes local servers, browser sessions, and
debug sessions. A request to test does not authorize disrupting these processes.

Use computer use to capture screenshots of the running site without
interrupting the user's browser, server, or debug session.

## Comments

Write comments to explain **why** a decision, constraint, workaround, or
non-obvious tradeoff exists. Do not use comments to restate what the code
already clearly does. Keep comments accurate when changing the related code,
and remove comments that no longer add useful context.

## Marketing copy and imagery

- Never add draft, sample, example, preview, placeholder, or implementation labels to the website UI. Keep development notes in project documentation and chat.
- Do not add unsolicited trial/subscription disclaimers beneath marketing CTAs, including “Made for iPhone · Subscription required after trial.” Keep pricing answers accurate in the relevant FAQ or pricing content.
- Use happy everyday-life photography. The homepage hero should show friends in their twenties spending time together. Avoid sad expressions, couples presented as lovers, and people making payments.
- Generated review copy is for the local design preview only. Publish testimonials only when actual customer quotes are supplied; do not invent public endorsements or ratings.

- BudgetGo’s palette is purple, lime, white and off-white variants, and black. Use purple as the main brand color and lime as the accent; do not introduce unrelated blue, pink, or yellow section backgrounds.

- Build product widgets and insight stories with HTML, CSS, and vector charts. Read the matching BudgetGo Flutter components for layout, fonts, spacing, and grouping; use screenshots as references rather than enlarged UI images.
