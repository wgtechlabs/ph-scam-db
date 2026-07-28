import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import Ajv2020, { type ValidateFunction } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

export const statuses = ['reported', 'watchlist', 'confirmed'] as const;
export type ReportStatus = (typeof statuses)[number];

export interface ReportReference {
  type: 'github-issue' | 'government-advisory' | 'news-report' | 'maintainer-review';
  id: number | string;
}

export interface ScamReport {
  number: string;
  categories: string[];
  status: ReportStatus;
  firstReportedAt: string;
  lastReportedAt: string;
  reportCount: number;
  references: ReportReference[];
  notes?: string;
  expiresAt?: string;
}

export interface ReportFile {
  file: string;
  value: ScamReport;
}

export async function createReportValidator(root: string): Promise<ValidateFunction<ScamReport>> {
  const schema = JSON.parse(await readFile(path.join(root, 'schemas/report.schema.json'), 'utf8')) as object;
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return ajv.compile<ScamReport>(schema);
}

export async function loadReports(root: string): Promise<ReportFile[]> {
  const directory = path.join(root, 'data/reports');
  const files = (await walk(directory)).filter((file) => file.endsWith('.json')).sort();
  const reports: ReportFile[] = [];

  for (const file of files) {
    reports.push({
      file: path.relative(root, file),
      value: JSON.parse(await readFile(file, 'utf8')) as ScamReport
    });
  }

  return reports;
}

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  }));
  return nested.flat();
}

export function validateSemantics(reports: ReportFile[]): string[] {
  const errors: string[] = [];
  const numbers = new Set<string>();
  const today = new Date().toISOString().slice(0, 10);

  for (const { file, value } of reports) {
    if (numbers.has(value.number)) errors.push(`${file}: duplicate number ${value.number}`);
    numbers.add(value.number);
    if (value.firstReportedAt > value.lastReportedAt) errors.push(`${file}: first report is after last report`);
    if (value.lastReportedAt > today) errors.push(`${file}: last report is in the future`);
    if (value.expiresAt && value.expiresAt <= value.lastReportedAt) errors.push(`${file}: expiry must follow last report`);
  }

  return errors;
}
