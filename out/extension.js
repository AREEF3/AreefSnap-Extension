"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
function activate(context) {
    const command = vscode.commands.registerCommand('areefsnap.snap', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('AreefSnap: No active editor found!');
            return;
        }
        const selection = editor.selection;
        const code = editor.document.getText(selection.isEmpty ? undefined : selection);
        const language = editor.document.languageId;
        const panel = vscode.window.createWebviewPanel('areefsnap', 'AreefSnap', vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
        });
        const mp = (file) => panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', file)));
        panel.webview.html = getWebviewContent(code, language, mp, panel.webview.cspSource);
        panel.webview.onDidReceiveMessage(async (msg) => {
            if (msg.command === 'save') {
                const uri = await vscode.window.showSaveDialog({
                    defaultUri: vscode.Uri.file(path.join(require('os').homedir(), 'areefsnap.png')),
                    filters: { Images: ['png'] }
                });
                if (uri) {
                    const base64 = msg.data;
                    fs.writeFileSync(uri.fsPath, Buffer.from(base64, 'base64'));
                    vscode.window.showInformationMessage(`AreefSnap: Saved to ${uri.fsPath}`);
                }
            }
        });
    });
    context.subscriptions.push(command);
}
function getWebviewContent(code, language, mp, cspSource) {
    const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const lineCount = code.split('\n').length;
    const lineNums = Array.from({ length: lineCount }, (_, i) => `<div class="ln">${i + 1}</div>`).join('');
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob: ${cspSource}; script-src ${cspSource} 'nonce-areefsnap' 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline' ${cspSource};"/>
  <title>AreefSnap</title>
  <link rel="stylesheet" href="${mp('style.css')}"/>
  <link id="hlStyle" rel="stylesheet" href="${mp('atom-one-dark.min.css')}"/>
  <script nonce="areefsnap" src="${mp('highlight.min.js')}"></script>
  <script nonce="areefsnap" src="${mp('dom-to-image-more.min.js')}"></script>
</head>
<body>
  <div class="toolbar">
    <label>Theme:
      <select id="themeSelect">
        <option>Love</option>
        <option>Friends</option>
        <option>Ocean</option>
        <option>Forest</option>
        <option>Candy</option>
        <option>Night Owl</option>
        <option>Midnight</option>
        <option>Simple</option>
      </select>
    </label>
    <label>Outer BG: <input type="color" id="outerBg" value="#ff6b6b"/></label>
    <label>Inner BG: <input type="color" id="innerBg" value="#1a0000"/></label>
    <button id="saveBtn">&#128248; Save PNG</button>
  </div>
  <div class="canvas-wrapper">
    <div class="snap-outer" id="snapOuter">
      <div class="theme-deco" id="themeDeco"></div>
      <div class="snap-card" id="snapCard">
        <div class="window-chrome">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
        </div>
        <div class="code-wrap">
          <div class="line-nums">${lineNums}</div>
          <pre><code id="codeBlock" class="language-${language}">${escaped}</code></pre>
        </div>
      </div>
    </div>
  </div>
  <script nonce="areefsnap" src="${mp('snap.js')}"></script>
</body>
</html>`;
}
function deactivate() { }
