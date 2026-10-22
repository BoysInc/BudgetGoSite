# Legal data review — October 22, 2026

The website terms and privacy policy were updated from the local app, backend
and AI-engine source. This review does not establish which revisions or provider
settings are currently deployed. No app, backend or provider settings changed.

## Confirmed in source

- One active budget, or expense tracking without a budget.
- Plaid and FinanceKit account imports; on-device parsing of Shortcuts bank SMS
  alerts; file, receipt and voice inputs; editable and exportable records.
- SMS parser output excludes the raw message from the saved transaction
  description and sync payload (`BudgetGo/lib/services/local/apple_shortcuts_service.dart`).
- RevenueCat obtains offerings and trial eligibility from the store. The code
  does not establish a universal seven-day trial or US-dollar pricing
  (`BudgetGo/lib/services/online/revenuecat_service.dart`). Cancellation follows
  the purchasing store. Apple instructions:
  https://support.apple.com/en-us/118428 and https://support.apple.com/en-us/118223.
- Production PostHog initialization and identified account properties include
  user ID, email and name where supplied. Import analytics exclude file/audio
  content and account details (`BudgetGo/docs/analytics-tracking.md` and
  `BudgetGo/lib/services/analytics/analytics_service.dart`).
- The owner confirmed production diagnostics capture neither screenshots nor
  session replay. The consolidated privacy policy reflects that confirmation.
  Diagnostic identifiers, request metadata, errors, performance details and view
  hierarchy remain disclosed. No app or provider configuration changed here.
- The engine routes model requests through OpenRouter, has an OpenRouter audio
  transcription path, and exports AI traces to storage and Langfuse. Credential
  filters are not evidence of complete financial-data anonymization
  (`budgetgo-ai-engine/src/audio/endpoint.ts`, `src/mastra/model.ts`,
  `src/mastra/index.ts` and `src/mastra/storage.ts`).
- File ingestion uses E2B environments. The backend schedules expired-file
  cleanup every minute and retries failures. File expiry is 24 hours after batch
  creation; it is not a guarantee of erasure of every copy at that instant
  (`budgetgo-ai-engine/src/ingestion/pipeline.ts` and
  `budget-go-backend/src/ingestion/ingestion.service.ts`).
- Account deletion invokes a server-side `delete-account` function. After
  success, the app purges user-owned local tables, clears connection credentials
  and signs out (`BudgetGo/lib/data/repositories/auth.dart`,
  `BudgetGo/lib/providers/auth/account_deletion.dart` and
  `BudgetGo/lib/services/local/account_deletion_local_cleanup_service.dart`).

## Still needs confirmation

1. **Age enforcement:** the owner confirmed an 18+ minimum age. Both legal pages
   now require users to be at least 18 and exclude parental-permission exceptions.
   No age gate or date-of-birth check was found in the authentication/setup paths
   reviewed. The wording is consistent; any app enforcement remains separate work.
2. **Server-side account deletion:** the implementation of the `delete-account`
   function was not found in the repositories reviewed. Confirm its coverage of
   financial records, files, sessions, AI history, traces and notification tokens,
   plus deletion or revocation at Plaid and other providers. Local cleanup alone
   does not establish complete server/provider deletion or cleanup on other devices.
3. **Retention:** no complete retention schedule was found for saved records,
   voice data, AI conversations, import metadata, logs, PostHog, Sentry, Langfuse
   or backups. Confirm actual periods and deletion propagation. Only the import
   file expiry/cleanup mechanism is documented with a verified duration.
4. **AI and analytics choices:** no user-facing control disabling all AI or
   production analytics was found. A support contact is not evidence that all
   processing can be stopped while retaining every feature. Confirm the lawful
   basis for each purpose, consent requirements and the process for honoring
   objections/withdrawals. Do not treat accepting Terms or device permissions
   as blanket consent. The consolidated policy describes bases by purpose;
   deployment-specific legal decisions cannot be established from source code.
5. **Provider settings and locations:** production deployments, hosting regions,
   model routing recipients, provider retention/training settings, data-processing
   agreements and international-transfer safeguards cannot be verified from these
   sources. Do not claim exclusive US hosting, no model training, zero retention,
   or complete anonymization without verifying contracts and account settings.
6. **Release parity:** the app contains a streaming transcription client, while
   the checked engine has uploaded-audio and transcript extraction routes. Confirm
   the production voice path. The policy covers remote audio/text processing
   without promising one transport or model. Confirm current store offerings,
   prices and trial lengths in the store/RevenueCat dashboards as well.

Privacy disclosure categories were cross-checked against the ICO guidance:
https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-be-informed/.

## Review performed

Reviewed the changed content, section headings and internal anchor destinations;
checked the local pages in the browser and ran `git diff --check`. No tests were
added or run. Both legal pages now consistently require users to be at least 18; app age enforcement remains unverified.

## Consolidation into privacy PR #2

- Integrated the terms/privacy update already on main with the privacy PR's
  semantic sections, navigation, category table and fuller processing disclosures.
- Retained strict 18+ eligibility, the October 22 revision date, the one-active-
  budget limit, 24-hour import-file expiry with cleanup retries, and the distinction
  between record deletion, account deletion, provider cleanup and cancellation.
- Kept the owner's confirmation that production collects neither screenshots nor
  session replay; earlier source observations are not a statement of production
  capture behavior.
- Removed unverified Modal and separate document-redaction-service claims. Their
  use was not established in the checked app/backend/engine source; add specific
  recipient disclosures if such a processing path is confirmed.
- Kept voice-provider wording broad enough to cover direct and routed processing.
- Moved the PR's table and anchor presentation rules into the shared legal CSS.
- The existing main-branch Terms of Service remains unchanged by consolidation.
