const E164_PH_PHONE = /^\+63(?:9\d{9}|[2-8]\d{8})$/;

export function normalizePhoneNumber(input: unknown): string | null {
  if (typeof input !== 'string') return null;

  let value = input.trim().replace(/[\s().-]/g, '');
  if (value.startsWith('0063')) value = `+63${value.slice(4)}`;
  if (value.startsWith('63')) value = `+${value}`;
  if (value.startsWith('0')) value = `+63${value.slice(1)}`;

  return E164_PH_PHONE.test(value) ? value : null;
}

export function maskPhoneNumber(number: string): string {
  return `${number.slice(0, 6)}•••${number.slice(-3)}`;
}
