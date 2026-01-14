document.addEventListener('DOMContentLoaded', function () {
    // --------- PEGAR PARAMS DA URL ---------
    const urlParams    = new URLSearchParams(window.location.search);
    const pessoaParam  = urlParams.get('pessoa') || 'homem';   // homem | mulher
    let   phoneNumber  = urlParams.get('number') || '';
    const avatarParam  = urlParams.get('avatar');              // foto vinda da página 2
    const avatarUrl    = avatarParam ? decodeURIComponent(avatarParam) : null;

    // Adiciona o prefixo 55 se não tiver
    if (!phoneNumber.startsWith('+55')) {
        phoneNumber = '55' + phoneNumber.replace(/\D/g, '');
    }

    // ========== ÁUDIO (HOMEM / MULHER) ==========
    const imgElement   = document.getElementById('imgaudio');
    const audioElement = document.getElementById('audiomp3');

    if (imgElement && audioElement) {
        if (pessoaParam === 'homem') {
            imgElement.src   = './assets/images/HOMEM.png';
            audioElement.src = './assets/audio/homem.mp3';
        } else {
            imgElement.src   = './assets/images/MULHER.png';
            audioElement.src = './assets/audio/mulher.mp3';
        }
    } else {
        console.error('Elementos de imagem ou áudio não encontrados!');
    }

    // Player Plyr
    const player = new Plyr('.plyr', {
        controls: ['play', 'progress', 'current-time', 'duration']
    });

    const audioElementPlyr   = document.querySelector('.plyr');
    const currentTimeElement = document.querySelector('.plyr__time--current');
    const durationElement    = document.querySelector('.plyr__time--duration');
    const microphoneIcon     = document.querySelector('.microphone-icon');

    if (audioElementPlyr && currentTimeElement && durationElement && microphoneIcon) {
        currentTimeElement.classList.add('hide');

        audioElementPlyr.addEventListener('play', function () {
            currentTimeElement.classList.remove('hide');
            durationElement.classList.add('hide');
            microphoneIcon.classList.add('blue');
            audioElementPlyr.classList.add('blue');
            audioElementPlyr.style.setProperty('--range-thumb-background', '#3db8ee');
        });

        audioElementPlyr.addEventListener('pause', function () {
            currentTimeElement.classList.add('hide');
            durationElement.classList.remove('hide');
        });
    }

    const audioContainer  = document.getElementById('audioContainer');
    const playPauseButton = audioContainer?.querySelector('.plyr__controls button[data-plyr="play"]');
    const audioBox        = document.querySelector('.audio-box');

    if (audioContainer && playPauseButton && audioBox) {
        audioContainer.addEventListener('click', function () {
            playPauseButton.click();
        });

        playPauseButton.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        audioBox.addEventListener('click', function (event) {
            event.stopPropagation();
            playPauseButton.click();
        });
    }

    // ========= BACK REDIRECT / HISTÓRICO =========
    localStorage.setItem('accessedFinalPage', 'true');

    let urlBackRedirect = 'backredirect.html';
    urlBackRedirect = urlBackRedirect.trim() +
        (urlBackRedirect.indexOf("?") > 0 ? '&' : '?') +
        document.location.search.replace('?', '').toString();

    history.pushState({}, "", location.href);
    history.pushState({}, "", location.href);

    function redirectToBack() {
        setTimeout(function () {
            location.href = urlBackRedirect;
        }, 1);
    }
    window.onpopstate = redirectToBack;

    // ========= FUNÇÕES AUXILIARES PARA AS IMAGENS =========

    // Formata o número para exibir no topo das imagens (+55 DD 9)
    function getPhoneInitial(number) {
        let cleanNumber = number.replace(/\D/g, '');
        if (cleanNumber.startsWith('55')) cleanNumber = cleanNumber.slice(2);

        const m = cleanNumber.match(/^(\d{2})(\d)/);
        if (m) return `+55 ${m[1]} ${m[2]}`;
        return '+55';
    }

    async function tryFetch(url) {
        try {
            const res = await fetch(url);
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            console.error('Erro ao buscar:', url, e);
            return null;
        }
    }

    // Busca a foto do whats (URL pública) – usado só como backup se NÃO vier avatar da página 2
    async function fetchProfilePicture(phoneNumber) {
        const cleaned = phoneNumber.replace(/\D/g, '');
        const apiBase = 'https://conexaosegura.lat/api/whats.php?numero=';

        let response = await tryFetch(`${apiBase}${cleaned}`);
        if (response && response.profilePictureZAP) {
            return response.profilePictureZAP;
        }

        // tenta sem o nono dígito
        const semNono = cleaned.replace(/^(\d{2})(9)(\d{7})$/, '$1$3');
        if (semNono !== cleaned) {
            response = await tryFetch(`${apiBase}${semNono}`);
            if (response && response.profilePictureZAP) {
                return response.profilePictureZAP;
            }
        }

        // fallback – avatar padrão
        return 'https://conexaosegura.lat/api/imgs/user.jpg';
    }

    function updateTextByGender() {
        const genderSensitiveText = document.getElementById('gender-sensitive-text');
        if (!genderSensitiveText) return;

        if (pessoaParam === 'homem') {
            genderSensitiveText.innerHTML =
                '13 mensagens continham a palavra / semelhante "<strong>Gostosa</strong>"';
        } else {
            genderSensitiveText.innerHTML =
                '13 mensagens continham a palavra / semelhante "<strong>Gostoso</strong>"';
        }
    }

    // Converte URL em base64 "URL-safe" para usar em l_fetch:
    function encodeFetchUrl(url) {
        const b64 = btoa(url); // base64 normal
        return b64
            .replace(/\+/g, '-')  // + -> -
            .replace(/\//g, '_')  // / -> _
            .replace(/=+$/g, ''); // tira os "=" do final
    }

    // ========= MONTA AS 3 IMAGENS DINÂMICAS =========
    async function setImageUrl() {
        // PRIORIDADE 1: foto que veio da página 2 (avatar param)
        // PRIORIDADE 2: buscar na API (backup)
        const imageUrl = avatarUrl || await fetchProfilePicture(phoneNumber);

        // transforma em base64 URL-safe para usar em l_fetch:
        const fetchId   = encodeFetchUrl(imageUrl);

        // texto do número que vai em cima da imagem
        const phoneText = encodeURIComponent(getPhoneInitial(phoneNumber));

        // base do seu Cloudinary
        const cloudBase = 'https://res.cloudinary.com/dtyi1oxmy/image/upload';

// HOMEM (base: chat-mulher.jpg)
const primeiraIMGHomem = `${cloudBase}/l_fetch:${fetchId},w_130,h_130,c_fit,r_max/e_pixelate:9/fl_layer_apply,x_-292,y_900/l_microfone_y6z2fn/e_pixelate:9/fl_layer_apply,x_-232,y_930/l_fetch:${fetchId},w_130,h_130,c_fit,r_max/e_pixelate:9/fl_layer_apply,x_-292,y_503/l_microfone_y6z2fn/e_pixelate:9/fl_layer_apply,x_-232,y_533/l_fetch:${fetchId},w_130,h_130,c_fit,r_max/e_pixelate:9/fl_layer_apply,x_-292,y_340/l_microfone_y6z2fn/e_pixelate:9/fl_layer_apply,x_-232,y_370/l_fetch:${fetchId},w_130,h_130,c_fit,r_max/fl_layer_apply,x_-292,y_-145/l_microfone8_is0vqz/fl_layer_apply,x_-232,y_-107/l_fetch:${fetchId},w_130,h_130,c_fit,r_max/fl_layer_apply,x_-292,y_-635/l_microfone8_is0vqz/fl_layer_apply,x_-232,y_-595/co_rgb:FFFFFF,l_text:roboto_45_bold_normal_left:${phoneText}/fl_layer_apply,x_-265,y_-957/v1763564555/chat-mulher.jpg`;

// MULHER (base: chat-homem.jpg)
const primeiraIMGMulher =
  `${cloudBase}/l_fetch:${fetchId},w_130,h_130,c_fit,r_max/e_pixelate:9/fl_layer_apply,x_-292,y_750/l_microfone_y6z2fn/e_pixelate:9/fl_layer_apply,x_-232,y_790/l_fetch:${fetchId},w_130,h_130,c_fit,r_max/e_pixelate:9/fl_layer_apply,x_-292,y_573/l_microfone_y6z2fn/e_pixelate:9/fl_layer_apply,x_-232,y_613/l_fetch:${fetchId},w_130,h_130,c_fit,r_max/e_pixelate:9/fl_layer_apply,x_-292,y_397/l_microfone_y6z2fn/e_pixelate:9/fl_layer_apply,x_-232,y_437/l_fetch:${fetchId},w_130,h_130,c_fit,r_max/e_pixelate:9/fl_layer_apply,x_-292,y_220/l_microfone_y6z2fn/e_pixelate:9/fl_layer_apply,x_-232,y_260/l_fetch:${fetchId},w_130,h_130,c_fit,r_max/fl_layer_apply,x_-292,y_-334/l_microfone8_is0vqz/fl_layer_apply,x_-232,y_-294/co_rgb:FFFFFF,l_text:roboto_45_bold_normal_left:${phoneText}/fl_layer_apply,x_-265,y_-800/v1763564555/chat-homem.jpg`;


        // 2) SEGUNDA IMAGEM – ARQUIVADO
        const segundaIMGHomem  = `${cloudBase}/co_rgb:000000,l_text:roboto_55_normal_left:${phoneText}/fl_layer_apply,g_center,x_-217,y_-70/co_rgb:000000,l_text:roboto_55_normal_left:${phoneText}/fl_layer_apply,g_center,x_-217,y_160/v1763400550/arquivado-mulher.jpg`;
        const segundaIMGMulher = `${cloudBase}/co_rgb:000000,l_text:roboto_55_normal_left:${phoneText}/fl_layer_apply,g_center,x_-217,y_-70/co_rgb:000000,l_text:roboto_55_normal_left:${phoneText}/fl_layer_apply,g_center,x_-217,y_160/v1763400550/arquivado-homem.jpg`;

        // 3) TERCEIRA IMAGEM – FOTOS (local)
        const terceiraIMGHomem  = './assets/images/homem-fotos.jpg';
        const terceiraIMGMulher = './assets/images/mulher-fotos.jpg';

        // aplica na página
        document.getElementById('primeira-imagem').src =
            (pessoaParam === 'homem') ? primeiraIMGHomem : primeiraIMGMulher;
        document.getElementById('segunda-imagem').src  =
            (pessoaParam === 'homem') ? segundaIMGHomem  : segundaIMGMulher;
        document.getElementById('terceira-imagem').src =
            (pessoaParam === 'homem') ? terceiraIMGHomem  : terceiraIMGMulher;

        const debugUrl = (pessoaParam === 'homem') ? primeiraIMGHomem : primeiraIMGMulher;
        console.log('URL Cloudinary gerada:', debugUrl, '\nFoto usada:', imageUrl);

        updateTextByGender();
    }

    setImageUrl();

    // ========= NOTIFICAÇÕES =========
    let messageCounts = {
        "mensagens suspeitas encontradas": 2,
        "fotos suspeitas encontradas": 2,
        "localizações suspeitas encontradas": 2,
        "ligações suspeitas encontradas": 2,
        "mensagens apagadas encontradas": 2,
        "mensagens arquivadas encontradas": 2
    };

    function createNotification() {
        const notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) return;

        const messages      = Object.keys(messageCounts);
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        const messageCount  = messageCounts[randomMessage];

        messageCounts[randomMessage] += 2;

        const notification = document.createElement('div');
        notification.classList.add('notification');

        notification.innerHTML = `
            <img src="./assets/images/icon.webp" alt="WhatsApp">
            <div class="notification-text">
                <strong>WhatsDetect</strong><br>
                ${messageCount} ${randomMessage}
            </div>
            <button class="close-btn">×</button>
        `;

        notification.querySelector('.close-btn').addEventListener('click', function (e) {
            e.stopPropagation();
            closeNotification(notification);
        });

        notification.addEventListener('click', function () {
            showPopup();
        });

        notificationContainer.appendChild(notification);

        setTimeout(() => {
            closeNotification(notification);
        }, 3000);

        notification.addEventListener('touchstart', handleSwipeStart, false);
        notification.addEventListener('touchmove', handleSwipeMove, false);
        notification.addEventListener('touchend', handleSwipeEnd.bind(null, notification), false);
    }

    function closeNotification(notification) {
        notification.style.animation = 'slide-out 0.5s ease-in forwards';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }

    let swipeStartX = 0;

    function handleSwipeStart(event) {
        swipeStartX = event.touches[0].clientX;
    }

    function handleSwipeMove(event) {
        const currentX = event.touches[0].clientX;
        const diffX    = currentX - swipeStartX;

        if (diffX > 0) {
            event.target.style.transform = `translateX(${diffX}px)`;
        }
    }

    function handleSwipeEnd(notification, event) {
        const diffX = event.changedTouches[0].clientX - swipeStartX;

        if (diffX > 150) {
            closeNotification(notification);
        } else {
            notification.style.transform = 'translateX(0)';
        }
    }

    function showPopup() {
        const popupOverlay = document.getElementById('popup-overlay');
        if (popupOverlay) popupOverlay.style.display = 'flex';
    }

    function closePopup() {
        const popupOverlay = document.getElementById('popup-overlay');
        if (popupOverlay) popupOverlay.style.display = 'none';
    }

    const closePopupBtn = document.querySelector('.close-popup');
    if (closePopupBtn) closePopupBtn.addEventListener('click', closePopup);

    function startNotifications() {
        setTimeout(() => {
            createNotification();
            setInterval(() => {
                createNotification();
            }, Math.floor(Math.random() * 12000) + 8000);
        }, 15000);
    }

    startNotifications();
});
