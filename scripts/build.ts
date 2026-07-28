import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createReportValidator, loadReports, validateSemantics } from './lib/reports.ts';

const root = path.resolve(import.meta.dir, '..');
const reports = await loadReports(root);
const validate = await createReportValidator(root);

for (const report of reports) {
  if (!validate(report.value)) throw new Error(`${report.file} is invalid; run bun run validate`);
}
const semanticErrors = validateSemantics(reports);
if (semanticErrors.length) throw new Error(semanticErrors.join('\n'));

const entries = reports.map(({ value }) => value).sort((a, b) => a.number.localeCompare(b.number));
const confirmed = entries.filter((entry) => entry.status === 'confirmed');
const publicIndex = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  count: entries.length,
  entries
};

await rm(path.join(root, 'dist'), { recursive: true, force: true });
await mkdir(path.join(root, 'dist/data'), { recursive: true });
await cp(path.join(root, 'site'), path.join(root, 'dist'), { recursive: true });
await rm(path.join(root, 'dist/app.ts'));

const bundle = await Bun.build({
  entrypoints: [path.join(root, 'site/app.ts')],
  outdir: path.join(root, 'dist'),
  naming: 'app.js',
  minify: true,
  target: 'browser'
});
if (!bundle.success) throw new AggregateError(bundle.logs, 'Browser bundle failed');

await writeFile(path.join(root, 'dist/data/index.json'), `${JSON.stringify(publicIndex, null, 2)}\n`);
await writeFile(path.join(root, 'dist/data/blocklist.json'), `${JSON.stringify(confirmed.map((entry) => entry.number), null, 2)}\n`);
await writeFile(path.join(root, 'dist/data/blocklist.txt'), confirmed.length ? `${confirmed.map((entry) => entry.number).join('\n')}\n` : '');

console.log(`Built site and feeds from ${entries.length} report${entries.length === 1 ? '' : 's'}.`);
