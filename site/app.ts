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

const networkByPrefix: Record<string, string> = {
  '917': 'Globe',
  '919': 'Smart',
  '933': 'Smart / Sun Cellular',
  '947': 'Smart',
  '968': 'Smart / TNT'
};

const form = getElement<HTMLFormElement>('lookup-form');
const input = getElement<HTMLInputElement>('phone');
const result = getElement<HTMLElement>('result');
const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
let database: PublicDatabase | undefined;

if (!button) throw new Error('Missing lookup button');

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error('Missing #' + id);
  return element as T;
}

function normalizePhoneNumber(raw: string): string | null {
  let value = raw.trim().replace(/[\s().-]/g, '');
  if (value.startsWith('0063')) value = '+63' + value.slice(4);
  if (value.startsWith('63')) value = '+' + value;
  if (value.startsWith('0')) value = '+63' + value.slice(1);
  return /^\+63(?:9\d{9}|[2-8]\d{8})$/.test(value) ? value : null;
}

function show(kind: string, title: string, body: HTMLElement[], scroll = true): void {
  result.dataset.kind = kind;
  result.replaceChildren();
  const heading = document.createElement('h2');
  heading.textContent = title;
  result.append(heading, ...body);
  result.hidden = false;
  if (scroll) result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function paragraph(text: string, className?: string): HTMLParagraphElement {
  const element = document.createElement('p');
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function getNetwork(number: string): string {
  if (number.startsWith('+63') && number[3] === '9') {
    return networkByPrefix[number.slice(3, 6)] ?? 'Unknown mobile network';
  }
  return 'Philippine geographic landline';
}

function updateSearchUrl(number: string | null): void {
  const url = new URL(window.location.href);
  if (number) url.searchParams.set('number', number);
  else url.searchParams.delete('number');
  window.history.replaceState(null, '', url.pathname + url.search + url.hash);
}

function shareButton(): HTMLButtonElement {
  const share = document.createElement('button');
  share.type = 'button';
  share.className = 'result-share';
  share.textContent = 'Copy share link';
  share.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      share.textContent = 'Link copied';
    } catch {
      share.textContent = 'Copy failed';
    }
    window.setTimeout(() => { share.textContent = 'Copy share link'; }, 1800);
  });
  return share;
}

async function search(rawNumber: string, scroll = true): Promise<void> {
  const number = normalizePhoneNumber(rawNumber);
  if (!number) {
    updateSearchUrl(null);
    input.setAttribute('aria-invalid', 'true');
    show('invalid', 'Check the number', [paragraph('Enter a Philippine mobile or landline number, including the area code for landlines.')], scroll);
    input.focus();
    return;
  }

  input.removeAttribute('aria-invalid');
  updateSearchUrl(number);
  button.disabled = true;
  button.textContent = 'Checking...';
  form.setAttribute('aria-busy', 'true');

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
        paragraph('Likely network: ' + getNetwork(number)),
        paragraph('This does not guarantee the number is safe. Stay cautious with unexpected requests for money, passwords, or one-time codes.'),
        shareButton()
      ], scroll);
      return;
    }

    show(entry.verdict, 'This number has community reports', [
      paragraph('Verdict: ' + entry.verdict, 'status'),
      paragraph('Risk: ' + entry.riskLevel),
      paragraph('Status: ' + entry.status, 'status'),
      paragraph('Reports: ' + entry.reportCount + ' | Last observed: ' + entry.lastReportedAt),
      paragraph('Categories: ' + entry.categories.join(', ').replaceAll('-', ' ')),
      paragraph('Likely network: ' + getNetwork(number) + ' (based on number prefix)'),
      shareButton()
    ], scroll);
  } catch {
    show('invalid', 'Database unavailable', [paragraph('Please try again later or check the project repository for status updates.')], scroll);
  } finally {
    button.disabled = false;
    button.textContent = 'Check number';
    form.removeAttribute('aria-busy');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await search(input.value);
});

input.addEventListener('input', () => input.removeAttribute('aria-invalid'));

const sharedNumber = new URLSearchParams(window.location.search).get('number');
if (sharedNumber) {
  input.value = sharedNumber;
  void search(sharedNumber, false);
}
