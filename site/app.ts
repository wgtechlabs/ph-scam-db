type ReportStatus = 'reported' | 'watchlist' | 'confirmed';
type RiskLevel = 'low' | 'medium' | 'high';
type Verdict = 'warn' | 'block';

interface ScamReport {
  number: string;
  categories: string[];
  status: ReportStatus;
  riskLevel: RiskLevel;
  verdict: Verdict;
  lastReportedAt: string;
  reportCount: number;
}

interface PublicDatabase {
  entries: ScamReport[];
}

const form = getElement<HTMLFormElement>('lookup-form');
const input = getElement<HTMLInputElement>('phone');
const result = getElement<HTMLElement>('result');
let database: PublicDatabase | undefined;

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}`);
  return element as T;
}

function normalizePhoneNumber(raw: string): string | null {
  let value = raw.trim().replace(/[\s().-]/g, '');
  if (value.startsWith('0063')) value = `+63${value.slice(4)}`;
  if (value.startsWith('63')) value = `+${value}`;
  if (value.startsWith('0')) value = `+63${value.slice(1)}`;
  return /^\+63(?:9\d{9}|[2-8]\d{8})$/.test(value) ? value : null;
}

function show(kind: string, title: string, body: HTMLParagraphElement[]): void {
  result.dataset.kind = kind;
  result.replaceChildren();
  const heading = document.createElement('h2');
  heading.textContent = title;
  result.append(heading, ...body);
  result.hidden = false;
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function paragraph(text: string, className?: string): HTMLParagraphElement {
  const element = document.createElement('p');
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const number = normalizePhoneNumber(input.value);
  if (!number) {
    show('invalid', 'Check the number', [paragraph('Enter a Philippine mobile or landline number, including the area code for landlines.')]);
    return;
  }

  try {
    let currentDatabase = database;
    if (!currentDatabase) {
      currentDatabase = await fetch('data/index.json', { cache: 'no-cache' }).then(async (response) => {
        if (!response.ok) throw new Error('Database unavailable');
        return await response.json() as PublicDatabase;
      });
      database = currentDatabase;
    }
    if (!currentDatabase) throw new Error('Database unavailable');
    const entry = currentDatabase.entries.find((candidate) => candidate.number === number);
    if (!entry) {
      show('clear', 'No reports found', [
        paragraph('This number is not in the current community database.'),
        paragraph('This does not guarantee the number is safe. Stay cautious with unexpected requests for money, passwords, or one-time codes.')
      ]);
      return;
    }

    show(entry.verdict, 'This number has community reports', [
      paragraph(`Verdict: ${entry.verdict}`, 'status'),
      paragraph(`Risk: ${entry.riskLevel}`),
      paragraph(`Status: ${entry.status}`, 'status'),
      paragraph(`Reports: ${entry.reportCount} · Last observed: ${entry.lastReportedAt}`),
      paragraph(`Categories: ${entry.categories.join(', ').replaceAll('-', ' ')}`)
    ]);
  } catch {
    show('invalid', 'Database unavailable', [paragraph('Please try again later or check the project repository for status updates.')]);
  }
});
