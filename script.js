document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 [INIT] DOM carregado, inicializando aplicação...');

    const phoneInput       = document.getElementById('phoneInput');
    const startScanBtn     = document.getElementById('startScanBtn');
    const scanModal        = document.getElementById('scanModal');
    const displayPhone     = document.getElementById('displayPhone');
    const progressFill     = document.getElementById('progressFill');
    const progressPercent  = document.getElementById('progressPercent');
    const gifContainer     = document.getElementById('gifContainer');
    const completionGif    = document.getElementById('completionGif');
    const placeholderPhoto = document.getElementById('placeholderPhoto');

    console.log('📋 [INIT] Elementos DOM encontrados:', {
        phoneInput: !!phoneInput,
        startScanBtn: !!startScanBtn,
        scanModal: !!scanModal,
        displayPhone: !!displayPhone,
        progressFill: !!progressFill,
        progressPercent: !!progressPercent,
        gifContainer: !!gifContainer,
        completionGif: !!completionGif,
        placeholderPhoto: !!placeholderPhoto
    });

    // ========= Helpers =========
    const normalizeDigits = (v) => String(v || '').replace(/\D/g, '');
    const ensureBR = (digits) => digits.startsWith('55') ? digits : ('55' + digits);
    const buildCheckleakedURL = (digits) =>
        `https://whatsapp-db.checkleaked.com/${digits}.jpg?_=${Date.now()}`;

    // ========= (Opcional) Carregar imagem antiga do localStorage (LEGADO) =========
    function loadProfileImageFromStorage() {
        console.log('💾 [STORAGE] Tentando carregar imagem do localStorage (legado)...');
        const savedImage = localStorage.getItem('profileImage');
        const savedPhone = localStorage.getItem('profilePhone');

        console.log('💾 [STORAGE] Dados encontrados:', {
            savedImage: savedImage ? 'SIM' : 'NÃO',
            savedPhone: savedPhone || 'NÃO'
        });

        // Evita reutilizar URLs efêmeras da CDN do WhatsApp (se houver resquício antigo)
        if (savedImage && !/(^https?:\/\/)?pps\.whatsapp\.net/i.test(savedImage) && placeholderPhoto) {
            placeholderPhoto.src = savedImage;
            console.log('✅ [STORAGE] Imagem carregada do localStorage');
        } else {
            console.log('❌ [STORAGE] Nenhuma imagem reutilizável no localStorage');
        }
    }
    loadProfileImageFromStorage();

    // ========= Máscara/formatador visual do input =========
    phoneInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            if (value.length <= 2) {
                value = value.replace(/(\d{0,2})/, '($1');
            } else if (value.length <= 7) {
                value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
            } else {
                value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
            }
        }
        e.target.value = value;
        console.log('📱 [INPUT] Telefone exibido:', value);
    });

    // ========= Estado global de "encontrou imagem?" =========
    let apiImageFound = false;

    // ========= NOVO: tentar carregar imagem do checkleaked e marcar sucesso/erro =========
    function tryLoadCheckleakedImage(rawInput) {
        const digitsRaw = normalizeDigits(rawInput);
        const digits    = ensureBR(digitsRaw);
        const url       = buildCheckleakedURL(digits);

        console.log('🖼️ [IMG] Tentando carregar imagem:', { digits, url });

        // Salva apenas o telefone (se você quiser reaproveitar depois)
        localStorage.setItem('profilePhone', digits);

        // Atualiza o placeholder imediatamente
        if (placeholderPhoto) {
            placeholderPhoto.referrerPolicy = 'no-referrer';
            placeholderPhoto.alt = 'Carregando foto...';
            placeholderPhoto.style.opacity = '0.6';
            placeholderPhoto.src = url;

            // Valida carregamento real usando um Image separado (evita falso-positivo de cache)
            const probe = new Image();
            probe.referrerPolicy = 'no-referrer';
            probe.onload = () => {
                console.log('✅ [IMG] Imagem carregada com sucesso.');
                apiImageFound = true;
                // efeito fade-in
                placeholderPhoto.style.transition = 'opacity 0.3s ease';
                requestAnimationFrame(() => {
                    placeholderPhoto.style.opacity = '1';
                });
                // (Opcional) salvar a URL estável que você quiser (não é a CDN do WhatsApp)
                localStorage.setItem('profileImage', url);
            };
            probe.onerror = () => {
                console.log('❌ [IMG] Falha ao carregar a imagem.');
                apiImageFound = false;
                placeholderPhoto.onerror = null;
                placeholderPhoto.src = './assets/imgs/perfil.png';
                placeholderPhoto.style.opacity = '1';
                // Limpa URL antiga
                localStorage.removeItem('profileImage');
            };
            probe.src = url;
        } else {
            console.warn('❌ [IMG] #placeholderPhoto não encontrado.');
            apiImageFound = false;
        }
    }

    // ========= Clique no botão: valida, mostra modal, inicia "varredura" e tenta carregar imagem =========
    startScanBtn.addEventListener('click', function (e) {
        e.preventDefault?.();
        console.log('🔍 [SCAN] Botão de varredura clicado');

        const typed = phoneInput.value.trim();
        const digits = normalizeDigits(typed);

        console.log('📱 [SCAN] Número digitado (raw/digits):', { typed, digits });

        if (!digits || digits.length < 10) {
            console.log('❌ [SCAN] Número inválido, mostrando alerta');
            alert('Por favor, digite um número de telefone válido com DDD!');
            return;
        }

        // Mostrar o modal e setar número exibido
        scanModal.style.display = 'flex';
        scanModal.style.alignItems = 'center';
        scanModal.style.justifyContent = 'center';
        displayPhone.textContent = typed; // mantém visual formatado
        console.log('🎭 [MODAL] Exibido. Número:', typed);

        // Reset UI do modal
        progressFill.style.width = '0%';
        progressPercent.textContent = '0%';
        gifContainer.style.display = 'none';

        // Iniciar progresso + TENTAR carregar imagem (sem API)
        startProgressBar();
        tryLoadCheckleakedImage(typed);
    });

    // ========= Barra de progresso (inalterada, só sem chamada de API) =========
    function startProgressBar() {
        console.log('⏳ [PROGRESS] Iniciando barra de progresso...');
        const duration = 10000; // 10s
        const interval = 100;   // 100ms
        const steps = duration / interval;
        let currentStep = 0;

        const progressInterval = setInterval(function () {
            currentStep++;
            const percentage = Math.round((currentStep / steps) * 100);

            progressFill.style.width = percentage + '%';
            progressPercent.textContent = percentage + '%';

            if (percentage % 10 === 0) console.log('⏳ [PROGRESS]', percentage + '%');

            if (percentage >= 100) {
                clearInterval(progressInterval);
                console.log('✅ [PROGRESS] 100%');
                showCompletionGif();
            }
        }, interval);
    }

    // ========= GIF de conclusão e redirecionamento =========
    function showCompletionGif() {
        console.log('🎬 [GIF] Exibindo finalização...');
        document.querySelector('.progress-container').style.display = 'none';
        document.querySelector('.phone-display').style.display = 'none';
        document.querySelector('.modal-header').style.display = 'none';

        gifContainer.style.display = 'flex';
        gifContainer.style.alignItems = 'center';
        gifContainer.style.justifyContent = 'center';
        gifContainer.style.width = '100%';
        gifContainer.style.height = '100%';

        completionGif.src = './assets/midias/posimg.webm';
        completionGif.style.width = '100%';
        completionGif.style.height = '100%';
        completionGif.style.position = 'absolute';
        completionGif.style.top = '0';

        console.log('⏰ [REDIRECT] Esperando 3s...');
        setTimeout(function () {
            console.log('🚀 [REDIRECT] Redirecionando...');
            redirectToNextPage();
        }, 3000);
    }

    // ========= Redirecionamento baseado em apiImageFound (agora: sucesso do carregamento da imagem) =========
    function getUTMParams() {
        const params = new URLSearchParams(window.location.search);
        const utms = {};
        for (const [key, value] of params.entries()) {
            if (key.startsWith("utm_")) utms[key] = value;
        }
        return utms;
    }
    function buildUTMQuery(utms) {
        const q = new URLSearchParams(utms);
        return q.toString() ? `?${q.toString()}` : "";
    }
    function redirectToNextPage() {
        console.log('🎯 [REDIRECT] apiImageFound =', apiImageFound);
        const utms = getUTMParams();
        const utmQuery = buildUTMQuery(utms);

        sessionStorage.setItem('ALLOW_EXIT', 'true');
        if (apiImageFound) {
            const targetUrl = './vsl' + utmQuery;
            console.log('✅ [REDIRECT] Imagem encontrada! ->', targetUrl);
            window.location.href = targetUrl;
        } else {
            const targetUrl = './no-img/vsl/' + utmQuery;
            console.log('❌ [REDIRECT] Sem imagem. ->', targetUrl);
            window.location.href = targetUrl;
        }
    }

    // ========= UX extra =========
    window.addEventListener('click', function (event) {
        if (event.target === scanModal) {
            console.log('🎭 [MODAL] Clique fora -> fechar');
            scanModal.style.display = 'none';
        }
    });
    phoneInput.addEventListener('keypress', function (e) {
        const char = String.fromCharCode(e.which);
        if (!/[0-9]/.test(char) && e.which !== 8 && e.which !== 0) {
            console.log('🚫 [INPUT] Caractere bloqueado:', char);
            e.preventDefault();
        }
    });

    // (opcional) som no clique
    function playBeepSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            console.log('✅ [AUDIO] Beep ok');
        } catch (error) {
            console.log('❌ [AUDIO] Erro beep:', error.message);
        }
    }
    startScanBtn.addEventListener('click', function () {
        console.log('🔊 [AUDIO] Beep botão');
        playBeepSound();
    });

    console.log('✅ [INIT] Inicialização completa!');
});
