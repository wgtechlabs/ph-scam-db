# PH Scam DB 🛡️📞 [![made by](https://img.shields.io/badge/made%20by-WG%20Tech%20Labs-0060a0.svg?logo=github&longCache=true&labelColor=181717&style=flat-square)](https://github.com/wgtechlabs)

[![build workflow](https://img.shields.io/github/actions/workflow/status/wgtechlabs/ph-scam-db/ci.yml?branch=dev&style=flat-square&logo=github&label=build&labelColor=181717)](https://github.com/wgtechlabs/ph-scam-db/actions/workflows/ci.yml) [![star](https://img.shields.io/github/stars/wgtechlabs/ph-scam-db.svg?logo=github&labelColor=181717&color=yellow&style=flat-square)](https://github.com/wgtechlabs/ph-scam-db/stargazers) [![license](https://img.shields.io/github/license/wgtechlabs/ph-scam-db.svg?&logo=github&labelColor=181717&style=flat-square)](https://github.com/wgtechlabs/ph-scam-db/blob/dev/LICENSE)

[![PH Scam DB – GitHub Repo Banner](https://ghrb.waren.build/banner?header=PH+Scam+DB+%F0%9F%9B%A1%EF%B8%8F&subheader=Open-source+PH+scam+number+database&bg=013B84-016EEA&color=FFFFFF)](https://github.com/wgtechlabs/ph-scam-db)
<!-- Created with GitHub Repo Banner by Waren Gonzaga: https://ghrb.waren.build -->

**Open-source scam phone-number intelligence for the Philippines** — a community-maintained database of Philippine mobile and landline numbers reported for scam calls and messages.

PH Scam DB treats Git as the source of truth. Community submissions are reviewed, normalized, and stored as small schema-validated records. The build generates a searchable static website and machine-readable feeds that other projects can consume.

> [!IMPORTANT]
> Entries represent community reports, not legal findings. A number absent from the database is not necessarily safe. Caller IDs can be spoofed, and phone numbers can be reassigned.

## MVP features

- Philippine mobile and landline lookup with common-format normalization
- Three review states: `reported`, `watchlist`, and `confirmed`
- JSON Schema plus chronological, uniqueness, and expiry validation
- Generated full index and confirmed-only JSON/text blocklists
- Structured single-number, bulk report, and appeal forms
- Public moderation, privacy, security, and contribution policies
- Strict TypeScript, Node.js 26, Bun-based tests/build, and GitHub Actions CI
- Dependency-light static site suitable for GitHub Pages or any static host

## Architecture

```text
data/reports/*.json          reviewed source records
          │
          ├── schema + semantic validation
          │
          └── Bun/TypeScript build
                    │
                    ├── dist/data/index.json
                    ├── dist/data/blocklist.json
                    ├── dist/data/blocklist.txt
                    └── dist/ lookup website
```

The repository deliberately does not store raw screenshots, message transcripts, identity documents, or reporter details. See [MODERATION.md](MODERATION.md) for the evidence and appeal rules.

## Getting started

Requirements: Node.js 26.5.0 or later within the Node.js 26 release line, plus [Bun](https://bun.sh/) 1.3.9 or later. Node.js 26 is the application runtime contract; Bun is the package manager, TypeScript toolchain, test runner, and bundler.

```sh
git clone https://github.com/wgtechlabs/ph-scam-db.git
cd ph-scam-db
git switch dev
bun install
bun run check
bun run serve
```

Open `http://127.0.0.1:4173` to preview the lookup site.

## Data format

Each reviewed record conforms to [`schemas/report.schema.json`](schemas/report.schema.json):

```json
{
  "number": "+639171234567",
  "categories": ["phishing-sms"],
  "status": "reported",
  "riskLevel": "medium",
  "verdict": "warn",
  "firstReportedAt": "2026-07-01",
  "lastReportedAt": "2026-07-01",
  "reportCount": 1,
  "references": [{ "type": "github-issue", "id": 123 }],
  "expiresAt": "2027-01-01"
}
```

The example is fictional and is not included in the published database.

`status` describes evidence confidence, `riskLevel` describes threat severity, and `verdict` gives consumer apps a recommended action. Use `warn` for caution UI and `block` for entries that should be filtered or hard-stopped.

## Public feeds

After `bun run build`, generated artifacts are available under `dist/data/`:

| Feed | Contents |
| --- | --- |
| `index.json` | All reviewed public records with verdict, risk, status, and aggregate metadata |
| `blocklist.json` | E.164 numbers whose verdict is `block` |
| `blocklist.txt` | Newline-separated blocked numbers for simple integrations |

## Use the data

The feeds are public, versioned, and browser-friendly. Fetch the full index when your app needs categories and review status:

```js
(async () => {
  const database = await fetch(
    'https://wgtechlabs.com/ph-scam-db/data/index.json'
  ).then((response) => response.json());

  const normalizedNumber = '+639171234567';
  const report = database.entries.find((entry) => entry.number === normalizedNumber);

  if (report) {
    console.log(report.verdict, report.riskLevel, report.status, report.categories);
  }
})();
```

For an allow/block decision, use the smaller blocked-number feed:

```js
(async () => {
  const blocklist = await fetch(
    'https://wgtechlabs.com/ph-scam-db/data/blocklist.json'
  ).then((response) => response.json());

  const isBlocked = blocklist.includes('+639171234567');
})();
```

Requests from browser apps are supported through CORS. Normalize Philippine phone input to E.164 before checking it—for example, `0917 123 4567` becomes `+639171234567`, while `(02) 8123 4567` becomes `+63281234567`. Landline input must include its area code. Cache the feed locally and refresh it periodically rather than requesting it on every lookup.

Consumers should pin a known revision, validate `schemaVersion`, refresh conservatively, and preserve the distinction between a community report and a legal determination.

## Reporting and contributing

- [Report a suspected scam number](https://github.com/wgtechlabs/ph-scam-db/issues/new?template=report-number.yml)
- [Report multiple suspected scam numbers](https://github.com/wgtechlabs/ph-scam-db/issues/new?template=bulk-report-numbers.yml)
- [Appeal or correct an entry](https://github.com/wgtechlabs/ph-scam-db/issues/new?template=appeal.yml)
- Read [CONTRIBUTING.md](CONTRIBUTING.md) before changing data or code
- Use [Clean Commit](https://github.com/wgtechlabs/clean-commit) for every commit

Pull requests should target `dev`. Releases can be promoted from `dev` to `main` after CI and moderation review.

## Project status

This is an early MVP. The initial database is intentionally empty: no number is published until it passes the moderation workflow. Before a public launch, maintainers should configure branch protection, GitHub Pages or another static host, labels/discussions, a private evidence channel, and named moderators.

## 💬 Community Discussions

Join our community discussions to get help, share ideas, and connect with other users:

- 📣 **[Announcements](https://github.com/wgtechlabs/ph-scam-db/discussions/categories/announcements)**: Official updates from the maintainer
- 📸 **[Showcase](https://github.com/wgtechlabs/ph-scam-db/discussions/categories/showcase)**: Show and tell your implementation
- 💖 **[Wall of Love](https://github.com/wgtechlabs/ph-scam-db/discussions/categories/wall-of-love)**: Share your experience with the project
- 🛟 **[Help & Support](https://github.com/wgtechlabs/ph-scam-db/discussions/categories/help-support)**: Get assistance from the community
- 🧠 **[Ideas](https://github.com/wgtechlabs/ph-scam-db/discussions/categories/ideas)**: Suggest new features and improvements

## 🛟 Help & Support

Need help? Check our [Help & Support](https://github.com/wgtechlabs/ph-scam-db/discussions/categories/help-support) discussions or [create a new issue](https://github.com/wgtechlabs/ph-scam-db/issues/new/choose).

## 🎯 Contributing

**Important**: Submit pull requests to the `dev` branch following the repository workflow.

Contributions are welcome! Your code must pass `bun run typecheck` before merging.

## 💖 Sponsors

Like this project? **Leave a star**! ⭐⭐⭐⭐⭐

There are several ways you can support this project:

- [Become a sponsor](https://github.com/sponsors/wgtechlabs) and get some perks! 💖
- [Buy us a coffee](https://buymeacoffee.com/wgtechlabs) if you love what we do! ☕

## ⭐ GitHub Star Nomination

Found this project helpful? Consider nominating me **(@warengonzaga)** for the [GitHub Star program](https://stars.github.com/nominate/)! This recognition supports ongoing development of this project and [my other open-source projects](https://github.com/warengonzaga?tab=repositories). GitHub Stars are recognized for their significant contributions to the developer community — your nomination makes a difference and encourages continued innovation!

## 📃 License

The software, source records, and generated community dataset are available under the [MIT License](LICENSE). By contributing database records, contributors agree to license those contributions under the same terms.

## 📝 Author

This project is created by **[Waren Gonzaga](https://github.com/warengonzaga)** under [WG Technology Labs](https://github.com/wgtechlabs), with the help of awesome [contributors](https://github.com/wgtechlabs/ph-scam-db/graphs/contributors).

[![contributors](https://contrib.rocks/image?repo=wgtechlabs/ph-scam-db)](https://github.com/wgtechlabs/ph-scam-db/graphs/contributors)

---

💻💖☕ by [Waren Gonzaga](https://warengonzaga.com) | [YHWH](https://www.youtube.com/watch?v=VOZbswniA-g) 🙏 - Without _Him_, none of this exists, _even me_.
