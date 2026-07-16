/* ============================================================
   AUDIO DATA — Mapa de slides e textos para narração
   ------------------------------------------------------------
   Este arquivo é a ÚNICA fonte de verdade que descreve:
     (1) ordem dos slides em cada HTML (precisa bater com NR11_MODULE_OFFSETS de shared.js)
     (2) quais slides têm múltiplos estados (quiz, micro-quiz)
     (3) o que deve ser narrado em cada estado de um slide multi-estado

   Usado por:
     - generate-audios.js  (Node, gera os MP3 batendo na API de TTS)
     - shared.js           (browser, escolhe qual MP3 tocar a cada clique em "Ouvir")
   ============================================================ */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.AUDIO_DATA = factory();
}(typeof self !== 'undefined' ? self : this, function () {

    /* Ordem dos slides em cada HTML — DEVE bater com NR11_MODULE_OFFSETS.
       Soma das slides = NR11_TOTAL_SLIDES (42).                              */
    const SLIDE_ORDER = {
        'index.html': ['s1', 's1b', 's-sumario'],
        'modulo-1.html': ['s4', 's5', 's6', 's7', 's8', 's9'],
        'modulo-2.html': ['s10', 's11', 's12', 's13', 's14', 's15'],
        'modulo-3.html': ['s16', 's17', 's18', 's19', 's20', 's21'],
        'modulo-4.html': ['s22', 's23', 's24', 's25', 's25a', 's26'],
        'modulo-5.html': ['s27', 's28', 's29', 's30', 's31', 's32', 's33', 's34', 's35'],
        'modulo-6.html': ['s36', 's36a', 's37', 's38', 's39', 's40', 's41', 's43', 's44']
    };

    /* MULTI_STATE: slides com múltiplos conteúdos exibidos em sequência.
       O player troca de áudio conforme o estado visível na tela.

       Campos:
         panels: { intro:'#id', question:'#id', result:'#id' }  -> usado para detectar estado no DOM
         counterSelector:  seletor para ler "Pergunta X de N" e descobrir índice
         intro / result:   texto narrado para esses estados
         questions[]:      texto narrado para cada pergunta (i+1 = Q1, Q2 …)                */
    const MULTI_STATE = {
        // ─── QUIZ 1 (slide global 10, modulo-1.html, sq1) ─────────────────────
        's9': {
            panels: { intro: '#q1-intro-panel', question: '#q1-question-panel', result: '#q1-result-panel' },
            counterSelector: '#q1-counter',
            intro: 'Hora do desafio. Quiz do Módulo 1. Mostre que você domina os principais procedimentos da operação segura. Esta avaliação contém cinco perguntas com mínimo de setenta por cento de acertos. Toque em Iniciar Desafio para começar.',
            questions: [
                'Pergunta 1 de 5. O que a Norma Regulamentadora 11, NR 11, regulamenta? Opção A: Segurança elétrica industrial. Opção B: Ergonomia no trabalho. Opção C: Transporte, movimentação e armazenagem de materiais. Opção D: Saúde ocupacional geral.',
                'Pergunta 2 de 5. Qual documento o operador de NR 11 — Empilhadeira Elétrica Retrátil e Combustão deve portar durante a operação? Opção A: Apenas o crachá da empresa. Opção B: Cartão de identificação de operador autorizado. Opção C: CNH, Carteira Nacional de Habilitação. Opção D: Diploma de conclusão de curso.',
                'Pergunta 3 de 5. Com que frequência deve ser renovada a autorização do operador de empilhadeira? Opção A: A cada dois anos. Opção B: A cada cinco anos. Opção C: Apenas uma vez na carreira. Opção D: Anualmente, a cada doze meses.',
                'Pergunta 4 de 5. Qual requisito é obrigatório antes de operar a NR 11 — Empilhadeira Elétrica Retrátil e Combustão? Opção A: Possuir autorização e treinamento. Opção B: Apenas conhecer o equipamento. Opção C: Trabalhar no estoque. Opção D: Ter experiência informal.',
                'Pergunta 5 de 5. A reciclagem periódica do treinamento tem como objetivo: Opção A: Substituir o exame médico. Opção B: Aumentar velocidade da operação. Opção C: Atualizar conhecimentos de segurança. Opção D: Liberar operadores sem avaliação.'
            ],
            result: 'Resultado do Quiz do Módulo 1. Veja sua pontuação na tela. Toque em Tentar Novamente para refazer ou siga para o próximo módulo.'
        },

        // ─── QUIZ 2 (slide global 16, modulo-2.html, sq2) — Verdadeiro/Falso ──
        's15': {
            panels: { intro: '#sq2-intro-panel', question: '#sq2-question-panel', result: '#sq2-result-panel' },
            counterSelector: '#sq2-counter',
            intro: 'Quiz do Módulo 2. Verdadeiro ou Falso. Teste seus conhecimentos sobre operação segura. Esta avaliação contém oito afirmações com mínimo de setenta por cento de acertos. Toque em Começar para iniciar.',
            questions: [
                'Pergunta 1 de 8. Afirmação: A inspeção visual do equipamento deve ser realizada antes da operação. Responda verdadeiro ou falso.',
                'Pergunta 2 de 8. Afirmação: Os garfos podem permanecer elevados durante o deslocamento. Responda verdadeiro ou falso.',
                'Pergunta 3 de 8. Afirmação: O botão de buzina auxilia na prevenção de colisões. Responda verdadeiro ou falso.',
                'Pergunta 4 de 8. Afirmação: O timão possui sistema de frenagem automática nas posições extremas. Responda verdadeiro ou falso.',
                'Pergunta 5 de 8. Afirmação: Curvas em alta velocidade aumentam o risco de tombamento. Responda verdadeiro ou falso.',
                'Pergunta 6 de 8. Afirmação: A NR 11 — Empilhadeira Elétrica Retrátil e Combustão é utilizada apenas para movimentação vertical. Responda verdadeiro ou falso.',
                'Pergunta 7 de 8. Afirmação: A carga instável pode causar queda de materiais. Responda verdadeiro ou falso.',
                'Pergunta 8 de 8. Afirmação: O operador pode utilizar o equipamento sem conhecer os comandos. Responda verdadeiro ou falso.'
            ],
            result: 'Resultado do Quiz do Módulo 2. Veja sua pontuação na tela. Toque em Tentar Novamente para refazer ou siga para o próximo módulo.'
        },

        // ─── SIMULADOR DE VISIBILIDADE (slide global 19, modulo-3.html, s18) ─
        's18': {
            panels: { intro: null, question: null, result: null },
            counterSelector: null,
            counterPattern: null,
            questions: [
                'Condições adversas de operação. Ajuste o controle de visibilidade para observar como chuva, neblina e baixa visibilidade afetam a operação segura da empilhadeira. Reduza a visibilidade até dez por cento e abra o fator cegueira para continuar.'
            ],
            result: 'Simulação concluída. Você observou os efeitos das condições climáticas na visibilidade operacional.'
        },

        // ─── CENTRAL DE SEGURANÇA (slide global 21, modulo-3.html, s21) ───────
        's21': {
            panels: { intro: '#q3-intro-panel', question: '#q3-question-panel', result: '#q3-result-panel' },
            counterSelector: '#q3-counter',
            intro: 'Central de Segurança Operacional. O supervisor está chamando no rádio. Analise cada situação e escolha a resposta mais segura para a operação. Esta avaliação contém quatro chamadas. Toque em Começar para atender.',
            questions: [
                'Chamada 1 de 4. Atenção operador. Começou a chover forte e o piso do armazém está escorregadio. Qual sua ação? Câmbio. Opção A: Reduzir a velocidade imediatamente. Opção B: Manter a velocidade e utilizar frenagens bruscas.',
                'Chamada 2 de 4. Atenção. Neblina intensa na área externa. Confirme o alcance dos faróis para auxiliar a segurança da operação. Câmbio. Opção A: Cento e vinte metros. Opção B: Cinquenta metros.',
                'Chamada 3 de 4. Alerta geral. Um operador relatou ofuscamento causado por luz intensa. Quanto tempo a visão humana pode levar para se recuperar? Câmbio. Opção A: Sete segundos. Opção B: Três segundos.',
                'Chamada 4 de 4. Para encerrar o turno, confirme os principais riscos críticos da operação de empilhadeiras. Câmbio. Opção A: Tombamentos, colisões, atropelamentos e queda de materiais. Opção B: Apenas falhas mecânicas da máquina.'
            ],
            result: 'Turno Encerrado com Segurança. Parabéns. Você concluiu o Módulo 3 e demonstrou compreender os principais riscos operacionais da atividade. Toque em Próximo para avançar ao Módulo 4.'
        },

        // ─── QUIZ 4 (slide global 27, modulo-4.html, s-quiz4) ─────────────────
        's26': {
            panels: { intro: '#q4-intro-panel', question: '#q4-question-panel', result: '#q4-result-panel' },
            counterSelector: '#q4-counter',
            intro: 'Quiz do Módulo 4. Decisão Rápida. Simule situações operacionais e tome a decisão correta. Esta avaliação contém cinco situações com mínimo de sessenta por cento de acertos. Toque em Iniciar para começar.',
            questions: [
                'Situação 1 de 5. A carga começou a inclinar durante o deslocamento. Opção A: Parar e reposicionar. Opção B: Continuar a operação.',
                'Situação 2 de 5. O trajeto possui pessoas circulando próximas. Opção A: Manter velocidade. Opção B: Reduzir e sinalizar.',
                'Situação 3 de 5. Sua visão frontal foi totalmente bloqueada pela carga alta. Opção A: Conduzir de ré. Opção B: Tentar olhar por cima.',
                'Situação 4 de 5. Você finalizou o turno e precisa estacionar o equipamento. Opção A: Baixar os garfos ao chão. Opção B: Deixar os garfos elevados.',
                'Situação 5 de 5. Durante o deslocamento, você precisa passar por uma rampa. Opção A: Subir de frente e descer de ré. Opção B: Subir e descer de frente.'
            ],
            result: 'Resultado do Quiz do Módulo 4. Veja sua pontuação na tela. Toque em Tentar Novamente para refazer ou siga para o próximo módulo.'
        },

        // ─── QUIZ 5 (slide global 36, modulo-5.html, s-quiz5) ─────────────────
        's35': {
            panels: { intro: '#q5-intro-panel', question: '#q5-question-panel', result: '#q5-result-panel' },
            counterSelector: '#q5-counter',
            intro: 'Quiz do Módulo 5. Simulação Operacional. Avalie cenários de movimentação, armazenagem e emergências. Esta avaliação contém cinco situações com mínimo de setenta por cento de acertos. Toque em Iniciar para começar.',
            questions: [
                'Pergunta 1 de 5. Corredor Obstruído. O operador encontrou um corredor parcialmente bloqueado durante a movimentação da carga. Qual deve ser o procedimento correto? Opção A: Continuar normalmente. Opção B: Sinalizar e liberar o corredor antes da operação. Opção C: Passar rapidamente pelo bloqueio. Opção D: Ignorar o obstáculo.',
                'Pergunta 2 de 5. Carga Elevada. A carga está sendo transportada acima da altura recomendada. Qual é o principal risco desta operação? Opção A: Melhor visibilidade. Opção B: Maior estabilidade. Opção C: Maior velocidade. Opção D: Comprometimento da visibilidade e risco de colisão.',
                'Pergunta 3 de 5. EPI Ausente. O operador iniciou a movimentação sem todos os EPIs obrigatórios. Qual procedimento está correto? Opção A: Interromper a operação até regularizar os EPIs. Opção B: Operar apenas em áreas vazias. Opção C: Continuar se a operação for rápida. Opção D: Solicitar ajuda apenas em caso de risco.',
                'Pergunta 4 de 5. Emergência Operacional. Foi identificado um princípio de incêndio próximo à área de movimentação. Qual deve ser a primeira ação? Opção A: Continuar a operação. Opção B: Improvisar sozinho o combate. Opção C: Parar a operação e afastar as pessoas. Opção D: Mover a carga rapidamente.',
                'Pergunta 5 de 5. Distanciamento Seguro. Durante a movimentação, o operador reduziu excessivamente a distância da estrutura lateral. Qual distância mínima deve ser mantida? Opção A: Vinte centímetros. Opção B: Cinquenta centímetros. Opção C: Trinta centímetros. Opção D: Não existe distância mínima.'
            ],
            result: 'Resultado do Quiz do Módulo 5. Veja sua pontuação na tela. Toque em Tentar Novamente para refazer ou siga para o próximo módulo.'
        },

        // ─── QUIZ 6 (slide global 39, modulo-6.html, s43) — Liberar/Não ───
        's43': {
            panels: { intro: '#q6-intro-panel', question: '#q6-question-panel', result: '#q6-result-panel' },
            counterSelector: '#q6-counter',
            counterPattern: /AN[AÁ]LISE\s+(\d+)\s*\//i,
            intro: 'Quiz Final. Validação Operacional. Analise cada cenário e decida se a operação deve ser liberada ou não liberada. Esta avaliação contém cinco análises com mínimo de sessenta por cento de acertos. Toque em Iniciar para começar.',
            questions: [
                'Análise 1 de 5. Verificação do Trajeto. O operador irá iniciar a movimentação sem verificar o corredor operacional. Você deve liberar ou não liberar?',
                'Análise 2 de 5. Altura da Carga. A carga está posicionada corretamente para movimentação segura. Você deve liberar ou não liberar?',
                'Análise 3 de 5. Distração Operacional. O operador utiliza celular durante a movimentação da carga. Você deve liberar ou não liberar?',
                'Análise 4 de 5. Proteção Operacional. O operador iniciou a operação utilizando os EPIs obrigatórios. Você deve liberar ou não liberar?',
                'Análise 5 de 5. Finalização Segura. O equipamento foi estacionado corretamente ao final da operação. Você deve liberar ou não liberar?'
            ],
            result: 'Resultado da Validação Operacional. Veja sua pontuação na tela. Caso aprovado, toque em Finalizar Treinamento. Caso contrário, refaça a validação.'
        }
    };

    /* Textos hardcoded para slides "normais" cujos áudios atuais ficaram ruins.
       Adicione aqui se quiser sobrescrever o texto extraído do HTML.
       Slides não listados usam extração automática via jsdom no generator.    */
    const OVERRIDES = {
        // exemplo: 's1': 'Bem-vindo ao treinamento NR 11...'
    };

    /* Calcula o número global do slide (1..NR11_TOTAL_SLIDES) a partir do
       nome do arquivo HTML e do índice interno do slide. Mantém em sintonia
       com NR11_MODULE_OFFSETS de shared.js.                                    */
    const MODULE_OFFSETS = {
        'index.html': 0, 'modulo-1.html': 3, 'modulo-2.html': 9,
        'modulo-3.html': 15, 'modulo-4.html': 21, 'modulo-5.html': 26,
        'modulo-6.html': 32
    };

    function globalSlideOf(file, slideId) {
        const order = SLIDE_ORDER[file];
        if (!order) return null;
        const idx = order.indexOf(slideId);
        if (idx < 0) return null;
        return (MODULE_OFFSETS[file] || 0) + idx + 1;
    }

    return { SLIDE_ORDER, MULTI_STATE, OVERRIDES, MODULE_OFFSETS, globalSlideOf };
}));
