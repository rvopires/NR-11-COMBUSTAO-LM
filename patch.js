const fs = require('fs');
const file1 = 'c:/Users/Rhayanne Pires/Downloads/NR 11 - PATOLADA - REVISÃO/NR 11 - PATOLADA - REVISÃO/modulo-6.html';
const file2 = 'c:/Users/Rhayanne Pires/Downloads/NR 11 - PATOLADA SEM SIMULAÇÃO/modulo-6.html';

const newSlide = `                        if (typeof updateNextButton === 'function') updateNextButton();
                    }
                </script>
            </div>

            <div class="slide" id="s-mod6-comp-preventiva">
                <style>
                    #s-mod6-comp-preventiva .comp-cards-grid {
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                        width: 100%;
                        align-items: center;
                    }
                    #s-mod6-comp-preventiva .comp-card-modern {
                        width: 100%;
                        background: linear-gradient(145deg, rgba(20, 25, 40, 0.95), rgba(10, 15, 25, 0.98));
                        border: 1px solid rgba(255, 255, 255, 0.06);
                        border-radius: 12px;
                        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), inset 0 2px 10px rgba(255, 255, 255, 0.03);
                        overflow: hidden;
                        transition: all 0.4s cubic-bezier(0.18, 1, 0.26, 1) !important;
                        cursor: pointer !important;
                    }
                    #s-mod6-comp-preventiva .comp-card-modern:nth-child(1) {
                        border-top: 4px solid #ff4757;
                    }
                    #s-mod6-comp-preventiva .comp-card-modern:nth-child(2) {
                        border-top: 4px solid #2ecc71;
                    }
                    #s-mod6-comp-preventiva .comp-card-modern:nth-child(1):hover {
                        transform: translateY(-5px);
                        box-shadow: 0 20px 40px rgba(255, 71, 87, 0.2), inset 0 2px 15px rgba(255, 71, 87, 0.08) !important;
                        border-color: rgba(255, 71, 87, 0.3) !important;
                    }
                    #s-mod6-comp-preventiva .comp-card-modern:nth-child(2):hover {
                        transform: translateY(-5px);
                        box-shadow: 0 20px 40px rgba(46, 204, 113, 0.2), inset 0 2px 15px rgba(46, 204, 113, 0.08) !important;
                        border-color: rgba(46, 204, 113, 0.3) !important;
                    }
                    #s-mod6-comp-preventiva .comp-card-modern:nth-child(1).req-done {
                        background: linear-gradient(145deg, rgba(255, 71, 87, 0.12), rgba(15, 20, 35, 0.95)) !important;
                        box-shadow: 0 15px 40px rgba(255, 71, 87, 0.25), inset 0 0 25px rgba(255, 71, 87, 0.1) !important;
                        border: 1px solid rgba(255, 71, 87, 0.4) !important;
                        border-top: 4px solid #ff4757 !important;
                        transform: scale(1.02);
                    }
                    #s-mod6-comp-preventiva .comp-card-modern:nth-child(2).req-done {
                        background: linear-gradient(145deg, rgba(46, 204, 113, 0.12), rgba(15, 20, 35, 0.95)) !important;
                        box-shadow: 0 15px 40px rgba(46, 204, 113, 0.25), inset 0 0 25px rgba(46, 204, 113, 0.1) !important;
                        border: 1px solid rgba(46, 204, 113, 0.4) !important;
                        border-top: 4px solid #2ecc71 !important;
                        transform: scale(1.02);
                    }
                    #s-mod6-comp-preventiva .comp-card-img-wrap img {
                        transition: transform 0.5s cubic-bezier(0.18, 1, 0.26, 1);
                    }
                    #s-mod6-comp-preventiva .comp-card-modern:hover .comp-card-img-wrap img {
                        transform: scale(1.08);
                    }
                    @media (min-width: 769px) {
                        #s-mod6-comp-preventiva .comp-cards-grid {
                            flex-direction: row;
                            justify-content: center;
                            align-items: stretch;
                            gap: 45px;
                        }
                        #s-mod6-comp-preventiva .comp-card-modern {
                            flex: 1;
                            max-width: 410px;
                        }
                        #s-mod6-comp-preventiva .comp-card-img-wrap {
                            height: 200px !important;
                        }
                        #s-mod6-comp-preventiva .comp-card-body {
                            padding: 24px !important;
                        }
                    }
                    @media (max-width: 768px) {
                        #s-mod6-comp-preventiva .comp-cards-grid {
                            flex-direction: column;
                        }
                        #s-mod6-comp-preventiva .comp-card-modern {
                            max-width: 100%;
                        }
                    }
                </style>

                <div class="top-bar">
                    <div class="section-tag" style="background: var(--red); color: var(--black); font-size: 16px; padding: 6px 16px; font-weight: 800; box-shadow: 0 0 12px rgba(46, 204, 113, 0.4);">🏁 MÓDULO 6</div>
                    <h2 class="slide-title" style="font-size: clamp(28px, 4vw, 42px); letter-spacing: -0.01em; text-shadow: 0 0 15px rgba(46, 204, 113, 0.4);">Atitudes Preventivas<br><span>Salvam Vidas</span></h2>
                </div>

                <script>
                    function activatePreventiva(el) {
                        if (el.classList.contains('req-done')) return;
                        el.classList.add('req-done');
                        if (typeof playTechClick === 'function') playTechClick();
                        else if (window.soundClick) window.soundClick.play();
                        if (typeof updateNextButton === 'function') updateNextButton();
                        const container = document.getElementById('s-mod6-comp-preventiva');
                        const total = container.querySelectorAll('.req-item').length;
                        const done = container.querySelectorAll('.req-item.req-done').length;
                        if (done === total) {
                            const wrapper = document.getElementById('prev-hint-wrapper');
                            if (wrapper) wrapper.style.display = 'none';
                            const successMsg = document.getElementById('prev-success-msg');
                            if (successMsg) {
                                successMsg.style.display = 'block';
                                void successMsg.offsetWidth;
                                successMsg.style.opacity = '1';
                                successMsg.style.transform = 'translateY(0)';
                            }
                        }
                    }
                </script>

                <div class="content-area" style="padding-top: 15px; max-width: 900px; margin: 0 auto; width: 100%;">
                    <div id="prev-hint-wrapper" style="margin-top: 0; margin-bottom: 25px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; width: 100%;">
                        <div style="font-family: var(--font-h); font-size: 14px; color: var(--green); text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 0 10px rgba(46, 204, 113, 0.5); animation: pulse-soft 2s infinite;">Toque nas imagens para comparar os comportamentos ✔</div>
                        <div style="font-family: var(--font-h); font-size: 13px; color: rgba(46, 204, 113, 0.8); margin-top: 10px; letter-spacing: 1px; text-transform: uppercase;"><span id="prev-counter-text">Veja os dois lados para avançar</span></div>
                    </div>
                    <div class="comp-success" id="prev-success-msg" style="font-family: var(--font-h); font-size: 16px; color: var(--green); text-transform: uppercase; letter-spacing: 2px; margin-top: 0; margin-bottom: 25px; text-shadow: 0 0 15px rgba(46, 204, 113, 0.8); opacity: 0; transform: translateY(10px); transition: all 0.5s ease; display: none; text-align: center;">✅ Análise concluída</div>

                    <div class="comp-cards-grid hud-anim-enter">
                        <!-- LADO ESQUERDO: INCORRETO -->
                        <div class="comp-card-modern req-item" onclick="activatePreventiva(this)" style="cursor: pointer; position: relative;">
                            <div class="comp-card-content">
                                <div class="comp-card-img-wrap" style="height: 250px; border-bottom: 2px solid #ff4757; overflow: hidden;">
                                    <img src="https://i.imgur.com/gtuC8HP.png" alt="Operador Distraído" style="object-fit: cover; width: 100%; height: 100%; opacity: 0.7; filter: grayscale(50%);">
                                </div>
                                <div class="comp-card-body" style="padding: 20px;">
                                    <h4 class="comp-card-title" style="color: #ff4757; font-size: 20px; font-weight: 800; margin-bottom: 15px; letter-spacing: 1px;">❌ INCORRETO</h4>
                                    <ul style="color: rgba(255,255,255,0.7); font-size: 15px; margin: 0; padding-left: 0; text-align: left; line-height: 1.8; list-style-type: none;">
                                        <li style="margin-bottom: 8px;">▪ Operador sem atenção</li>
                                        <li style="margin-bottom: 8px;">▪ Comportamento inseguro</li>
                                        <li>▪ Postura inadequada</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <!-- LADO DIREITO: CORRETO -->
                        <div class="comp-card-modern req-item" onclick="activatePreventiva(this)" style="cursor: pointer; position: relative;">
                            <div class="comp-card-content">
                                <div class="comp-card-img-wrap" style="height: 250px; border-bottom: 2px solid #2ecc71; overflow: hidden;">
                                    <img src="https://i.imgur.com/7BJLUgg.png" alt="Operador Atento" style="object-fit: cover; width: 100%; height: 100%; opacity: 0.9;">
                                </div>
                                <div class="comp-card-body" style="padding: 20px;">
                                    <h4 class="comp-card-title" style="color: var(--green); font-size: 20px; font-weight: 800; margin-bottom: 15px; letter-spacing: 1px;">✅ CORRETO</h4>
                                    <ul style="color: rgba(255,255,255,0.7); font-size: 15px; margin: 0; padding-left: 0; text-align: left; line-height: 1.8; list-style-type: none;">
                                        <li style="margin-bottom: 8px;">▪ Operador focado</li>
                                        <li style="margin-bottom: 8px;">▪ Postura correta</li>
                                        <li>▪ Operação segura</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="wave"><svg viewBox="0 0 1440 100" preserveAspectRatio="none">
                    <path d="M0,65 C360,20 720,90 1080,40 C1260,15 1390,70 1440,60 L1440,100 L0,100 Z" fill="rgba(46,204,113,0.07)" />
                </svg></div>
            </div>`;

function patchFile(f) {
  let content = fs.readFileSync(f, 'utf8');
  let lines = content.split(/\r?\n/);
  
  let idxCorreto = lines.findIndex(l => l.includes("✅ CORRETO</h4>"));
  if (idxCorreto === -1) {
    console.log("Not found in", f);
    return;
  }
  
  let startIdx = idxCorreto;
  while (startIdx > 0 && !lines[startIdx].includes("if (successMsg) successMsg.classList.add('show');")) {
    startIdx--;
  }
  
  let endIdx = idxCorreto;
  while (endIdx < lines.length && !lines[endIdx].includes('<div class="slide" id="s-mod6-mensagem-final"')) {
    endIdx++;
  }
  
  let replacementLines = newSlide.split('\n');
  
  lines.splice(startIdx + 2, endIdx - (startIdx + 2), ...replacementLines);
  
  fs.writeFileSync(f, lines.join('\n'));
  console.log("Patched", f);
}

patchFile(file1);
patchFile(file2);
