# Contributing

Thank you for helping build PH Scam DB. Contributions may affect real people, so data changes receive more scrutiny than ordinary code changes.

## Report a number

Use the **Report a phone number** issue form. Do not open a data pull request for an unreviewed allegation. Issues are public: never attach screenshots or include names, OTPs, addresses, financial details, message transcripts, or other personal information.

Maintainers triage the report, check for duplicates and spoofing indicators, and assign a status under [MODERATION.md](MODERATION.md). After review, a maintainer creates or approves the data change and links the source issue.

## Change code or documentation

1. Fork the repository and branch from `dev`.
2. Install dependencies with `bun install`.
3. Make a focused change and run `bun run check`.
4. Use the [Clean Commit](https://github.com/wgtechlabs/clean-commit) format.
5. Open a pull request against `dev` and complete the checklist.

## Add a reviewed record

Records live below `data/reports/`, grouped by year. Name a file using a SHA-256 digest or the linked issue number—not the phone number—to reduce accidental exposure in file listings. A record must conform to `schemas/report.schema.json` and pass semantic validation.

Never commit raw evidence. The public record contains only normalized classification metadata and public reference identifiers.

## Local commands

```sh
bun install
bun run validate
bun test
bun run build
bun run serve
```

The preview server is available at `http://127.0.0.1:4173` after a build.
