import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
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
const blocked = entries.filter((entry) => entry.verdict === 'block');
const publicIndex = {
  schemaVersion: 2,
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

const markupPath = path.join(root, 'dist/index.html');
const markup = await readFile(markupPath, 'utf8');
const stylesheet = await readFile(path.join(root, 'dist/styles.css'), 'utf8');
const stylesheetVersion = createHash('sha256').update(stylesheet).digest('hex').slice(0, 8);
const stylesheetLink = /href="styles\.css(?:\?[^"]*)?"/;
if (!stylesheetLink.test(markup)) throw new Error('dist/index.html has no styles.css link to version');
await writeFile(markupPath, markup.replace(new RegExp(stylesheetLink, 'g'), `href="styles.css?v=${stylesheetVersion}"`));

await writeFile(path.join(root, 'dist/data/index.json'), `${JSON.stringify(publicIndex, null, 2)}\n`);
await writeFile(path.join(root, 'dist/data/blocklist.json'), `${JSON.stringify(blocked.map((entry) => entry.number), null, 2)}\n`);
await writeFile(path.join(root, 'dist/data/blocklist.txt'), blocked.length ? `${blocked.map((entry) => entry.number).join('\n')}\n` : '');

console.log(`Built site and feeds from ${entries.length} report${entries.length === 1 ? '' : 's'}.`);
