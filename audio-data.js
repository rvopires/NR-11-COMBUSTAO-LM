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

    /* Ordem dos slides em cada HTML — DEVE bater com NR11_MODULE_OFFSETS. */
    const SLIDE_ORDER = {
        'index.html': ['s1', 's1b', 's-sumario'],
        'modulo-1.html': ['s4', 's5', 's6', 's7', 's8', 's8-req', 's9'],
        'modulo-2.html': ['s10', 's11', 's12', 's13', 's14', 's14b', 's15'],
        'modulo-3.html': ['s16', 's17', 's18', 's19', 's20', 's21'],
        'modulo-4.html': ['s22', 's23', 's24', 's25', 's25a', 's26'],
        'modulo-5.html': ['s27', 's28', 's29', 's30', 's31', 's35'],
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
        // ─── Credencial (slide global 9, s8-req) — 3 tópicos/cards ───────────
        's8-req': {
            panels: { intro: null, question: '#s8r-card', result: null },
            counterSelector: '#s8r-counter',
            counterPattern: /(\d+)\s*\//,
            // Também usado no desktop (acordeão): áudio por tópico q1..q3
            questions: [
                'Habilitação. Os operadores deverão ser habilitados através de treinamento e só poderão dirigir se portarem o cartão de identificação em lugar visível.',
                'Validade. O cartão tem validade de um ano. O operador é o responsável por observar o vencimento de sua autorização.',
                'Saúde. Para a revalidação anual, o empregado deverá passar por exame de saúde completo, por conta do empregador.'
            ]
        },

        // ─── QUIZ 1 (slide global 10, modulo-1.html, s9) — 3 perguntas ───────
        's9': {
            panels: { intro: '#q1-intro-panel', question: '#q1-question-panel', result: '#q1-result-panel' },
            counterSelector: '#q1-counter',
            intro: 'Desafio NR-11. Módulo 1. Responda três perguntas. Você precisa acertar no mínimo duas para avançar. Toque em Iniciar Desafio para começar.',
            questions: [
                'Pergunta 1 de 3. De acordo com a NR-11, qual é a validade do cartão de identificação do operador e o que é exigido para sua revalidação? Opção A: Validade de 6 meses, com necessidade de novo teste prático. Opção B: Validade de 1 ano, devendo o empregado passar por exame de saúde completo. Opção C: Validade de 2 anos, sem a exigência de novos exames médicos.',
                'Pergunta 2 de 3. Na classificação de responsabilidade civil e criminal, como é definida a atitude de um operador que age sem a devida cautela, por exemplo, operando em excesso de velocidade? Opção A: Imprudência. Opção B: Imperícia. Opção C: Negligência.',
                'Pergunta 3 de 3. Segundo o Artigo 482 da CLT, o que pode ocorrer com o operador que comete infrações ou atos inseguros de forma reincidente? Opção A: Apenas a suspensão temporária do seu cartão de identificação. Opção B: Receberá apenas advertências verbais, sem impacto no contrato. Opção C: Poderá sofrer demissão por justa causa, além de ficar obrigado a reparar os danos causados.'
            ],
            result: 'Resultado do Desafio do Módulo 1. Veja se concluiu o desafio na tela. Toque em Jogar Novamente para refazer ou siga para o próximo módulo.'
        },

        // ─── O Que Fazer / Não Fazer (slide global 16, s14b) — 6 cards ───────
        's14b': {
            panels: { intro: null, question: '#s14b-card', result: null },
            counterSelector: '#s14b-counter',
            counterPattern: /(\d+)\s*\//,
            questions: [
                'O que fazer. Aderência. Verifique rodas e superfície.',
                'O que fazer. Controle em Rampas. Reduza a velocidade.',
                'O que fazer. Controle da Carga. Transporte cargas estáveis e seguras.',
                'O que não fazer. Manobras Perigosas. Não vire em declive.',
                'O que não fazer. Estacionamento. Não estacione fora de superfície plana.',
                'O que não fazer. Manutenção. Não faça manutenção sem autorização.'
            ]
        },

        // ─── QUIZ 2 (slide global 17, s15) — 5 situações ─────────────────────
        's15': {
            panels: { intro: '#sq2-intro-panel', question: '#sq2-question-panel', result: '#sq2-result-panel' },
            counterSelector: '#sq2-counter',
            intro: 'Desafio NR-11. Módulo 2. Analise cinco situações. Você precisa acertar no mínimo três para avançar. Toque em Iniciar Desafio para começar.',
            questions: [
                'Pergunta 1 de 5. Um operador transporta um palete com a carga a aproximadamente quinze a vinte centímetros do solo durante todo o percurso. Opção A: Operação segura. Opção B: Ato inseguro.',
                'Pergunta 2 de 5. Uma empilhadeira opera em alta velocidade sob forte chuva com os faróis desligados. Opção A: Operação segura. Opção B: Ato inseguro.',
                'Pergunta 3 de 5. Um colega de trabalho pega carona na lateral da empilhadeira durante a operação. Opção A: Operação segura. Opção B: Ato inseguro.',
                'Pergunta 4 de 5. Ao fim do expediente, o operador estaciona a empilhadeira em uma rampa. Opção A: Operação segura. Opção B: Ato inseguro.',
                'Pergunta 5 de 5. Saindo fumaça do motor, o operador para a máquina, pede ajuda e usa o extintor da empilhadeira. Opção A: Operação segura. Opção B: Ato inseguro.'
            ],
            result: 'Resultado do Desafio do Módulo 2. Veja se concluiu o desafio na tela. Toque em Jogar Novamente para refazer ou siga para o próximo módulo.'
        },

        // ─── Análise de Riscos (slide global 19, s17) — 6 câmeras ───────────
        's17': {
            panels: { intro: null, question: '#s17-card', result: null },
            counterSelector: '#s17-cam-id',
            counterPattern: /CAM-0?(\d+)/i,
            questions: [
                'Câmera 1. Corredor logístico. Risco: colisão com estrutura. Impacto contra porta-paletes e estruturas fixas. Severidade alta.',
                'Câmera 2. Cruzamento. Risco: colisão entre veículos. Risco de impacto entre empilhadeiras e outros equipamentos. Severidade alta.',
                'Câmera 3. Corredor lateral. Risco: atropelamento. Movimentação simultânea de pessoas e equipamentos. Severidade crítica.',
                'Câmera 4. Área de carga. Risco: queda de materiais. Carga instável pode cair durante a movimentação. Severidade alta.',
                'Câmera 5. Abastecimento. Risco: incêndio ou explosão. Risco durante abastecimento e troca de cilindros GLP. Severidade crítica.',
                'Câmera 6. Área de manobra. Risco: tombamento. Perda de estabilidade durante a operação. Severidade crítica.'
            ]
        },

        // ─── Condições adversas (slide global 20, s18) — por nível + cegueira ─
        's18': {
            panels: { intro: null, question: '#s18-alert-box', result: null },
            counterSelector: '#s18-vis-value',
            counterPattern: /(\d+)\s*%/,
            // q1=100%, q2=75%, q3=50%, q4=25%, q5=10% — blind = modal Fator Cegueira
            questions: [
                'Módulo 3. Condições adversas de operação. Ajuste a visibilidade para observar como as condições climáticas afetam a operação. Visibilidade: cem por cento. Efeitos da condição climática. Alerta atual: Visibilidade plena. Operação normal. Chuva reduz aderência. Diminua a velocidade. Faróis acesos alertam pedestres e melhoram a visão. Botão: Fator Cegueira.',
                'Módulo 3. Condições adversas de operação. Ajuste a visibilidade para observar como as condições climáticas afetam a operação. Visibilidade: setenta e cinco por cento. Efeitos da condição climática. Alerta atual: Reduza a velocidade. Chuva reduz aderência. Diminua a velocidade. Faróis acesos alertam pedestres e melhoram a visão. Botão: Fator Cegueira.',
                'Módulo 3. Condições adversas de operação. Visibilidade: cinquenta por cento. Efeitos da condição climática. Alerta atual: Piso molhado exige atenção redobrada. Chuva reduz aderência. Diminua a velocidade. Faróis acesos alertam pedestres e melhoram a visão. Botão: Fator Cegueira.',
                'Módulo 3. Condições adversas de operação. Visibilidade: vinte e cinco por cento. Efeitos da condição climática. Alerta atual: Aumente a distância de segurança. Chuva reduz aderência. Diminua a velocidade. Faróis acesos alertam pedestres e melhoram a visão. Botão: Fator Cegueira.',
                'Módulo 3. Condições adversas de operação. Visibilidade: dez por cento. Efeitos da condição climática. Alerta atual: Visibilidade crítica. Utilize os faróis. Chuva reduz aderência. Diminua a velocidade. Faróis acesos alertam pedestres e melhoram a visão. Botão: Fator Cegueira.'
            ],
            blind: 'Fator Cegueira. Você Sabia? A visão humana pode levar cerca de sete segundos para se recuperar após um ofuscamento intenso. Durante esse período, a percepção dos riscos pode ficar seriamente comprometida. Nunca direcione faróis diretamente para o rosto de outros trabalhadores.'
        },

        // ─── QUIZ 3 / Central (slide global 23, s21) — 5 chamadas ───────────
        's21': {
            panels: { intro: '#q3-intro-panel', question: '#q3-question-panel', result: '#q3-result-panel' },
            counterSelector: '#q3-counter',
            intro: 'Desafio NR-11. Módulo 3. Responda cinco chamadas. Você precisa acertar no mínimo três para avançar. Toque em Iniciar Desafio para começar.',
            questions: [
                'Chamada 1 de 5. Atenção operador. Começou a chover forte e o piso do armazém está escorregadio. Qual sua ação? Câmbio. Opção A: Reduzir a velocidade imediatamente. Opção B: Manter a velocidade e utilizar frenagens bruscas.',
                'Chamada 2 de 5. Atenção. Neblina intensa na área externa. Confirme o alcance dos faróis para auxiliar a segurança da operação. Câmbio. Opção A: Cinquenta metros. Opção B: Cento e vinte metros.',
                'Chamada 3 de 5. Alerta geral. Um operador relatou ofuscamento causado por luz intensa. Quanto tempo a visão humana pode levar para se recuperar? Câmbio. Opção A: Três segundos. Opção B: Sete segundos.',
                'Chamada 4 de 5. Para encerrar o turno, confirme os principais riscos críticos da operação de empilhadeiras. Câmbio. Opção A: Apenas falhas mecânicas da máquina. Opção B: Tombamentos, colisões, atropelamentos e queda de materiais.',
                'Chamada 5 de 5. Atenção operador. Pedestre detectado cruzando o corredor durante a movimentação. Qual sua ação? Câmbio. Opção A: Parar completamente e aguardar a liberação do caminho. Opção B: Manter a velocidade e buzinar para alertar.'
            ],
            result: 'Resultado do Desafio do Módulo 3. Veja se concluiu o desafio na tela. Toque em Jogar Novamente para refazer ou siga para o próximo módulo.'
        },

        // ─── Equilíbrio / alturas (slide global 25, s23) — 4 cards ───────────
        's23': {
            panels: { intro: null, question: '#s23-m-card', result: null },
            counterSelector: '#s23-m-counter',
            counterPattern: /(\d+)\s*\//,
            questions: [
                'Altura baixa. Cem por cento. Estabilidade ideal. A carga permanece próxima ao centro de gravidade da máquina. Capacidade residual: a máquina opera dentro das melhores condições de estabilidade.',
                'Altura média. Setenta e cinco por cento. Atenção. A elevação da carga começa a reduzir a estabilidade. Capacidade residual: o operador deve redobrar a atenção durante a movimentação.',
                'Altura alta. Cinquenta por cento. Risco moderado. A estabilidade foi significativamente reduzida. Capacidade residual: evite curvas bruscas e movimentos repentinos.',
                'Altura máxima. Vinte e cinco por cento. Risco de tombamento. A estabilidade encontra-se criticamente reduzida. Importante: mesmo dentro da capacidade nominal, a elevação excessiva pode comprometer o equilíbrio da empilhadeira.'
            ]
        },

        // ─── Centro de carga (slide global 26, s24) — 2 cenários ─────────────
        's24': {
            panels: { intro: null, question: '#s24-m-slide', result: null },
            counterSelector: '#s24-m-counter',
            counterPattern: /(\d+)\s*\//,
            questions: [
                'Centro de carga correto. Carga posicionada corretamente. Maior estabilidade operacional.',
                'Centro de carga excedido. Maior risco de desequilíbrio e tombamento.'
            ]
        },

        // ─── QUIZ 4 (slide global 29, s26) — 4 cenários ──────────────────────
        's26': {
            panels: { intro: '#q4-intro-panel', question: '#q4-question-panel', result: '#q4-result-panel' },
            counterSelector: '#q4-counter',
            intro: 'Desafio NR-11. Módulo 4. Analise quatro cenários. Você precisa acertar no mínimo três para avançar. Toque em Iniciar Desafio para começar.',
            questions: [
                'Pergunta 1 de 4. Cenário 1. O operador pegou a carga máxima permitida na máquina, capacidade nominal, e elevou a torre até o limite máximo de altura para tentar manobrar. Opção A: Vai tombar. Opção B: Operação segura.',
                'Pergunta 2 de 4. Cenário 2. O operador apanhou a caixa, posicionou a coluna na vertical e inclinou a carga ligeiramente para trás antes de começar a andar. Opção A: Vai tombar. Opção B: Operação segura.',
                'Pergunta 3 de 4. Cenário 3. Durante o transporte, o operador decide fazer um giro muito rápido, curva fechada, para a esquerda para ganhar tempo na entrega. Opção A: Vai tombar. Opção B: Operação segura.',
                'Pergunta 4 de 4. Cenário 4. Para não perder a viagem, o operador pega uma carga muito longa, deixando o centro de carga bem na ponta dos garfos, além do especificado. Opção A: Vai tombar. Opção B: Operação segura.'
            ],
            result: 'Resultado do Desafio do Módulo 4. Veja se concluiu o desafio na tela. Toque em Jogar Novamente para refazer ou siga para o próximo módulo.'
        },

        // ─── Checklist pré-operação (slide global 31, s28) — 6 itens ─────────
        's28': {
            panels: { intro: null, question: '#s28-m-card', result: null },
            counterSelector: '#s28-m-counter',
            counterPattern: /(\d+)\s*\//,
            // Visão geral (desktop): usar OVERRIDES.s28 → pagina-31.mp3
            questions: [
                'Checklist de liberação. Item 1 de 6. Estou apto medicamente.',
                'Checklist de liberação. Item 2 de 6. Realizei o treinamento obrigatório.',
                'Checklist de liberação. Item 3 de 6. Fiz o Check List da empilhadeira.',
                'Checklist de liberação. Item 4 de 6. Estou utilizando o cinto de segurança.',
                'Checklist de liberação. Item 5 de 6. Não utilizarei celular durante a operação.',
                'Checklist de liberação. Item 6 de 6. Não transportarei passageiros.'
            ]
        },

        // ─── Parada segura (slide global 32, s29) — 2 cenários ───────────────
        's29': {
            panels: { intro: null, question: '#s29-m-slide', result: null },
            counterSelector: '#s29-m-counter',
            counterPattern: /(\d+)\s*\//,
            // Visão geral (desktop): usar OVERRIDES.s29 → pagina-32.mp3
            questions: [
                'Estacionamento correto. Garfos abaixados, chave na mão, corredor livre. Lembre a regra: garfos totalmente abaixados, chave removida, área permitida e corredores livres.',
                'Estacionamento incorreto. Garfos levantados, corredor bloqueado, área obstruída. Nunca deixe a empilhadeira assim.'
            ]
        },

        // ─── QUIZ 5 (slide global 35, s35) — 3 ocorrências ───────────────────
        's35': {
            panels: { intro: '#q5-intro-panel', question: '#q5-question-panel', result: '#q5-result-panel' },
            counterSelector: '#q5-counter',
            intro: 'Desafio NR-11. Módulo 5. Analise três ocorrências. Você precisa acertar no mínimo duas para avançar. Toque em Iniciar Desafio para começar.',
            questions: [
                'Pergunta 1 de 3. Ocorrência 01. O operador está com uma carga muito alta e volumosa que tampa sua visão frontal, então ele decide conduzir a empilhadeira de marcha à ré para enxergar o caminho. Qual sua decisão? Opção A: Aprovado. Opção B: Advertência.',
                'Pergunta 2 de 3. Ocorrência 02. Para adiantar o serviço, o operador deu uma carona rápida para o ajudante ir em pé na lateral da empilhadeira até o outro lado do galpão. Qual sua decisão? Opção A: Aprovado. Opção B: Advertência.',
                'Pergunta 3 de 3. Ocorrência 03. O operador foi para o horário de almoço. Estacionou no local correto e abaixou os garfos até o chão, mas deixou a chave na ignição para facilitar na volta. Qual sua decisão? Opção A: Aprovado. Opção B: Advertência.'
            ],
            result: 'Resultado do Desafio do Módulo 5. Veja se concluiu o desafio na tela. Toque em Jogar Novamente para refazer ou siga para o próximo módulo.'
        },

        // ─── Regras críticas baterias/GLP (slide global 38, s37) — 4 cards ───
        's37': {
            panels: { intro: null, question: '#s37-slide', result: null },
            counterSelector: '#s37-counter',
            counterPattern: /(\d+)\s*\//,
            questions: [
                'Regras críticas. Card 1 de 4. Bateria elétrica. Observe as orientações de segurança para baterias elétricas.',
                'Regras críticas. Card 2 de 4. Vazamento de ácido. Observe o procedimento seguro em caso de vazamento de ácido.',
                'Regras críticas. Card 3 de 4. Cilindro de GLP. Observe as orientações de segurança para cilindros de GLP.',
                'Regras críticas. Card 4 de 4. Proibido. Não fumar. Não produzir fagulhas. Não utilizar chamas abertas. Não improvisar procedimentos.'
            ]
        },

        // ─── Ação em incêndio (slide global 39, s38) — 5 passos mobile ───────
        's38': {
            panels: { intro: null, question: '#s38-m-label', result: null },
            counterSelector: '#s38-m-step',
            counterPattern: /(\d+)\s*DE/i,
            // Visão geral desktop: OVERRIDES.s38 → pagina-39.mp3
            questions: [
                'Passo 1 de 5. Alarme. Incêndio identificado.',
                'Passo 2 de 5. Estacione. Local seguro.',
                'Passo 3 de 5. Desligue. Equipamento desligado.',
                'Passo 4 de 5. Evacuação. Libere as saídas.',
                'Passo 5 de 5. Brigada. Aguardar orientação.'
            ]
        },

        // ─── Mini quiz M6 (slide global 40, s39) — 3 perguntas ───────────────
        's39': {
            panels: { intro: '#q6b-intro-panel', question: '#q6b-question-panel', result: '#q6b-result-panel' },
            counterSelector: '#q6b-counter',
            intro: 'Desafio NR-11. Módulo 6. Responda três perguntas sobre emergências e baterias. Você precisa acertar no mínimo duas para avançar. Toque em Iniciar Desafio para começar.',
            questions: [
                'Pergunta 1 de 3. De acordo com o protocolo de emergência, qual deve ser sua atitude imediata ao ouvir o alarme de incêndio disparar no galpão? Opção A: Acelerar a empilhadeira para sair do prédio o mais rápido possível. Opção B: Abandonar o equipamento no meio do cruzamento e correr. Opção C: Estacionar o veículo em local seguro, deixando a passagem livre, e aguardar as orientações do brigadista.',
                'Pergunta 2 de 3. O que o operador deve fazer caso ocorra um princípio de incêndio na sua própria empilhadeira? Opção A: Primeiramente pedir ajuda e comunicar, para só então iniciar o combate usando o extintor adequado, pó químico ou CO2. Opção B: Tentar apagar o fogo sozinho com qualquer extintor, sem avisar ninguém. Opção C: Jogar água no motor imediatamente e fugir.',
                'Pergunta 3 de 3. Sobre o procedimento seguro para a troca de baterias de empilhadeiras elétricas, qual é a sequência correta? Opção A: A troca pode ser feita com a máquina ligada, desde que seja rápida. Opção B: Remover a bateria, colocar a nova e deixar a bateria velha no chão do estoque. Opção C: Desligar a chave de partida, desconectar o cabo, instalar a nova bateria e conectar a bateria retirada no carregador.'
            ],
            result: 'Resultado do Desafio do Módulo 6. Veja se concluiu o desafio na tela. Toque em Jogar Novamente para refazer ou siga em frente.'
        },

        // ─── Avaliação final (slide global 43, s43) — 8 perguntas ────────────
        's43': {
            panels: { intro: '#q6-intro-panel', question: '#q6-question-panel', result: '#q6-result-panel' },
            counterSelector: '#q6-counter',
            intro: 'Desafio NR-11. Avaliação Final. Liberação operacional. Responda oito perguntas. Você precisa acertar no mínimo cinco para avançar. Toque em Iniciar Desafio para começar.',
            questions: [
                'Pergunta 1 de 8. Legislação e habilitação. O operador está com seu cartão de identificação, com nome e foto, vencido há dois anos, mas continua operando a máquina normalmente. Opção A: Operação segura. Opção B: Risco ou infração.',
                'Pergunta 2 de 8. Triângulo da estabilidade. Para ganhar tempo, o operador faz um giro rápido à esquerda enquanto transporta uma carga pesada elevada. Opção A: Operação segura. Opção B: Risco ou infração.',
                'Pergunta 3 de 8. Trânsito e pedestres. Ao se aproximar de um cruzamento interno do galpão, o operador faz a parada obrigatória e toca a buzina antes de prosseguir. Opção A: Operação segura. Opção B: Risco ou infração.',
                'Pergunta 4 de 8. Marcha à ré. O operador transporta uma carga que bloqueia totalmente sua visão frontal e decide conduzir a empilhadeira de marcha à ré. Opção A: Operação segura. Opção B: Risco ou infração.',
                'Pergunta 5 de 8. Checklist e manutenção. Durante o checklist diário, o operador percebe que a buzina não funciona, registra a falha, mas continua utilizando a máquina. Opção A: Operação segura. Opção B: Risco ou infração.',
                'Pergunta 6 de 8. Carona proibida. O operador permite que um ajudante viaje em pé na lateral da empilhadeira para atravessar o estoque. Opção A: Operação segura. Opção B: Risco ou infração.',
                'Pergunta 7 de 8. Casa de baterias. Antes de iniciar o carregamento da bateria, o operador completa o nível dos elementos com água. Opção A: Operação segura. Opção B: Risco ou infração.',
                'Pergunta 8 de 8. Emergência e incêndio. Ao ouvir o alarme de incêndio, o operador estaciona a empilhadeira em local seguro, libera a passagem e aguarda as orientações da brigada. Opção A: Operação segura. Opção B: Risco ou infração.'
            ],
            result: 'Resultado da Avaliação Final. Veja se concluiu o desafio na tela. Caso aprovado, avance para a conclusão. Caso contrário, refaça a avaliação.'
        }
    };

    /* Textos hardcoded para slides "normais" cujos áudios atuais ficaram ruins.
       Adicione aqui se quiser sobrescrever o texto extraído do HTML.
       Slides não listados usam extração automática via jsdom no generator.    */
    const OVERRIDES = {
        's27': 'Início. Módulo 5. Procedimentos Seguros.',
        's28': 'Você está pronto para operar? Antes de ligar a empilhadeira, confirme os itens obrigatórios. Checklist de liberação. Marque todos os itens para liberar a operação. Estou apto medicamente. Realizei o treinamento obrigatório. Fiz o Check List da empilhadeira. Estou utilizando o cinto de segurança. Não utilizarei celular durante a operação. Não transportarei passageiros.',
        's29': 'Condução e parada segura. Preferência a pedestres. Evite conversões bruscas. É sua obrigação diária. Compare o estacionamento correto e o incorreto. Regra de estacionamento: garfos totalmente abaixados, chave removida, área permitida e corredores livres.',
        's30': 'Módulo 5. Trânsito seguro. Assista ao vídeo.',
        's31': 'Módulo 5. Estacionamento e emergência. Assista ao vídeo.',
        's36': 'Início. Módulo 6. Emergências e Baterias.',
        's36a': 'Módulo 6. Baterias, GLP e emergências. Assista ao vídeo.',
        's37': 'Regras críticas para baterias e GLP. Percorra os quatro cards: bateria elétrica, vazamento de ácido, cilindro de GLP e o que é proibido. Proibido fumar, produzir fagulhas, utilizar chamas abertas ou improvisar procedimentos.',
        's38': 'Ação em casos de incêndio. Saiba como agir em situações de emergência. Passo a passo: alarme, estacione em local seguro, desligue o equipamento, evacuate liberando as saídas e aguarde a brigada. Combate permitido apenas quando for seguro. Nunca faça o que coloca pessoas em risco. Regra principal: pessoas primeiro, equipamentos depois.',
        's40': 'Pense antes de agir. Segurança em primeiro lugar. Avaliar riscos e seguir procedimentos é parte do trabalho. Confirme seu compromisso com a segurança.',
        's41': 'Módulo 6. Encerramento. Assista ao vídeo.',
        's44': 'Treinamento concluído. NR-11, Empilhadeira Elétrica Retrátil e Combustão. Seis módulos concluídos. Avaliação aprovada. Parabéns. Toque em Reiniciar Curso se quiser refazer o treinamento.'
    };

    /* Calcula o número global do slide (1..NR11_TOTAL_SLIDES) a partir do
       nome do arquivo HTML e do índice interno do slide. Mantém em sintonia
       com NR11_MODULE_OFFSETS de shared.js.                                    */
    const MODULE_OFFSETS = {
        'index.html': 0, 'modulo-1.html': 3, 'modulo-2.html': 10,
        'modulo-3.html': 17, 'modulo-4.html': 23, 'modulo-5.html': 29,
        'modulo-6.html': 35
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
