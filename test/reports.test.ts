import { expect, test } from 'bun:test';
import { type ScamReport, validateSemantics } from '../scripts/lib/reports.ts';

const report: ScamReport = {
  number: '+639171234567',
  categories: ['spam'],
  status: 'reported',
  firstReportedAt: '2025-01-01',
  lastReportedAt: '2025-01-02',
  reportCount: 1,
  references: [{ type: 'github-issue', id: 1 }]
};

test('accepts coherent report dates and unique numbers', () => {
  expect(validateSemantics([{ file: 'one.json', value: report }])).toEqual([]);
});

test('detects duplicate numbers and reversed dates', () => {
  const reversed: ScamReport = { ...report, firstReportedAt: '2025-02-01' };
  const errors = validateSemantics([
    { file: 'one.json', value: report },
    { file: 'two.json', value: reversed }
  ]);
  expect(errors).toHaveLength(2);
});
