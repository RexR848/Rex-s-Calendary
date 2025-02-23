const startDate = new Date('2025-02-21'); // Fecha de inicio del calendario
const now = new Date(); // Fecha actual

// Cargar los datos del calendario y los códigos válidos
Promise.all([
    fetch('calendar.json').then(response => response.json()),
    fetch('codes.json').then(response => response.json())
]).then(([calendarData, codesData]) => {
    const days = document.querySelectorAll('.day');
    const popup = document.getElementById('popup');
    const closePopup = document.getElementById('close-popup');
    const giftTitle = document.getElementById('gift-title');
    const giftMessage = document.getElementById('gift-message');
    const buttonText = document.getElementById('gift-button');
    const heartsContainer = document.getElementById('hearts-container');
    const codeInput = document.getElementById('code-input');
    const codeButton = document.getElementById('code-button');

    // Obtener el progreso desde localStorage
    let unlockedDays = parseInt(localStorage.getItem('unlockedDays')) || Math.min(Math.floor((now - startDate) / (1000 * 60 * 60 * 24)), calendarData.days.length);

    // Función para guardar el progreso en localStorage
    function saveProgress() {
        localStorage.setItem('unlockedDays', unlockedDays);
    }

    // Función para generar un corazón aleatorio
    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerHTML = '❤️';
        heart.style.left = `${Math.random() * 100}%`;
        heartsContainer.appendChild(heart);
        setTimeout(() => {
            heart.remove();
        }, 3000);
    }

    // Función para hacer fade-in de audio
    function fadeInAudio(audio, duration) {
        audio.volume = 0;
        let step = 0.01;
        let interval = duration / (1 / step);
        let fadeInInterval = setInterval(() => {
            if (audio.volume < 1) {
                audio.volume += step;
            } else {
                clearInterval(fadeInInterval);
            }
        }, interval);
    }

    // Función para hacer fade-out de audio
    function fadeOutAudio(audio, duration) {
        let step = 0.01;
        let interval = duration / (1 / step);
        let fadeOutInterval = setInterval(() => {
            if (audio.volume >= 0.01) {
                audio.volume -= step;
            } else {
                clearInterval(fadeOutInterval);
                audio.pause();
                audio.currentTime = 0;
            }
        }, interval);
    }

    // Función para abrir el popup con datos del JSON
    function openPopup(dayIndex) {
        const dayData = calendarData.days[dayIndex];
        giftTitle.textContent = dayData.title;
        giftMessage.textContent = dayData.text;
        buttonText.textContent = dayData.buttonText;
        const popupImage = document.getElementById('popup-image');
        popupImage.src = dayData.image;
        const popupContent = document.querySelector('.popup-content');
        popupContent.style.backgroundColor = dayData.backgroundColor;
        popupContent.style.color = dayData.textColor;
        popup.classList.add('show');
        for (let i = 0; i < 5; i++) {
            setTimeout(createHeart, i * 500);
        }
        if (dayData.audioUrl) {
            const audio = new Audio(dayData.audioUrl);
            audio.currentTime = dayData.audioStartTime;
            audio.play();
            fadeInAudio(audio, dayData.audioFadeInDuration * 1000);

            closePopup.addEventListener('click', () => {
                fadeOutAudio(audio, 1000);
                popup.classList.remove('show');
            }, { once: true });
        }

        buttonText.addEventListener('click', () => {
            if (dayData.buttonActionType === 'link') {
                window.open(dayData.buttonActionContent, '_blank');
            } else if (dayData.buttonActionType === 'code') {
                eval(dayData.buttonActionContent);
            }
        });
    }

    // Función para desbloquear regalos según la fecha actual y el código de regalo
    function unlockGifts(unlockedDays) {
        days.forEach((day, index) => {
            if (index < unlockedDays) {
                day.classList.remove('locked');
                day.addEventListener('click', () => {
                    openPopup(index);
                });
            }
        });
    }

    // Desbloquear los regalos inicialmente según la fecha actual o progreso guardado
    unlockGifts(unlockedDays);

    // Función para usar un código de regalo
    function useGiftCode() {
        const code = codeInput.value.trim();
        if (codesData.validCodes.includes(code)) {
            unlockedDays++;
            if (unlockedDays <= calendarData.days.length) {
                unlockGifts(unlockedDays);
                saveProgress(); // Guardar progreso al usar un código
                alert('¡Código válido! Has desbloqueado un regalo.');
                codeInput.value = '';
            } else {
                alert('No hay más regalos que desbloquear.');
            }
        } else {
            alert('Código inválido. Intenta de nuevo.');
        }
    }

    // Event listener para el botón de código
    codeButton.addEventListener('click', useGiftCode);
});
