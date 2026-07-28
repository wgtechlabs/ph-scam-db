import path from 'node:path';
import { createReportValidator, loadReports, validateSemantics } from './lib/reports.ts';

const root = path.resolve(import.meta.dir, '..');
const validate = await createReportValidator(root);
const reports = await loadReports(root);
const errors: string[] = [];

for (const report of reports) {
  if (!validate(report.value)) {
    for (const error of validate.errors ?? []) {
      errors.push(`${report.file}${error.instancePath}: ${error.message ?? 'invalid value'}`);
    }
  }
}
errors.push(...validateSemantics(reports));

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${reports.length} report${reports.length === 1 ? '' : 's'}.`);
}
