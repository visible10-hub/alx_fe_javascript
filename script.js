/* Dynamic Quote Generator
   - localStorage persistence
   - sessionStorage for last shown quote
   - import/export JSON
*/

const LS_KEY = 'dqg_quotes_v1'; // localStorage key
const SESSION_LAST = 'dqg_last_quote_index'; // sessionStorage key

// Default starter quotes (used only if localStorage is empty)
const DEFAULT_QUOTES = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Your limitation—it’s only your imagination.", category: "Inspiration" },
  { text: "Push yourself, because no one else is going to do it for you.", category: "Self-Growth" },
  { text: "Dream bigger. Do bigger.", category: "Ambition" }
];

// ---- DOM references ----
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const categoryFilter = document.getElementById('categoryFilter');
const exportBtn = document.getElementById('exportBtn');
const importFileInput = document.getElementById('importFile');
const importBtn = document.getElementById('importBtn');
const clearStorageBtn = document.getElementById('clearStorage');

let quotes = []; // will be populated from localStorage or defaults

// --- Storage helpers ---
function saveQuotesToLocalStorage() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(quotes));
  } catch (e) {
    console.error('Failed to save quotes to localStorage', e);
  }
}

function loadQuotesFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch (e) {
    console.warn('Could not parse localStorage quotes, resetting.', e);
    return null;
  }
}

// --- UI helpers ---
function refreshCategoryOptions() {
  const categories = Array.from(new Set(quotes.map(q => q.category))).sort();
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
}

function displayQuoteObject(qObj) {
  quoteDisplay.innerHTML = `
    <div style="font-size:1.05rem;">"${escapeHtml(qObj.text)}"</div>
    <div style="margin-top:8px; font-style:italic; color:#666;">— ${escapeHtml(qObj.category)}</div>
  `;
}

// small helper to avoid accidental HTML injection
function escapeHtml(str = '') {
  return String(str).replace(/[&<>"'`=\/]/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;', '`':'&#96;','=':'&#61;','/':'&#47;'
  }[s]));
}

// --- showing quotes ---
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const pool = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);

  if (pool.length === 0) {
    quoteDisplay.textContent = "No quotes available for the selected category.";
    return;
  }

  // pick random index in the filtered pool but we must map back to global index for session storage
  const randomPoolIndex = Math.floor(Math.random() * pool.length);
  const chosenQuote = pool[randomPoolIndex];

  // find global index (first match)
  const globalIndex = quotes.findIndex(q => q.text === chosenQuote.text && q.category === chosenQuote.category);

  // display
  displayQuoteObject(chosenQuote);

  // save last shown index in sessionStorage (session-only)
  try {
    sessionStorage.setItem(SESSION_LAST, String(globalIndex));
  } catch (e) {
    console.warn('sessionStorage not available', e);
  }
}

function showLastViewedFromSession() {
  try {
    const idx = Number(sessionStorage.getItem(SESSION_LAST));
    if (!Number.isFinite(idx) || idx < 0 || idx >= quotes.length) return;
    displayQuoteObject(quotes[idx]);
  } catch (e) {
    // ignore
  }
}

// --- adding quotes ---
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    alert('Please enter both quote text and category.');
    return;
  }

  // push to array
  quotes.push({ text, category });

  // clear inputs
  newQuoteText.value = '';
  newQuoteCategory.value = '';

  // update UI and storage
  refreshCategoryOptions();
  saveQuotesToLocalStorage();

  // show newly added quote
  displayQuoteObject({ text, category });
  alert('Quote added and saved!');
}

// --- export JSON ---
function exportQuotesAsJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// --- import JSON ---
function importFromJsonFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (!Array.isArray(parsed)) throw new Error('Imported JSON must be an array');
      // validation: each item should have text and category
      const valid = parsed.every(item =>
        item && typeof item.text === 'string' && typeof item.category === 'string'
      );
      if (!valid) throw new Error('Each quote must be an object with "text" and "category" strings');

      // Option: merge while avoiding exact duplicates
      let added = 0;
      parsed.forEach(item => {
        const exists = quotes.some(q => q.text === item.text && q.category === item.category);
        if (!exists) {
          quotes.push({ text: item.text, category: item.category });
          added++;
        }
      });

      saveQuotesToLocalStorage();
      refreshCategoryOptions();
      alert(`Imported ${parsed.length} quotes. ${added} new quotes added (duplicates skipped).`);
    } catch (err) {
      console.error(err);
      alert('Failed to import JSON: ' + (err.message || 'invalid file'));
    }
  };
  reader.onerror = function () {
    alert('Failed to read file.');
  };
  reader.readAsText(file);
}

// --- clear saved quotes (localStorage) ---
function clearSavedQuotes() {
  if (!confirm('This will remove all saved quotes and restore defaults. Continue?')) return;
  localStorage.removeItem(LS_KEY);
  quotes = DEFAULT_QUOTES.slice();
  saveQuotesToLocalStorage();
  refreshCategoryOptions();
  quoteDisplay.textContent = 'Quotes cleared — defaults restored.';
}

// --- initialization ---
function init() {
  // load from localStorage, fallback to defaults
  const saved = loadQuotesFromLocalStorage();
  if (Array.isArray(saved) && saved.length > 0) {
    quotes = saved;
  } else {
    quotes = DEFAULT_QUOTES.slice();
    saveQuotesToLocalStorage();
  }

  // wire up UI
  refreshCategoryOptions();
  newQuoteBtn.addEventListener('click', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);
  exportBtn.addEventListener('click', exportQuotesAsJson);
  importFileInput.addEventListener('change', (e) => importFromJsonFile(e.target.files[0]));
  importBtn.addEventListener('click', () => importFileInput.click());
  clearStorageBtn.addEventListener('click', clearSavedQuotes);
  categoryFilter.addEventListener('change', showRandomQuote);

  // show last viewed quote from session if present
  showLastViewedFromSession();
}

// run init when DOM is ready
document.addEventListener('DOMContentLoaded', init);
