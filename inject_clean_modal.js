const fs = require('fs');
const path = 'c:\\Users\\Rhayanne Pires\\Downloads\\NR 11 - PATOLADA SEM SIMULAÇÃO\\index.html';
let content = fs.readFileSync(path, 'utf8');

const injection = `
        <div class="img-modal-overlay" id="tutorialModal" onclick="closeTutorialModal(event)">
            <div class="img-modal-content" onclick="event.stopPropagation()" style="width: 90vw; max-width: 900px; padding: 0;">
                <button class="img-modal-close" onclick="closeTutorialModal()">×</button>
                
                <div style="padding:56.25% 0 0 0;position:relative; border-radius: 12px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6); overflow: hidden; background: #000;"><iframe src="https://player.vimeo.com/video/1194825560?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="TUTORIAL TREINAMENTOS - PARA TODOS OS TREINAMENTOS"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>

            </div>
        </div>

    </div>

    <script>
        function closeTutorialModal(e) {
            const modal = document.getElementById('tutorialModal');
            if(modal) {
                modal.classList.remove('active');
                const iframe = modal.querySelector('iframe');
                if(iframe) {
                    const src = iframe.src;
                    iframe.src = src; 
                }
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            const tutorialSeen = localStorage.getItem('tutorial_nr11_seen_v2');
            if (!tutorialSeen) {
                setTimeout(() => {
                    const modal = document.getElementById('tutorialModal');
                    if (modal) {
                        modal.classList.add('active');
                        localStorage.setItem('tutorial_nr11_seen_v2', 'true');
                    }
                }, 800); 
            }
        });
    </script>
`;

const oldModalRegex = /\s*<div class="img-modal-overlay" id="tutorialModal"[\s\S]*?<\/script>\s*/;
content = content.replace(oldModalRegex, '\n');

content = content.replace('    </div>\r\n\r\n    <script src="shared.js"></script>', injection + '\r\n    <script src="shared.js"></script>');
if(content.indexOf('tutorialModal') === -1) {
    content = content.replace('    </div>\n\n    <script src="shared.js"></script>', injection + '\n    <script src="shared.js"></script>');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Tutorial modal updated cleanly.');
