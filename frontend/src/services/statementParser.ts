/**
 * FinSight AI 4.0 — Real Statement Parser
 * Parses CSV, XLSX/XLS, and PDF bank statements client-side.
 * Extracts real transactions, detects bank name, date period, and auto-categorizes.
 */

export interface ParsedTransaction {
  date: string;
  raw_description: string;
  merchant: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  payment_method: string;
  is_recurring: boolean;
}

export interface ParsedStatement {
  bank_name: string;
  period: string;
  transactions: ParsedTransaction[];
  total_debits: number;
  total_credits: number;
  error?: string;
}

// ─── Category keyword map ────────────────────────────────────────────────────
const CATEGORY_RULES: { keywords: string[]; category: string }[] = [
  { keywords: ['salary', 'payroll', 'ctc', 'stipend', 'income credit', 'wages'], category: 'Income' },
  { keywords: ['interest credit', 'fd interest', 'dividend', 'refund', 'cashback'], category: 'Income' },
  { keywords: ['swiggy', 'zomato', 'food', 'restaurant', 'cafe', 'hotel', 'biryani', 'pizza', 'dominos', 'mcd', 'kfc', 'blinkit', 'grofer', 'bigbasket', 'zepto', 'grocery', 'bakery', 'tea', 'coffee'], category: 'Food & Dining' },
  { keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa', 'shopping', 'mall', 'retail', 'store', 'market', 'cinema', 'bookmyshow', 'inox', 'pvr'], category: 'Shopping & Entertainment' },
  { keywords: ['netflix', 'spotify', 'prime', 'hotstar', 'jiocinema', 'youtube premium', 'microsoft', 'adobe', 'icloud', 'google one', 'gym', 'fitness', 'electricity', 'bill', 'recharge', 'broadband', 'airtel', 'jio', 'bsnl', 'postpaid', 'prepaid', 'insurance', 'lic', 'subscription'], category: 'Bills & Subscriptions' },
  { keywords: ['rent', 'landlord', 'house', 'flat', 'pg', 'maintenance'], category: 'Bills & Subscriptions' },
  { keywords: ['mf', 'mutual fund', 'sip', 'investment', 'zerodha', 'groww', 'fd', 'fixed deposit', 'nps', 'ppf', 'shares', 'stock', 'demat', 'trading'], category: 'Investment & Savings' },
  { keywords: ['neft', 'rtgs', 'imps', 'transfer', 'upi transfer', 'self transfer', 'atm withdrawal', 'cash withdrawal', 'cash deposit'], category: 'Transfers' },
  { keywords: ['uber', 'ola', 'rapido', 'metro', 'train', 'irctc', 'bus', 'petrol', 'fuel', 'toll', 'parking', 'indigo', 'spicejet', 'flight', 'taxi', 'cab'], category: 'Travel & Transport' },
  { keywords: ['apollo', 'pharmacy', 'chemist', 'hospital', 'clinic', 'doctor', 'medical', 'health', 'medicine', 'diagnostic', 'lab test', 'salon', 'spa', 'beauty', 'haircut', 'barber'], category: 'Health & Personal Care' },
  { keywords: ['emi', 'loan', 'credit card', 'card payment', 'repayment'], category: 'Investment & Savings' },
];

function categorize(description: string): string {
  const desc = description.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => desc.includes(kw))) {
      return rule.category;
    }
  }
  return 'Other Expenses';
}

function detectPaymentMethod(description: string): string {
  const d = description.toLowerCase();
  if (d.includes('upi')) return 'UPI';
  if (d.includes('neft')) return 'NEFT';
  if (d.includes('rtgs')) return 'RTGS';
  if (d.includes('imps')) return 'IMPS';
  if (d.includes('atm') || d.includes('cash')) return 'Cash/ATM';
  if (d.includes('card') || d.includes('pos') || d.includes('swipe')) return 'Card';
  if (d.includes('cheque') || d.includes('chq')) return 'Cheque';
  return 'Bank Transfer';
}

function extractMerchant(description: string): string {
  const d = description.trim();
  // UPI: extract between slashes e.g. UPI/123456/AMAZON PAY/GPAY
  const upiMatch = d.match(/UPI\/\d+\/([^\/]+)/i);
  if (upiMatch) return upiMatch[1].trim();

  // Remove common prefixes
  const cleaned = d
    .replace(/^(UPI|NEFT|RTGS|IMPS|POS|ATM|CARD|CHQ|NACH|ACH|AUTO|SI)[\/\-\s]*/gi, '')
    .replace(/\/\d{6,}\//, '/')
    .replace(/\d{10,}/g, '')
    .trim();

  // Take first meaningful segment
  const parts = cleaned.split(/[\/\-|]/);
  const first = parts[0]?.trim();
  return first ? first.substring(0, 40) : d.substring(0, 40);
}

function normalizeDate(raw: string): string {
  if (!raw || !raw.trim()) return '';
  const s = raw.trim();

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // YYYY-MM-DD (already ISO)
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // MM/DD/YYYY
  const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Try JS Date parse as fallback
  try {
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  } catch {}

  return '';
}

function detectBankFromText(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('state bank') || t.includes('sbi')) return 'State Bank of India';
  if (t.includes('hdfc')) return 'HDFC Bank';
  if (t.includes('icici')) return 'ICICI Bank';
  if (t.includes('axis')) return 'Axis Bank';
  if (t.includes('kotak')) return 'Kotak Mahindra Bank';
  if (t.includes('yes bank')) return 'Yes Bank';
  if (t.includes('idfc')) return 'IDFC First Bank';
  if (t.includes('pnb') || t.includes('punjab national')) return 'Punjab National Bank';
  if (t.includes('union bank')) return 'Union Bank of India';
  if (t.includes('canara')) return 'Canara Bank';
  if (t.includes('bank of baroda') || t.includes('bob')) return 'Bank of Baroda';
  if (t.includes('federal bank')) return 'Federal Bank';
  if (t.includes('rbl')) return 'RBL Bank';
  if (t.includes('indusind')) return 'IndusInd Bank';
  if (t.includes('paytm')) return 'Paytm Payments Bank';
  return 'Unknown Bank';
}

// ─── CSV Parser ──────────────────────────────────────────────────────────────
function parseCSV(text: string): ParsedStatement {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return { bank_name: 'Unknown', period: '', transactions: [], total_debits: 0, total_credits: 0, error: 'CSV file has no data rows' };
  }

  const bankName = detectBankFromText(text.slice(0, 500));

  // Find header row (the one with most commas and has date/amount keywords)
  let headerIdx = 0;
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const lower = lines[i].toLowerCase();
    if ((lower.includes('date') || lower.includes('narration') || lower.includes('description')) &&
        (lower.includes('amount') || lower.includes('debit') || lower.includes('credit') || lower.includes('withdrawal'))) {
      headerIdx = i;
      break;
    }
  }

  // Parse with comma and tab delimiters
  const parseRow = (line: string): string[] => {
    // Handle quoted CSV fields
    const result: string[] = [];
    let current = '';
    let inQuote = false;
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if ((ch === ',' || ch === '\t') && !inQuote) { result.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[headerIdx]).map(h => h.toLowerCase().replace(/['"]/g, '').trim());

  // Identify column indices by common header names
  const findCol = (...names: string[]) => headers.findIndex(h => names.some(n => h.includes(n)));

  const dateCol = findCol('date', 'txn date', 'transaction date', 'value date', 'posting date');
  const descCol = findCol('description', 'narration', 'particulars', 'remarks', 'details', 'narrative');
  const debitCol = findCol('debit', 'withdrawal', 'dr', 'amount (dr)');
  const creditCol = findCol('credit', 'deposit', 'cr', 'amount (cr)');
  const amountCol = findCol('amount', 'transaction amount');
  const typeCol = findCol('type', 'cr/dr', 'txn type');
  const balanceCol = findCol('balance', 'running balance', 'closing balance');

  const transactions: ParsedTransaction[] = [];
  const dates: string[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = parseRow(lines[i]);
    if (cols.length < 2) continue;

    const rawDate = dateCol >= 0 ? cols[dateCol] : '';
    const date = normalizeDate(rawDate);
    if (!date) continue; // skip rows without valid date

    const desc = descCol >= 0 ? cols[descCol] : cols.slice(1).join(' ');
    if (!desc.trim()) continue;

    // Parse amount
    const cleanNum = (s: string) => parseFloat((s || '0').replace(/[₹,\s]/g, '')) || 0;

    let amount = 0;
    let type: 'credit' | 'debit' = 'debit';

    if (debitCol >= 0 && creditCol >= 0) {
      const debitAmt = cleanNum(cols[debitCol]);
      const creditAmt = cleanNum(cols[creditCol]);
      if (creditAmt > 0) { amount = creditAmt; type = 'credit'; }
      else if (debitAmt > 0) { amount = debitAmt; type = 'debit'; }
      else continue;
    } else if (amountCol >= 0) {
      amount = cleanNum(cols[amountCol]);
      if (amount === 0) continue;
      // Determine type from type column or description
      if (typeCol >= 0) {
        const t = cols[typeCol]?.toLowerCase() || '';
        type = t.includes('cr') || t.includes('credit') ? 'credit' : 'debit';
      } else {
        const d = desc.toLowerCase();
        type = (d.includes('credit') || d.includes('cr ') || d.includes('salary') || d.includes('interest credit')) ? 'credit' : 'debit';
      }
    } else continue;

    if (amount <= 0) continue;
    if (date) dates.push(date);

    transactions.push({
      date,
      raw_description: desc.substring(0, 200),
      merchant: extractMerchant(desc),
      amount: Math.round(amount * 100) / 100,
      type,
      category: categorize(desc),
      payment_method: detectPaymentMethod(desc),
      is_recurring: false,
    });
  }

  const sorted = dates.sort();
  const period = sorted.length >= 2 ? `${sorted[0]} to ${sorted[sorted.length - 1]}` : sorted[0] || '';
  const total_debits = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const total_credits = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);

  return { bank_name: bankName, period, transactions, total_debits, total_credits };
}

// ─── XLSX / Excel Parser ─────────────────────────────────────────────────────
async function parseExcel(file: File): Promise<ParsedStatement> {
  try {
    const XLSX = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

    // Use the first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to CSV string and reuse CSV parser
    const csv = XLSX.utils.sheet_to_csv(sheet);
    const result = parseCSV(csv);
    result.bank_name = detectBankFromText(file.name + ' ' + sheetName) || result.bank_name;
    return result;
  } catch (err: any) {
    return { bank_name: 'Unknown', period: '', transactions: [], total_debits: 0, total_credits: 0, error: `Excel parse failed: ${err?.message}` };
  }
}

// ─── PDF Parser using pdfjs-dist ─────────────────────────────────────────────
async function parsePDF(file: File, password?: string): Promise<ParsedStatement> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set the worker source using CDN for compatibility
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: buffer, password: password || '' });

    let pdfDoc: any;
    try {
      pdfDoc = await loadingTask.promise;
    } catch (err: any) {
      if (err?.name === 'PasswordException' || err?.code === 1 || err?.code === 2) {
        if (!password) throw new Error('PASSWORD_REQUIRED');
        throw new Error('INVALID_PASSWORD');
      }
      throw err;
    }

    let fullText = '';
    for (let pageNum = 1; pageNum <= Math.min(pdfDoc.numPages, 30); pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    const bankName = detectBankFromText(fullText.slice(0, 1000));

    // Try to parse PDF text as structured data
    // Strategy: look for lines that match date patterns followed by amounts
    const txs: ParsedTransaction[] = [];
    const dates: string[] = [];

    const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 5);

    // Regex to find lines with dates + amounts
    const datePattern = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/;
    const amountPattern = /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;

    for (const line of lines) {
      const dateMatch = line.match(datePattern);
      if (!dateMatch) continue;

      const date = normalizeDate(dateMatch[1]);
      if (!date) continue;

      const amounts = Array.from(line.matchAll(amountPattern))
        .map(m => parseFloat(m[1].replace(/,/g, '')))
        .filter(a => a > 0 && a < 10000000);

      if (amounts.length === 0) continue;

      // Remove date from line for description
      const desc = line.replace(dateMatch[0], '').replace(/\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g, '').trim();
      if (desc.length < 3) continue;

      // Use largest amount or last amount
      const amount = amounts[amounts.length - 1];

      // Determine credit vs debit by position (last amount in balance sheet lines = balance, second to last = tx)
      const txAmount = amounts.length >= 2 ? amounts[amounts.length - 2] : amounts[0];
      if (txAmount <= 0) continue;

      const lower = line.toLowerCase();
      let type: 'credit' | 'debit' = 'debit';
      if (lower.includes('cr') || lower.includes('credit') || lower.includes('deposit') || lower.includes('salary')) {
        type = 'credit';
      }

      dates.push(date);
      txs.push({
        date,
        raw_description: desc.substring(0, 200),
        merchant: extractMerchant(desc),
        amount: txAmount,
        type,
        category: categorize(desc),
        payment_method: detectPaymentMethod(desc),
        is_recurring: false,
      });
    }

    if (txs.length === 0) {
      // Fallback: if PDF text extraction gave us nothing useful, return a helpful error
      return {
        bank_name: bankName,
        period: '',
        transactions: [],
        total_debits: 0,
        total_credits: 0,
        error: 'Could not extract structured transactions from this PDF. Try downloading your statement as CSV from your bank portal instead.'
      };
    }

    const sorted = dates.sort();
    const period = sorted.length >= 2 ? `${sorted[0]} to ${sorted[sorted.length - 1]}` : sorted[0] || '';
    const total_debits = txs.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    const total_credits = txs.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);

    return { bank_name: bankName, period, transactions: txs, total_debits, total_credits };
  } catch (err: any) {
    if (err?.message === 'PASSWORD_REQUIRED' || err?.message === 'INVALID_PASSWORD') throw err;
    return {
      bank_name: 'Unknown',
      period: '',
      transactions: [],
      total_debits: 0,
      total_credits: 0,
      error: `PDF parse error: ${err?.message || 'Unknown error'}`
    };
  }
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────
export async function parseStatement(file: File, password?: string): Promise<ParsedStatement> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.csv')) {
    const text = await file.text();
    return parseCSV(text);
  }

  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return parseExcel(file);
  }

  if (name.endsWith('.pdf')) {
    return parsePDF(file, password);
  }

  // Unsupported format
  return {
    bank_name: 'Unknown',
    period: '',
    transactions: [],
    total_debits: 0,
    total_credits: 0,
    error: `Unsupported file format: ${file.name.split('.').pop()?.toUpperCase()}. Please upload PDF, CSV, or Excel.`
  };
}
