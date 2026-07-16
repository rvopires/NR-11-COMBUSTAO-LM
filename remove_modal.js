const fs = require('fs');
let css = fs.readFileSync('shared.css', 'utf8');
css = css.replace(/\/\* ════════════════════════════════════════\r?\n   TUTORIAL OBRIGATÓRIO — Modal de boas-vindas\r?\n   ════════════════════════════════════════ \*\/[\s\S]*?(?=\/\* ── Modal de Libras ── \*\/)/g, '');
fs.writeFileSync('shared.css', css);

let js = fs.readFileSync('shared.js', 'utf8');
js = js.replace(/\/\/ ID do vídeo no Vimeo \(PLACEHOLDER[\s\S]*?function init\(\) \{[\s\S]*?addReplayButton\(\);\r?\n    \}/, 
`function isIndexPage() {
        return !!(window.MODULE_NAV && window.MODULE_NAV.id === 'index');
    }

    function addReplayButton() {
        const startBtn = document.querySelector('.btn-start');
        if (!startBtn || startBtn.parentElement.querySelector('.tutorial-replay')) return;
        const replay = document.createElement('button');
        replay.type = 'button';
        replay.className = 'tutorial-replay';
        replay.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg> Ver tutorial novamente';
        replay.onclick = function () {
            const staticModal = document.getElementById('tutorialModal');
            if (staticModal) {
                staticModal.classList.add('active');
            }
        };
        startBtn.insertAdjacentElement('afterend', replay);
    }

    function init() {
        if (!isIndexPage()) return;
        addReplayButton();
    }`);
fs.writeFileSync('shared.js', js);
console.log("Replacement complete.");
