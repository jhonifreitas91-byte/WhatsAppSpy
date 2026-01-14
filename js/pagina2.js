// ================== BLOCO INICIAL (redirect se já passou pela final) ==================
document.addEventListener('DOMContentLoaded', function() {
  const redirectUrl = 'backexpirado.html';
  const accessedFinalPage = localStorage.getItem('accessedFinalPage');

  if (accessedFinalPage) {
    const fullRedirectUrl = redirectUrl + location.search;
    window.location.href = fullRedirectUrl;
    return;
  }
});

// ================== PERFIS FAKE ==================
const profiles = [
  { img: './assets/profiles/profile1.png', number: '+55 88 99733-****' },
  { img: './assets/profiles/profile2.png', number: '+55 21 98926-****' },
  { img: './assets/profiles/profile26.png', number: '+55 95 91467-****' }
];

let remainingProfiles = [];
let userCity = 'Desconhecida';

function randomizeProfiles() {
  const phoneItems = document.querySelectorAll('.phone-item');

  if (remainingProfiles.length < phoneItems.length) {
    remainingProfiles = [...profiles];
  }

  phoneItems.forEach((item) => {
    if (remainingProfiles.length === 0) return;

    const randomIndex   = Math.floor(Math.random() * remainingProfiles.length);
    const randomProfile = remainingProfiles.splice(randomIndex, 1)[0];

    const profilePic = item.querySelector('.profile-pic');
    profilePic.src   = randomProfile.img;
    item.querySelector('span').textContent = randomProfile.number;
    profilePic.style.filter = 'blur(5px)';
  });
}
setInterval(randomizeProfiles, 3000);

// ================== INPUT / BOTÃO ==================
const inputPhone = document.querySelector('.input-phone');
const btnClone   = document.querySelector('.btn.green');
if (btnClone) btnClone.disabled = true;

// ---- função genérica pra chamar o whats.php e salvar a URL no localStorage ----
async function fetchProfilePicture(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, '');           // só dígitos
  const apiBase = 'https://conexaosegura.lat/api/whats.php?numero=';

  // tenta com o número normal
  let response = await tryFetch(`${apiBase}${cleaned}`);
  if (response && response.profilePictureZAP) {
    const url = response.profilePictureZAP;
    localStorage.setItem("profileImageUrl", url);
    localStorage.setItem("profileImage", url); // mesma coisa
    return url;
  }

  // tenta sem o nono dígito (ex: 55889999 -> 5588999)
  const semNono = cleaned.replace(/^(\d{4})9/, '$1');
  if (semNono !== cleaned) {
    response = await tryFetch(`${apiBase}${semNono}`);
    if (response && response.profilePictureZAP) {
      const url = response.profilePictureZAP;
      localStorage.setItem("profileImageUrl", url);
      localStorage.setItem("profileImage", url);
      return url;
    }
  }

  // fallback: avatar padrão
  localStorage.removeItem("profileImageUrl");
  localStorage.removeItem("profileImage");
  return './assets/images/user.jpg';
}

async function tryFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Erro ao tentar buscar:', url, e);
    return null;
  }
}

// ---- evento do input ----
inputPhone.addEventListener('input', function () {
  const cleaned       = this.value.replace(/\D/g, '');
  const errorElement  = document.getElementById('phone-error');
  const validIcon     = document.getElementById('valid-icon');

  // formata
  let value = cleaned;
  value = value.replace(/^(\d{2})(\d)/, '($1) $2');
  value = value.replace(/(\d{5})(\d{4})$/, '$1-$2');
  this.value = value;

  // limpa estados
  errorElement.style.display = 'none';
  errorElement.textContent   = '';
  inputPhone.style.border    = '';
  inputPhone.classList.remove('valid');
  validIcon.style.display    = 'none';

  if (cleaned.length === 11) {
    // válido
    inputPhone.classList.add('valid');
    inputPhone.style.border   = '2px solid #009500';
    validIcon.style.display   = 'inline';
    btnClone.disabled         = false;
    btnClone.classList.add('enabled');
    btnClone.style.backgroundColor = '#00b64e';
    btnClone.style.cursor          = 'pointer';

    // chama o whats.php em background (não trava o usuário)
    fetchProfilePicture("+55" + cleaned)
      .then(url => {
        const previewImg    = document.getElementById("preview-photo");
        const previewBox    = document.getElementById("preview-container");
        const previewNumber = document.getElementById("preview-number");
        const previewCity   = document.getElementById("preview-city");

        if (url && url !== './assets/images/user.jpg' && previewImg && previewBox) {
          previewImg.src = url;
          previewBox.style.display = 'block';
          if (previewNumber) previewNumber.textContent = "+55" + cleaned;
          if (previewCity)   previewCity.textContent   = userCity || "Desconhecida";
        } else if (previewBox) {
          previewBox.style.display = 'none';
        }
      });
  } else {
    // inválido
    btnClone.disabled = true;
    btnClone.classList.remove('enabled');
    btnClone.style.backgroundColor = '#bdbdbd';
    btnClone.style.cursor = 'not-allowed';
  }
});

// ================== CLIQUE NO BOTÃO ==================
document.addEventListener('DOMContentLoaded', () => {
  const cloneButton = document.querySelector('.btn.green');
  const box         = document.querySelector('.box');

  if (!cloneButton) return;

  cloneButton.addEventListener('click', async function () {
    if (cloneButton.disabled) return;

    const phoneNumber   = inputPhone.value;
    const cleanedNumber = phoneNumber.replace(/\D/g, '');

    // >>> AQUI <<<
    // força uma nova chamada ao whats.php NA HORA DO CLIQUE
    await fetchProfilePicture("+55" + cleanedNumber);

    // depois disso, monta a tela de carregamento
    box.innerHTML = `
      <div style="position:relative;padding-top:56.25%;">
        <iframe id="panda-35916dfb-ceb8-469e-932a-bec793c354b8"
          src="https://player-vz-2d62d8bf-839.tv.pandavideo.com.br/embed/?v=7e6300c5-5af0-479a-b30a-697ada340224"
          style="border:none;position:absolute;top:0;left:0;"
          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
          allowfullscreen
          width="100%" height="100%" fetchpriority="high"></iframe>
      </div>
      <div class="loading-box">
        <p class="status">
          <span class="blinking-dot"></span> Investigação em andamento...
        </p>
        <h2 style="font-size: 23px; text-align: center;">Conectando WhatsApp, não saia dessa tela!</h2>
        <div class="progress-bar">
          <div class="progress-bar-fill">0%</div>
        </div>
        <div id="process-container">
          <div class="step"><div class="icon loading"></div><span>Iniciando rastreamento...</span></div>
          <div class="step"><div class="icon"></div><span>Enviando requisição HTTPS...</span></div>
          <div class="step"><div class="icon"></div><span>Procurando vulnerabilidade na aplicação web...</span></div>
          <div class="step"><div class="icon"></div><span>Vulnerabilidade encontrada no código QR Temporário...</span></div>
          <div class="step"><div class="icon"></div><span>Autenticação do número de telefone com o WhatsApp Web...</span></div>
          <div class="step"><div class="icon"></div><span id="location-step">Supostas localizações suspeitas em CIDADE e região...</span></div>
          <div class="step"><div class="icon"></div><span id="motel-step">Descobri que passou a noite no <span id="motel-info">...</span></span></div>
          <div class="step"><div class="icon"></div><span>Obtendo chats, fotos, áudios, vídeos e contatos...</span></div>
          <div class="step"><div class="icon"></div><span>O WhatsApp foi clonado, abrindo o WhatsApp Web...</span></div>
        </div>
      </div>
    `;

    fetchCity();
    startProgress();
    showSteps();
  });

  // ===== PROGRESSO =====
  async function startProgress() {
    const progressBar   = document.querySelector('.progress-bar-fill');
    let progress        = 0;
    const progressStep  = 100 / 30;

    const progressInterval = setInterval(() => {
      if (progress < 100) {
        progress += progressStep;
        if (progress > 100) progress = 100;
        progressBar.style.width     = `${progress}%`;
        progressBar.textContent     = `${Math.round(progress)}%`;
      } else {
        clearInterval(progressInterval);
        const phoneNumber = inputPhone.value;
        showFinalLayout(phoneNumber, userCity);
      }
    }, 1000);
  }
});

// ================== LOCALIZAÇÃO / MOTEL (mesmo que antes) ==================
function fetchCity() {
  const services = [
    { name:'ipapi.co',  url:'https://ipapi.co/json/',       parser:d=>({ city:d.city,    region_code:d.region_code }) },
    { name:'ipwho.is',  url:'https://ipwho.is/',            parser:d=>({ city:d.city,    region_code:d.region_code }) },
    { name:'freeipapi', url:'https://freeipapi.com/api/json', parser:d=>({ city:d.cityName, region_code:d.regionName }) },
    { name:'wtfismyip', url:'https://wtfismyip.com/json',   parser:d=>{
        const city = d.YourFuckingCity;
        const parts = d.YourFuckingLocation?.split(',');
        const region_code = parts && parts.length>=2 ? parts[1].trim() : '';
        return { city, region_code };
      } 
    },
    { name:'ip-api',    url:'http://ip-api.com/json',       parser:d=>({ city:d.city,    region_code:d.region }) }
  ];

  let locationFound = false;

  (async () => {
    for (const service of services) {
      try {
        const res = await fetch(service.url);
        const data = await res.json();
        const { city, region_code } = service.parser(data);

        if (city && region_code) {
          userCity = city;
          const locationStep = document.getElementById('location-step');
          if (locationStep) {
            locationStep.textContent = `Supostas localizações suspeitas em ${userCity} e região...`;
          }
          initMotelSearch(userCity, region_code);
          locationFound = true;
          break;
        }
      } catch (err) {
        console.warn(`Erro ao tentar ${service.name}:`, err);
      }
    }

    if (!locationFound) {
      console.error('Não foi possível obter a localização do visitante.');
      const locationStep = document.getElementById('location-step');
      if (locationStep) {
        locationStep.textContent = 'Não foi possível obter sua cidade.';
      }
    }
  })();
}

function initMotelSearch(city, region_code) {
  const apiUrl = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyC0BoQxG9JKTfGODzQd-1bEtBRebWyY-mY&callback=initMap';

  fetch(apiUrl)
    .then(r => {
      if (!r.ok) throw new Error('Erro na requisição: ' + r.statusText);
      return r.json();
    })
    .then(data => {
      if (data && data.data && data.data.length > 0) {
        document.getElementById('motel-info').textContent = data.data[0].name;
      } else {
        document.getElementById('motel-info').textContent = 'Motel não localizado.';
      }
    })
    .catch(err => {
      console.error('Erro ao buscar o motel:', err);
      document.getElementById('motel-info').textContent = 'Erro ao buscar o motel.';
    });
}

// ================== SHOW FINAL LAYOUT (usa o que estiver no localStorage) ==================
async function showFinalLayout(phoneNumber, city) {
  const foto =
    localStorage.getItem('profileImage') ||
    localStorage.getItem('profileImageUrl') ||
    './assets/images/user.jpg';

  console.log('Foto usada na tela final:', foto);

  const box = document.querySelector('.box');
  box.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;text-align:center;font-family:Arial;">
      <div style="width:130px;height:130px;background-image:linear-gradient(320deg,#33bb00,#b8ff20);border-radius:100%;display:flex;align-items:center;justify-content:center;">
        <img src="${foto}" alt="Profile Picture" style="width:90%;height:90%;border-radius:100%;object-fit:cover;border:4px solid #fff;">
      </div>
      <p style="font-size:16px;margin-top:10px;"><strong>${phoneNumber}</strong></p>
      <p style="font-size:14px;color:#777;">Conectado em: ${city}</p>
      <button id="access-messages-btn" style="margin-top:10px;padding:10px 20px;background-color:#00b64e;border:none;border-radius:5px;color:#fff;cursor:pointer;animation:pulse 2s infinite;transition:all .3s ease;">
        Clique Aqui para acessar mensagens
      </button>
    </div>
  `;

  document.getElementById('access-messages-btn').addEventListener('click', function () {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('number', phoneNumber);

    const avatarUrl = localStorage.getItem('profileImageUrl') || '';
    if (avatarUrl) {
        urlParams.set('avatar', encodeURIComponent(avatarUrl));
    }

    // PRIORIDADE: valor da URL > localStorage > default
    const pessoaDaUrl   = urlParams.get('pessoa');
    const pessoaStorage = localStorage.getItem('generoSelecionado');
    const pessoaFinal   = pessoaDaUrl || pessoaStorage || 'homem';

    urlParams.set('pessoa', pessoaFinal);

    window.location.href = `pagina3.html?${urlParams.toString()}`;
});
}

// ================== STEPS ==================
function showSteps() {
  const steps = document.querySelectorAll('.step');
  let currentStep = 0;

  function showNextStep() {
    if (currentStep > 0) {
      const previousIcon = steps[currentStep - 1].querySelector('.icon');
      previousIcon.classList.remove('loading');
      previousIcon.classList.add('completed');
    }

    if (currentStep < steps.length) {
      const current = steps[currentStep];
      current.style.visibility = 'visible';
      const icon = current.querySelector('.icon');
      icon.classList.add('loading');

      currentStep++;
      setTimeout(showNextStep, 3000);
    }
  }

  setTimeout(showNextStep, 1000);
}
