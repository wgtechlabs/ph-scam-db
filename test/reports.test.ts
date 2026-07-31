import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'bun:test';
import { createReportValidator, type ScamReport, validateSemantics } from '../scripts/lib/reports.ts';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const report: ScamReport = {
  number: '+639171234567',
  categories: ['spam'],
  status: 'reported',
  riskLevel: 'low',
  verdict: 'warn',
  firstReportedAt: '2025-01-01',
  lastReportedAt: '2025-01-02',
  reportCount: 1,
  references: [{ type: 'github-issue', id: 1 }]
};

test('accepts coherent report dates and unique numbers', () => {
  expect(validateSemantics([{ file: 'one.json', value: report }])).toEqual([]);
});

test('accepts a Philippine landline report', async () => {
  const validate = await createReportValidator(repositoryRoot);
  expect(validate({ ...report, number: '+63281234567' })).toBe(true);
});

test('detects duplicate numbers and reversed dates', () => {
  const reversed: ScamReport = { ...report, firstReportedAt: '2025-02-01' };
  const errors = validateSemantics([
    { file: 'one.json', value: report },
    { file: 'two.json', value: reversed }
  ]);
  expect(errors).toHaveLength(2);
});

test('requires confirmed status for block verdicts', () => {
  const errors = validateSemantics([
    { file: 'one.json', value: { ...report, riskLevel: 'high', verdict: 'block' } }
  ]);
  expect(errors).toEqual(['one.json: block verdict requires confirmed status']);
});
