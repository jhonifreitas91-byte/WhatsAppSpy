// CÓDIGO JAVASCRIPT CORRIGIDO E OTIMIZADO

// Função para gerar números aleatórios
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Gerar números aleatórios para os relatórios (uma vez por carregamento)
const NUMEROS_RELATORIOS = {
    mensagens: getRandomInt(35, 99),
    imagens: getRandomInt(15, 25),
    localizacoes: getRandomInt(1, 3)
};

// Atualizar números no HTML quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    const numMensagens = document.getElementById('num-mensagens');
    const numImagens = document.getElementById('num-imagens');
    const numLocalizacoes = document.getElementById('num-localizacoes');

    if (numMensagens) numMensagens.textContent = NUMEROS_RELATORIOS.mensagens;
    if (numImagens) numImagens.textContent = NUMEROS_RELATORIOS.imagens;
    if (numLocalizacoes) numLocalizacoes.textContent = NUMEROS_RELATORIOS.localizacoes;
});

// Função para mostrar toast de etapa concluída (tempo reduzido)
function showStageToast(type, icon, title, message) {
    const container = document.getElementById('stageToastContainer');
    if (!container) {
        console.warn('Elemento #stageToastContainer não encontrado para exibir o toast de etapa.');
        return;
    }

    const toast = document.createElement('div');
    toast.className = `stage-toast ${type}`;
    
    toast.innerHTML = `
        <div class="toast-header">
            <span class="toast-icon">${icon}</span>
            <div class="toast-title">${title}</div>
        </div>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    // Auto-hide após 3 segundos (reduzido de 4)
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 500);
    }, 3000);
}

// --- BARRA DE PROGRESSO CORRIGIDA ---
function startProgressBarWithVariableSpeeds({
    rootSelector = ".progress.neon",
    totalDurationMs = 28000,
    onComplete,
    speedIntervals = [
        { from: 0, to: 60, speed: 2.5 },
        { from: 60, to: 85, speed: 1,6 },
        { from: 85, to: 100, speed: 0.9 }
    ],
    statusMessages = [
        { from: 30, to: 60, messages: [
            { text: "Analisando pacotes de dados...", icon: "📦", type: "processing" },
            { text: "Verificando registros de chamadas...", icon: "📞", type: "processing" }
        ]},
        { from: 60, to: 75, messages: [
            { text: "Cruzando referências de contatos...", icon: "👥", type: "processing" },
            { text: "⚠️ Detectada atividade suspeita.", icon: "⚠️", type: "warning" }
        ]},
        { from: 75, to: 90, messages: [
            { text: "Analisando arquivos de mídia...", icon: "🖼️", type: "processing" },
            { text: "Buscando por imagens ocultas...", icon: "🔍", type: "processing" }
        ]},
        { from: 90, to: 100, messages: [
            { text: "Finalizando varredura profunda...", icon: "🔬", type: "processing" },
            { text: "Compilando relatório final...", icon: "📋", type: "success" },
            { text: "✅ Análise concluída!", icon: "✅", type: "success" }
        ]}
    ]
} = {}) {
    const root = document.querySelector(rootSelector);
    if (!root) {
        console.error('Elemento da barra de progresso não encontrado:', rootSelector);
        return;
    }

    const bar = root.querySelector(".progress-bar");
    const texts = root.querySelectorAll(".progress-text");
    const statusText = document.getElementById('statusText');
    const statusIcon = document.getElementById('statusIcon');
    const statusContainer = document.querySelector('.progress-status');

    if (!bar) {
        console.error('Elemento .progress-bar não encontrado');
        return;
    }

    const eventFlags = {
        mensagens: false,
        fotos: false,
        imagens: false,
        cardMsg: false,
        cardImg: false,
        cardLoc: false
    };

    // Inicialização corrigida - garantir que começa em 0%
    let currentProgress = 0;
    bar.style.width = "0%";
    texts.forEach(t => t.textContent = "0%");
    root.dataset.width = "0%";

    let lastTime = performance.now();
    let currentMessageIndex = 0;
    let lastMessageTime = 0;
    let currentInterval = null;
    let animationId = null;

    const timePerPercent = totalDurationMs / 100;

    function updateStatusMessage(progress) {
        if (progress < 30) return;

        const now = performance.now();
        const messageInterval = statusMessages.find(interval => 
            progress >= interval.from && progress < interval.to
        );

        if (messageInterval && messageInterval !== currentInterval) {
            currentInterval = messageInterval;
            currentMessageIndex = 0;
            lastMessageTime = now;
        }

        if (messageInterval && (now - lastMessageTime > 2000)) {
            const messages = messageInterval.messages;
            const message = messages[currentMessageIndex % messages.length];
            
            if(statusText) {
                statusText.classList.add('changing');
                setTimeout(() => statusText.classList.remove('changing'), 500);
                statusText.textContent = message.text;
            }
            if(statusIcon) statusIcon.textContent = message.icon;
            if(statusContainer) statusContainer.className = 'progress-status ' + message.type;
            
            currentMessageIndex++;
            lastMessageTime = now;
        }
    }
    
    // helper para revelar o resultado de um card e esconder título/descrição
    function revealCard(selector) {
        const card = document.querySelector(selector);
        if (!card) return;
        const title = card.querySelector('.card-title');
        const desc = card.querySelector('.card-description');
        const result = card.querySelector('.card-result');

        if (title) title.style.display = 'none';
        if (desc) desc.style.display = 'none';
        if (result) result.style.display = 'flex'; // ou 'block' se preferir
    }

    function checkEvents(progress) {
        // toasts já existentes (mantidos)
        if (progress >= 70 && !eventFlags.mensagens) {
            showStageToast('error', '💬', 'Mensagens Suspeitas', 'Análise inicial indica padrões suspeitos.');
            eventFlags.mensagens = true;
        }
        if (progress >= 85 && !eventFlags.fotos) {
            showStageToast('warning', '🖼️', 'Fotos', 'Detecção de imagens potencialmente comprometedoras.');
            eventFlags.fotos = true;
        }
        if (progress >= 90 && !eventFlags.imagens) {
            showStageToast('error', '📸', 'Imagens', 'Arquivos de imagem ocultos foram encontrados.');
            eventFlags.imagens = true;
        }

        // 👉 revela UM POR VEZ na ordem 70% → 85% → 90%
        if (progress >= 70 && !eventFlags.cardMsg) {
            revealCard('#card-msg');     // mostra resultado e esconde textos do 1º card
            eventFlags.cardMsg = true;
            return; // garante "um de cada vez" caso o progresso pule muito num mesmo frame
        }
        if (progress >= 85 && !eventFlags.cardImg) {
            revealCard('#card-img');     // 2º card
            eventFlags.cardImg = true;
            return;
        }
        if (progress >= 90 && !eventFlags.cardLoc) {
            revealCard('#card-loc');     // 3º card
            eventFlags.cardLoc = true;
            return;
        }
    }

    function tick(now) {
        const deltaTime = now - lastTime;
        lastTime = now;

        const currentSpeedInterval = speedIntervals.find(interval => 
            currentProgress >= interval.from && currentProgress < interval.to
        );

        if (currentSpeedInterval) {
            const progressIncrement = (deltaTime / timePerPercent) * currentSpeedInterval.speed;
            currentProgress += progressIncrement;
        }

        // Garantir que não ultrapasse 100% e não fique negativo
        currentProgress = Math.max(0, Math.min(100, currentProgress));

        const pct = Math.floor(currentProgress);

        // Atualizar elementos visuais
        bar.style.width = pct + "%";
        texts.forEach(t => t.textContent = pct + "%");
        root.dataset.width = pct + "%";

        updateStatusMessage(currentProgress);
        checkEvents(currentProgress);

        if (currentProgress < 100) {
            animationId = requestAnimationFrame(tick);
        } else {
            // Garantir que termina exatamente em 100%
            bar.style.width = "100%";
            texts.forEach(t => t.textContent = "100%");
            root.dataset.width = "100%";
            
            if (typeof onComplete === "function") {
                onComplete();
            }
            setTimeout(() => {
                if (typeof mostrarToastPreset === 'function') {
                    mostrarToastPreset('alertaUrgente');
                }
            }, 1000);
        }
    }

    // Iniciar animação
    animationId = requestAnimationFrame(tick);
    
    // Retornar função para cancelar se necessário
    return () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    };
}

// --- INICIALIZAÇÃO GERAL CORRIGIDA ---
document.addEventListener("DOMContentLoaded", function () {
    const cta = document.getElementById("descobrir-verdade");
    if (cta) {
        cta.disabled = true;
        cta.style.opacity = "0.7";
        cta.style.cursor = "not-allowed";
    }

    // Aguardar 3 segundos antes de iniciar (conforme conhecimento)
    setTimeout(() => {
        startProgressBarWithVariableSpeeds({
            onComplete: () => {
                if (cta) {
                    cta.disabled = false;
                    cta.style.opacity = "";
                    cta.style.cursor = "pointer";
                }
                const btnWhats = document.querySelector(".btn-under-vsl");
                if (btnWhats) {
                    btnWhats.style.display = "block";
                }
            }
        });
    }, 3000);
});

// --- CLASSE DE NOTIFICAÇÃO TOAST CORRIGIDA ---
class ToastNotification {
    constructor() {
        this.toastElement = null;
        this.autoCloseTimer = null;
        this.config = {
            autoClose: true,
            autoCloseDelay: 6000, // Reduzido de 10000 para 6000
            soundEnabled: true,
            vibrationEnabled: true,
            position: 'bottom-center'
        };
    }
    
    show(options = {}) {
        this.hide();
        const config = {
            title: 'Conversas suspeitas encontradas!',
            subtitle: 'Clique para verificar no WhatsApp',
            icon: '⚠️',
            color: 'red',
            buttonText: 'Acessar',
            showCloseButton: true,
            ...options
        };
        this.createToastElement(config);
        document.body.appendChild(this.toastElement);
        
        setTimeout(() => {
            if(this.toastElement) {
                this.toastElement.style.animation = 'slideUp 0.5s ease-out, pulse 2s ease-in-out infinite 1s';
            }
        }, 10);
        
        if (this.config.autoClose) {
            this.autoCloseTimer = setTimeout(() => this.hide(), this.config.autoCloseDelay);
        }
        return this;
    }
    
    createToastElement(config) {
        this.toastElement = document.createElement('div');
        this.toastElement.className = `toast-notification ${config.color}`;
        this.toastElement.id = 'toastNotification';
        this.toastElement.innerHTML = `
            ${config.showCloseButton ? '<button class="toast-close" onclick="window.toastInstance.hide()">&times;</button>' : ''}
            <span class="toast-icon">${config.icon}</span>
            <div class="toast-content">
                <div class="toast-title">${config.title}</div>
                <div class="toast-subtitle">${config.subtitle}</div>
            </div>
            <button class="toast-button" onclick="window.toastInstance.handleButtonClick()">${config.buttonText}</button>
        `;
    }
    
    hide() {
        if (this.toastElement) {
            this.toastElement.classList.add('hiding');
            setTimeout(() => {
                if (this.toastElement && this.toastElement.parentNode) {
                    this.toastElement.parentNode.removeChild(this.toastElement);
                }
                this.toastElement = null;
            }, 300);
        }
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
        }
    }
    
    handleButtonClick() {
        if (this.config.soundEnabled) this.playAlertSound();
        if (this.config.vibrationEnabled) this.addVibration();
        this.abrirWhatsApp();
        setTimeout(() => this.hide(), 500);
    }

    abrirWhatsApp() {
        window.location.href = "../verificacao.html";
    }

    playAlertSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) { 
            console.log('Som não disponível:', e); 
        }
    }
    
    addVibration() {
        if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    }
    
    configure(options) {
        this.config = { ...this.config, ...options };
        return this;
    }
}

// Instância global do toast
window.toastInstance = new ToastNotification();

// Funções auxiliares
function mostrarToastPersonalizado(titulo, subtitulo, cor = 'red', botaoTexto = 'Acessar') {
    window.toastInstance.show({ 
        title: titulo, 
        subtitle: subtitulo, 
        color: cor, 
        buttonText: botaoTexto 
    });
}

const ToastPresets = {
    conversasSuspeitas: { 
        title: 'Conversas suspeitas encontradas!', 
        subtitle: 'Clique para verificar no WhatsApp', 
        color: 'red', 
        icon: '⚠️', 
        buttonText: 'Acessar' 
    },
    alertaUrgente: { 
        title: 'ATENÇÃO: Atividade suspeita!', 
        subtitle: 'Verificação imediata necessária', 
        color: 'red', 
        icon: '🚨', 
        buttonText: 'Verificar' 
    },
};

function mostrarToastPreset(preset) {
    if (ToastPresets[preset]) {
        window.toastInstance.show(ToastPresets[preset]);
    } else {
        console.error('Preset de toast não encontrado:', preset);
    }
}

// Configuração inicial dos toasts
document.addEventListener('DOMContentLoaded', function () {
    window.toastInstance.configure({ 
        autoClose: true, 
        autoCloseDelay: 6000, // Reduzido de 12000 para 6000
        soundEnabled: true, 
        vibrationEnabled: true 
    });
});

// Função para fechar toast (compatibilidade)
function fecharToast() {
    if (window.toastInstance) {
        window.toastInstance.hide();
    }
}

