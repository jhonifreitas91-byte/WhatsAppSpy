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
        { from: 60, to: 85, speed: 1.6 }, // ✅ corrigido
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
    if (!root) return;

    const bar = root.querySelector(".progress-bar");
    const texts = root.querySelectorAll(".progress-text");
    const statusText = document.getElementById('statusText');
    const statusIcon = document.getElementById('statusIcon');
    const statusContainer = document.querySelector('.progress-status');
    
    let currentProgress = 0;
    let lastTime = performance.now();
    const timePerPercent = totalDurationMs / 100;

    let lastPct = -1;
    let lastStatusIndex = -1;

function getStatusIndex(progress) {
    return statusMessages.findIndex(i =>
        progress >= i.from && (progress < i.to || i.to === 100)
    );
}

function tick(now) {
    const delta = now - lastTime;
    lastTime = now;

    const interval = speedIntervals.find(i =>
        currentProgress >= i.from && currentProgress < i.to
    );

    if (interval) {
        currentProgress += (delta / timePerPercent) * interval.speed;
    }

    currentProgress = Math.min(100, currentProgress);
    const pct = Math.floor(currentProgress);

    // ✅ Atualiza SOMENTE se mudou o número
    if (pct !== lastPct) {
        lastPct = pct;
        bar.style.width = pct + "%";
        texts.forEach(t => t.textContent = pct + "%");

        const statusIndex = getStatusIndex(pct);
        if (statusIndex !== lastStatusIndex && statusIndex !== -1) {
            lastStatusIndex = statusIndex;
            const msgs = statusMessages[statusIndex].messages;
            const msg = msgs[Math.floor(Math.random() * msgs.length)];

            if (statusText) statusText.textContent = msg.text;
            if (statusIcon) statusIcon.textContent = msg.icon;
            if (statusContainer) statusContainer.className = 'progress-status ' + msg.type;
        }
    }

    if (currentProgress < 100) {
        requestAnimationFrame(tick);
    } else {
        bar.style.width = "100%";
        texts.forEach(t => t.textContent = "100%");
        if (typeof onComplete === "function") onComplete();
    }
}
    requestAnimationFrame(tick);
}

// --- INICIALIZAÇÃO GERAL ---
document.addEventListener("DOMContentLoaded", function () {

    const cta = document.getElementById("descobrir-verdade");
    if (cta) {
        cta.disabled = true;
        cta.style.opacity = "0.7";
        cta.style.cursor = "not-allowed";
    }

    setTimeout(() => {
        startProgressBarWithVariableSpeeds({
            onComplete: () => {
                if (cta) {
                    cta.disabled = false;
                    cta.style.opacity = "";
                    cta.style.cursor = "pointer";
                }
                const btnWhats = document.querySelector(".btn-under-vsl");
                if (btnWhats) btnWhats.style.display = "block";
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

