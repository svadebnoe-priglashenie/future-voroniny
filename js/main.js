class ProtocolInvitation {
    constructor() {
        this.guests = [];
        this.music = document.getElementById('protocolMusic');
        this.isMusicPlaying = false;
        this.musicStarted = false;
        this.isFlipping = false;
        
        // Плейлист
        this.playlist = [
            'assets/music/protocol.mp3',
            'assets/music/music2.mp3'
        ];
        this.currentTrack = 0;
        this.nextAudio = null;
        
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
    }
    
    setupOpenButton() {
        const openBtn = document.getElementById('openCaseBtn');
        const frontPage = document.getElementById('page1');
        const backPage = document.getElementById('page2');
        const shadow = document.getElementById('flipShadow');
        
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                if (this.isFlipping) return;
                this.isFlipping = true;
                
                history.pushState(null, null, window.location.href);
                shadow.classList.add('active');
                
                frontPage.classList.add('flipping');
                backPage.classList.add('revealing');
                backPage.style.display = 'block';
                
                setTimeout(() => {
                    frontPage.style.display = 'none';
                    frontPage.classList.remove('flipping');
                    backPage.classList.remove('revealing');
                    shadow.classList.remove('active');
                    this.isFlipping = false;
                    this.startMusicOnPage2();
                }, 700);
            });
        }
    }
    
    setupBackNavigation() {
        window.addEventListener('popstate', () => {
            this.goBackToFirstPage();
        });
    }
    
    goBackToFirstPage() {
        if (this.isFlipping) return;
        
        const frontPage = document.getElementById('page1');
        const backPage = document.getElementById('page2');
        const shadow = document.getElementById('flipShadow');
        
        if (backPage && backPage.style.display !== 'none') {
            this.isFlipping = true;
            
            if (this.music && this.isMusicPlaying) {
                this.music.pause();
                this.isMusicPlaying = false;
                this.updateMusicButton();
            }
            
            shadow.classList.add('active');
            
            backPage.classList.add('closing');
            frontPage.classList.add('returning');
            frontPage.style.display = 'block';
            
            setTimeout(() => {
                backPage.style.display = 'none';
                backPage.classList.remove('closing');
                frontPage.classList.remove('returning');
                shadow.classList.remove('active');
                this.isFlipping = false;
            }, 700);
        }
    }
    
    preloadNextTrack() {
        let nextIndex = this.currentTrack + 1;
        if (nextIndex >= this.playlist.length) {
            nextIndex = 0;
        }
        
        this.nextAudio = new Audio();
        this.nextAudio.src = this.playlist[nextIndex];
        this.nextAudio.load();
    }
    
    playTrack(index) {
        if (index >= this.playlist.length) {
            index = 0;
        }
        
        this.currentTrack = index;
        this.music.src = this.playlist[this.currentTrack];
        this.music.load();
        
        this.music.play().then(() => {
            this.isMusicPlaying = true;
            this.musicStarted = true;
            this.music.volume = 1;
            this.updateMusicButton();
            
            this.preloadNextTrack();
            
            this.music.onended = () => {
                this.crossfadeToNext();
            };
        }).catch((e) => {
            console.log('Ошибка воспроизведения:', e);
        });
    }
    
    crossfadeToNext() {
        if (!this.isMusicPlaying) return;
        
        let nextIndex = this.currentTrack + 1;
        if (nextIndex >= this.playlist.length) {
            nextIndex = 0;
        }
        
        if (this.nextAudio && this.nextAudio.src.includes(this.playlist[nextIndex])) {
            const nextTrack = this.nextAudio;
            
            let volume = 1;
            const fadeOut = setInterval(() => {
                if (volume <= 0.02) {
                    clearInterval(fadeOut);
                    this.music.pause();
                    
                    this.music.src = nextTrack.src;
                    this.music.load();
                    
                    this.music.volume = 0;
                    this.music.play().then(() => {
                        this.currentTrack = nextIndex;
                        this.isMusicPlaying = true;
                        this.updateMusicButton();
                        
                        let vol = 0;
                        const fadeIn = setInterval(() => {
                            if (vol >= 0.98) {
                                clearInterval(fadeIn);
                                this.music.volume = 1;
                            } else {
                                vol += 0.03;
                                this.music.volume = Math.min(1, vol);
                            }
                        }, 30);
                        
                        this.preloadNextTrack();
                        
                        this.music.onended = () => {
                            this.crossfadeToNext();
                        };
                    }).catch(() => {});
                } else {
                    volume -= 0.03;
                    this.music.volume = Math.max(0, volume);
                }
            }, 30);
        } else {
            this.playTrack(nextIndex);
        }
    }
    
    startMusicOnPage2() {
        setTimeout(() => {
            if (!this.musicStarted) {
                this.playTrack(0);
            }
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
            container.innerHTML = [
                '18:00 — Сбор понятых',
                '18:30 — Оглашение протокола',
                '19:00 — Церемония',
                '19:30 — Фотофиксация',
                '20:00 — Застолье',
                '22:00 — Танцы',
                '00:00 — Закрытие дела'
            ].map(item => `<div class="program-item">${item}</div>`).join('');
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
        if (!input) return;
        
        let fullName = input.value.trim().toUpperCase();
        if (!fullName) return alert('Заполните ФИО!');
        if (!this.validateName(fullName)) return alert('ФИО: Фамилия Имя Отчество');
        
        this.guests.push({ id: Date.now(), name: fullName, date: new Date().toLocaleString('ru-RU') });
        this.renderGuestList();
        input.value = '';
        if (!this.isMusicPlaying) this.playBeep();
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
            this.music.pause();
            this.isMusicPlaying = false;
            this.updateMusicButton();
        } else {
            this.music.play().catch(() => {});
            this.isMusicPlaying = true;
            this.musicStarted = true;
            this.updateMusicButton();
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
        document.querySelectorAll('.venue-photo img, .officer-photo img').forEach((photo, i) => {
            photo.style.opacity = '0';
            photo.style.transform = 'translateY(20px)';
            setTimeout(() => {
                photo.style.transition = 'all 0.6s';
                photo.style.opacity = '1';
                photo.style.transform = 'translateY(0)';
            }, 200 + i * 150);
        });
    }
    
    setupPopup() {
        const popup = document.getElementById('popupOverlay');
        const closeBtn = document.getElementById('closePopupBtn');
        
        if (closeBtn) {
            closeBtn.onclick = function() {
                if (popup) {
                    popup.style.display = 'none';
                }
                return false;
            };
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProtocolInvitation();
    
    const style = document.createElement('style');
    style.textContent = `
        .remove-guest { background: #8b0000 !important; color: white !important; margin-left: 10px; padding: 2px 8px; border: none; cursor: pointer; }
        .remove-guest:hover { background: #5a0000 !important; }
        .program-item { padding: 5px 0; }
    `;
    document.head.appendChild(style);
});