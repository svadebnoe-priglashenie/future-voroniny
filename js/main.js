class ProtocolInvitation {
    constructor() {
        this.guests = [];
        this.music = document.getElementById('protocolMusic');
        this.isMusicPlaying = false;
        this.musicStarted = false;
        this.isFlipping = false;
        this.isOpen = false;
        this.currentTrack = 0;
        this.isFading = false;
        
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
            openBtn.addEventListener('click', () => {
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
                        setTimeout(() => {
                            this.setupCheckboxLogic();
                        }, 300);
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
    
    fadeOut(callback) {
        if (!this.music || this.music.paused || this.isFading) {
            if (callback) callback();
            return;
        }
        this.isFading = true;
        let volume = this.music.volume;
        const fade = setInterval(() => {
            if (volume <= 0.05) {
                clearInterval(fade);
                this.music.volume = 0;
                this.isFading = false;
                if (callback) callback();
            } else {
                volume -= 0.05;
                this.music.volume = Math.max(0, volume);
            }
        }, 50);
    }
    
    fadeIn() {
        if (!this.music) return;
        let volume = 0;
        this.music.volume = 0;
        const fade = setInterval(() => {
            if (volume >= 0.95) {
                clearInterval(fade);
                this.music.volume = 1;
            } else {
                volume += 0.05;
                this.music.volume = Math.min(1, volume);
            }
        }, 50);
    }
    
    playTrack(index) {
        if (index >= this.playlist.length) index = 0;
        this.currentTrack = index;
        this.music.src = this.playlist[this.currentTrack];
        this.music.load();
        this.music.play().then(() => {
            this.isMusicPlaying = true;
            this.musicStarted = true;
            this.fadeIn();
            this.updateMusicButton();
            this.music.onended = () => {
                this.fadeOut(() => {
                    let nextIndex = this.currentTrack + 1;
                    if (nextIndex >= this.playlist.length) nextIndex = 1;
                    this.playTrack(nextIndex);
                });
            };
        }).catch((e) => console.log('Ошибка:', e));
    }
    
    startMusicOnPage2() {
        setTimeout(() => {
            if (!this.musicStarted) this.playTrack(0);
        }, 500);
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
        input.value = '';
        checkbox.checked = false;
        const addBtn = document.getElementById('addGuestBtn');
        if (addBtn) addBtn.disabled = true;
        if (!this.isMusicPlaying) this.playBeep();
        
        alert(`Спасибо, ${fullName}! Ваше участие подтверждено. Ждем вас 06.06.2026!`);
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
    
    toggleMusic() {
        if (!this.music) return;
        
        if (this.isMusicPlaying) {
            this.fadeOut(() => {
                this.music.pause();
                this.isMusicPlaying = false;
                this.updateMusicButton();
            });
        } else {
            this.music.play().then(() => {
                this.isMusicPlaying = true;
                this.musicStarted = true;
                this.fadeIn();
                this.updateMusicButton();
            }).catch(() => {});
        }
    }
    
    updateMusicButton() {
        const btn = document.getElementById('musicToggleBtn');
        if (btn) btn.textContent = this.isMusicPlaying ? '🔊' : '🔇';
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
        if (closeBtn) closeBtn.onclick = () => { if (popup) popup.style.display = 'none'; };
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