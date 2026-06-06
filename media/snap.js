const vscode = acquireVsCodeApi();

// Syntax highlight on load
document.addEventListener('DOMContentLoaded', () => {
  hljs.highlightAll();
});

// Theme switcher
document.getElementById('themeSelect').addEventListener('change', (e) => {
  const theme = e.target.value;
  const link = document.querySelector('link[rel="stylesheet"][href*="highlight"]');
  if (link) {
    link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${theme}.min.css`;
  }
  setTimeout(() => hljs.highlightAll(), 100);
});

// Background color picker
document.getElementById('bgColor').addEventListener('input', (e) => {
  document.getElementById('snapCard').style.background = e.target.value;
});

// Save as PNG
document.getElementById('saveBtn').addEventListener('click', () => {
  const card = document.getElementById('snapCard');
  html2canvas(card, {
    backgroundColor: null,
    scale: 2,
    useCORS: true
  }).then((canvas) => {
    const data = canvas.toDataURL('image/png');
    vscode.postMessage({ command: 'save', data });
  });
});
