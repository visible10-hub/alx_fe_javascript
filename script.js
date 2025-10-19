const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
  { text: "Your time is limited, don’t waste it living someone else’s life.", category: "Life" }
];

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = `
    <p>"${quotes[randomIndex].text}"</p>
    <small>— ${quotes[randomIndex].category}</small>
  `;
}

function addQuote() {
  const newText = document.getElementById('newQuoteText').value.trim();
  const newCategory = document.getElementById('newQuoteCategory').value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    alert('Quote added successfully!');
  } else {
    alert('Please enter both quote and category!');
  }
}

document.getElementById('newQuote').addEventListener('click', showRandomQuote);
