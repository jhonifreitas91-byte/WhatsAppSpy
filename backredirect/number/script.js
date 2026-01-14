// Mensagens de toast para urgência
const urgencyMessages = [
    "⚠️ Investigação sendo perdida!",
    "🔍 Processo interrompido!",
    "⏰ Conexão expirando!",
    "📱 Volte para finalizar!",
    "🚨 Dados sendo perdidos!"
];

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    initToastNotifications();
    initUrgencyEffects();
});

// Função principal de redirecionamento
function voltarEspionagem() {
    showLoadingState();
    
    // Simular carregamento e redirecionar
    setTimeout(() => {
        // Redirecionar para a página principal do SpyZap
        window.location.href = "../../index.html";
    }, 1500);
}

// Estado de carregamento do botão
function showLoadingState() {
    const button = document.querySelector('.main-cta');
    const originalContent = button.innerHTML;
    
    button.innerHTML = `
        <div class="cta-content">
            <div class="loading-spinner"></div>
            <div class="cta-text">
                <div class="cta-main">RECONECTANDO...</div>
                <div class="cta-sub">Retomando investigação...</div>
            </div>
        </div>
    `;
    
    button.disabled = true;
    button.style.opacity = '0.8';
}

// Sistema de notificações toast
function initToastNotifications() {
    // Criar container se não existir
    if (!document.getElementById('toastContainer')) {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Mostrar primeiro toast após 3 segundos
    setTimeout(() => {
        showToast(urgencyMessages[0]);
    }, 3000);
    
    // Mostrar toasts periódicos
    let messageIndex = 1;
    setInterval(() => {
        if (messageIndex < urgencyMessages.length) {
            showToast(urgencyMessages[messageIndex]);
            messageIndex++;
        } else {
            // Reiniciar ciclo
            messageIndex = 0;
        }
    }, 8000);
}

function showToast(message) {
    const toastContainer = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <button class="toast-close" onclick="closeToast(this)">&times;</button>
        <div>${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
    
    // Limitar número de toasts visíveis
    const toasts = toastContainer.querySelectorAll('.toast');
    if (toasts.length > 2) {
        toasts[0].remove();
    }
}

function closeToast(button) {
    button.parentElement.remove();
}

// Efeitos de urgência adicionais
function initUrgencyEffects() {
    // Efeito de piscar no ícone de alerta
    setInterval(() => {
        const alertIcon = document.querySelector('.alert-icon');
        if (alertIcon) {
            alertIcon.style.transform = 'scale(1.2)';
            setTimeout(() => {
                alertIcon.style.transform = 'scale(1)';
            }, 200);
        }
    }, 4000);
    
    // Efeito no aviso final
    setTimeout(() => {
        const finalWarning = document.querySelector('.final-warning');
        if (finalWarning) {
            finalWarning.style.animation = 'warningPulse 2s infinite';
        }
    }, 10000);
}

// Comportamento baseado em tempo na página
let timeOnPage = 0;
setInterval(() => {
    timeOnPage++;
    
    if (timeOnPage === 30) {
        showToast("⚡ Conexão expirando em breve!");
    }
    
    if (timeOnPage === 60) {
        showToast("🚨 URGENTE: Volte agora!");
    }
    
    if (timeOnPage === 90) {
        showToast("💥 ÚLTIMA CHANCE!");
    }
}, 1000);

// Vibração em dispositivos móveis
function vibrateDevice() {
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }
}

// Adicionar CSS para animações dinâmicas
const style = document.createElement('style');
style.textContent = `
    @keyframes warningPulse {
        0%, 100% { 
            border-color: #ff1744;
            background: rgba(255, 23, 68, 0.1);
        }
        50% { 
            border-color: #ff5722;
            background: rgba(255, 23, 68, 0.2);
        }
    }
    
    .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #ffffff;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 10px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Efeito especial quando a página carrega
setTimeout(() => {
    vibrateDevice();
    showToast("🚨 Investigação interrompida!");
}, 1000);

