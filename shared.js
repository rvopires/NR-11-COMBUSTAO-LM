/* ============================================================
   NR 11 — EMPILHADEIRA ELÉTRICA RETRÁTIL E COMBUSTÃO — Shared logic (split refactor)
   ============================================================ */
function openImageModal(src) {
    const modal = document.getElementById('imgModal');
    const img = document.getElementById('modalImg');
    if (!modal || !img) return;
    img.src = src;
    modal.classList.add('active');
}
function closeImageModal(e) {
    const modal = document.getElementById('imgModal');
    if (!modal) return;
    modal.classList.remove('active');
}

/* ── Mobile: setinha para rolar conteúdo cortado ── */
const _slideScrollBtns = {};
const _SCROLL_BTN_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';

window.scrollSlideDown = function (slideId) {
    const cfg = _slideScrollBtns[slideId];
    const area = cfg ? cfg.area : document.querySelector('#' + slideId + ' .content-area');
    if (!area) return;
    area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
};

function updateSlideScrollBtn(slideId) {
    const cfg = _slideScrollBtns[slideId];
    if (!cfg) return;
    if (!window.matchMedia('(max-width: 768px)').matches) {
        cfg.btn.classList.add('is-hidden');
        return;
    }
    // Páginas que são só carrossel (sem precisar rolar verticalmente) escondem a setinha.
    // Páginas mistas (ex.: imagem + carrossel) continuam mostrando quando há overflow.
    const slide = document.getElementById(slideId);
    const hasCarousel = !!(slide && slide.querySelector('[class*="-carousel-nav"]'));
    const needsScroll = cfg.area.scrollHeight > cfg.area.clientHeight + 8;
    if (hasCarousel && !needsScroll) {
        cfg.btn.classList.add('is-hidden');
        return;
    }
    const atBottom = cfg.area.scrollTop + cfg.area.clientHeight >= cfg.area.scrollHeight - 8;
    cfg.btn.classList.toggle('is-hidden', !needsScroll || atBottom);
}

window.updateSlideScrollBtn = updateSlideScrollBtn;

function refreshActiveSlideScrollBtn() {
    const active = document.querySelector('.slide.active');
    if (active && active.id) updateSlideScrollBtn(active.id);
}

function scheduleScrollBtnRefresh() {
    requestAnimationFrame(refreshActiveSlideScrollBtn);
    setTimeout(refreshActiveSlideScrollBtn, 80);
    setTimeout(refreshActiveSlideScrollBtn, 320);
}

window.refreshActiveSlideScrollBtn = refreshActiveSlideScrollBtn;
window.scheduleScrollBtnRefresh = scheduleScrollBtnRefresh;

function registerSlideScrollBtn(slideId, btn, area) {
    if (_slideScrollBtns[slideId]) return;
    _slideScrollBtns[slideId] = { btn, area };
    if (!btn.onclick) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            scrollSlideDown(slideId);
        });
    }
    area.addEventListener('scroll', function () { updateSlideScrollBtn(slideId); }, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(function () { updateSlideScrollBtn(slideId); });
        ro.observe(area);
    }
    if (typeof MutationObserver !== 'undefined') {
        const mo = new MutationObserver(function () { scheduleScrollBtnRefresh(); });
        mo.observe(area, { childList: true, subtree: true, attributes: true, characterData: true });
    }
    updateSlideScrollBtn(slideId);
}

function ensureSlideScrollBtn(slide) {
    const slideId = slide.id;
    if (!slideId) return;
    const area = slide.querySelector('.content-area');
    if (!area) return;

    let btn = slide.querySelector(':scope > .slide-scroll-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slide-scroll-btn is-hidden';
        btn.setAttribute('aria-label', 'Rolar para baixo');
        btn.innerHTML = _SCROLL_BTN_SVG;
        slide.appendChild(btn);
    }
    registerSlideScrollBtn(slideId, btn, area);
}

function initAllSlideScrollBtns() {
    document.querySelectorAll('.slide').forEach(ensureSlideScrollBtn);
}

initAllSlideScrollBtns();
window.addEventListener('resize', refreshActiveSlideScrollBtn);
const _scrollBtnMq = window.matchMedia('(max-width: 768px)');
if (_scrollBtnMq.addEventListener) {
    _scrollBtnMq.addEventListener('change', refreshActiveSlideScrollBtn);
} else if (_scrollBtnMq.addListener) {
    _scrollBtnMq.addListener(refreshActiveSlideScrollBtn);
}

/* ════════════════════════════════════════
   NAVIGATION CORE
   ════════════════════════════════════════ */

// ===== Persistence helpers =====
(function clearNr11Persistence() {
    try {
        var lsKeys = [];
        for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && (k.indexOf('nr11_') === 0 || k.indexOf('tutorial_nr11') === 0)) lsKeys.push(k);
        }
        lsKeys.forEach(function (k) { localStorage.removeItem(k); });
        var ssKeys = [];
        for (var j = 0; j < sessionStorage.length; j++) {
            var sk = sessionStorage.key(j);
            if (sk && sk.indexOf('nr11_') === 0) ssKeys.push(sk);
        }
        ssKeys.forEach(function (k) { sessionStorage.removeItem(k); });
    } catch (e) { }
})();
try {
    // Mantém ?restoreslide / ?last para o atalho goNN; limpa o resto
    if (window.location.search) {
        const url = new URL(window.location.href);
        const keep = url.searchParams.has('restoreslide') || url.searchParams.has('last');
        if (!keep) history.replaceState(null, '', window.location.pathname);
    }
} catch (e) { }

function getPageKey() {
    try {
        if (window.MODULE_NAV && window.MODULE_NAV.id) return window.MODULE_NAV.id;
        const p = window.location.pathname.split('/').pop() || 'index.html';
        return p.replace(/\.html$/i, '') || 'index';
    } catch (e) { return 'index'; }
}

function _loadReqState() {
    // No persistence: always start with empty requirements
    return [];
}
function _saveReqState(arr) {
    // No persistence: do nothing
}


// === GLOBAL SLIDE INDEXING ===
const NR11_MODULE_OFFSETS = {
    'index': 0,
    'modulo-1': 3,
    'modulo-2': 10,
    'modulo-3': 17,
    'modulo-4': 23,
    'modulo-5': 29,
    'modulo-6': 35
};
const NR11_TOTAL_SLIDES = 44;
function nr11GlobalSlide() {
    if (typeof currentSlide === 'undefined') return 1;
    const offset = NR11_MODULE_OFFSETS[(window.MODULE_NAV && window.MODULE_NAV.id) || 'index'] || 0;
    return offset + currentSlide + 1;
}
const QUIZ_AUDIO_HELPER_PAGES = [10, 17, 23, 29, 35, 40, 43];
const QUIZ_AUDIO_HELPER_PANELS = {
    s9: 'q1-question-panel',
    s15: 'sq2-question-panel',
    's21': 'q3-question-panel',
    's26': 'q4-question-panel',
    's35': 'q5-question-panel',
    's39': 'q6b-question-panel',
    's43': 'q6-question-panel'
};
window.updateQuizAudioHelper = function updateQuizAudioHelper() {
    const bar = document.getElementById('a11y-bar');
    const audioHelper = bar && bar.querySelector('.audio-helper');
    if (!audioHelper) return;

    let show = false;
    if (QUIZ_AUDIO_HELPER_PAGES.includes(nr11GlobalSlide())) {
        const activeSlide = document.querySelector('.slide.active');
        const panelId = activeSlide && QUIZ_AUDIO_HELPER_PANELS[activeSlide.id];
        if (panelId) {
            const panel = document.getElementById(panelId);
            show = !!(panel && window.getComputedStyle(panel).display !== 'none');
        }
    }

    audioHelper.classList.toggle('is-active', show);
    if (bar) bar.classList.toggle('quiz-audio-helper', show);
};

/* ════════════════════════════════════════
   RELOAD GUARD: refresh sempre volta pro index
   ════════════════════════════════════════ */
// O script que forçava a limpeza do localStorage ao recarregar a página foi removido
// a pedido do usuário para preservar a página (o progresso) quando o usuário sair.

/* ════════════════════════════════════════
   GLOBAL HISTORY SYSTEM
   ════════════════════════════════════════ */
function trackHistory(slideIndex) {
    // Removed persistence
}

function popHistory() {
    return null;
}

/* ════════════════════════════════════════
   MODULE NAVIGATION (multi-page refactor)
   ════════════════════════════════════════ */
window.MODULE_NAV = window.MODULE_NAV || { id: 'index', prev: null, next: null, label: 'Capa' };

function moduleNext(force) {
    try { playBeep && playBeep('click'); } catch (e) { }
    const total = document.querySelectorAll('.slide').length;
    if (currentSlide === total - 1) {
        if (!window.MODULE_NAV.next) return;
        if (!force && !isSlideCompleted(currentSlide)) {
            alert('Você precisa concluir o quiz deste módulo para avançar.');
            return;
        }
        // removed persistence
        pauseAllSlideVideos();
        window.location.href = window.MODULE_NAV.next;
        return;
    }
    goTo(currentSlide + 1, !!force);
}
window.moduleNext = moduleNext;

function modulePrev(force) {
    try { playBeep && playBeep('click'); } catch (e) { }
    if (currentSlide === 0) {
        if (!window.MODULE_NAV.prev) return;
        // Persistence removed for previous navigation
        pauseAllSlideVideos();
        window.location.href = window.MODULE_NAV.prev;
        return;
    }
    goTo(currentSlide - 1, true);
}
window.modulePrev = modulePrev;

const TOTAL = document.querySelectorAll('.slide').length;
let currentSlide = 0;

function startCourse() {
    const clickAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    clickAudio.volume = 0.4;
    clickAudio.play().catch(e => console.log('Audio error:', e));
    goTo(1, true);
}

function buildDots() {
    const dots = document.getElementById('nav-dots');
    if (!dots) return;
    dots.innerHTML = '';
    for (let i = 0; i < TOTAL; i++) {
        const d = document.createElement('div');
        d.className = 'ndot' + (i === currentSlide ? ' cur' : '');
        d.onclick = () => goTo(i, true);
        dots.appendChild(d);
    }
}

window.demoMode = (function () {
    try { return sessionStorage.getItem('nr11-demoMode') === '1'; } catch (e) { return false; }
})();
window._s44FinalizarUnlocked = false;

function isDemoBtnRevealed() {
    try { return sessionStorage.getItem('nr11-demoBtnVisible') === '1'; } catch (e) { return false; }
}

function setDemoBtnRevealed(visible) {
    try { sessionStorage.setItem('nr11-demoBtnVisible', visible ? '1' : '0'); } catch (e) { }
}

function applyDemoModeUI() {
    const btn = document.getElementById('btn-demo');
    const ind = document.getElementById('demo-indicator');
    var revealBtn = !!window.demoMode || isDemoBtnRevealed();

    if (window.demoMode) {
        setDemoBtnRevealed(true);
        revealBtn = true;
    }

    if (btn) {
        btn.classList.toggle('demo-shortcut-visible', !!revealBtn);
        btn.classList.toggle('is-active', !!window.demoMode);
    }
    if (ind) {
        ind.classList.toggle('demo-shortcut-visible', !!window.demoMode);
        if (window.demoMode) {
            ind.style.opacity = '1';
            ind.style.transform = 'translateY(0)';
        } else {
            ind.style.opacity = '0';
            ind.style.transform = 'translateY(-20px)';
        }
    }
    try { updateNextButton(); } catch (e) { }
    try { if (typeof window.positionA11yBar === 'function') window.positionA11yBar(); } catch (e) { }
}

function s44HideFinalizarBtn() {
    window._s44FinalizarUnlocked = false;
    const btn = document.getElementById('s44-btn-final');
    if (!btn) return;
    btn.style.display = 'none';
    btn.classList.remove('is-visible');
    btn.setAttribute('aria-hidden', 'true');
}

function s44RevealFinalizarBtn() {
    if (window._s44FinalizarUnlocked) return;
    const btn = document.getElementById('s44-btn-final');
    if (!btn) return;
    window._s44FinalizarUnlocked = true;
    try { playTechClick(); } catch (e) { }
    btn.style.display = 'inline-flex';
    btn.setAttribute('aria-hidden', 'false');
    btn.classList.remove('is-visible');
    void btn.offsetWidth;
    btn.classList.add('is-visible');
}

function toggleDemoMode() {
    window.demoMode = !window.demoMode;
    try { sessionStorage.setItem('nr11-demoMode', window.demoMode ? '1' : '0'); } catch (e) { }
    setDemoBtnRevealed(!!window.demoMode);

    const activeSlide = document.querySelector('.slide.active');
    if (window.demoMode) {
        if (activeSlide && activeSlide.id === 's44') {
            s44RevealFinalizarBtn();
        }
        if (activeSlide && activeSlide.id === 's43') {
            const rPanel = document.getElementById('q6-result-panel');
            if (rPanel) rPanel.classList.add('req-done');
        }
    } else {
        if (activeSlide && activeSlide.id === 's43') {
            const rPanel = document.getElementById('q6-result-panel');
            const status = document.getElementById('q6-status');
            const approved = status && status.classList.contains('ap');
            if (rPanel && !approved) rPanel.classList.remove('req-done');
        }
    }
    applyDemoModeUI();
}

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleDemoMode();
    }
});

/* Atalho: digitar qa1010 → mostra/esconde o botão SIMULAÇÃO */
(function initDemoShortcutReveal() {
    var seq = '';
    var target = 'qa1010';
    window.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;
        if (!e.key || e.key.length !== 1) return;
        seq = (seq + e.key.toLowerCase()).slice(-target.length);
        if (seq !== target) return;
        var btn = document.getElementById('btn-demo');
        if (btn) {
            btn.classList.toggle('demo-shortcut-visible');
            var visible = btn.classList.contains('demo-shortcut-visible');
            setDemoBtnRevealed(visible);
            if (!visible && window.demoMode) {
                window.demoMode = false;
                try { sessionStorage.setItem('nr11-demoMode', '0'); } catch (err) { }
            }
            applyDemoModeUI();
        }
        seq = '';
    });
})();

/* Atalho: digitar go + número (ex. go31) → pula para a página global; Esc cancela */
(function initGoPageShortcut() {
    var buf = '';
    var timer = null;
    var modules = [
        { id: 'index', offset: 0, file: 'index.html' },
        { id: 'modulo-1', offset: 3, file: 'modulo-1.html' },
        { id: 'modulo-2', offset: 10, file: 'modulo-2.html' },
        { id: 'modulo-3', offset: 17, file: 'modulo-3.html' },
        { id: 'modulo-4', offset: 23, file: 'modulo-4.html' },
        { id: 'modulo-5', offset: 29, file: 'modulo-5.html' },
        { id: 'modulo-6', offset: 35, file: 'modulo-6.html' }
    ];

    function clearBuf() {
        buf = '';
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }

    function resolveGlobalPage(pageNum) {
        if (!pageNum || pageNum < 1 || pageNum > NR11_TOTAL_SLIDES) return null;
        for (var i = modules.length - 1; i >= 0; i--) {
            if (pageNum > modules[i].offset) {
                return {
                    id: modules[i].id,
                    file: modules[i].file,
                    local: pageNum - modules[i].offset - 1
                };
            }
        }
        return null;
    }

    function jumpToGlobalPage(pageNum) {
        var target = resolveGlobalPage(pageNum);
        if (!target) return;
        clearBuf();
        var currentId = (window.MODULE_NAV && window.MODULE_NAV.id) || 'index';
        if (target.id === currentId) {
            if (typeof goTo === 'function') goTo(target.local, true);
            return;
        }
        window.location.href = target.file + '?restoreslide=' + target.local;
    }

    function tryCommitGo() {
        var m = buf.match(/^go(\d{1,2})$/);
        if (!m) return;
        var pageNum = parseInt(m[1], 10);
        if (pageNum >= 1 && pageNum <= NR11_TOTAL_SLIDES) jumpToGlobalPage(pageNum);
        else clearBuf();
    }

    window.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;

        if (e.key === 'Enter' && /^go\d{1,2}$/.test(buf)) {
            e.preventDefault();
            tryCommitGo();
            return;
        }
        if (e.key === 'Escape') {
            clearBuf();
            return;
        }
        if (!e.key || e.key.length !== 1) return;

        var ch = e.key.toLowerCase();
        if (ch === 'g') {
            clearBuf();
            buf = 'g';
            return;
        }
        if (buf === 'g' && ch === 'o') {
            buf = 'go';
            return;
        }
        if (buf.indexOf('go') === 0 && /^\d$/.test(ch) && buf.length < 4) {
            buf += ch;
            if (timer) clearTimeout(timer);
            timer = setTimeout(function () { tryCommitGo(); }, 700);
            return;
        }
        clearBuf();
    });
})();

function isCourseVideoSrc(src) {
    src = src || '';
    return src.indexOf('youtube.com') !== -1 || src.indexOf('youtu.be') !== -1 || src.indexOf('vimeo.com') !== -1;
}

function slideHasVimeoVideo(slide) {
    if (!slide) return false;
    var wrap = slide.querySelector('.video-wrap');
    if (!wrap) return false;
    var iframe = wrap.querySelector('iframe');
    if (!iframe) return false;
    var src = iframe.getAttribute('src') || '';
    return !!(iframe.dataset.vimeoSrc || iframe.dataset.vimeoPrepared || isCourseVideoSrc(src));
}

function isVideoSlidePending(slide) {
    if (!slide || !slideHasVimeoVideo(slide)) return false;
    var wrap = slide.querySelector('.video-wrap');
    return wrap && !wrap.classList.contains('req-done');
}

function ensureVideoSlideReqItems() {
    document.querySelectorAll('.slide .video-wrap iframe').forEach(function (iframe) {
        var src = iframe.getAttribute('src') || '';
        if (!iframe.dataset.vimeoSrc && !iframe.dataset.vimeoPrepared && !isCourseVideoSrc(src)) return;
        var wrap = iframe.closest('.video-wrap');
        if (wrap) wrap.classList.add('req-item');
    });
}

function isSlideCompleted(idx) {
    if (window.demoMode) return true;
    const slide = document.querySelectorAll('.slide')[idx];
    if (!slide) return true;
    if (isVideoSlidePending(slide)) return false;
    const resultPanel = slide.querySelector('[id$="-result-panel"]');
    if (resultPanel && resultPanel.style.display === 'none') return false;
    if (resultPanel && resultPanel.style.display === 'block') {
        const status = resultPanel.querySelector('.r-status');
        if (status && status.classList.contains('ref')) return false;
    }
    const reqs = slide.querySelectorAll('.req-item');
    if (slideHasVimeoVideo(slide) && !reqs.length) return false;
    for (let i = 0; i < reqs.length; i++) {
        if (!reqs[i].classList.contains('req-done')) return false;
    }
    return true;
}

function updateNextButton() {
    const btnFwd = document.getElementById('btn-fwd');
    if (!btnFwd) return;
    const completed = isSlideCompleted(currentSlide);
    if (currentSlide === TOTAL - 1) {
        btnFwd.disabled = true;
        btnFwd.style.display = 'none';
        btnFwd.classList.remove('is-locked');
    } else {
        btnFwd.disabled = !completed;
        btnFwd.style.display = 'flex';
        btnFwd.classList.toggle('is-locked', !completed);
    }
    btnFwd.setAttribute('aria-disabled', btnFwd.disabled ? 'true' : 'false');
}

/* ── Slide video lazy load (YouTube iframes + video preload) ── */
var SLIDE_VIDEO_BLANK = 'about:blank';
var _videoWrapInited = new Set();
var _ytApiPromise = null;
var VIDEO_UNLOCK_REMAINING_SECONDS = 3;

function getYouTubeIdFromSrc(src) {
    src = src || '';
    var m = src.match(/youtube\.com\/embed\/([^?&/"']+)/) ||
        src.match(/youtu\.be\/([^?&/"']+)/) ||
        src.match(/[?&]v=([^?&/"']+)/);
    return m ? m[1] : null;
}

function getVimeoIdFromSrc(src) {
    var m = (src || '').match(/vimeo\.com\/video\/(\d+)/);
    return m ? m[1] : null;
}

function isLoadedCourseVideoIframe(iframe) {
    var src = iframe.getAttribute('src') || '';
    return isCourseVideoSrc(src) && src !== SLIDE_VIDEO_BLANK;
}

function ensureYouTubeApi() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (_ytApiPromise) return _ytApiPromise;
    _ytApiPromise = new Promise(function (resolve) {
        var prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = function () {
            if (typeof prev === 'function') prev();
            resolve();
        };
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            var tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
        }
        if (window.YT && window.YT.Player) resolve();
    });
    return _ytApiPromise;
}

function ensureVideoPoster(wrap, videoSrc) {
    if (!wrap || wrap.querySelector('.video-poster')) return;
    var ytId = getYouTubeIdFromSrc(videoSrc);
    var vimeoId = getVimeoIdFromSrc(videoSrc);
    if (!ytId && !vimeoId) return;
    var poster = document.createElement('img');
    poster.className = 'video-poster';
    poster.alt = '';
    poster.src = ytId
        ? ('https://img.youtube.com/vi/' + ytId + '/hqdefault.jpg')
        : ('https://vumbnail.com/' + vimeoId + '.jpg');
    poster.decoding = 'async';
    var iframe = wrap.querySelector('iframe');
    if (iframe) wrap.insertBefore(poster, iframe);
    else wrap.appendChild(poster);
}

function setVideoPosterVisible(wrap, visible) {
    var poster = wrap && wrap.querySelector('.video-poster');
    if (poster) poster.style.display = visible ? 'block' : 'none';
}

function normalizeCourseVideoSrc(src) {
    src = src || '';
    if (src.indexOf('youtube.com') === -1 && src.indexOf('youtu.be') === -1) return src;
    try {
        if (location.protocol !== 'file:' && src.indexOf('origin=') === -1) {
            src += (src.indexOf('?') >= 0 ? '&' : '?') + 'origin=' + encodeURIComponent(location.origin);
        }
    } catch (e) { }
    return src;
}

function prepareVimeoIframe(iframe) {
    if (!iframe || iframe.dataset.vimeoPrepared) return;
    if (!iframe.closest('.video-wrap')) return;
    var src = iframe.getAttribute('src');
    if (!src || src === SLIDE_VIDEO_BLANK || !isCourseVideoSrc(src)) return;
    iframe.dataset.vimeoSrc = normalizeCourseVideoSrc(src);
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.removeAttribute('src');
    iframe.dataset.vimeoPrepared = '1';
    var wrap = iframe.closest('.video-wrap');
    if (wrap) {
        ensureVideoPoster(wrap, src);
        wrap.classList.add('req-item');
        wrap.classList.remove('req-done');
    }
}

function pauseVimeoIframe(iframe) {
    if (!iframe) return;
    try {
        if (iframe._ytPlayer && typeof iframe._ytPlayer.pauseVideo === 'function') {
            iframe._ytPlayer.pauseVideo();
            return;
        }
        if (typeof Vimeo !== 'undefined' && isLoadedCourseVideoIframe(iframe) && (iframe.getAttribute('src') || '').indexOf('vimeo') !== -1) {
            new Vimeo.Player(iframe).pause().catch(function () { });
        }
    } catch (e) { }
}

function pauseAllSlideVideos() {
    document.querySelectorAll('.slide iframe').forEach(pauseVimeoIframe);
    document.querySelectorAll('.slide video').forEach(function (v) {
        try { v.pause(); } catch (e) { }
    });
}

function unloadVimeoIframe(iframe) {
    pauseVimeoIframe(iframe);
    if (!iframe.dataset.vimeoSrc) return;
    var wrap = iframe.closest('.video-wrap');
    if (wrap) {
        if (wrap._ytPoll) {
            clearInterval(wrap._ytPoll);
            wrap._ytPoll = null;
        }
        _videoWrapInited.delete(wrap);
        wrap.classList.remove('req-done');
    }
    try { iframe._ytPlayer = null; } catch (e) { }
    iframe.setAttribute('src', SLIDE_VIDEO_BLANK);
    setVideoPosterVisible(wrap, true);
}

function loadVimeoIframe(iframe) {
    var src = normalizeCourseVideoSrc(iframe.dataset.vimeoSrc || '');
    if (!src) return;
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    var current = iframe.getAttribute('src') || '';
    if (current === src) {
        var wrapLoaded = iframe.closest('.video-wrap');
        if (wrapLoaded) {
            wrapLoaded.classList.add('req-item');
            wrapLoaded.classList.remove('req-done');
        }
        initVideoWrapPlayer(wrapLoaded);
        updateNextButton();
        return;
    }
    if (!current || current === SLIDE_VIDEO_BLANK) {
        iframe.addEventListener('load', function () {
            setVideoPosterVisible(iframe.closest('.video-wrap'), false);
            initVideoWrapPlayer(iframe.closest('.video-wrap'));
        }, { once: true });
        iframe.setAttribute('src', src);
    }
}

function markVideoWrapDone(wrap, warn) {
    if (!wrap || wrap.classList.contains('req-done')) return;
    wrap.classList.add('req-done');
    if (warn) warn.style.display = 'none';
    updateNextButton();
    try { playBeep('end'); } catch (e) { }
}

function initVideoWrapPlayer(wrap) {
    if (!wrap) return;
    var iframe = wrap.querySelector('iframe');
    if (!iframe || !isLoadedCourseVideoIframe(iframe)) return;

    wrap.classList.add('req-item');
    wrap.classList.remove('req-done');
    updateNextButton();

    if (_videoWrapInited.has(wrap)) return;
    _videoWrapInited.add(wrap);
    wrap.style.cursor = 'default';

    var warn = wrap.querySelector('.video-warn');
    if (!warn) {
        warn = document.createElement('div');
        warn.className = 'video-warn';
        warn.textContent = 'Assista até o final';
        wrap.appendChild(warn);
    }

    var src = iframe.getAttribute('src') || '';
    if (src.indexOf('youtube') === -1 && src.indexOf('youtu.be') === -1) {
        // fallback Vimeo (não usado nos vídeos do curso)
        if (typeof Vimeo === 'undefined') return;
        var vPlayer = new Vimeo.Player(iframe);
        var maxWatchedV = 0;
        vPlayer.on('timeupdate', function (data) {
            if (data.seconds > maxWatchedV + 1) {
                vPlayer.setCurrentTime(maxWatchedV);
                return;
            }
            if (data.seconds > maxWatchedV && (data.seconds - maxWatchedV) < 1.5) maxWatchedV = data.seconds;
            vPlayer.getDuration().then(function (duration) {
                if (duration > 0 && (duration - data.seconds) <= VIDEO_UNLOCK_REMAINING_SECONDS) {
                    markVideoWrapDone(wrap, warn);
                }
            }).catch(function () { });
        });
        vPlayer.on('ended', function () { markVideoWrapDone(wrap, warn); });
        return;
    }

    ensureYouTubeApi().then(function () {
        if (!iframe.isConnected) return;
        if (!iframe.id) iframe.id = 'yt-' + Math.random().toString(36).slice(2, 10);

        var maxWatched = 0;
        var player = new YT.Player(iframe.id, {
            events: {
                onReady: function (e) {
                    iframe._ytPlayer = e.target;
                    if (wrap._ytPoll) clearInterval(wrap._ytPoll);
                    wrap._ytPoll = setInterval(function () {
                        try {
                            if (!iframe._ytPlayer || typeof iframe._ytPlayer.getCurrentTime !== 'function') return;
                            var seconds = iframe._ytPlayer.getCurrentTime() || 0;
                            var duration = iframe._ytPlayer.getDuration() || 0;
                            var state = iframe._ytPlayer.getPlayerState();

                            if (seconds > maxWatched + 1.25) {
                                iframe._ytPlayer.seekTo(maxWatched, true);
                                return;
                            }
                            if (state === YT.PlayerState.PLAYING) {
                                if (seconds > maxWatched) maxWatched = seconds;
                                warn.style.opacity = '0';
                                warn.style.pointerEvents = 'none';
                            } else if (state === YT.PlayerState.PAUSED && !wrap.classList.contains('req-done')) {
                                warn.style.opacity = '1';
                                warn.style.pointerEvents = 'auto';
                            }

                            if (duration > 0 && (duration - seconds) <= VIDEO_UNLOCK_REMAINING_SECONDS) {
                                markVideoWrapDone(wrap, warn);
                            }
                            if (state === YT.PlayerState.ENDED) {
                                markVideoWrapDone(wrap, warn);
                            }
                        } catch (err) { }
                    }, 250);
                },
                onStateChange: function (e) {
                    if (e.data === YT.PlayerState.ENDED) {
                        markVideoWrapDone(wrap, warn);
                    }
                    if (e.data === YT.PlayerState.PLAYING) {
                        warn.style.opacity = '0';
                        warn.style.pointerEvents = 'none';
                    }
                    if (e.data === YT.PlayerState.PAUSED && !wrap.classList.contains('req-done')) {
                        warn.style.opacity = '1';
                        warn.style.pointerEvents = 'auto';
                    }
                }
            }
        });
        iframe._ytPlayer = player;
    });
}

function syncSlideVideos(activeIdx) {
    ensureVideoSlideReqItems();
    var slides = document.querySelectorAll('.slide');
    if (!slides.length) return;
    slides.forEach(function (slide, i) {
        slide.querySelectorAll('.video-wrap iframe').forEach(prepareVimeoIframe);
        if (i === activeIdx) {
            slide.querySelectorAll('.video-wrap').forEach(function (wrap) {
                if (wrap.querySelector('iframe[data-vimeo-prepared], iframe[src*="youtube"], iframe[src*="youtu.be"], iframe[src*="vimeo"]')) {
                    wrap.classList.add('req-item');
                    wrap.classList.remove('req-done');
                }
            });
        }
        slide.querySelectorAll('.video-wrap iframe[data-vimeo-prepared]').forEach(function (iframe) {
            if (i === activeIdx) {
                loadVimeoIframe(iframe);
            } else {
                unloadVimeoIframe(iframe);
            }
        });
        slide.querySelectorAll('video').forEach(function (v) {
            v.setAttribute('preload', 'metadata');
            if (i !== activeIdx) {
                try { v.pause(); } catch (e) { }
            }
        });
    });
    try { updateNextButton(); } catch (e) { }
}

function goTo(idx, force = false, skipHistory = false) {
    try {
        const clickAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        clickAudio.volume = 0.4;
        clickAudio.play().catch(e => console.log('Audio error:', e));
    } catch (e) { }

    if (idx < 0 || idx >= TOTAL) return;
    if (idx > currentSlide && !force && !isSlideCompleted(currentSlide)) {
        alert('Por favor, interaja com todos os itens e responda o quiz para avançar.');
        return;
    }
    const slides = document.querySelectorAll('.slide');
    const oldSlide = slides[currentSlide];
    oldSlide.querySelectorAll('iframe').forEach(pauseVimeoIframe);
    oldSlide.querySelectorAll('video').forEach(function (v) {
        try { v.pause(); } catch (e) { }
    });
    oldSlide.classList.remove('active');
    oldSlide.classList.add('exit-left');
    // Pause q6 background music when leaving quiz 6 slide
    try {
        const q6Music = oldSlide.querySelector('#q6-bg-music');
        if (q6Music) { q6Music.pause(); q6Music.currentTime = 0; }
    } catch (e) { }
    setTimeout(() => { oldSlide.classList.remove('exit-left'); }, 600);

    currentSlide = idx;
    if (!skipHistory) trackHistory(currentSlide);
    const newSlide = slides[currentSlide];
    newSlide.classList.add('active');
    newSlide.classList.remove('exit-left');

    const nav = document.getElementById('nav');
    if (nav) nav.style.display = 'flex';

    if (newSlide.id === 's44') {
        startConclusionEpic();
        s44HideFinalizarBtn();
    }
    const pbar = document.getElementById('pbar');
    if (pbar) pbar.style.width = (nr11GlobalSlide() / NR11_TOTAL_SLIDES * 100) + '%';
    const counter = document.getElementById('slide-counter');
    if (counter) counter.textContent = nr11GlobalSlide() + ' / ' + NR11_TOTAL_SLIDES;
    const btnBack = document.getElementById('btn-back');
    if (btnBack) {
        btnBack.disabled = (currentSlide === 0 && !window.MODULE_NAV.prev);
        btnBack.style.visibility = (currentSlide === 0 && !window.MODULE_NAV.prev) ? 'hidden' : 'visible';
    }
    const btnFwd = document.getElementById('btn-fwd');
    if (btnFwd) {
        btnFwd.style.visibility = 'visible';
        btnFwd.style.display = (currentSlide === TOTAL - 1) ? 'none' : 'flex';
    }
    buildDots();
    try { syncSlideVideos(currentSlide); } catch (e) { }
    updateNextButton();
    try { window.updateQuizAudioHelper(); } catch (e) { }
    try { scheduleScrollBtnRefresh(); } catch (e) { }
    // Slide index not persisted
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') moduleNext(true);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') modulePrev(true);
});


function startConclusionEpic() {
    createCinematicParticles();
    createPremiumConfetti();
    playConclusionCinematicAudio();
}

function createCinematicParticles() {
    const container = document.getElementById('c-particles');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle-green';
        p.style.width = p.style.height = (Math.random() * 4 + 2) + 'px';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = (Math.random() * 100 + 50) + 'vh';
        p.style.animationDuration = (Math.random() * 5 + 5) + 's';
        p.style.animationDelay = (Math.random() * 2) + 's';
        container.appendChild(p);
    }
}

function createPremiumConfetti() {
    const container = document.getElementById('c-confetti');
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#e65100', '#ff6d00', '#f1c40f', '#bf360c', '#ffffff'];
    for (let i = 0; i < 60; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * 100 + 'vw';
        c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        c.style.animationDuration = (Math.random() * 3 + 4) + 's';
        c.style.animationDelay = (Math.random() * 1.5) + 's';
        c.style.opacity = Math.random() * 0.5 + 0.5;
        container.appendChild(c);
    }
}

function playConclusionCinematicAudio() {
    try {
        // Usando caminho relativo para evitar bloqueios do navegador e ajustando volume
        const efeitofinal = new Audio('https://res.cloudinary.com/dzqns0zpe/video/upload/v1779288012/efeitofinal_kzr836.mp3');
        efeitofinal.volume = 0.5; // Volume ajustado para um nível médio/baixo
        efeitofinal.play().catch(e => console.log('Audio error:', e));
    } catch (e) { console.log('Audio disabled', e); }
}

function finishTraining() {
    console.log('--- TREINAMENTO FINALIZADO VIA SCORM/LMS ---');
    alert('Treinamento concluído e registrado com sucesso!');
    // Aqui iria a chamada para o LMS, ex: window.close(), SCORM.quit(), etc.
}

function restartCourse() {
    try {
        window.location.href = 'index.html';
    } catch (e) {
        window.location.assign('index.html');
    }
}
window.restartCourse = restartCourse;

/* ════════════════════════════════════════
   ════════════════════════════════════════ */
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let currentOsc = null;
let currentGain = null;

function playBeep(type) {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Evitar sobreposição cancelando o áudio anterior imediatamente
    if (currentOsc) {
        try { currentOsc.stop(); currentOsc.disconnect(); } catch (e) { }
    }
    if (currentGain) {
        try { currentGain.disconnect(); } catch (e) { }
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    currentOsc = osc;
    currentGain = gain;

    const now = audioCtx.currentTime;

    if (type === 'click') {
        // Som de clique tecnológico super rápido e sutil
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now); osc.stop(now + 0.08);
    } else if (type === 'ok') {
        // Acerto: acorde ascendente claro (dó–mi–sol)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.09);
        osc.frequency.setValueAtTime(783.99, now + 0.18);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.start(now); osc.stop(now + 0.42);
    } else if (type === 'nok') {
        // Erro: tom descendente grave
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.28);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
        osc.start(now); osc.stop(now + 0.36);
    } else if (type === 'end') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.1);
        osc.frequency.setValueAtTime(659.25, now + 0.2);
        osc.frequency.setValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
        osc.start(now); osc.stop(now + 0.6);
    } else if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'flip') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.12);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    }
}


// Global playTechClick - usa mesmo som do flip card  
window.playTechClick = function () {
    try { playBeep('flip'); } catch (e) { }
};

// Mobile/Browser audio unlock: resume AudioContext on first user interaction
(function unlockAudioOnFirstInteraction() {
    function unlock() {
        try {
            if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => { });
            // create a tiny silent buffer to unlock audio on iOS
            const silent = new Audio();
            silent.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
            silent.volume = 0;
            silent.play().catch(() => { });
        } catch (e) { }
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('click', unlock);
    }
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
    window.addEventListener('click', unlock, { once: true, passive: true });
})();

function initFlipCardInteractions() {
    const cards = document.querySelectorAll('#s8 .flip-card');
    cards.forEach(card => {
        card.addEventListener('click', () => playBeep('flip'));
    });
}

initFlipCardInteractions();

/* ── Reset de estado visual das respostas (quizzes/atividades) ── */
var ANSWER_STATE_CLASSES = ['selected', 'active', 'correct', 'wrong', 'checked', 'selected-true', 'selected-false', 'selected-visual', 'muted', 'answered'];

function clearAnswerState(el) {
    if (!el) return;
    ANSWER_STATE_CLASSES.forEach(function (cls) { el.classList.remove(cls); });
}

function clearAnswerGroup(container, selector) {
    if (!container) return;
    container.querySelectorAll(selector).forEach(clearAnswerState);
}

function resetTfButtons(btnTrue, btnFalse) {
    [btnTrue, btnFalse].forEach(clearAnswerState);
    if (btnTrue) {
        btnTrue.className = 'tf-btn true';
        btnTrue.style.animation = '';
    }
    if (btnFalse) {
        btnFalse.className = 'tf-btn false';
        btnFalse.style.animation = '';
    }
}

/* ════════════════════════════════════════
   QUIZ ENGINE (generic)
   ════════════════════════════════════════ */
function quizIsMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
}

function createQuizEngine(prefix, questions, numDots) {
    let idx = 0, answered = false, score = 0, selectedOptIdx = -1;
    let wrongTopics = [];
    const isChallengeQuiz = function () { return prefix === 'q1' || prefix === 'q3' || prefix === 'q4' || prefix === 'q5' || prefix === 'q6b' || prefix === 'q6'; };

    const _stateKey = () => 'nr11_' + getPageKey() + '_' + prefix + '_state';
    function _saveState() {
        // removed persistence
    }
    function _loadState() {
        return null;
    }

    function uniqueTopics(list) {
        const seen = {};
        const out = [];
        list.forEach(function (t) {
            if (!t || seen[t]) return;
            seen[t] = true;
            out.push(t);
        });
        return out;
    }

    function getMinCorrect() {
        if (prefix === 'q1' || prefix === 'q5' || prefix === 'q6b') return 2;
        if (prefix === 'q3' || prefix === 'q4') return 3;
        if (prefix === 'q6') return 5;
        return Math.ceil(questions.length * 0.60);
    }

    function start() {
        const introPanel = document.getElementById(prefix + '-intro-panel');
        const qPanel = document.getElementById(prefix + '-question-panel');
        if (introPanel) introPanel.style.display = 'none';
        if (qPanel) {
            qPanel.style.display = 'block';
            qPanel.style.opacity = '0';
            setTimeout(() => qPanel.style.opacity = '1', 50);
        }
        playBeep('click');
        if (prefix === 'q6') {
            try { playQuiz6Audio('start'); } catch (e) { }
            try {
                const m = document.getElementById('q6-bg-music');
                const btn = document.getElementById('q6-btn-music-toggle');
                if (m) {
                    m.volume = 0.15;
                    m.muted = false;
                    m.currentTime = 0;
                    m.play().catch(function () { });
                }
                if (btn) {
                    btn.innerHTML = '🔊 MUSIC ON';
                    btn.style.color = 'var(--green)';
                    btn.style.borderColor = 'var(--green)';
                }
            } catch (e) { }
        }
        try { window.updateQuizAudioHelper(); } catch (e) { }
    }

    function renderDots() {
        const dotsContainer = document.querySelector('#' + prefix + '-question-panel .q-dots');
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < numDots; i++) {
                const d = document.createElement('div');
                d.id = prefix + 'dot' + i;
                d.className = 'qdot2' + (i < idx ? ' done' : '') + (i === idx ? ' cur' : '');
                dotsContainer.appendChild(d);
            }
        }
    }

    function render() {
        const qPanel = document.getElementById(prefix + '-question-panel');
        if (qPanel) qPanel.classList.remove('q-result-anim');

        // sempre resetar estado visual a cada nova pergunta
        answered = false;
        selectedOptIdx = -1;

        const q = questions[idx];
        const isQ4 = prefix === 'q4';
        const isQ5 = prefix === 'q5';
        const isQuizMobile = quizIsMobile() && (prefix === 'q3' || prefix === 'q4' || prefix === 'q5');
        const c = document.getElementById(prefix + '-counter');
        if (c) {
            if (isChallengeQuiz()) {
                c.textContent = `Pergunta ${idx + 1} de ${questions.length}`;
            } else if (isQuizMobile) {
                c.textContent = (idx + 1) + ' DE ' + questions.length;
            } else {
                c.textContent = `Pergunta ${idx + 1} de ${questions.length}`;
            }
        }
        const txt = document.getElementById(prefix + '-text');
        if (txt) {
            if (isQ4 && quizIsMobile()) {
                txt.innerHTML = `
            ${q.img ? `<div class="q4-m-img-wrap"><img src="${q.img}" alt="Cenário"><button type="button" onclick="openImageModal('${q.img}')">🔍 AMPLIAR</button></div>` : ''}
            <div class="q4-m-sit">${q.q}</div>`;
            } else if (isQ4) {
                txt.innerHTML = `
            <div class="q4-layout">
                <div class="q4-col-img" style="position:relative;">
                    ${q.img ? `<img src="${q.img}" alt="Cenário" style="width:100%;height:100%;object-fit:cover;display:block;min-height:180px;max-height:240px;">` : ''}
                    ${q.img ? `<button onclick="openImageModal('${q.img}')" style="position:absolute;bottom:8px;left:10px;z-index:5;padding:5px 12px;background:rgba(0,0,0,0.75);border:1px solid rgba(230,81,0,0.6);border-radius:6px;color:rgba(230,81,0,1);font-size:11px;font-weight:700;cursor:pointer;letter-spacing:1px;backdrop-filter:blur(6px);text-transform:uppercase;">🔍 AMPLIAR</button>` : ''}
                </div>
                <div class="q4-col-text">
                    ${q.q}
                </div>
            </div>`;
            } else if (isQ5) {
                txt.innerHTML = `
            ${q.img ? `<div class="q5-img-wrap"><img src="${q.img}" alt="Cenário"><button type="button" onclick="openImageModal('${q.img}')">🔍 AMPLIAR</button></div>` : ''}
            ${q.tag ? `<div class="q5-tag">${q.tag}</div>` : ''}
            ${q.situation ? `<div class="q5-sit">${q.situation}</div>` : ''}
            <div class="q5-ask">${q.q}</div>`;
            } else {
                txt.innerHTML = q.q;
            }
        }
        const opts = document.getElementById(prefix + '-options');
        if (opts) {
            opts.innerHTML = '';
            const letters = ['A', 'B', 'C', 'D'];
            opts.className = 'q-options';
            q.opts.forEach((opt, i) => {
                const el = document.createElement('div');
                el.className = 'q-opt';
                el.innerHTML = `<div class="opt-l">${letters[i]}</div><span>${opt}</span>`;
                el.onclick = () => selectAnswer(i, el);
                opts.appendChild(el);
            });
        }
        const fb = document.getElementById(prefix + '-feedback');
        if (fb) {
            fb.className = 'q-feedback';
            fb.textContent = '';
            fb.style.background = '';
            fb.style.border = '';
            fb.style.color = '';
        }
        const vCont = document.getElementById(prefix + '-verify-container');
        if (vCont) { vCont.style.display = 'none'; vCont.style.opacity = '0'; vCont.style.visibility = 'hidden'; }
        const btn = document.getElementById('btn-next-' + prefix);
        if (btn) {
            btn.className = 'btn-next-q';
            if (isChallengeQuiz()) {
                btn.textContent = 'Continuar →';
            }
        }
        // Scroll para o topo do painel ao trocar de pergunta
        if (qPanel) {
            qPanel.scrollTop = 0;
            const wrap = document.querySelector('#s21 .quiz-wrap') || document.querySelector('#s26 .quiz-wrap') || document.querySelector('#s35 .quiz-wrap') || document.querySelector('#s39 .quiz-wrap') || document.querySelector('#s43 .quiz-wrap') || document.querySelector('.quiz-wrap');
            if (wrap) wrap.scrollTop = 0;
            const contentArea = document.querySelector('#s21 .content-area') || document.querySelector('#s26 .content-area') || document.querySelector('#s35 .content-area') || document.querySelector('#s39 .content-area') || document.querySelector('#s43 .content-area') || document.querySelector('.content-area');
            if (contentArea && isQuizMobile) {
                contentArea.scrollTop = 0;
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
        renderDots();
        try { window.updateQuizAudioHelper(); } catch (e) { }
    }

    function selectAnswer(i, el) {
        if (answered) return;
        selectedOptIdx = i;
        const allOpts = document.querySelectorAll('#' + prefix + '-options .q-opt');
        allOpts.forEach(clearAnswerState);
        el.classList.add('selected');
        playBeep('click');

        const vCont = document.getElementById(prefix + '-verify-container');
        if (vCont) {
            vCont.style.display = 'block';
            setTimeout(() => {
                vCont.style.opacity = '1';
                vCont.style.visibility = 'visible';
            }, 50);
        }
    }

    function verify() {
        if (answered || selectedOptIdx === -1) return;
        answered = true;

        const vCont = document.getElementById(prefix + '-verify-container');
        if (vCont) { vCont.style.display = 'none'; vCont.style.opacity = '0'; vCont.style.visibility = 'hidden'; }

        const q = questions[idx];
        const allOpts = document.querySelectorAll('#' + prefix + '-options .q-opt');
        allOpts.forEach(function (o) {
            clearAnswerState(o);
            o.style.pointerEvents = 'none';
            o.classList.add('answered');
        });
        const fb = document.getElementById(prefix + '-feedback');

        function setOptIcon(el, icon) {
            if (!el) return;
            const letter = el.querySelector('.opt-l');
            if (letter) letter.textContent = icon;
        }

        if (selectedOptIdx === q.correct) {
            // removed persistence
            allOpts[selectedOptIdx].classList.add('correct');
            setOptIcon(allOpts[selectedOptIdx], '✓');
            if (fb) {
                fb.textContent = q.feedback_ok;
                fb.className = 'q-feedback ok';
                fb.style.background = '';
                fb.style.border = '';
            }
            score++;
            try { playBeep('ok'); } catch (e) { }
        } else {
            allOpts[selectedOptIdx].classList.add('wrong');
            setOptIcon(allOpts[selectedOptIdx], '✕');
            if (allOpts[q.correct]) {
                allOpts[q.correct].classList.add('correct');
                setOptIcon(allOpts[q.correct], '✓');
            }
            if (q.topic || q.cat || q.theme) wrongTopics.push(q.topic || q.cat || q.theme);
            if (fb) {
                fb.textContent = q.feedback_nok;
                fb.className = 'q-feedback nok';
                fb.style.background = '';
                fb.style.border = '';
            }
            try { playBeep('nok'); } catch (e) { }
        }

        allOpts.forEach(function (o) {
            if (!o.classList.contains('correct') && !o.classList.contains('wrong')) {
                o.classList.add('muted');
            }
        });

        const btn = document.getElementById('btn-next-' + prefix);
        if (btn) {
            btn.className = 'btn-next-q show';
            if (isChallengeQuiz()) {
                btn.textContent = 'Continuar →';
            }
        }

        try { if (typeof scheduleScrollBtnRefresh === 'function') scheduleScrollBtnRefresh(); } catch (e) { }

        // Scroll após feedback
        setTimeout(function () {
            if (quizIsMobile() && (prefix === 'q3' || prefix === 'q4' || prefix === 'q5')) {
                if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            var qPanel = document.getElementById(prefix + '-question-panel');
            if (qPanel) qPanel.scrollTop = 0;
            var wrap = document.querySelector('.quiz-wrap');
            if (wrap) wrap.scrollTop = 0;
            var contentArea = document.querySelector('.content-area');
            if (contentArea) contentArea.scrollTop = 0;
        }, quizIsMobile() && (prefix === 'q3' || prefix === 'q4' || prefix === 'q5') ? 300 : 100);

        // persist quiz state after verification
        try { _saveState(); } catch (e) { }
    }

    function next() {
        idx++;
        if (idx < questions.length) { render(); _saveState(); }
        else { showResult(); }
        try { window.updateQuizAudioHelper(); } catch (e) { }
    }

    function showResult() {
        playBeep('end');
        if (prefix === 'q6') {
            try {
                const m = document.getElementById('q6-bg-music');
                if (m) m.pause();
            } catch (e) { }
        }
        const qPanel = document.getElementById(prefix + '-question-panel');
        if (qPanel) qPanel.style.display = 'none';
        const rPanel = document.getElementById(prefix + '-result-panel');
        if (rPanel) {
            rPanel.style.display = 'block';
            rPanel.classList.add('is-visible');
            rPanel.classList.remove('q-result-anim');
            void rPanel.offsetWidth;
            rPanel.classList.add('q-result-anim');
        }
        const minCorrect = getMinCorrect();
        const approved = score >= minCorrect;
        const pct = score / questions.length;
        const pctEl = document.getElementById(prefix + '-pct');
        if (pctEl) { pctEl.textContent = Math.round(pct * 100) + '%'; pctEl.className = 'result-pct ' + (approved ? 'green' : 'red-c'); }
        const starsEl = document.getElementById(prefix + '-stars');
        if (starsEl) {
            starsEl.textContent = pct === 1 ? '⭐⭐⭐' : approved ? '⭐⭐' : '⭐';
            starsEl.classList.remove('stars-anim');
            void starsEl.offsetWidth;
            starsEl.classList.add('stars-anim');
        }
        const status = document.getElementById(prefix + '-status');
        if (status) {
            if (isChallengeQuiz()) {
                status.textContent = approved ? 'Desafio Concluído!' : 'Desafio não concluído';
                status.className = 'quiz-result-title r-status ' + (approved ? 'ap' : 'ref');
            } else {
                status.textContent = approved ? '✅ Aprovado!' : '❌ Quase lá!';
                status.className = 'r-status ' + (approved ? 'ap' : 'ref');
            }
        }
        const sub = document.getElementById(prefix + '-sub');
        if (sub) {
            if (isChallengeQuiz()) {
                if (approved) {
                    sub.textContent = 'Você acertou ' + score + ' de ' + questions.length + ' questões. Parabéns! Pode avançar para a próxima etapa.';
                } else {
                    sub.textContent = 'Você acertou ' + score + ' de ' + questions.length + ' questões. É necessário acertar pelo menos ' + minCorrect + ' questões. Estude e tente novamente.';
                }
            } else {
                sub.textContent = 'Você acertou ' + score + ' de ' + questions.length + ' questões.' + (approved ? ' Parabéns!' : ' Revise o módulo e tente novamente.');
            }
        }

        if (isChallengeQuiz()) {
            const reviewEl = document.getElementById(prefix + '-review');
            const iconEl = document.getElementById(prefix + '-result-icon');
            const retryBtn = document.getElementById(prefix + '-retry-btn');
            const topics = uniqueTopics(wrongTopics);

            if (iconEl) iconEl.textContent = approved ? '🏅' : '📚';
            if (retryBtn) {
                retryBtn.textContent = approved ? 'REVISAR DESAFIO' : 'JOGAR NOVAMENTE';
                retryBtn.style.display = approved ? 'none' : 'inline-flex';
            }

            if (reviewEl) {
                if (!approved && topics.length) {
                    reviewEl.hidden = false;
                    reviewEl.innerHTML = '<strong>Revise estes temas:</strong><ul>' +
                        topics.map(function (t) { return '<li>' + t + '</li>'; }).join('') +
                        '</ul>';
                } else {
                    reviewEl.hidden = true;
                    reviewEl.innerHTML = '';
                }
            }

            if (rPanel) {
                rPanel.classList.toggle('is-approved', approved);
                rPanel.classList.toggle('is-failed', !approved);
            }
        }

        // removed persistence
        updateNextButton();
        try { window.updateQuizAudioHelper(); } catch (e) { }
        try { if (typeof scheduleScrollBtnRefresh === 'function') scheduleScrollBtnRefresh(); } catch (e) { }
    }

    function reset() {
        idx = 0; score = 0; answered = false; selectedOptIdx = -1;
        wrongTopics = [];
        if (prefix === 'q6') {
            try {
                const m = document.getElementById('q6-bg-music');
                if (m) { m.pause(); m.currentTime = 0; }
            } catch (e) { }
        }
        const introPanel = document.getElementById(prefix + '-intro-panel');
        const qPanel = document.getElementById(prefix + '-question-panel');
        const rPanel = document.getElementById(prefix + '-result-panel');

        if (qPanel) {
            qPanel.style.display = 'none';
            qPanel.style.opacity = '';
        }
        if (rPanel) {
            rPanel.style.display = 'none';
            rPanel.classList.remove('is-approved', 'is-failed', 'q-result-anim', 'is-visible');
        }
        if (introPanel) {
            introPanel.style.display = isChallengeQuiz() ? 'flex' : 'block';
        }

        const fb = document.getElementById(prefix + '-feedback');
        if (fb) { fb.className = 'q-feedback'; fb.textContent = ''; }

        const vCont = document.getElementById(prefix + '-verify-container');
        if (vCont) { vCont.style.display = 'none'; vCont.style.opacity = '0'; vCont.style.visibility = 'hidden'; }

        const btn = document.getElementById('btn-next-' + prefix);
        if (btn) btn.className = 'btn-next-q';

        const reviewEl = document.getElementById(prefix + '-review');
        if (reviewEl) { reviewEl.hidden = true; reviewEl.innerHTML = ''; }

        // removed persistence

        render();
        try { window.updateQuizAudioHelper(); } catch (e) { }
        try { if (typeof scheduleScrollBtnRefresh === 'function') scheduleScrollBtnRefresh(); } catch (e) { }
    }

    return { render, next, reset, selectAnswer, start, verify };
}

/* ════════════════════════════════════════
   QUIZ DATA — MÓDULO 1
   ════════════════════════════════════════ */
const q1_questions = [
    {
        q: "De acordo com a NR-11, qual é a validade do cartão de identificação do operador e o que é exigido para sua revalidação?",
        cat: "Habilitação",
        topic: "Validade e revalidação do cartão de identificação",
        opts: [
            "Validade de 6 meses, com necessidade de novo teste prático.",
            "Validade de 1 (um) ano, devendo o empregado passar por exame de saúde completo.",
            "Validade de 2 anos, sem a exigência de novos exames médicos."
        ],
        correct: 1,
        feedback_ok: "Correto! O cartão tem validade de 1 ano e o operador também é responsável por observar o seu vencimento e avisar a chefia.",
        feedback_nok: "Incorreto. O cartão tem validade de 1 ano e exige exame de saúde completo para revalidação."
    },
    {
        q: "Na classificação de responsabilidade civil e criminal, como é definida a atitude de um operador que age sem a devida cautela (por exemplo, operando em excesso de velocidade)?",
        cat: "Responsabilidade e Culpa",
        topic: "Tipos de culpa: Imprudência, Negligência e Imperícia",
        opts: [
            "Imprudência.",
            "Imperícia.",
            "Negligência."
        ],
        correct: 0,
        feedback_ok: "Correto! Imprudência é agir sem cautela. Lembre-se: Negligência é a omissão de precauções e Imperícia é a falta de habilidade.",
        feedback_nok: "Incorreto. Agir sem cautela é Imprudência. Negligência é omissão e Imperícia é falta de habilidade."
    },
    {
        q: "Segundo o Artigo 482 da CLT, o que pode ocorrer com o operador que comete infrações ou atos inseguros de forma reincidente?",
        cat: "Penalidades Trabalhistas",
        topic: "Penalidades trabalhistas (CLT Art. 482)",
        opts: [
            "Apenas a suspensão temporária do seu cartão de identificação.",
            "Receberá apenas advertências verbais, sem impacto no contrato.",
            "Poderá sofrer demissão por justa causa, além de ficar obrigado a reparar os danos causados."
        ],
        correct: 2,
        feedback_ok: "Correto! Atos faltosos reincidentes geram demissão por justa causa. Além disso, o Código Civil obriga a reparação de danos a terceiros.",
        feedback_nok: "Incorreto. Infrações reincidentes podem gerar demissão por justa causa e obrigação de reparar danos."
    }
];
const quiz1 = createQuizEngine('q1', q1_questions, 3);
function startQuiz1Intro() { quiz1.start(); }
function verifyAnswer1() { quiz1.verify(); }
function nextQuestion1() { quiz1.next(); }
function resetQuiz1() { quiz1.reset(); }

const q3_questions = [
    {
        q: '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;margin-bottom:0;"><div class="q3-badge" style="background:rgba(230, 81, 0, 0.15);border:1px solid rgba(230, 81, 0, 0.3);color:var(--gold);box-shadow:0 0 10px rgba(230, 81, 0, 0.15);font-size:12px;padding:2px 10px;margin-bottom:4px;">📡 CHAMADA 1</div><div style="font-size:clamp(15px, 2.2vw, 18px);color:var(--white);font-family:var(--font-h);font-weight:700;line-height:1.5;text-align:center;text-shadow: 0 0 10px rgba(255,255,255,0.1);">Atenção operador.<br>Começou a chover forte e o piso do armazém está escorregadio.</div></div><div style="font-size:14px;color:rgba(255,255,255,0.8);font-family:var(--font-h);font-weight:400;margin-top:12px;text-align:center;">Qual sua ação?<br><span style="color:rgba(46,204,113,0.7);font-style:italic;">Câmbio.</span></div>',
        topic: 'Condução em piso molhado / chuva',
        opts: ['Reduzir a velocidade imediatamente.', 'Manter a velocidade e utilizar frenagens bruscas.'],
        correct: 0, feedback_ok: '✓ Câmbio, copiado. Procedimento correto.', feedback_nok: '⚠ Câmbio, repita a operação. Procedimento inseguro.'
    },
    {
        q: '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;margin-bottom:0;"><div class="q3-badge" style="background:rgba(230, 81, 0, 0.15);border:1px solid rgba(230, 81, 0, 0.3);color:var(--gold);box-shadow:0 0 10px rgba(230, 81, 0, 0.15);font-size:12px;padding:2px 10px;margin-bottom:4px;">📡 CHAMADA 2</div><div style="font-size:clamp(15px, 2.2vw, 18px);color:var(--white);font-family:var(--font-h);font-weight:700;line-height:1.5;text-align:center;text-shadow: 0 0 10px rgba(255,255,255,0.1);">Atenção.<br>Neblina intensa na área externa.</div></div><div style="font-size:14px;color:rgba(255,255,255,0.8);font-family:var(--font-h);font-weight:400;margin-top:12px;text-align:center;">Confirme o alcance dos faróis para auxiliar a segurança da operação.<br><span style="color:rgba(46,204,113,0.7);font-style:italic;">Câmbio.</span></div>',
        topic: 'Alcance dos faróis / neblina',
        opts: ['50 metros.', '120 metros.'],
        correct: 1, feedback_ok: '✓ Câmbio, copiado. Procedimento correto.', feedback_nok: '⚠ Câmbio, repita a operação. Procedimento inseguro.'
    },
    {
        q: '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;margin-bottom:0;"><div class="q3-badge" style="background:rgba(230, 81, 0, 0.15);border:1px solid rgba(230, 81, 0, 0.3);color:var(--gold);box-shadow:0 0 10px rgba(230, 81, 0, 0.15);font-size:12px;padding:2px 10px;margin-bottom:4px;">📡 CHAMADA 3</div><div style="font-size:clamp(15px, 2.2vw, 18px);color:var(--white);font-family:var(--font-h);font-weight:700;line-height:1.5;text-align:center;text-shadow: 0 0 10px rgba(255,255,255,0.1);">Alerta geral.<br>Um operador relatou ofuscamento causado por luz intensa.</div></div><div style="font-size:14px;color:rgba(255,255,255,0.8);font-family:var(--font-h);font-weight:400;margin-top:12px;text-align:center;">Quanto tempo a visão humana pode levar para se recuperar?<br><span style="color:rgba(46,204,113,0.7);font-style:italic;">Câmbio.</span></div>',
        topic: 'Ofuscamento e recuperação da visão',
        opts: ['3 segundos.', '7 segundos.'],
        correct: 1, feedback_ok: '✓ Câmbio, copiado. Procedimento correto.', feedback_nok: '⚠ Câmbio, repita a operação. Procedimento inseguro.'
    },
    {
        q: '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;margin-bottom:0;"><div class="q3-badge" style="background:rgba(230, 81, 0, 0.15);border:1px solid rgba(230, 81, 0, 0.3);color:var(--gold);box-shadow:0 0 10px rgba(230, 81, 0, 0.15);font-size:12px;padding:2px 10px;margin-bottom:4px;">📡 CHAMADA 4</div><div style="font-size:clamp(15px, 2.2vw, 18px);color:var(--white);font-family:var(--font-h);font-weight:700;line-height:1.5;text-align:center;text-shadow: 0 0 10px rgba(255,255,255,0.1);">Para encerrar o turno, confirme os principais riscos críticos da operação de empilhadeiras.</div></div><div style="font-size:14px;color:rgba(255,255,255,0.8);font-family:var(--font-h);font-weight:400;margin-top:12px;text-align:center;"><span style="color:rgba(46,204,113,0.7);font-style:italic;">Câmbio.</span></div>',
        topic: 'Riscos críticos da operação',
        opts: ['Apenas falhas mecânicas da máquina.', 'Tombamentos, colisões, atropelamentos e queda de materiais.'],
        correct: 1, feedback_ok: '✓ Câmbio, copiado. Procedimento correto.', feedback_nok: '⚠ Câmbio, repita a operação. Procedimento inseguro.'
    },
    {
        q: '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;margin-bottom:0;"><div class="q3-badge" style="background:rgba(230, 81, 0, 0.15);border:1px solid rgba(230, 81, 0, 0.3);color:var(--gold);box-shadow:0 0 10px rgba(230, 81, 0, 0.15);font-size:12px;padding:2px 10px;margin-bottom:4px;">📡 CHAMADA 5</div><div style="font-size:clamp(15px, 2.2vw, 18px);color:var(--white);font-family:var(--font-h);font-weight:700;line-height:1.5;text-align:center;text-shadow: 0 0 10px rgba(255,255,255,0.1);">Atenção operador.<br>Pedestre detectado cruzando o corredor durante a movimentação.</div></div><div style="font-size:14px;color:rgba(255,255,255,0.8);font-family:var(--font-h);font-weight:400;margin-top:12px;text-align:center;">Qual sua ação?<br><span style="color:rgba(46,204,113,0.7);font-style:italic;">Câmbio.</span></div>',
        topic: 'Pedestres no corredor',
        opts: ['Parar completamente e aguardar a liberação do caminho.', 'Manter a velocidade e buzinar para alertar.'],
        correct: 0, feedback_ok: '✓ Câmbio, copiado. Procedimento correto.', feedback_nok: '⚠ Câmbio, repita a operação. Procedimento inseguro.'
    }
];
const quiz3 = createQuizEngine('q3', q3_questions, q3_questions.length);
function startQuiz3Intro() { quiz3.start(); }
function verifyAnswer3() { quiz3.verify(); }
function nextQuestion3() { quiz3.next(); }
function resetQuiz3() { quiz3.reset(); }

/* ════════════════════════════════════════
   INIT
   ════════════════════════════════════════ */
(function initSlideFromUrl() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const restoreSlide = urlParams.get('restoreslide');
        const isLast = urlParams.get('last');
        if (restoreSlide !== null && restoreSlide !== '') {
            const n = parseInt(restoreSlide, 10);
            if (!isNaN(n) && n >= 0 && n < TOTAL) currentSlide = n;
        } else if (isLast === '1') {
            currentSlide = TOTAL - 1;
        } else {
            currentSlide = 0;
        }
    } catch (e) {
        currentSlide = 0;
    }
    try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('restoreslide') || url.searchParams.has('last')) {
            url.searchParams.delete('restoreslide');
            url.searchParams.delete('last');
            history.replaceState(null, '', url.pathname + (url.search ? url.search : '') + url.hash);
        }
    } catch (e) { }
})();
trackHistory(currentSlide);

document.querySelectorAll('.slide').forEach((s, i) => {
    if (i === currentSlide) s.classList.add('active');
    else s.classList.remove('active');
});
const pbarInit = document.getElementById('pbar');
if (pbarInit) pbarInit.style.width = (nr11GlobalSlide() / NR11_TOTAL_SLIDES * 100) + '%';

const counterInit = document.getElementById('slide-counter');
if (counterInit) {
    counterInit.textContent = nr11GlobalSlide() + ' / ' + NR11_TOTAL_SLIDES;
    counterInit.style.visibility = 'visible';
}
const btnBackInit = document.getElementById('btn-back');
if (btnBackInit) {
    btnBackInit.disabled = (currentSlide === 0 && !window.MODULE_NAV.prev);
    btnBackInit.style.visibility = (currentSlide === 0 && !window.MODULE_NAV.prev) ? 'hidden' : 'visible';
}
const btnFwdInit = document.getElementById('btn-fwd');
if (btnFwdInit) {
    btnFwdInit.style.visibility = 'visible';
}

buildDots();
if (document.getElementById('q1-question-panel')) quiz1.render();
if (document.getElementById('q3-question-panel')) quiz3.render();
try { syncSlideVideos(currentSlide); } catch (e) { }
try { applyDemoModeUI(); } catch (e) { }
try {
    const active = document.querySelectorAll('.slide')[currentSlide];
    if (active && active.id === 's44') {
        startConclusionEpic();
        s44HideFinalizarBtn();
        if (window.demoMode) s44RevealFinalizarBtn();
    }
} catch (e) { }
updateNextButton();
try { window.updateQuizAudioHelper(); } catch (e) { }
try { scheduleScrollBtnRefresh(); } catch (e) { }

window.addEventListener('pagehide', pauseAllSlideVideos);

// removed persistence

document.addEventListener('DOMContentLoaded', () => {
    const interactives = document.querySelectorAll('.risk-card, .vplay, .c-badge');
    const savedReqs = _loadReqState();
    interactives.forEach((el, i) => {
        el.classList.add('req-item');
        el.title = 'Clique para confirmar leitura';
        // tag with stable index for persistence
        el.dataset.reqIndex = i;
        // restore
        if (savedReqs && savedReqs.indexOf(i) !== -1) {
            el.classList.add('req-done');
        }
        el.addEventListener('click', function () {
            if (this.classList.contains('req-done')) return;
            this.classList.add('req-done');
            // persist
            try {
                const idx = parseInt(this.dataset.reqIndex);
                const arr = _loadReqState();
                if (arr.indexOf(idx) === -1) arr.push(idx);
                _saveReqState(arr);
            } catch (e) { }
            updateNextButton();
        });
    });

    try { syncSlideVideos(currentSlide); } catch (e) { }

    updateNextButton();
});
// ==========================================
// LÓGICA DO VERDADEIRO OU FALSO (MÓDULO 2)
// ==========================================
const styleHUD = document.createElement('style');
styleHUD.textContent = `
        .hud-glow-correct {
          box-shadow: 0 0 30px rgba(46, 204, 113, 0.4) !important;
          transform: scale(1.01);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border-radius: 12px;
        }
        .hud-glow-error {
          box-shadow: 0 0 30px rgba(231, 76, 60, 0.4) !important;
          transform: scale(1.01);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border-radius: 12px;
        }
        .tf-btn {
          transition: transform 0.1s ease, box-shadow 0.3s ease, background 0.3s ease !important;
        }
        .tf-btn:active {
          transform: scale(0.95) !important;
        }
        .btn-tf-verify {
          background: #ffffff;
          color: #0d0a08;
          border: none;
          padding: 15px 40px;
          border-radius: 99px;
          font-family: var(--font-h);
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 30px rgba(255,255,255,0.2);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .btn-tf-verify:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.92);
          box-shadow: 0 0 40px rgba(255,255,255,0.35);
        }
        .btn-tf-verify:active {
          transform: translateY(0);
        }
        .tf-btn.selected-visual {
          transform: scale(0.98);
          border-color: var(--gold) !important;
          box-shadow: 0 0 15px rgba(241, 196, 15, 0.4);
        }
        .hud-anim-enter {
          animation: hudFadeIn 0.4s ease forwards;
        }
        @keyframes hudFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
document.head.appendChild(styleHUD);

function playHUDBeep(type) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        if (!window.hudAudioCtx) window.hudAudioCtx = new AudioContext();
        const ctx = window.hudAudioCtx;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(900, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'correct') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.setValueAtTime(850, now + 0.1);
            gain.gain.setValueAtTime(0.0, now);
            gain.gain.linearRampToValueAtTime(0.06, now + 0.05);
            gain.gain.linearRampToValueAtTime(0.0, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (type === 'incorrect') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(350, now);
            osc.frequency.exponentialRampToValueAtTime(250, now + 0.25);
            gain.gain.setValueAtTime(0.0, now);
            gain.gain.linearRampToValueAtTime(0.05, now + 0.05);
            gain.gain.linearRampToValueAtTime(0.0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'transition') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(700, now + 0.15);
            gain.gain.setValueAtTime(0.0, now);
            gain.gain.linearRampToValueAtTime(0.03, now + 0.05);
            gain.gain.linearRampToValueAtTime(0.0, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'conclusion') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554, now + 0.15);
            osc.frequency.setValueAtTime(659, now + 0.3);
            osc.frequency.setValueAtTime(880, now + 0.45);
            gain.gain.setValueAtTime(0.0, now);
            gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
            gain.gain.linearRampToValueAtTime(0.04, now + 0.4);
            gain.gain.linearRampToValueAtTime(0.0, now + 0.8);
            osc.start(now);
            osc.stop(now + 0.8);
        }
    } catch (e) { }
}

const q2Data = [
    {
        q: "Um operador transporta um palete com a carga a aproximadamente 15-20cm do solo durante todo o percurso.",
        ans: true,
        exp: "Correto! A carga deve ser mantida baixa, a aproximadamente 15 a 20 cm do solo, garantindo equilíbrio e estabilidade.",
        topic: "Altura da carga durante o transporte",
        img: "imagens/ioyL3zG.png"
    },
    {
        q: "Uma empilhadeira opera em alta velocidade sob forte chuva com os faróis desligados.",
        ans: false,
        exp: "Ato inseguro! Na chuva, a velocidade deve ser reduzida e os faróis mantidos acesos para garantir visibilidade e avisar pedestres.",
        topic: "Operação em condições climáticas adversas",
        img: "imagens/5tuQ11z.jpg"
    },
    {
        q: "Um colega de trabalho pega carona na lateral da empilhadeira durante a operação.",
        ans: false,
        exp: "Proibido! Não é permitido dar carona a outras pessoas. O veículo nunca deve ser usado como transporte de pedestres.",
        topic: "Proibição de carona no equipamento",
        img: "imagens/WIN4X4r.jpg"
    },
    {
        q: "Ao fim do expediente, o operador estaciona a empilhadeira em uma rampa.",
        ans: false,
        exp: "Ato inseguro! A norma proíbe terminantemente o estacionamento da empilhadeira em rampas e declives.",
        topic: "Estacionamento em rampas e declives",
        img: "imagens/7vVEc2n.jpg"
    },
    {
        q: "Saindo fumaça do motor, o operador para a máquina, pede ajuda e usa o extintor da empilhadeira.",
        ans: true,
        exp: "Correto! Em caso de incêndio, pedir ajuda e iniciar o combate com o extintor adequado é o procedimento correto.",
        topic: "Procedimento em caso de princípio de incêndio",
        img: "imagens/gpsz3rW.jpg"
    }
];

let currentQ2 = 0;
let scoreQ2 = 0;
let sq2Answered = false;
let sq2Selected = null; // true | false | null
let sq2WrongTopics = [];

function sq2ResetOpts() {
    const optTrue = document.getElementById('sq2-opt-true');
    const optFalse = document.getElementById('sq2-opt-false');
    [optTrue, optFalse].forEach(function (o) {
        if (!o) return;
        o.className = 'q-opt';
        o.style.pointerEvents = '';
        const letter = o.querySelector('.opt-l');
        if (letter) letter.textContent = o.id === 'sq2-opt-true' ? 'A' : 'B';
    });
}

function sq2HideVerify() {
    const vCont = document.getElementById('sq2-verify-container');
    if (!vCont) return;
    vCont.style.display = 'none';
    vCont.style.opacity = '0';
    vCont.style.visibility = 'hidden';
}

function sq2ShowVerify() {
    const vCont = document.getElementById('sq2-verify-container');
    if (!vCont) return;
    vCont.style.display = 'block';
    setTimeout(function () {
        vCont.style.opacity = '1';
        vCont.style.visibility = 'visible';
    }, 50);
}

function sq2RenderDots(idx) {
    for (let i = 0; i < q2Data.length; i++) {
        const d = document.getElementById('sq2dot' + i);
        if (!d) continue;
        d.className = 'qdot2' + (i < idx ? ' done' : '') + (i === idx ? ' cur' : '');
    }
}

function startQuiz2Intro() {
    const intro = document.getElementById('sq2-intro-panel');
    const panel = document.getElementById('sq2-question-panel');
    const result = document.getElementById('sq2-result-panel');
    if (intro) intro.style.display = 'none';
    if (result) {
        result.style.display = 'none';
        result.classList.remove('is-visible', 'is-approved', 'is-failed', 'q-result-anim');
    }
    if (panel) {
        panel.style.display = 'block';
        panel.style.opacity = '0';
        setTimeout(function () { panel.style.opacity = '1'; }, 50);
    }
    currentQ2 = 0;
    scoreQ2 = 0;
    sq2Answered = false;
    sq2Selected = null;
    sq2WrongTopics = [];
    try { playBeep('click'); } catch (e) { }
    sq2Load(0);
    try { window.updateQuizAudioHelper(); } catch (e) { }
}

function sq2Load(idx) {
    const q = q2Data[idx];
    sq2Answered = false;
    sq2Selected = null;

    const counter = document.getElementById('sq2-counter');
    const text = document.getElementById('sq2-text');
    const fb = document.getElementById('sq2-feedback');
    const nextBtn = document.getElementById('btn-next-sq2');
    const imgWrap = document.getElementById('sq2-img-wrap');
    const imgEl = document.getElementById('sq2-img');
    const expandBtn = document.getElementById('sq2-img-expand');

    if (counter) counter.textContent = 'Pergunta ' + (idx + 1) + ' de ' + q2Data.length;
    if (text) text.textContent = q.q;
    if (fb) { fb.className = 'q-feedback'; fb.textContent = ''; }
    if (nextBtn) {
        nextBtn.className = 'btn-next-q';
        nextBtn.textContent = 'Continuar →';
    }
    sq2HideVerify();

    if (imgWrap && imgEl) {
        if (q.img) {
            imgWrap.hidden = false;
            imgEl.src = q.img;
            imgEl.alt = q.topic || 'Situação';
            if (expandBtn) {
                expandBtn.onclick = function (e) {
                    e.stopPropagation();
                    if (typeof openImageModal === 'function') openImageModal(q.img);
                };
            }
        } else {
            imgWrap.hidden = true;
            imgEl.removeAttribute('src');
            if (expandBtn) expandBtn.onclick = null;
        }
    }

    sq2ResetOpts();
    sq2RenderDots(idx);
    try { window.updateQuizAudioHelper(); } catch (e) { }
}

function sq2Select(answer) {
    if (sq2Answered) return;
    sq2Selected = answer;

    const optTrue = document.getElementById('sq2-opt-true');
    const optFalse = document.getElementById('sq2-opt-false');
    [optTrue, optFalse].forEach(function (o) {
        if (!o) return;
        o.classList.remove('selected', 'correct', 'wrong', 'muted', 'answered');
    });
    const chosen = answer === true ? optTrue : optFalse;
    if (chosen) chosen.classList.add('selected');

    try { playBeep('click'); } catch (e) { }
    sq2ShowVerify();
}

function sq2Verify() {
    if (sq2Answered || sq2Selected === null) return;
    const q = q2Data[currentQ2];
    const correct = sq2Selected === q.ans;
    sq2Answered = true;
    sq2HideVerify();

    const optTrue = document.getElementById('sq2-opt-true');
    const optFalse = document.getElementById('sq2-opt-false');
    const fb = document.getElementById('sq2-feedback');
    const nextBtn = document.getElementById('btn-next-sq2');
    const chosen = sq2Selected === true ? optTrue : optFalse;
    const other = sq2Selected === true ? optFalse : optTrue;

    [optTrue, optFalse].forEach(function (o) {
        if (!o) return;
        o.style.pointerEvents = 'none';
        o.classList.add('answered');
        o.classList.remove('selected', 'correct', 'wrong', 'muted');
    });

    function setOptIcon(el, icon) {
        if (!el) return;
        const letter = el.querySelector('.opt-l');
        if (letter) letter.textContent = icon;
    }

    if (correct) {
        scoreQ2++;
        if (chosen) {
            chosen.classList.add('correct');
            setOptIcon(chosen, '✓');
        }
        if (other) other.classList.add('muted');
        if (fb) {
            fb.textContent = q.exp;
            fb.className = 'q-feedback ok';
        }
        try { playBeep('ok'); } catch (e) { }
    } else {
        if (q.topic) sq2WrongTopics.push(q.topic);
        if (chosen) {
            chosen.classList.add('wrong');
            setOptIcon(chosen, '✕');
        }
        if (other) other.classList.add('muted');
        if (fb) {
            fb.textContent = q.exp;
            fb.className = 'q-feedback nok';
        }
        try { playBeep('nok'); } catch (e) { }
    }

    if (nextBtn) {
        nextBtn.textContent = currentQ2 >= q2Data.length - 1 ? 'Ver resultado →' : 'Continuar →';
        nextBtn.className = 'btn-next-q show';
        setTimeout(function () {
            nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
}

function sq2Answer(answer) {
    // compat: seleção + verificação no mesmo fluxo do módulo 1
    sq2Select(answer);
}

function sq2NextQuestion() {
    if (!sq2Answered) return;
    currentQ2++;
    if (currentQ2 < q2Data.length) {
        sq2Load(currentQ2);
    } else {
        sq2ShowResult();
    }
}

function sq2UniqueTopics(list) {
    const seen = {};
    const out = [];
    list.forEach(function (t) {
        if (!t || seen[t]) return;
        seen[t] = true;
        out.push(t);
    });
    return out;
}

function sq2ShowResult() {
    const qPanel = document.getElementById('sq2-question-panel');
    const rPanel = document.getElementById('sq2-result-panel');
    if (qPanel) qPanel.style.display = 'none';
    if (!rPanel) return;

    const minCorrect = 3;
    const approved = scoreQ2 >= minCorrect;

    rPanel.style.display = 'block';
    rPanel.classList.add('is-visible');
    rPanel.classList.remove('q-result-anim', 'is-approved', 'is-failed');
    void rPanel.offsetWidth;
    rPanel.classList.add('q-result-anim');
    rPanel.classList.toggle('is-approved', approved);
    rPanel.classList.toggle('is-failed', !approved);

    const status = document.getElementById('sq2-status');
    const sub = document.getElementById('sq2-sub');
    const iconEl = document.getElementById('sq2-result-icon');
    const retryBtn = document.getElementById('sq2-retry-btn');
    const reviewEl = document.getElementById('sq2-review');

    if (status) {
        status.textContent = approved ? 'Desafio Concluído!' : 'Desafio não concluído';
        status.className = 'quiz-result-title r-status ' + (approved ? 'ap' : 'ref');
    }
    if (sub) {
        if (approved) {
            sub.textContent = 'Você acertou ' + scoreQ2 + ' de ' + q2Data.length + ' questões. Parabéns! Pode avançar para a próxima etapa.';
        } else {
            sub.textContent = 'Você acertou ' + scoreQ2 + ' de ' + q2Data.length + ' questões. É necessário acertar pelo menos ' + minCorrect + ' questões. Estude e tente novamente.';
        }
    }
    if (iconEl) iconEl.textContent = approved ? '🏅' : '📚';
    if (retryBtn) {
        retryBtn.textContent = approved ? 'REVISAR DESAFIO' : 'JOGAR NOVAMENTE';
        retryBtn.style.display = approved ? 'none' : 'inline-flex';
    }
    if (reviewEl) {
        const topics = sq2UniqueTopics(sq2WrongTopics);
        if (!approved && topics.length) {
            reviewEl.hidden = false;
            reviewEl.innerHTML = '<strong>Revise estes temas:</strong><ul>' +
                topics.map(function (t) { return '<li>' + t + '</li>'; }).join('') +
                '</ul>';
        } else {
            reviewEl.hidden = true;
            reviewEl.innerHTML = '';
        }
    }

    if (typeof updateNextButton === 'function') updateNextButton();
    try { window.updateQuizAudioHelper(); } catch (e) { }
    if (typeof playHUDBeep === 'function') playHUDBeep('conclusion');
}

function sq2Retry() {
    currentQ2 = 0;
    scoreQ2 = 0;
    sq2Answered = false;
    sq2Selected = null;
    sq2WrongTopics = [];
    const rPanel = document.getElementById('sq2-result-panel');
    const intro = document.getElementById('sq2-intro-panel');
    const qPanel = document.getElementById('sq2-question-panel');
    if (rPanel) {
        rPanel.style.display = 'none';
        rPanel.classList.remove('is-visible', 'is-approved', 'is-failed', 'q-result-anim');
    }
    if (qPanel) qPanel.style.display = 'none';
    if (intro) intro.style.display = 'flex';
    const reviewEl = document.getElementById('sq2-review');
    if (reviewEl) { reviewEl.hidden = true; reviewEl.innerHTML = ''; }
    sq2HideVerify();
    try { window.updateQuizAudioHelper(); } catch (e) { }
}

/* ════════════════════════════════════════
   ENGINE: CONDUÇÃO SEGURA (1 A 1)
   ════════════════════════════════════════ */
const conducaoData = [
    { text: "Usar celular durante operação", isAllowed: false, explanation: "O uso de celular reduz a atenção do operador e aumenta o risco de acidentes." },
    { text: "Reduzir velocidade em curvas", isAllowed: true, explanation: "Reduzir a velocidade aumenta a estabilidade e evita tombamentos." },
    { text: "Transportar pessoas no equipamento", isAllowed: false, explanation: "O equipamento não foi projetado para transportar passageiros." },
    { text: "Utilizar buzina em cruzamentos", isAllowed: true, explanation: "A buzina ajuda a alertar pedestres e outros operadores." },
    { text: "Circular com carga elevada", isAllowed: false, explanation: "Circular com a carga elevada reduz a estabilidade do equipamento." },
    { text: "Olhar sempre na direção do movimento", isAllowed: true, explanation: "Manter atenção na direção do deslocamento evita colisões." }
];
let currentConducao = 0;
let conducaoAnswered = false;

function resetConducaoBtnClasses() {
    resetTfButtons(
        document.getElementById('btn-conducao-true'),
        document.getElementById('btn-conducao-false')
    );
}

function loadConducao(idx) {
    if (idx >= conducaoData.length) return;
    conducaoAnswered = false;

    const counter = document.getElementById('conducao-counter');
    if (counter) counter.textContent = 'Ação ' + (idx + 1) + ' de ' + conducaoData.length;

    const textElement = document.getElementById('conducao-text');
    if (textElement) textElement.textContent = conducaoData[idx].text;

    resetConducaoBtnClasses();
    const btnTrue = document.getElementById('btn-conducao-true');
    const btnFalse = document.getElementById('btn-conducao-false');
    if (btnTrue) btnTrue.disabled = false;
    if (btnFalse) btnFalse.disabled = false;

    const fb = document.getElementById('conducao-feedback');
    if (fb) {
        fb.className = 'tf-feedback';
        fb.style.display = 'none';
        fb.style.opacity = '';
    }
    const fbTitle = document.getElementById('conducao-fb-title');
    const fbText = document.getElementById('conducao-fb-text');
    if (fbTitle) fbTitle.textContent = '';
    if (fbText) fbText.innerHTML = '';
    try { window.updateQuizAudioHelper(); } catch (e) { }
}

// ============================================
// CORREÇÃO DE ÁUDIO - MÓDULO 3 CONDUÇÃO
// Utilizando o mesmo sistema sintetizado (playHUDBeep) do módulo 2
// para garantir consistência e zero delay
// ============================================

window.answerConducao = function (isAllowBtn) {
    if (conducaoAnswered) return;
    conducaoAnswered = true;

    playHUDBeep('click');

    const data = conducaoData[currentConducao];
    const isCorrect = (data.isAllowed === isAllowBtn);

    const btnTrue = document.getElementById('btn-conducao-true');
    const btnFalse = document.getElementById('btn-conducao-false');
    resetConducaoBtnClasses();
    if (btnTrue) { btnTrue.disabled = true; btnTrue.blur(); }
    if (btnFalse) { btnFalse.disabled = true; btnFalse.blur(); }

    const selectedBtn = isAllowBtn ? btnTrue : btnFalse;

    const fb = document.getElementById('conducao-feedback');
    const fbTitle = document.getElementById('conducao-fb-title');
    const fbText = document.getElementById('conducao-fb-text');

    if (isCorrect) {
        if (selectedBtn) selectedBtn.classList.add('selected-true');

        // Timeout para garantir que a animação CSS não trave o áudio sintetizado
        setTimeout(() => { playHUDBeep('correct'); }, 50);

        if (fb && fbTitle && fbText) {
            fb.style.display = 'block';
            fb.style.opacity = '1';
            fb.className = 'tf-feedback show success visible';
            fbTitle.textContent = 'Correto!';
            fbText.innerHTML = data.explanation;
        }

        setTimeout(() => {
            currentConducao++;
            if (currentConducao < conducaoData.length) {
                loadConducao(currentConducao);
            } else {
                const qPanel = document.getElementById('conducao-question-panel');
                const rPanel = document.getElementById('conducao-result-panel');
                if (qPanel) qPanel.style.display = 'none';
                if (rPanel) rPanel.style.display = 'block';

                const container = document.getElementById('conducao-container');
                if (container) {
                    container.classList.add('req-done');
                    updateNextButton();
                }
                playHUDBeep('conclusion');
            }
            try { window.updateQuizAudioHelper(); } catch (e) { }
        }, 3500);

    } else {
        if (selectedBtn) selectedBtn.classList.add('selected-false');

        setTimeout(() => { playHUDBeep('incorrect'); }, 50);

        if (fb && fbTitle && fbText) {
            fb.style.display = 'block';
            fb.style.opacity = '1';
            fb.className = 'tf-feedback show error visible';
            fbTitle.textContent = 'Incorreto';
            fbText.innerHTML = data.explanation + '<br><br><strong>Tente novamente.</strong>';
        }

        if (selectedBtn) {
            selectedBtn.style.animation = 'none';
            void selectedBtn.offsetWidth;
            selectedBtn.style.animation = 'shake 0.5s ease-in-out';
        }

        setTimeout(() => {
            conducaoAnswered = false;
            resetConducaoBtnClasses();
            if (btnTrue) btnTrue.disabled = false;
            if (btnFalse) btnFalse.disabled = false;
            if (fb) fb.className = 'tf-feedback';
        }, 2500);
    }
};

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    loadConducao(0);
});

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    const introPanel = document.getElementById('sq2-intro-panel');
    if (introPanel) introPanel.style.display = 'flex';

    const qPanel = document.getElementById('sq2-question-panel');
    if (qPanel) qPanel.style.display = 'none';
});

window.checkMod4Item = function (el) {
    if (el.classList.contains('req-done')) return;
    if (window.soundClick) window.soundClick.play();
    el.classList.add('req-done');
    el.classList.add('active');

    const reqs = el.closest('.m4-check-list').querySelectorAll('.req-item');
    const done = el.closest('.m4-check-list').querySelectorAll('.req-done').length;
    const fill = el.closest('.slide').querySelector('.m4-progress-fill');
    const text = el.closest('.slide').querySelector('.m4-progress-top span:last-child');

    if (fill) fill.style.width = ((done / reqs.length) * 100) + '%';
    if (text) text.textContent = done + '/' + reqs.length + ' ITENS';

    if (done === reqs.length) {
        if (window.soundCorrect) setTimeout(() => window.soundCorrect.play(), 200);
        const comp = el.closest('.slide').querySelector('.m4-completion');
        if (comp) comp.style.display = 'block';

        const contentArea = el.closest('.slide').querySelector('.content-area');
        if (contentArea) {
            contentArea.style.justifyContent = 'flex-start';
        }
    }
    updateNextButton();
}

const q4_questions = [
    {
        img: 'imagens/RdlrAU8.jpeg',
        topic: 'Carga nominal com torre no limite máximo',
        q: '<div class="q4-sit-title">CENÁRIO 1</div><div class="q4-sit-desc">O operador pegou a carga máxima permitida na máquina (capacidade nominal) e elevou a torre até o limite máximo de altura para tentar manobrar.</div>',
        opts: ['💥 VAI TOMBAR!', '✅ OPERAÇÃO SEGURA'],
        correct: 0, feedback_ok: '✅ DECISÃO CORRETA — O manual alerta que elevar a carga nominal até o limite máximo da torre compromete seriamente o equilíbrio da máquina.', feedback_nok: '❌ DECISÃO INCORRETA — Carga nominal com torre no limite máximo compromete seriamente o equilíbrio da máquina.'
    },
    {
        img: 'imagens/DkzI2Zl.jpeg',
        topic: 'Inclinação da carga e centro de gravidade',
        q: '<div class="q4-sit-title">CENÁRIO 2</div><div class="q4-sit-desc">O operador apanhou a caixa, posicionou a coluna na vertical e inclinou a carga ligeiramente para trás antes de começar a andar.</div>',
        opts: ['💥 VAI TOMBAR!', '✅ OPERAÇÃO SEGURA'],
        correct: 1, feedback_ok: '✅ DECISÃO CORRETA — Inclinar a carga para trás mantém o Centro de Gravidade protegido no meio do Triângulo da Estabilidade.', feedback_nok: '❌ DECISÃO INCORRETA — Inclinar a carga para trás é o procedimento correto e mantém o centro de gravidade dentro do triângulo.'
    },
    {
        img: 'imagens/S2Yyyle.jpeg',
        topic: 'Giros rápidos / Triângulo da Estabilidade',
        q: '<div class="q4-sit-title">CENÁRIO 3</div><div class="q4-sit-desc">Durante o transporte, o operador decide fazer um giro muito rápido (curva fechada) para a esquerda para ganhar tempo na entrega.</div>',
        opts: ['💥 VAI TOMBAR!', '✅ OPERAÇÃO SEGURA'],
        correct: 0, feedback_ok: '✅ DECISÃO CORRETA — Giros rápidos jogam o ponto de equilíbrio para fora do Triângulo da Estabilidade, causando tombamento imediato.', feedback_nok: '❌ DECISÃO INCORRETA — Giros rápidos em curvas fechadas deslocam o centro de gravidade para fora do triângulo de estabilidade.'
    },
    {
        img: 'imagens/OQJ0Uri.jpeg',
        topic: 'Centro de carga além do especificado',
        q: '<div class="q4-sit-title">CENÁRIO 4</div><div class="q4-sit-desc">Para não perder a viagem, o operador pega uma carga muito longa, deixando o centro de carga bem na ponta dos garfos (além do especificado).</div>',
        opts: ['💥 VAI TOMBAR!', '✅ OPERAÇÃO SEGURA'],
        correct: 0, feedback_ok: '✅ DECISÃO CORRETA — Centro de carga além do especificado causa desequilíbrio violento e tombamento.', feedback_nok: '❌ DECISÃO INCORRETA — Caso o centro de carga esteja além do especificado, ocorre desequilíbrio violento e tombamento.'
    }
];
const quiz4 = createQuizEngine('q4', q4_questions, 4);
if (document.getElementById('q4-question-panel')) quiz4.render();
function startQuiz4Intro() { quiz4.start(); }
function verifyAnswer4() { quiz4.verify(); }
function nextQuestion4() { quiz4.next(); }
function resetQuiz4() { quiz4.reset(); }

const q5_questions = [
    {
        tag: 'OCORRÊNCIA 01',
        img: 'imagens/rzLV2uK.jpeg',
        situation: 'O operador está com uma carga muito alta e volumosa que tampa sua visão frontal, então ele decide conduzir a empilhadeira de marcha à ré para enxergar o caminho.',
        q: 'Qual sua decisão?',
        topic: 'Marcha à ré com carga que bloqueia a visão',
        opts: ['Aprovado', 'Advertência'],
        correct: 0,
        feedback_ok: '✅ Correto! A regra exige que o operador transite sempre de ré quando estiver conduzindo uma carga que atrapalhe a visão.',
        feedback_nok: '❌ Incorreto. A NR-11 determina que o operador deve transitar de marcha à ré quando a carga bloquear a visão frontal.'
    },
    {
        tag: 'OCORRÊNCIA 02',
        img: 'imagens/X3o5ASP.jpeg',
        situation: 'Para adiantar o serviço, o operador deu uma carona rápida para o ajudante ir em pé na lateral da empilhadeira até o outro lado do galpão.',
        q: 'Qual sua decisão?',
        topic: 'Proibição de caronas na empilhadeira',
        opts: ['Aprovado', 'Advertência'],
        correct: 1,
        feedback_ok: '✅ Correto! O veículo não é um meio de transporte para pessoas. Nunca dê caronas ou permita pessoas em pé na máquina.',
        feedback_nok: '❌ Incorreto. O veículo não é um meio de transporte para pessoas. Nunca dê caronas ou permita pessoas em pé na máquina.'
    },
    {
        tag: 'OCORRÊNCIA 03',
        img: 'imagens/9qtKZUV.jpeg',
        situation: 'O operador foi para o horário de almoço. Estacionou no local correto e abaixou os garfos até o chão, mas deixou a chave na ignição para facilitar na volta.',
        q: 'Qual sua decisão?',
        topic: 'Chave removida ao estacionar',
        opts: ['Aprovado', 'Advertência'],
        correct: 1,
        feedback_ok: '✅ Correto! Ao estacionar, a regra é clara: nunca deixe a chave na ignição.',
        feedback_nok: '❌ Incorreto. Ao estacionar, a regra é clara: nunca deixe a chave na ignição.'
    }
];
const quiz5 = createQuizEngine('q5', q5_questions, 3);
if (document.getElementById('q5-question-panel')) quiz5.render();
function startQuiz5Intro() { quiz5.start(); }
function verifyAnswer5() { quiz5.verify(); }
function nextQuestion5() { quiz5.next(); }
function resetQuiz5() { quiz5.reset(); }

const q6b_questions = [
    {
        q: 'De acordo com o protocolo de emergência, qual deve ser sua atitude imediata ao ouvir o alarme de incêndio disparar no galpão?',
        topic: 'Protocolo de emergência — alarme de incêndio',
        opts: [
            'Acelerar a empilhadeira para sair do prédio o mais rápido possível.',
            'Abandonar o equipamento no meio do cruzamento e correr.',
            'Estacionar o veículo em local seguro, deixando a passagem livre, e aguardar as orientações do brigadista.'
        ],
        correct: 2,
        feedback_ok: '✅ Correto! Estacionar em local seguro, liberar a passagem e aguardar o brigadista é o procedimento correto.',
        feedback_nok: '❌ Incorreto. O procedimento correto é estacionar em local seguro, liberar a passagem e aguardar as orientações do brigadista.'
    },
    {
        q: 'O que o operador deve fazer caso ocorra um princípio de incêndio na sua própria empilhadeira?',
        topic: 'Princípio de incêndio na empilhadeira',
        opts: [
            'Primeiramente pedir ajuda e comunicar, para só então iniciar o combate usando o extintor adequado (Pó químico ou CO₂).',
            'Tentar apagar o fogo sozinho com qualquer extintor, sem avisar ninguém para não assustar a equipe.',
            'Jogar água no motor imediatamente e fugir.'
        ],
        correct: 0,
        feedback_ok: '✅ Correto! Comunicar primeiro e depois usar o extintor adequado é o procedimento seguro.',
        feedback_nok: '❌ Incorreto. Sempre comunique primeiro, depois utilize o extintor adequado (Pó químico ou CO₂).'
    },
    {
        q: 'Sobre o procedimento seguro para a troca de baterias de empilhadeiras elétricas, qual é a sequência correta?',
        topic: 'Troca segura de baterias',
        opts: [
            'A troca pode ser feita com a máquina ligada, desde que seja rápida.',
            'Remover a bateria, colocar a nova e deixar a bateria velha no chão do estoque.',
            'Desligar a chave de partida, desconectar o cabo, instalar a nova bateria e conectar a bateria retirada no carregador.'
        ],
        correct: 2,
        feedback_ok: '✅ Correto! Desligar, desconectar, instalar a nova e colocar a antiga para carregar é o procedimento correto.',
        feedback_nok: '❌ Incorreto. A sequência correta é: desligar a chave, desconectar, instalar a nova e colocar a antiga no carregador.'
    }
];
const quiz6b = createQuizEngine('q6b', q6b_questions, 3);
if (document.getElementById('q6b-question-panel')) quiz6b.render();
function startQuiz6bIntro() { quiz6b.start(); }
function verifyAnswer6b() { quiz6b.verify(); }
function nextQuestion6b() { quiz6b.next(); }
function resetQuiz6b() { quiz6b.reset(); }

const q6_questions = [
    { theme:'LEGISLAÇÃO E HABILITAÇÃO', svg:'<circle cx="28" cy="16" r="10" stroke="rgba(230,81,0,0.8)" stroke-width="1.5" fill="none"/><rect x="20" y="28" width="16" height="20" rx="3" stroke="rgba(230,81,0,0.8)" stroke-width="1.5" fill="none"/><line x1="23" y1="34" x2="33" y2="34" stroke="rgba(230,81,0,0.6)" stroke-width="1.5"/><line x1="23" y1="38" x2="33" y2="38" stroke="rgba(230,81,0,0.6)" stroke-width="1.5"/><text x="28" y="52" font-size="8" text-anchor="middle" fill="rgba(230,81,0,0.7)" font-family="monospace">VENCIDO</text>', q:'O operador está com seu cartão de identificação (com nome e foto) vencido há 2 anos, mas continua operando a máquina normalmente.', opts:['🟢 OPERAÇÃO SEGURA','🔴 RISCO / INFRAÇÃO'], correct:1, feedback_ok:'✅ O cartão possui validade de 1 ano e deve ser revalidado mediante exame de saúde.', feedback_nok:'❌ O cartão possui validade de 1 ano e deve ser revalidado. Esta é uma infração.' },
    { theme:'TRIÂNGULO DA ESTABILIDADE', svg:'<polygon points="28,4 52,48 4,48" stroke="rgba(230,81,0,0.8)" stroke-width="1.5" fill="rgba(230,81,0,0.08)"/><circle cx="28" cy="32" r="5" fill="rgba(230,81,0,0.8)"/><line x1="28" y1="37" x2="28" y2="45" stroke="rgba(230,81,0,0.6)" stroke-width="2" stroke-dasharray="3,3"/>', q:'Para ganhar tempo, o operador faz um giro rápido à esquerda enquanto transporta uma carga pesada elevada.', opts:['🟢 OPERAÇÃO SEGURA','🔴 RISCO / INFRAÇÃO'], correct:1, feedback_ok:'✅ Curvas rápidas deslocam o centro de gravidade fora do triângulo e podem causar tombamento.', feedback_nok:'❌ Curvas rápidas com carga elevada podem causar tombamento. Situação de risco.' },
    { theme:'TRÂNSITO E PEDESTRES', svg:'<rect x="4" y="40" width="48" height="4" rx="1" fill="rgba(230,81,0,0.3)"/><line x1="14" y1="40" x2="14" y2="44" stroke="rgba(230,81,0,0.6)" stroke-width="2"/><line x1="22" y1="40" x2="22" y2="44" stroke="rgba(230,81,0,0.6)" stroke-width="2"/><line x1="30" y1="40" x2="30" y2="44" stroke="rgba(230,81,0,0.6)" stroke-width="2"/><line x1="38" y1="40" x2="38" y2="44" stroke="rgba(230,81,0,0.6)" stroke-width="2"/><circle cx="28" cy="10" r="5" stroke="rgba(230,81,0,0.8)" stroke-width="1.5" fill="none"/><line x1="28" y1="15" x2="28" y2="28" stroke="rgba(230,81,0,0.8)" stroke-width="2"/><line x1="20" y1="20" x2="36" y2="20" stroke="rgba(230,81,0,0.8)" stroke-width="1.5"/><line x1="28" y1="28" x2="22" y2="38" stroke="rgba(230,81,0,0.8)" stroke-width="1.5"/><line x1="28" y1="28" x2="34" y2="38" stroke="rgba(230,81,0,0.8)" stroke-width="1.5"/>', q:'Ao se aproximar de um cruzamento interno do galpão, o operador faz a parada obrigatória e toca a buzina antes de prosseguir.', opts:['🟢 OPERAÇÃO SEGURA','🔴 RISCO / INFRAÇÃO'], correct:0, feedback_ok:'✅ A parada obrigatória e o uso da buzina são procedimentos corretos e obrigatórios.', feedback_nok:'❌ Este é o procedimento correto. Parada obrigatória e buzina são exigências da NR-11.' },
    { theme:'MARCHA À RÉ', svg:'<rect x="8" y="18" width="30" height="20" rx="4" stroke="rgba(230,81,0,0.8)" stroke-width="1.5" fill="rgba(230,81,0,0.06)"/><circle cx="14" cy="40" r="5" stroke="rgba(230,81,0,0.8)" stroke-width="1.5" fill="none"/><circle cx="32" cy="40" r="5" stroke="rgba(230,81,0,0.8)" stroke-width="1.5" fill="none"/><line x1="38" y1="24" x2="50" y2="24" stroke="rgba(230,81,0,0.5)" stroke-width="1" stroke-dasharray="3,2"/><polygon points="46,20 52,24 46,28" fill="rgba(230,81,0,0.7)"/><text x="28" y="14" font-size="8" text-anchor="middle" fill="rgba(230,81,0,0.7)" font-family="monospace">◄ RÉ</text>', q:'O operador transporta uma carga que bloqueia totalmente sua visão frontal e decide conduzir a empilhadeira de marcha à ré.', opts:['🟢 OPERAÇÃO SEGURA','🔴 RISCO / INFRAÇÃO'], correct:0, feedback_ok:'✅ Quando a visão frontal é comprometida, a operação deve ocorrer em marcha à ré.', feedback_nok:'❌ Este é o procedimento correto. Com visão frontal bloqueada, deve-se operar em marcha à ré.' },
    { theme:'CHECKLIST E MANUTENÇÃO', svg:'<rect x="14" y="4" width="28" height="36" rx="3" stroke="rgba(230,81,0,0.8)" stroke-width="1.5" fill="none"/><line x1="20" y1="14" x2="36" y2="14" stroke="rgba(230,81,0,0.4)" stroke-width="1.5"/><line x1="20" y1="20" x2="36" y2="20" stroke="rgba(230,81,0,0.4)" stroke-width="1.5"/><line x1="20" y1="26" x2="30" y2="26" stroke="rgba(230,81,0,0.4)" stroke-width="1.5"/><circle cx="34" cy="44" r="8" fill="rgba(220,50,50,0.2)" stroke="rgba(220,50,50,0.8)" stroke-width="1.5"/><line x1="31" y1="41" x2="37" y2="47" stroke="rgba(220,50,50,0.9)" stroke-width="2" stroke-linecap="round"/><line x1="37" y1="41" x2="31" y2="47" stroke="rgba(220,50,50,0.9)" stroke-width="2" stroke-linecap="round"/>', q:'Durante o checklist diário, o operador percebe que a buzina não funciona, registra a falha, mas continua utilizando a máquina.', opts:['🟢 OPERAÇÃO SEGURA','🔴 RISCO / INFRAÇÃO'], correct:1, feedback_ok:'✅ Equipamentos com itens obrigatórios defeituosos devem ser retirados de operação.', feedback_nok:'❌ A buzina é item obrigatório. O equipamento deve ser retirado para manutenção.' },
    { theme:'CARONA PROIBIDA', svg:'<circle cx="20" cy="10" r="5" stroke="rgba(230,81,0,0.8)" stroke-width="1.5" fill="none"/><line x1="20" y1="15" x2="20" y2="26" stroke="rgba(230,81,0,0.8)" stroke-width="2"/><line x1="12" y1="20" x2="28" y2="20" stroke="rgba(230,81,0,0.8)" stroke-width="1.5"/><line x1="20" y1="26" x2="15" y2="36" stroke="rgba(230,81,0,0.8)" stroke-width="1.5"/><line x1="20" y1="26" x2="25" y2="36" stroke="rgba(230,81,0,0.8)" stroke-width="1.5"/><circle cx="28" cy="28" r="14" stroke="rgba(220,50,50,0.8)" stroke-width="2" fill="none"/><line x1="18" y1="18" x2="38" y2="38" stroke="rgba(220,50,50,0.8)" stroke-width="2.5" stroke-linecap="round"/>', q:'O operador permite que um ajudante viaje em pé na lateral da empilhadeira para atravessar o estoque.', opts:['🟢 OPERAÇÃO SEGURA','🔴 RISCO / INFRAÇÃO'], correct:1, feedback_ok:'✅ Empilhadeiras não são meios de transporte de pessoas. Caronas são terminantemente proibidas.', feedback_nok:'❌ Caronas são proibidas. Empilhadeiras não são meios de transporte de pessoas.' },
    { theme:'CASA DE BATERIAS', svg:'<rect x="8" y="14" width="36" height="24" rx="3" stroke="rgba(230,81,0,0.8)" stroke-width="1.5" fill="rgba(230,81,0,0.06)"/><rect x="18" y="8" width="6" height="6" rx="1" fill="rgba(230,81,0,0.6)"/><rect x="28" y="8" width="6" height="6" rx="1" fill="rgba(230,81,0,0.6)"/><line x1="20" y1="22" x2="20" y2="32" stroke="rgba(230,81,0,0.8)" stroke-width="2"/><line x1="15" y1="27" x2="25" y2="27" stroke="rgba(230,81,0,0.8)" stroke-width="2"/><line x1="30" y1="27" x2="38" y2="27" stroke="rgba(230,81,0,0.5)" stroke-width="2"/><text x="28" y="50" font-size="7" text-anchor="middle" fill="rgba(230,81,0,0.5)" font-family="monospace">H₂O APÓS</text>', q:'Antes de iniciar o carregamento da bateria, o operador completa o nível dos elementos com água.', opts:['🟢 OPERAÇÃO SEGURA','🔴 RISCO / INFRAÇÃO'], correct:1, feedback_ok:'✅ A água deve ser adicionada apenas após o carregamento completo, nunca antes.', feedback_nok:'❌ A água deve ser adicionada apenas após o carregamento completo.' },
    { theme:'EMERGÊNCIA E INCÊNDIO', svg:'<polygon points="28,4 10,44 46,44" stroke="rgba(230,81,0,0.8)" stroke-width="1.5" fill="rgba(230,81,0,0.06)"/><line x1="28" y1="18" x2="28" y2="30" stroke="rgba(230,81,0,0.8)" stroke-width="2.5" stroke-linecap="round"/><circle cx="28" cy="36" r="2.5" fill="rgba(230,81,0,0.8)"/>', q:'Ao ouvir o alarme de incêndio, o operador estaciona a empilhadeira em local seguro, libera a passagem e aguarda as orientações da brigada.', opts:['🟢 OPERAÇÃO SEGURA','🔴 RISCO / INFRAÇÃO'], correct:0, feedback_ok:'✅ O procedimento segue corretamente o plano de emergência.', feedback_nok:'❌ Este é o procedimento correto de emergência.' }
];



function toggleQuiz6Music() {
    const m = document.getElementById('q6-bg-music');
    const btn = document.getElementById('q6-btn-music-toggle');
    if (!m) return;
    m.muted = !m.muted;
    if (m.muted) {
        btn.innerHTML = '🔇 MUSIC OFF';
        btn.style.color = 'var(--red)';
        btn.style.borderColor = 'var(--red)';
    } else {
        btn.innerHTML = '🔊 MUSIC ON';
        btn.style.color = 'var(--green)';
        btn.style.borderColor = 'var(--green)';
    }
}

function playQuiz6Audio(type) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const now = ctx.currentTime;

        if (type === 'start') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(50, now);
            osc.frequency.exponentialRampToValueAtTime(10, now + 1);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(now); osc.stop(now + 1);
        } else if (type === 'click') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'correct') {
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            osc1.type = 'sine'; osc2.type = 'triangle';
            osc1.frequency.setValueAtTime(440, now);
            osc1.frequency.setValueAtTime(554.37, now + 0.1);
            osc1.frequency.setValueAtTime(659.25, now + 0.2);
            osc2.frequency.setValueAtTime(220, now);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
            osc1.start(now); osc2.start(now); osc1.stop(now + 0.5); osc2.stop(now + 0.5);
        } else if (type === 'incorrect') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(now); osc.stop(now + 0.3);
        } else if (type === 'transition') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.linearRampToValueAtTime(2000, now + 0.2);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.05, now + 0.1);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(now); osc.stop(now + 0.2);
        } else if (type === 'end') {
            // Soft short tech sound instead of strong chord
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.05, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now); osc.stop(now + 0.5);
        }
    } catch (e) { }
}

const quiz6 = createQuizEngine('q6', q6_questions, 8);
if (document.getElementById('q6-question-panel')) quiz6.render();
function startQuiz6Intro() { quiz6.start(); }
function verifyAnswer6() { quiz6.verify(); }
function nextQuestion6() { quiz6.next(); }
function resetQuiz6() { quiz6.reset(); }



/* === Override Próximo button label/behavior at module end === */
(function () {
    const btnFwd = document.getElementById('btn-fwd');
    if (!btnFwd) return;

    // Normalize button structure: <span class="fwd-label">TEXT</span> + <svg/>
    (function normalize() {
        const svg = btnFwd.querySelector('svg');
        let label = btnFwd.querySelector('.fwd-label');
        if (!label) {
            label = document.createElement('span');
            label.className = 'fwd-label';
            label.textContent = 'PRÓXIMO';
            btnFwd.innerHTML = '';
            btnFwd.appendChild(label);
            if (svg) btnFwd.appendChild(svg);
        }
    })();

    const origUpdate = window.updateNextButton;
    window.updateNextButton = function () {
        if (typeof origUpdate === 'function') origUpdate();
        try {
            const activeSlide = document.querySelector('.slide.active');
            if (activeSlide && activeSlide.id === 's44') {
                btnFwd.style.display = 'none';
                return;
            }

            if (activeSlide && activeSlide.id === 's43') {
                btnFwd.style.display = 'flex';
            }

            const total = document.querySelectorAll('.slide').length;
            const label = btnFwd.querySelector('.fwd-label');
            const isLast = currentSlide === total - 1;
            const hasNextModule = window.MODULE_NAV && window.MODULE_NAV.next;

            if (isLast && hasNextModule) {
                // Last slide of non-final module: "PRÓXIMO MÓDULO"
                btnFwd.style.display = 'flex';
                btnFwd.disabled = !isSlideCompleted(currentSlide);
                if (label) label.textContent = 'PRÓXIMO';
                btnFwd.classList.add('btn-next-module');
            } else {
                // Restore default label "PRÓXIMO"
                if (label) label.textContent = 'PRÓXIMO';
                btnFwd.classList.remove('btn-next-module');
            }

            // Cover slide (index, slide 0): hide nav completely - "INICIAR" handles it
            const navEl = document.getElementById('nav');
            if (window.MODULE_NAV && window.MODULE_NAV.id === 'index' && currentSlide === 0) {
                if (navEl) navEl.classList.add('nav-hidden-cover');
            } else {
                if (navEl) navEl.classList.remove('nav-hidden-cover');
            }
        } catch (e) { }
    };
    try { window.updateNextButton(); } catch (e) { }
})();



/* ════════════════════════════════════════
   GLOBAL CLICK SOUND for cards (sem duplicar)
   Toca o som do flip card SOMENTE em cards que
   não tem som próprio. Detecta pelo onclick handler.
   ════════════════════════════════════════ */
(function () {
    const cardSelectors = [
        '.flip-card',
        '.comp-card-modern',
        '.compare-card',
        '.hub-spoke',
        '.icon-card',
        '.check-item',
        '.stat-pill',
        '.risk-card',
        '.sum-item',
        '.rule-card',
        '.rampas-card',
        '.mod5-card',
        '.hud-panel-item',
        '.passo-card',
        '.c-badge',
        '.epi-img-wrapper',
        '.epi-card'
    ];
    const soundPatterns = /playBeep|playHUDBeep|playTechClick|playQuiz6Audio|soundClick|playClick|clickAudio|new Audio/;

    function hasOwnSound(el) {
        if (!el) return false;
        // Walk up the tree checking onclick attributes
        let cur = el;
        while (cur && cur !== document.body) {
            const oc = cur.getAttribute && cur.getAttribute('onclick');
            if (oc && soundPatterns.test(oc)) return true;
            cur = cur.parentElement;
        }
        return false;
    }

    document.addEventListener('click', function (ev) {
        const target = ev.target.closest(cardSelectors.join(','));
        if (!target) return;
        if (hasOwnSound(target)) return;
        try { playBeep('flip'); } catch (e) { }
    }, true);
})();


/* ════════════════════════════════════════
   ACESSIBILIDADE — Ouvir (TTS) & Libras
   Injetado automaticamente em todas as páginas
   ════════════════════════════════════════ */
(function () {
    if (window.__a11yInjected) return;
    window.__a11yInjected = true;

    function init() {
        if (document.getElementById('a11y-bar')) return;

        const bar = document.createElement('div');
        bar.id = 'a11y-bar';
        bar.setAttribute('role', 'toolbar');
        bar.setAttribute('aria-label', 'Ferramentas de acessibilidade');
        bar.innerHTML = `
            <button type="button" id="a11y-launcher" aria-pressed="false" aria-label="Ouvir o conteúdo da página" title="Ouvir">
                <svg class="a11y-speaker-ico" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 9v6h3.5L12 19V5L7.5 9H4z" fill="currentColor"/>
                    <path d="M15.5 8.5a4.5 4.5 0 0 1 0 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M17.8 6a7.5 7.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
            <div class="audio-helper">Reproduza o áudio em cada nova pergunta.</div>
        `;
        document.body.appendChild(bar);

        function positionA11yBar() {
            const logo = document.getElementById('logo');
            if (!logo) return;
            const r = logo.getBoundingClientRect();
            const gap = 10;
            const launcherSize = parseFloat(getComputedStyle(document.getElementById('a11y-launcher')).width) || 36;
            const topPx = Math.max(8, r.top + (r.height - launcherSize) / 2);
            const rightPx = Math.max(8, window.innerWidth - r.left + gap);
            bar.style.top = topPx + 'px';
            bar.style.right = rightPx + 'px';

            const btnDemo = document.getElementById('btn-demo');
            if (btnDemo) {
                const btnGap = 8;
                const btnH = btnDemo.offsetHeight || launcherSize;
                btnDemo.style.top = Math.max(8, r.top + (r.height - btnH) / 2) + 'px';
                btnDemo.style.right = (rightPx + launcherSize + btnGap) + 'px';
                btnDemo.style.left = 'auto';
                btnDemo.style.bottom = 'auto';
            }
        }
        positionA11yBar();
        window.positionA11yBar = positionA11yBar;
        window.addEventListener('resize', positionA11yBar);
        window.addEventListener('load', positionA11yBar);
        const logoEl = document.getElementById('logo');
        if (logoEl) {
            const logoImg = logoEl.querySelector('img');
            if (logoImg) {
                if (logoImg.complete) positionA11yBar();
                else logoImg.addEventListener('load', positionA11yBar);
            }
        }

        const launcher = document.getElementById('a11y-launcher');
        let currentAudio = null;
        let currentObjectUrl = null;
        let speaking = false;
        let speakToken = 0;

        // Páginas com TTS liberado: toca MP3 pré-gerado (sem API no clique).
        const TTS_TEST_PAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44];
        const TTS_AUDIO_DIR = 'audios-novos';

        function resolveLocalTtsSrc(pageNum) {
            const fallback = TTS_AUDIO_DIR + '/pagina-' + pageNum + '.mp3';
            try {
                if (typeof AUDIO_DATA === 'undefined' || !AUDIO_DATA.MULTI_STATE) return fallback;
                const activeSlide = document.querySelector('.slide.active');
                if (!activeSlide || !activeSlide.id) return fallback;
                const cfg = AUDIO_DATA.MULTI_STATE[activeSlide.id];
                if (!cfg) return fallback;

                const isVisible = function (sel) {
                    if (!sel) return false;
                    const el = activeSlide.querySelector(sel) || document.querySelector(sel);
                    if (!el) return false;
                    const cs = window.getComputedStyle(el);
                    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
                    return el.offsetParent !== null || el.getClientRects().length > 0;
                };

                // Credencial (s8-req): tópico aberto no acordeão OU card do carrossel
                if (activeSlide.id === 's8-req' && cfg.questions && cfg.questions.length) {
                    const desktopAcc = activeSlide.querySelector('.s8r-desktop-acc');
                    const desktopOn = desktopAcc && window.getComputedStyle(desktopAcc).display !== 'none';
                    if (desktopOn) {
                        const items = activeSlide.querySelectorAll('.s8r-desktop-acc .acc-item');
                        let openIdx = -1;
                        items.forEach(function (el, i) {
                            if (el.classList.contains('open')) openIdx = i;
                        });
                        if (openIdx >= 0) {
                            return TTS_AUDIO_DIR + '/pagina-' + pageNum + '-q' + (openIdx + 1) + '.mp3';
                        }
                        return fallback;
                    }
                    const counter = activeSlide.querySelector(cfg.counterSelector) ||
                        document.querySelector(cfg.counterSelector);
                    let qNum = 1;
                    if (counter) {
                        const m = (counter.textContent || '').match(cfg.counterPattern || /(\d+)\s*\//);
                        if (m && m[1]) qNum = parseInt(m[1], 10) || 1;
                    }
                    return TTS_AUDIO_DIR + '/pagina-' + pageNum + '-q' + qNum + '.mp3';
                }

                // Carrossel s14b (fazer / não fazer): sempre pelo contador
                if (activeSlide.id === 's14b' && cfg.questions && cfg.questions.length) {
                    const counter = activeSlide.querySelector(cfg.counterSelector) ||
                        document.querySelector(cfg.counterSelector);
                    let qNum = 1;
                    if (counter) {
                        const m = (counter.textContent || '').match(cfg.counterPattern || /(\d+)\s*\//);
                        if (m && m[1]) qNum = parseInt(m[1], 10) || 1;
                    }
                    return TTS_AUDIO_DIR + '/pagina-' + pageNum + '-q' + qNum + '.mp3';
                }

                // Câmeras s17: índice pelo CAM-0N
                if (activeSlide.id === 's17' && cfg.questions && cfg.questions.length) {
                    const camId = activeSlide.querySelector('#s17-cam-id') || document.getElementById('s17-cam-id');
                    let qNum = 1;
                    if (camId) {
                        const m = (camId.textContent || '').match(/CAM-0?(\d+)/i);
                        if (m && m[1]) qNum = parseInt(m[1], 10) || 1;
                    }
                    return TTS_AUDIO_DIR + '/pagina-' + pageNum + '-q' + qNum + '.mp3';
                }

                // Simulador s18: modal Fator Cegueira OU nível do slider (100/75/50/25/10)
                if (activeSlide.id === 's18') {
                    const modal = document.getElementById('s18-modal');
                    if (modal && modal.classList.contains('active')) {
                        return TTS_AUDIO_DIR + '/pagina-' + pageNum + '-blind.mp3';
                    }
                    const valueEl = document.getElementById('s18-vis-value');
                    let pct = 100;
                    if (valueEl) {
                        const m = (valueEl.textContent || '').match(/(\d+)/);
                        if (m) pct = parseInt(m[1], 10) || 100;
                    }
                    const map = { 100: 1, 75: 2, 50: 3, 25: 4, 10: 5 };
                    const qNum = map[pct] || 1;
                    return TTS_AUDIO_DIR + '/pagina-' + pageNum + '-q' + qNum + '.mp3';
                }

                // Equilíbrio s23: botão ativo (desktop) ou contador (mobile)
                if (activeSlide.id === 's23' && cfg.questions && cfg.questions.length) {
                    const activeBtn = activeSlide.querySelector('.eq-btn.active');
                    const mobileOn = isVisible('#s23-m-card');
                    if (mobileOn) {
                        const counter = document.getElementById('s23-m-counter');
                        let qNum = 1;
                        if (counter) {
                            const m = (counter.textContent || '').match(/(\d+)\s*\//);
                            if (m && m[1]) qNum = parseInt(m[1], 10) || 1;
                        }
                        return TTS_AUDIO_DIR + '/pagina-' + pageNum + '-q' + qNum + '.mp3';
                    }
                    if (activeBtn && activeBtn.dataset && activeBtn.dataset.idx != null) {
                        const qNum = (parseInt(activeBtn.dataset.idx, 10) || 0) + 1;
                        return TTS_AUDIO_DIR + '/pagina-' + pageNum + '-q' + qNum + '.mp3';
                    }
                    return TTS_AUDIO_DIR + '/pagina-' + pageNum + '-q1.mp3';
                }

                // Centro de carga s24: contador mobile ou visão geral no desktop
                if (activeSlide.id === 's24' && cfg.questions && cfg.questions.length) {
                    if (isVisible('#s24-m-slide')) {
                        const counter = document.getElementById('s24-m-counter');
                        let qNum = 1;
                        if (counter) {
                            const m = (counter.textContent || '').match(/(\d+)\s*\//);
                            if (m && m[1]) qNum = parseInt(m[1], 10) || 1;
                        }
                        return TTS_AUDIO_DIR + '/pagina-' + pageNum + '-q' + qNum + '.mp3';
                    }
                    return fallback;
                }

                // Checklist s28: contador mobile ou visão geral desktop
                if (activeSlide.id === 's28' && cfg.questions && cfg.questions.length) {
                    if (isVisible('#s28-m-card')) {
                        const counter = document.getElementById('s28-m-counter');
                        let qNum = 1;
                        if (counter) {
                            const m = (counter.textContent || '').match(/(\d+)\s*\//);
                            if (m && m[1]) qNum = parseInt(m[1], 10) || 1;
                        }
                        return TTS_AUDIO_DIR + '/pagina-' + pageNum + '-q' + qNum + '.mp3';
                    }
                    return fallback;
                }

                // Parada segura s29: contador mobile ou visão geral desktop
                if (activeSlide.id === 's29' && cfg.questions && cfg.questions.length) {
                    if (isVisible('#s29-m-slide')) {
                        const counter = document.getElementById('s29-m-counter');
                        let qNum = 1;
                        if (counter) {
                            const m = (counter.textContent || '').match(/(\d+)\s*\//);
                            if (m && m[1]) qNum = parseInt(m[1], 10) || 1;
                        }
                        return TTS_AUDIO_DIR + '/pagina-' + pageNum + '-q' + qNum + '.mp3';
                    }
                    return fallback;
                }

                // Regras críticas s37: carrossel sempre pelo contador
                if (activeSlide.id === 's37' && cfg.questions && cfg.questions.length) {
                    const counter = document.getElementById('s37-counter');
                    let qNum = 1;
                    if (counter) {
                        const m = (counter.textContent || '').match(/(\d+)\s*\//);
                        if (m && m[1]) qNum = parseInt(m[1], 10) || 1;
                    }
                    return TTS_AUDIO_DIR + '/pagina-' + pageNum + '-q' + qNum + '.mp3';
                }

                // Incêndio s38: passos mobile ou visão geral desktop
                if (activeSlide.id === 's38' && cfg.questions && cfg.questions.length) {
                    const mobileOn = isVisible('#s38-m-label') || isVisible('#s38-m-journey');
                    const postOn = isVisible('#s38-m-post');
                    if (mobileOn && !postOn) {
                        const stepEl = document.getElementById('s38-m-step');
                        let qNum = 1;
                        if (stepEl) {
                            const m = (stepEl.textContent || '').match(/(\d+)\s*DE/i);
                            if (m && m[1]) qNum = parseInt(m[1], 10) || 1;
                        }
                        return TTS_AUDIO_DIR + '/pagina-' + pageNum + '-q' + qNum + '.mp3';
                    }
                    return fallback;
                }

                if (cfg.panels && cfg.panels.result && isVisible(cfg.panels.result)) {
                    return TTS_AUDIO_DIR + '/pagina-' + pageNum + '-result.mp3';
                }
                if (cfg.panels && cfg.panels.intro && isVisible(cfg.panels.intro)) {
                    return TTS_AUDIO_DIR + '/pagina-' + pageNum + '-intro.mp3';
                }
                if (cfg.panels && cfg.panels.question && isVisible(cfg.panels.question)) {
                    const counter = activeSlide.querySelector(cfg.counterSelector) ||
                        document.querySelector(cfg.counterSelector);
                    let qNum = 1;
                    if (counter) {
                        const pat = cfg.counterPattern || /(\d+)/;
                        const m = (counter.textContent || '').match(pat);
                        if (m && m[1]) qNum = parseInt(m[1], 10) || 1;
                    }
                    return TTS_AUDIO_DIR + '/pagina-' + pageNum + '-q' + qNum + '.mp3';
                }
            } catch (e) {
                console.warn('resolveLocalTtsSrc falhou:', e);
            }
            return fallback;
        }

        // Pré-carrega áudios simples das páginas liberadas
        TTS_TEST_PAGES.forEach(function (n) {
            try {
                const a = new Audio(TTS_AUDIO_DIR + '/pagina-' + n + '.mp3');
                a.preload = 'auto';
                a.load();
            } catch (e) { }
        });

        function stopSpeak() {
            speakToken++;
            if (currentAudio) {
                try { currentAudio.onended = null; currentAudio.onerror = null; } catch (e) { }
                currentAudio.pause();
                currentAudio.removeAttribute('src');
                try { currentAudio.load(); } catch (e) { }
                currentAudio = null;
            }
            if (currentObjectUrl) {
                try { URL.revokeObjectURL(currentObjectUrl); } catch (e) { }
                currentObjectUrl = null;
            }
            speaking = false;
            if (launcher) {
                launcher.classList.remove('is-active');
                launcher.setAttribute('aria-pressed', 'false');
                launcher.setAttribute('title', 'Ouvir');
            }
        }

        function cleanSpeakText(s) {
            if (!s) return '';
            return String(s)
                .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{1F000}-\u{1F2FF}\u{FE0F}]/gu, ' ')
                .replace(/[·•●▪►–—]+/g, '. ')
                .replace(/\u00A0/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        /* Extrai texto visível da página, INCLUINDO rótulos de botões. */
        function extractActiveSlideText() {
            const slide = document.querySelector('.slide.active');
            if (!slide) return '';
            const clone = slide.cloneNode(true);
            const removeSel = [
                'script', 'style', 'noscript', 'svg', 'iframe', 'audio', 'video',
                'canvas', 'embed', 'object', 'img', 'picture', 'source',
                '[aria-hidden="true"]', '.wave', '.s1-hero-img',
                '.s1-session-info', '#nav', '#a11y-bar'
            ];
            removeSel.forEach(function (sel) {
                clone.querySelectorAll(sel).forEach(function (n) { n.remove(); });
            });
            clone.querySelectorAll('br').forEach(function (br) {
                br.replaceWith(document.createTextNode(' '));
            });
            clone.querySelectorAll('button, .btn-start, .btn-tutorial, .tutorial-replay').forEach(function (btn) {
                const label = cleanSpeakText(btn.innerText || btn.textContent || '');
                if (label) btn.textContent = ' ' + label + '. ';
            });
            return cleanSpeakText(clone.textContent || '');
        }

        function playFromSrc(src) {
            return new Promise(function (resolve, reject) {
                if (currentAudio) {
                    try { currentAudio.onended = null; currentAudio.onerror = null; } catch (e) { }
                    currentAudio.pause();
                }
                const audio = new Audio();
                currentAudio = audio;
                audio.preload = 'auto';
                audio.onended = function () {
                    stopSpeak();
                    resolve();
                };
                audio.onerror = function () {
                    reject(new Error('Erro ao carregar/reproduzir: ' + src));
                };
                audio.src = src;
                const p = audio.play();
                if (p && typeof p.then === 'function') {
                    p.then(function () { /* playing */ }).catch(reject);
                }
            });
        }

        async function startSpeak() {
            const pageNum = (typeof nr11GlobalSlide === 'function') ? nr11GlobalSlide() : 1;

            if (TTS_TEST_PAGES.indexOf(pageNum) === -1) {
                console.warn('TTS teste: página ' + pageNum + ' ainda não liberada.');
                return;
            }

            speakToken++;
            speaking = true;
            if (launcher) {
                launcher.classList.add('is-active');
                launcher.setAttribute('aria-pressed', 'true');
                launcher.setAttribute('title', 'Parar leitura');
            }

            const src = resolveLocalTtsSrc(pageNum);
            const pageLabel = 'Página ' + pageNum + ' de ' + NR11_TOTAL_SLIDES + '.';
            console.log('[TTS] tocando', src, '|', cleanSpeakText(pageLabel + ' ' + extractActiveSlideText()));

            try {
                await playFromSrc(src);
            } catch (err) {
                console.error('TTS falhou:', err);
                alert('Não foi possível reproduzir o áudio da página ' + pageNum + '.');
                stopSpeak();
            }
        }

        launcher.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (speaking) stopSpeak();
            else startSpeak();
            window.updateQuizAudioHelper();
        });

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stopSpeak();
        });
        window.addEventListener('beforeunload', stopSpeak);

        if (typeof window.goTo === 'function' && !window.goTo.__a11yHooked) {
            const origGoTo = window.goTo;
            window.goTo = function () {
                stopSpeak();
                const result = origGoTo.apply(this, arguments);
                window.updateQuizAudioHelper();
                return result;
            };
            window.goTo.__a11yHooked = true;
        }

        window.updateQuizAudioHelper();
        ['q1-question-panel', 'sq2-question-panel', 'q3-question-panel', 'q4-question-panel', 'q5-question-panel', 'q6-question-panel', 'q6b-question-panel'].forEach(function (id) {
            const panel = document.getElementById(id);
            if (panel) {
                new MutationObserver(window.updateQuizAudioHelper).observe(panel, { attributes: true, attributeFilter: ['style', 'class'] });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


/* ════════════════════════════════════════
   MOBILE PERF — lazy load em imagens internas dos slides
   ════════════════════════════════════════ */
(function () {
    function shouldSkipLazy(img) {
        if (img.closest('.s1-hero-img, #logo, #a11y-bar, #nav, #a11y-launcher, .a11y-btn')) return true;
        if (img.closest('#s39')) return true;
        if (img.id === 'modalImg') return true;
        return false;
    }

    function applySlideImageLazyLoading() {
        document.querySelectorAll('.slide img').forEach(function (img) {
            if (shouldSkipLazy(img)) return;
            img.loading = 'lazy';
            img.decoding = 'async';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applySlideImageLazyLoading);
    } else {
        applySlideImageLazyLoading();
    }
})();
/* ════════════════════════════════════════
   TUTORIAL OBRIGATÓRIO — primeira tela
   ════════════════════════════════════════ */
(function () {
    if (window.__tutorialInjected) return;
    window.__tutorialInjected = true;

    function isIndexPage() {
        return !!(window.MODULE_NAV && window.MODULE_NAV.id === 'index');
    }

    function addReplayButton() {
        if (document.querySelector('.s1-secondary-actions')) return;
        const startBtn = document.querySelector('#s1 .btn-start');
        if (!startBtn) return;

        const row = document.createElement('div');
        row.className = 's1-secondary-actions';

        const replay = document.createElement('button');
        replay.type = 'button';
        replay.className = 'btn-tutorial tutorial-replay';
        replay.innerHTML = '▶ Ver tutorial';
        replay.onclick = function () {
            const staticModal = document.getElementById('tutorialModal');
            if (staticModal) staticModal.classList.add('active');
        };
        row.appendChild(replay);

        startBtn.insertAdjacentElement('afterend', row);
    }

    function init() {
        if (!isIndexPage()) return;
        addReplayButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
