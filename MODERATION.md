# Moderation policy

PH Scam DB records community reports, not legal findings. Moderators apply consistent standards, minimize published data, and give affected number holders a practical appeal path.

## Statuses

| Status | Public meaning | Minimum bar |
| --- | --- | --- |
| `reported` | A good-faith submission passed basic checks but remains unverified. | One recent, internally coherent report. |
| `watchlist` | Independent signals suggest harmful use, but control or intent is not conclusive. | Two independent reports or one report plus a credible public source. |
| `confirmed` | Evidence strongly associates the number with a repeatable scam operation. | Multiple independent reports, or an authoritative public advisory, after moderator review. |

Report counts alone never determine status. Moderators consider spoofed caller ID, recycled numbers, coordinated reporting, age, detail consistency, and public sources.

## Risk and verdicts

`riskLevel` describes threat severity for consumer app presentation and moderation priority. Use `low`, `medium`, or `high`.

`verdict` describes the recommended consumer app action. Use `warn` for caution labels, warning screens, or extra confirmation. Use `block` only when the record is `confirmed`; reported and watchlist entries should remain warnings until stronger review supports blocking.

## Review workflow

1. Redact or close submissions that expose personal information.
2. Normalize the number to Philippine E.164 format and check for duplicates.
3. Assess whether the caller ID may have been spoofed.
4. Classify the tactic and record only minimal, non-identifying notes.
5. Link the public issue or authoritative reference.
6. Require a second maintainer approval for `confirmed` status.
7. Set an expiry date when evidence may become stale or the number may be reassigned.

Moderators must disclose conflicts and recuse themselves from reports involving their own disputes, employers, customers, or close contacts.

## Appeals and corrections

Anyone may use the appeal issue form. Maintainers acknowledge an appeal promptly, temporarily downgrade an entry when credible reassignment or spoofing evidence exists, and document the decision in the linked issue. Private proof must never be posted publicly; until a private evidence channel is configured, moderators should decide only from safe public information and remove an entry when doubt cannot be resolved responsibly.

## Retention

Entries should be reviewed at expiry and at least annually. An expired entry is removed from generated feeds until renewed by current evidence. Git history remains available, so maintainers must never commit raw evidence or personal data.
