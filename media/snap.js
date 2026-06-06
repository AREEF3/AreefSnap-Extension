const vscode = acquireVsCodeApi();

const hlThemes = {
  'atom-one-dark': 'atom-one-dark.min.css',
  'monokai': 'monokai.min.css',
  'github': 'github.min.css'
};

const currentHlStyle = document.getElementById('hlStyle');
const baseUrl = currentHlStyle.href.substring(0, currentHlStyle.href.lastIndexOf('/') + 1);

const themes = {
  'Love':      { outer: 'linear-gradient(135deg,#ff6b6b,#ee0979)', inner: '#1a0000', hl: 'atom-one-dark' },
  'Friends':   { outer: 'linear-gradient(135deg,#f7971e,#ffd200)', inner: '#1a1000', hl: 'monokai' },
  'Ocean':     { outer: 'linear-gradient(135deg,#0093e9,#80d0c7)', inner: '#001a22', hl: 'atom-one-dark' },
  'Forest':    { outer: 'linear-gradient(135deg,#134e5e,#71b280)', inner: '#071a0e', hl: 'atom-one-dark' },
  'Candy':     { outer: 'linear-gradient(135deg,#f953c6,#b91d73)', inner: '#1a0010', hl: 'atom-one-dark' },
  'Night Owl': { outer: 'linear-gradient(135deg,#1a1a2e,#16213e)', inner: '#0f1923', hl: 'atom-one-dark' },
  'Midnight':  { outer: 'linear-gradient(135deg,#232526,#414345)', inner: '#111111', hl: 'atom-one-dark' },
  'Simple':    { outer: '#e8e8e8', inner: '#ffffff', hl: 'github' }
};

const heartPositions = [
  [3,8],[13,4],[24,9],[36,5],[50,8],[63,4],[74,9],[86,5],[94,8],
  [2,88],[11,92],[27,88],[43,93],[58,89],[71,93],[84,88],[95,91]
];

function renderHearts() {
  const c = document.getElementById('themeDeco');
  c.innerHTML = '';
  heartPositions.forEach(([l, t]) => {
    const s = document.createElement('span');
    s.innerHTML = '&#9829;';
    s.style.cssText = `position:absolute;left:${l}%;top:${t}%;color:#ff0000;font-size:22px;opacity:0.65;text-shadow:0 0 8px #ff0000;line-height:1;pointer-events:none;`;
    c.appendChild(s);
  });
}

function applyTheme(name) {
  const t = themes[name];
  if (!t) return;
  document.getElementById('snapOuter').style.background = t.outer;
  document.getElementById('snapCard').style.background = t.inner;
  document.getElementById('hlStyle').href = baseUrl + hlThemes[t.hl];
  name === 'Love' ? renderHearts() : (document.getElementById('themeDeco').innerHTML = '');
  setTimeout(() => hljs.highlightAll(), 150);
}

document.addEventListener('DOMContentLoaded', () => {
  hljs.highlightAll();
  applyTheme('Love');
});

document.getElementById('themeSelect').addEventListener('change', e => applyTheme(e.target.value));
document.getElementById('outerBg').addEventListener('input', e => {
  document.getElementById('snapOuter').style.background = e.target.value;
});
document.getElementById('innerBg').addEventListener('input', e => {
  document.getElementById('snapCard').style.background = e.target.value;
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const target = document.getElementById('snapOuter');
  const toolbar = document.querySelector('.toolbar');
  domtoimage.toPng(target, {
    scale: 2,
    filter: node => node !== toolbar
  })
    .then(url => {
      const data = url.slice(url.indexOf(',') + 1);
      vscode.postMessage({ command: 'save', data });
    })
    .catch(err => console.error('Snap failed', err));
});
