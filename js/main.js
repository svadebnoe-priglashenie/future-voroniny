class ProtocolInvitation {
    constructor() {
        this.guests = [];
        this.music = document.getElementById('protocolMusic');
        this.isMusicPlaying = false;
        this.musicStarted = false;
        this.isFlipping = false;
        this.isOpen = false;
        this.currentTrack = 0;
        this.wasPlayingBeforeHide = false;

        this.playlist = [
            'assets/music/protocol.mp3',
            'assets/music/music2.mp3'
        ];

        this.init();
        this.setupGuestForm();
        this.setupProgramList();
        this.setupBackNavigation();
        this.setupOpenButton();
        this.setupPopup();
        this.setupVisibilityListener();
        this.setupBeforeUnload();
    }

    init() {
        this.loadGuestsFromStorage();
        this.renderGuestList();
        this.setupPhotoAnimation();
        this.setupSignatures();
        this.setupCheckboxLogic();
    }

    setupOpenButton() {
        const openBtn = document.getElementById('openCaseBtn');
        if (openBtn) {
            openBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.isOpen || this.isFlipping) return;

                const frontPage = document.getElementById('page1');
                const backPage = document.getElementById('page2');
                const shadow = document.getElementById('flipShadow');

                this.isFlipping = true;
                history.pushState(null, null, window.location.href);
                if (shadow) shadow.classList.add('active');

                backPage.style.display = 'block';
                backPage.style.transform = 'rotateY(90deg)';
                frontPage.style.transition = 'transform 0.5s ease';
                frontPage.style.transform = 'rotateY(-90deg)';

                setTimeout(() => {
                    frontPage.style.display = 'none';
                    frontPage.style.transform = '';
                    backPage.style.transition = 'transform 0.5s ease';
                    backPage.style.transform = 'rotateY(0deg)';

                    setTimeout(() => {
                        if (shadow) shadow.classList.remove('active');
                        this.isFlipping = false;
                        this.isOpen = true;
                        this.startMusicOnPage2();
                        this.setupCheckboxLogic();
                    }, 500);
                }, 500);
            });
        }
    }

    setupBackNavigation() {
        window.addEventListener('popstate', () => {
            const frontPage = document.getElementById('page1');
            const backPage = document.getElementById('page2');
            const shadow = document.getElementById('flipShadow');

            if (backPage && backPage.style.display !== 'none' && !this.isFlipping) {
                this.isFlipping = true;
                if (this.music && this.isMusicPlaying) {
                    this.music.pause();
                    this.isMusicPlaying = false;
                    this.updateMusicButton();
                }
                if (shadow) shadow.classList.add('active');

                backPage.style.transition = 'transform 0.5s ease';
                backPage.style.transform = 'rotateY(90deg)';
                frontPage.style.display = 'block';
                frontPage.style.transition = 'transform 0.5s ease';
                frontPage.style.transform = 'rotateY(0deg)';

                setTimeout(() => {
                    backPage.style.display = 'none';
                    backPage.style.transform = '';
                    frontPage.style.transform = '';
                    if (shadow) shadow.classList.remove('active');
                    this.isFlipping = false;
                    this.isOpen = false;
                }, 500);
            }
        });
    }

    playTrack(index) {
        if (index >= this.playlist.length) index = 0;
        this.currentTrack = index;
        this.music.src = this.playlist[this.currentTrack];
        this.music.load();

        this.music.play().then(() => {
            this.isMusicPlaying = true;
            this.musicStarted = true;
            this.music.volume = 0.7;
            this.updateMusicButton();

            this.music.onended = () => {
                let nextIndex = this.currentTrack + 1;
                if (nextIndex >= this.playlist.length) nextIndex = 1;
                this.playTrack(nextIndex);
            };
        }).catch((e) => console.log('Ошибка музыки:', e));
    }

    startMusicOnPage2() {
        setTimeout(() => {
            if (!this.musicStarted) this.playTrack(0);
        }, 500);
    }

    toggleMusic() {
        if (!this.music) return;
        if (this.isMusicPlaying) {
            this.music.pause();
            this.isMusicPlaying = false;
        } else {
            this.music.play().catch(() => {});
            this.isMusicPlaying = true;
            this.musicStarted = true;
        }
        this.updateMusicButton();
    }

    updateMusicButton() {
        const btn = document.getElementById('musicToggleBtn');
        if (btn) btn.textContent = this.isMusicPlaying ? '🔊' : '🔇';
    }

    setupGuestForm() {
        const addBtn = document.getElementById('addGuestBtn');
        const guestInput = document.getElementById('guestName');
        const musicBtn = document.getElementById('musicToggleBtn');

        if (addBtn) addBtn.addEventListener('click', () => this.addGuest());
        if (guestInput) guestInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addGuest();
        });
        if (musicBtn) musicBtn.addEventListener('click', () => this.toggleMusic());

        window.addEventListener('beforeunload', () => {
            localStorage.setItem('protocolGuests', JSON.stringify(this.guests));
        });
    }

    setupProgramList() {
        const container = document.getElementById('programList');
        if (container) {
            container.innerHTML = `
                <div class="program-item">14:30 — Сбор понятых</div>
                <div class="program-item">15:00 — Оглашение протокола</div>
                <div class="program-item">__________ — ____________________</div>
                <div class="program-item">__________ — ____________________</div>
            `;
        }
    }

    setupSignatures() {
        const groom = { surname: 'ВОРОНИН', name: 'РОСТИСЛАВ', patronymic: 'СЕРГЕЕВИЧ' };
        const bride = { surname: 'УСТИНОВА', name: 'АНАСТАСИЯ', patronymic: 'МАКСИМОВНА' };

        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        setText('groomSurname', groom.surname);
        setText('groomName', groom.name);
        setText('groomPatronymic', groom.patronymic);
        setText('signGroom', `${groom.surname} ${groom.name[0]}.${groom.patronymic[0]}.`);
        setText('brideSurname', bride.surname);
        setText('brideName', bride.name);
        setText('bridePatronymic', bride.patronymic);
        setText('signBride', `${bride.surname} ${bride.name[0]}.${bride.patronymic[0]}.`);
    }

    addGuest() {
        const input = document.getElementById('guestName');
        const checkbox = document.getElementById('confirmCheckbox');
        if (!input) return;

        let fullName = input.value.trim().toUpperCase();
        if (!fullName) return alert('Заполните ФИО!');
        if (!this.validateName(fullName)) return alert('ФИО: Фамилия Имя Отчество');
        if (!checkbox || !checkbox.checked) return alert('Подтвердите участие!');

        this.guests.push({ id: Date.now(), name: fullName, date: new Date().toLocaleString('ru-RU') });
        this.renderGuestList();
        this.sendToTelegram(fullName);

        input.value = '';
        checkbox.checked = false;
        const addBtn = document.getElementById('addGuestBtn');
        if (addBtn) addBtn.disabled = true;
        if (!this.isMusicPlaying) this.playBeep();

        alert(`Спасибо, ${fullName}! Ждём вас 06.06.2026!`);
    }

    validateName(name) {
        return name.split(/\s+/).length >= 3;
    }

    renderGuestList() {
        const container = document.getElementById('guestListDisplay');
        if (!container) return;

        if (this.guests.length === 0) {
            container.innerHTML = '<div class="guest-item">Нет задержанных</div>';
        } else {
            container.innerHTML = this.guests.map(guest => `
                <div class="guest-item" data-id="${guest.id}">
                    <strong>${guest.name}</strong><br>
                    <small>${guest.date}</small>
                    <button class="remove-guest protocol-btn">✖</button>
                </div>
            `).join('');

            document.querySelectorAll('.remove-guest').forEach((btn, i) => {
                btn.onclick = () => this.removeGuest(this.guests[i].id);
            });
        }
    }

    removeGuest(id) {
        this.guests = this.guests.filter(g => g.id !== id);
        this.renderGuestList();
        localStorage.setItem('protocolGuests', JSON.stringify(this.guests));
    }

    loadGuestsFromStorage() {
        try {
            this.guests = JSON.parse(localStorage.getItem('protocolGuests')) || [];
        } catch(e) { this.guests = []; }
    }

    sendToTelegram(name) {
        const BOT_TOKEN = 'ВАШ_ТОКЕН';
        const CHAT_ID = 'ВАШ_CHAT_ID';
        if (!BOT_TOKEN || BOT_TOKEN === 'ВАШ_ТОКЕН') return;

        const message = `🟢 НОВЫЙ ГОСТЬ!\n\n👤 ФИО: ${name}\n📅 Дата: ${new Date().toLocaleString('ru-RU')}`;
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message })
        }).catch(() => {});
    }

    playBeep() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.value = 0.15;
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
            osc.stop(ctx.currentTime + 0.3);
            ctx.resume();
        } catch(e) {}
    }

    setupPhotoAnimation() {
        document.querySelectorAll('.venue-photo img, .officer-photo img, .rings-image img').forEach(img => {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s ease';
            setTimeout(() => img.style.opacity = '1', 200);
        });
    }

    setupPopup() {
        const popup = document.getElementById('popupOverlay');
        const closeBtn = document.getElementById('closePopupBtn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (popup) {
                    popup.style.display = 'none';
                }
            });
        }
    }

    setupCheckboxLogic() {
        const checkbox = document.getElementById('confirmCheckbox');
        const addBtn = document.getElementById('addGuestBtn');
        if (checkbox && addBtn) {
            checkbox.addEventListener('change', () => {
                addBtn.disabled = !checkbox.checked;
            });
        }
    }

    setupVisibilityListener() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this.isMusicPlaying) {
                    this.music.pause();
                    this.wasPlayingBeforeHide = true;
                } else {
                    this.wasPlayingBeforeHide = false;
                }
            } else {
                if (this.wasPlayingBeforeHide && this.music && this.music.paused) {
                    this.music.play().catch(() => {});
                    this.isMusicPlaying = true;
                    this.updateMusicButton();
                }
            }
        });
    }

    setupBeforeUnload() {
        window.addEventListener('beforeunload', () => {
            if (this.music) this.music.pause();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProtocolInvitation();

    const style = document.createElement('style');
    style.textContent = `
        .remove-guest { background: #8b0000 !important; color: white !important; margin-left: 10px; padding: 2px 8px; border: none; cursor: pointer; font-size: 12px; }
        .remove-guest:hover { background: #5a0000 !important; }
        .program-item { padding: 5px 0; }
    `;
    document.head.appendChild(style);
});