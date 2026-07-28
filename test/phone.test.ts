import { describe, expect, test } from 'bun:test';
import { maskPhoneNumber, normalizePhoneNumber } from '../scripts/lib/phone.ts';

describe('normalizePhoneNumber', () => {
  test('normalizes supported Philippine mobile formats', () => {
    expect(normalizePhoneNumber('0917 123 4567')).toBe('+639171234567');
    expect(normalizePhoneNumber('(+63) 917-123-4567')).toBe('+639171234567');
    expect(normalizePhoneNumber('0063 917 123 4567')).toBe('+639171234567');
  });

  test('rejects malformed and non-mobile numbers', () => {
    expect(normalizePhoneNumber('021234567')).toBeNull();
    expect(normalizePhoneNumber('+63917ABC4567')).toBeNull();
    expect(normalizePhoneNumber('')).toBeNull();
    expect(normalizePhoneNumber(null)).toBeNull();
  });
});

test('masks the middle of a normalized number', () => {
  expect(maskPhoneNumber('+639171234567')).toBe('+63917•••567');
});
