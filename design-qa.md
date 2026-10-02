# BudgetGo — native product UI, insight stories, and privacy

Date: 2026-10-02

final result: passed

## Scope
- Replaced all four feature screenshots with HTML/CSS and vector charts. Visuals fill the left side of the stacked cards; recurring rows are enlarged to use the available space.
- Ported the overview from BudgetCard, HomeTimelinePicker, SpendingComparisonBadge, DueSoonRecurringCards, HomeVisualTheme, and AppGradients in the BudgetGo Flutter project. Uses the bundled Manrope font, the three-stop financial gradient, grouped due-soon rows, overlapping avatars, and responsive amount stacking. The secondary avatar uses lilac to honor the website palette. The eye button hides and restores amounts.
- Built native spending, cash-flow, and Forecast widgets. Forecast uses the app's existing outlook reference values; the app's forecast landing and running-total implementations were inspected.
- Rebuilt the supplied Desktop insight stories as full status views, including progress, close/reopen, sharing, next/recap navigation, pause/hold behavior, chart annotations, background rings, comparison icons, and explanatory text.
- Added entrance motion, number counting, graph growth, and line drawing. Reduced-motion users receive the completed static values and charts. No motion hides the underlying HTML content.
- Added Privacy first with solid white icons, border-free cards, biometrics, PII filtering, no-data-selling, and record controls. Heading says “Your spending is personal.” Tilt privacy is omitted as requested.
- Removed the destination tagline and “for iPhone” from the closing button. Plaid coverage uses the shared bold SVG arrow.

## Verification
- Manually inspected 1316 × 984 desktop and 390 × 844 mobile in the running in-app browser. No horizontal mobile overflow; all feature panels fit their content.
- Manually checked hiding/restoring amounts, closing/reopening an insight, and next-story navigation with focus transfer. Share is implemented with native sharing or clipboard fallback; no external sharing was performed during review.
- Browser error logs were empty. JavaScript syntax checks and git diff --check passed. No tests were added or run, and no app project files or running processes were changed.
- Source PNGs remain in src/images/insights as references only; the website renders product visuals as HTML/CSS. sources.json records the Flutter components and Desktop references.

## Evidence
Directory: `/Users/timiafolabi/.codex/visualizations/2026/10/02/01a0fb59-139d-72c1-953c-c88b99549b72/overtake-adaptation/`
- flutter-overview-desktop.jpg and flutter-overview-mobile.jpg
- native-categories-desktop.jpg and native-recurring-desktop.jpg
- native-insight-widgets-desktop.jpg and native-insights-mobile.jpg
- native-insight-stories-desktop.jpg and native-stories-mobile.jpg
- privacy-first-desktop.jpg and privacy-first-mobile.jpg

---

# BudgetGo — purple palette, source hub, Plaid, reviews, and FAQs

Date: 2026-10-02

final result: passed

## Scope
This report supersedes the previous payment-photo, static-card, and review-heading descriptions.

- Redesigned the source section around a central BudgetGo hub, premium source assets, a 2D SMS alert, and animated dollar amounts. FintechX informed the hub; Cospace informed the spacing and type.
- Added the official Plaid logo and a bank-connection panel. The 12,000+ figure explicitly describes Plaid’s network, rather than guaranteeing every institution is available in BudgetGo. Existing Plaid integration is documented in `llms.txt`; coverage was checked at https://plaid.com/press/ on this date.
- Purple, lime, white/off-white, and black now anchor the page. Removed unrelated blue, pink, and yellow section backgrounds and recorded the palette in `AGENTS.md`.
- Feature cards overlap while scrolling on sufficiently tall desktop viewports. Short viewports, mobile, and reduced-motion users receive the readable static layout.
- Hero photography shows three young friends sharing pizza. The joined mosaic shows happy everyday food, coffee, groceries, and transport scenes, without payment scenes. Photo credits are recorded with the assets.
- Six local preview reviews have human avatars and names, a seamless slow-scrolling row, and the heading “What people are saying.” Generated quotes render only on localhost; production requires actual supplied reviews.
- Removed trial text beneath CTAs and recorded the requested copy rules in `AGENTS.md`. Rewrote FAQs around tracking without a budget, sources, supported banks, category control, imports, recurring bills, pricing, and data export/deletion.

## Reference and evidence
References: https://fintechx-wbs.framer.website/ and https://cospace-wbs.framer.website/
Preview: http://127.0.0.1:4174/?preview=purple#reviews
Evidence: `/Users/timiafolabi/.codex/visualizations/2026/10/02/01a0fb59-139d-72c1-953c-c88b99549b72/overtake-adaptation/`

- `fintechx-integration-visual.jpg` and `purple-sources-desktop.jpg` were displayed together at matching 1280 × 720 viewports. This is an intentional BudgetGo adaptation, not a pixel clone.
- `purple-stacked-cards.jpg` verifies actual overlap at 1316 × 984; `purple-everyday-desktop.jpg` verifies the joined photo grid.
- `purple-plaid-desktop.jpg` and `purple-reviews-desktop.jpg` capture the final bank panel and named reviews at 1316 × 984.
- `purple-sources-mobile.jpg`, `purple-plaid-mobile.jpg`, `purple-reviews-mobile.jpg`, and `purple-faq-mobile.jpg` show the checked 390 × 844 layout. The final mobile source canvas adds spacing between the bottom cards.

## Verification
- Inspected desktop and mobile in the running browser. No page-width overflow in the checked mobile viewport; source cards, SMS copy, bank panel, names, avatars, and FAQ answers remain readable.
- Review transform advances automatically; clicking/focusing its region pauses the animation. Duplicated cards are inert and hidden from assistive technology. Reduced-motion CSS stops the animation and allows horizontal browsing of the original cards.
- Bank FAQ opens correctly. Existing feature and setup anchors remain. Source paths adapt to source/hub geometry and retain reduced-motion support.
- Plaid logo and photography load. Browser error logs were empty.
- JavaScript syntax checks and `git diff --check` passed. No tests added or run. No user processes interrupted, and no deployment performed.

---

# BudgetGo — annotation updates and Selected work layout

Date: 2026-10-02

final result: passed

## Scope
Resolved the seven browser annotations and the follow-up request to adapt Overtake’s “Selected work” section. This report supersedes the earlier descriptions of tabs, sample labels, the hero logo, and the animation toggle.

- Replaced the inline hero logo with the reference’s dollar graphic and centered bolder CTA arrows.
- Replaced the couple photograph with café payment photography sourced online.
- Removed sample/example labels, the source-flow setup note, and its pause control. Reduced-motion support remains.
- Replaced equal photo cards with a joined grid of varied sizes using café, shopping, groceries, and city photography. Credits are recorded with the assets.
- Replaced the dark intro and feature tabs with four stacked cards: large actual app screenshots, inset black detail panels, tags, lime benefit text, and pill CTAs.

## Reference and evidence
Reference: https://overtake-wbs.framer.website/
Preview: http://127.0.0.1:4174/?preview=overtake#showcase
Evidence directory: `/Users/timiafolabi/.codex/visualizations/2026/10/02/01a0fb59-139d-72c1-953c-c88b99549b72/overtake-adaptation/`

- `source-selected-work.jpg` (1280 × 720) and `revised-showcase-desktop.jpg` (1194 × 984) were displayed together for structural comparison. Viewports differ; this is a qualitative adaptation check, not a pixel comparison.
- The reference’s stacked layout, inset dark panels, chips, divider, lime emphasis, and CTA treatment are retained. Actual app screens on colored backgrounds intentionally replace agency campaign photography and performance metrics.
- `revised-showcase-mobile.jpg` verifies the screenshot/detail stack at 390 × 844.
- `revised-grid-desktop.jpg` and `revised-grid-mobile.jpg` show the joined photography grid.
- `revised-hero-mobile.jpg` and `revised-payment-mobile.jpg` show the corrected hero and final photo crop.

## Verification
- Desktop and mobile layouts inspected in the running browser; no horizontal overflow in the checked viewports.
- Four feature cards render, old feature anchor IDs remain, and “See how it works” reaches the setup section.
- New photos and feature screenshots load. Offscreen lazy-loaded images were checked when their sections were reached.
- Removed elements are absent. Dollars still animate through the source paths; reduced-motion handling remains in code.
- Browser error console contained no errors.
- JavaScript syntax and `git diff --check` passed. No tests added or run.
- No outstanding blockers. No deployment performed.

---

# BudgetGo — Overtake design adaptation

Date: 2026-10-02

final result: passed

## Scope
User selected “Adapt it for BudgetGo.” The Overtake homepage is the visual reference; BudgetGo content, app screenshots, illustrations, guides, and product claims are retained. This is an adaptation, not a pixel-identical agency-site clone.

## Evidence
- Source: https://overtake-wbs.framer.website/
- Local implementation: http://127.0.0.1:4174/?preview=overtake
- Evidence directory: `/Users/timiafolabi/.codex/visualizations/2026/10/02/01a0fb59-139d-72c1-953c-c88b99549b72/overtake-adaptation/`
- Desktop reference: `source-desktop.jpg`; implementation: `budgetgo-desktop.jpg`.
- Mobile reference: `source-mobile.jpg`; implementation: `budgetgo-mobile.jpg`.
- CSS viewports: 1440 × 1000 desktop and 390 × 844 mobile. Both source and implementation were captured at matching viewport settings, with the same scrollbar and screenshot density. Compared together in one tool response; no density adjustment was needed.
- State: homepage top, mobile menu closed. Additional browser views covered the spending card, animated source flow, dark feature panel, setup cards, privacy section, and expanded FAQ.
- Focused comparisons: hero text, highlighted description, CTA shape, and first card row are readable in the paired desktop captures. Mobile captures show text wrapping, margins, and stacked actions.

## Findings
No actionable P0/P1/P2 findings in the reviewed adaptation.

- Typography: locally hosted Switzer 500/600 matches the reference family and display weight. Large two-line desktop headline; four-line mobile headline. BudgetGo wording intentionally differs.
- Spacing/layout: retained inset rounded hero, centered heading, paired actions, large photo/card row, generous section spacing, and alternating light/dark blocks. The trial disclosure adds a small intentional gap before the hero cards.
- Colors: white/light-gray canvas, black text, dark green card, lime highlights, and pink description highlight follow the reference. BudgetGo’s purple logo and source-flow accents remain.
- Images: reused BudgetGo’s full-resolution lifestyle photo, premium spending illustrations, and actual app screenshots. All observed image loads succeeded. Agency portraits, client logos, and performance metrics were replaced with relevant BudgetGo content.
- Copy: accurate expense tracking, AI assistance, optional bank connections, setup requirements, trial disclosure, and a single optional budget. Illustrative spending is labeled as sample data; $4.50 + $14.50 + $42.00 = $61.00.

## Interaction checks
- Desktop feature tabs switch content; ArrowRight moves selection correctly.
- Mobile navigation opens; Escape closes it.
- In-page navigation reaches the requested section.
- Money amounts still travel along source lines; pause/resume state updates correctly.
- Mobile recurring tab displays its corresponding panel.
- FAQ expands to show its answer.
- Desktop and mobile: no horizontal overflow or broken images detected.
- Browser error console: no errors observed.
- Existing reduced-motion rules and focus styles retained.
- `git diff --check` passed. No tests were added.

## Comparison history
Initial implementation passed the reviewed desktop/mobile adaptation checks without a visual correction cycle. Deliberate differences are BudgetGo branding/content, retained source animation, app screenshots, and relevant setup/privacy/FAQ sections instead of agency proof, testimonials, and blog posts.

## Follow-up polish
None required for handoff. No deployment performed.

---

# Source-flow animation update — 2026-10-02

final result: passed

User-requested changes: repeat the incoming flow and replace the 3D bank alert with a flat notification. The previously approved-in-code layout is retained; these changes intentionally differ from the earlier still image.

- Source comparison: previous `/Users/timiafolabi/.codex/visualizations/2026/10/02/01a0fb59-139d-72c1-953c-c88b99549b72/budgetgo-pipeline/desktop-final.jpg`, current `/Users/timiafolabi/.codex/visualizations/2026/10/02/01a0fb59-139d-72c1-953c-c88b99549b72/budgetgo-pipeline/flow-desktop.jpg`; both 1440×1000 at matching CSS dimensions. Mobile `/Users/timiafolabi/.codex/visualizations/2026/10/02/01a0fb59-139d-72c1-953c-c88b99549b72/budgetgo-pipeline/flow-mobile.jpg` is 390×844 at 1:1 capture.
- Five small source copies move along their existing paths, shrink and fade into BudgetGo, followed by a subtle logo response. The bank alert is actual flat HTML/CSS notification content; no new raster asset is needed.
- Existing Manrope hierarchy, lilac/charcoal colors, source spacing and four photographic assets remain. The new notification aligns within the same source footprint. Mobile has no horizontal overflow.
- Pause/resume manually verified: all five travelers report paused, then resume without restarting their shared timeline. Browser console has no errors. Motion is gated by visibility and reduced-motion preference in source; system preferences were not changed.
- JavaScript syntax and whitespace checks passed. No automated tests added.
- Earlier report below is historical: its one-shot-animation description has been superseded by this update.

---

# Spending-source flow QA — 2026-10-02

final result: passed

## Scope and evidence

The user rejected the earlier mocks and requested direct website iteration using the existing burger and coffee as material/lighting references. This is an original section layout, not a pixel-identical recreation.

- Source visual truth: `src/images/life/burger-v2.webp` (900×753), `src/images/life/coffee-opaque-v2.webp` (750×900). These are isolated art assets, not viewport layouts.
- Implementation: `http://127.0.0.1:4174/#payment-sources-title`.
- Desktop: `/Users/timiafolabi/.codex/visualizations/2026/10/02/01a0fb59-139d-72c1-953c-c88b99549b72/budgetgo-pipeline/desktop-final.jpg`, 1440×1000 pixels and CSS viewport (1:1 capture).
- Phones: `/Users/timiafolabi/.codex/visualizations/2026/10/02/01a0fb59-139d-72c1-953c-c88b99549b72/budgetgo-pipeline/mobile.jpg` (390×844) and `/Users/timiafolabi/.codex/visualizations/2026/10/02/01a0fb59-139d-72c1-953c-c88b99549b72/budgetgo-pipeline/mobile-320.jpg` (320×740), matching CSS viewport sizes, 1:1 capture. These precede the final connector-contrast increase; geometry is unchanged.
- State: section in view, all images loaded, introductory motion complete.
- Full-view comparison: reference assets and desktop capture opened together in one comparison input. Compared materials, cutout edges, light direction, dark page treatment, visual hierarchy and object scale. No pixel-alignment claim between unrelated objects.
- Focused review: each new original was inspected at full size; phone screenshots checked for readable labels, intact objects and connector placement.

## Findings and comparison history

1. P2: the initial connector color (#44404b) was too faint. Increased to #6d6378. Final desktop capture shows clear, restrained paths meeting the logo; re-compared with the coffee reference in the same input. Resolved.
2. Some captures taken during navigation showed unloaded images. Waited for load, verified every source image's natural width, recaptured and visually confirmed all assets. Resolved; no missing final assets.

No actionable P0/P1/P2 findings remain.

## Required surfaces

- Typography: existing Manrope, intentional two-line heading, readable source labels. Long mobile label wraps at 320px without collision.
- Layout: five desktop objects converge downward; phone layout flows from a left-hand list into the logo on the right. No horizontal overflow at 1440, 390 or 320px.
- Color: existing charcoal, ivory and lilac tokens retained. Paths brightened as above.
- Images: five genuine generated raster illustrations with physical materials, transparent edges and no enclosing icon circles. Existing logo preserved. 500×500 WebP assets total about 137KB.
- Copy: existing source names retained, setup/availability qualifier included, no new product capabilities claimed.

## Interaction checks

Keyboard Tab reaches Bank alerts with a visible outline and corresponding highlighted connector. Statements reaches the existing imports section. Source links have meaningful labels and valid existing targets. Five paths render and follow the responsive layout. Introduction lasts under four seconds; reduced-motion rules disable it and hover translation (source reviewed). Browser console showed no errors. JavaScript syntax and diff whitespace checks passed. No automated tests added.

## Generated asset prompts

Built-in image generation, each grounded in the burger and coffee images. Original PNGs retained outside the repository at `/Users/timiafolabi/.codex/visualizations/2026/10/02/01a0fb59-139d-72c1-953c-c88b99549b72/budgetgo-pipeline/source-originals`; optimized assets saved in `src/images/life/sources/`.

- `cards.webp`: two stacked satin graphite/titanium payment cards, realistic chip, restrained lilac edge, microtexture, three-quarter view, no text or brand, transparent.
- `alert.webp`: ivory frosted-glass notification slab, tactile lilac bell inset, graphite message marks, tiny green status dot, physical edge detail, transparent.
- `bank.webp`: warm travertine miniature bank facade, three columns, brushed metal base, subtle lilac side accent, photographic material detail, transparent.
- `statement.webp`: fanned ivory paper sheets, folded corner, restrained charcoal rows and lilac chart, realistic paper grain, transparent.
- `receipt.webp`: curled warm-white thermal receipt, serrated end, grey rows and barcode, reverse visible, realistic paper grain, transparent.

## Limits

No cross-browser or physical-device certification. Reduced-motion setting was reviewed in code rather than changing the user's system preferences. Visual taste remains open to user feedback.

---

## Earlier homepage review (preserved)

# Homepage design QA

Date: 2026-10-01

**Findings**

No actionable P0/P1/P2 issues remain in the checked homepage states.

This is a homepage redesign informed by the supplied galleries, not a pixel-for-pixel clone of the generated concept. The later request for motion changes the hero into an animated transaction sequence. Existing BudgetGo branding, product interactions, and useful content are retained.

**Evidence and scope**

- Source visual: `output/imagegen/homepage-redesign/direction-reference.png` (971 × 1619 pixels). This generated image is an art-direction reference, with no defined CSS viewport or device density.
- Reference captures: `output/imagegen/homepage-redesign/references/` contains Jiro's budgeting template, Recent's finance gallery, Navbar Gallery, CTA Gallery, and the previous local homepage.
- Implementation: `http://127.0.0.1:8000/`, dark theme, default Overview tab.
- Hero capture: `output/imagegen/homepage-redesign/desktop-final.jpg` (1212 × 972 pixels).
- Full-page capture: `output/imagegen/homepage-redesign/desktop-full-final.jpg` (1212 × 5410 pixels). The hero is partway through its animation in this capture.
- Reported desktop viewport: 1227 × 984 CSS pixels; document content width 1212. Browser capture dimensions differ slightly from the reported viewport. No pixel-distance or density-normalized fidelity claim is made.
- Responsive checks: 390- and 768-pixel-wide iframe viewports, 844 pixels tall. Content widths were 375 and 753 pixels after scrollbars, without horizontal overflow.
- Responsive interaction evidence: `output/imagegen/homepage-redesign/mobile-faq.jpg` (1265 × 712 screenshot of the test harness, not a standalone phone capture).
- Full-view comparison: source and final full-page images were opened together in one comparison input. Composition, dark palette, lilac accents, product focus, section hierarchy, and closing CTA were checked.
- Focused comparison: source and final hero capture were opened together in one comparison input, allowing readable inspection of navigation, headline, transaction rows, buttons, and caption.

**Required surfaces**

| Surface | Result |
| --- | --- |
| Fonts and typography | Manrope provides a consistent hierarchy. Display wrapping is intentional; controls, labels, and supporting copy remain readable in desktop and responsive checks. Generated reference typography is directional, not an exact font specification. |
| Spacing and layout | Open two-column desktop hero, stacked mobile hero, aligned section grids, and clear dividers. The longer page retains the existing product tour and detailed product content. No observed clipping or horizontal overflow. |
| Colors and tokens | Charcoal background, white text, and lilac accents follow the reference direction. Secondary hero text was brightened to #929399 after contrast review. |
| Image and asset quality | The rejected hero photo is removed. Existing BudgetGo and transaction assets remain sharp. The native transaction animation is an intentional response to the motion request; no hands or phone mockups appear in the hero. |
| Copy and content | Budgeting and spending stay central. Example transactions are labeled illustrative. Existing product links and substantive feature descriptions are retained; duplicate review wording reflects user control. |

**Comparison history**

1. Old hero photo still appeared due to cached styles. Removed both background-image rules and updated stylesheet versions. Post-fix evidence: `desktop-final.jpg` shows the open motion graphic with no photo.
2. Hero footnote and animation caption contrast needed improvement. Set both to #929399. Post-fix evidence: `desktop-final.jpg`.
3. Entrance opacity made section headings appear faint during captures. Kept the subtle translation and removed opacity fading. Post-fix evidence: `desktop-full-final.jpg` shows readable section content throughout.

**Interaction and code checks**

- Motion completes at €66.55; transaction categories and proportional bar correspond to the three purchases.
- Pause/play verified in the browser. Reduced-motion, offscreen suspension, and hidden-document behavior checked by the motion script's runtime harness and source review.
- Explore link reaches the product tour.
- Categories tab and Groceries control update the displayed amount to €436.80 and 20.6%.
- Arrow-key tab navigation and Recurring panel work.
- Mobile navigation opens and closes; FAQ expands.
- No broken loaded images or browser console errors observed.
- Local asset paths and anchor targets exist; no duplicate HTML IDs found.
- JavaScript syntax checks and `git diff --check` pass.

**Open questions and test gaps**

- No blocking questions. This pass covers the local homepage in the available browser, not a full cross-browser or real-device certification.
- App Store links were inspected; completing an App Store download is outside this homepage check.

**Implementation checklist**

- [x] Redesign the homepage around the supplied references.
- [x] Replace the hero photo with budgeting motion.
- [x] Provide pause/play and reduced-motion support.
- [x] Check desktop, mobile, product tabs, navigation, and FAQ.
- [x] Refresh the user's local preview and save screenshots.

**Follow-up polish**

None required for this handoff.

final result: passed
