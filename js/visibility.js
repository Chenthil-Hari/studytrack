const visibilityTracker = {
    activeSession: false,
    distractionCount: 0,
    inactivityTimeout: null,
    inactivityThreshold: 5 * 60 * 1000, // 5 minutes in ms
    lastFocusTime: null,
    totalOutOfFocusTime: 0, // seconds
    blurStartTime: null,
    audioCtx: null,

    init: function() {
        // Tab visibility listener
        document.addEventListener('visibilitychange', () => {
            if (this.activeSession) {
                if (document.hidden) {
                    this.handleDistraction("Tab Switched");
                } else {
                    this.handleReturn();
                }
            }
        });

        // Window focus/blur listeners
        window.addEventListener('blur', () => {
            if (this.activeSession) {
                this.handleDistraction("Window Blurred");
            }
        });

        window.addEventListener('focus', () => {
            if (this.activeSession) {
                this.handleReturn();
            }
        });

        // User activity listeners for inactivity detection
        const resetActivity = () => this.resetInactivityTimer();
        window.addEventListener('mousemove', resetActivity);
        window.addEventListener('keypress', resetActivity);
        window.addEventListener('click', resetActivity);
    },

    startSession: function() {
        this.activeSession = true;
        this.distractionCount = 0;
        this.totalOutOfFocusTime = 0;
        this.lastFocusTime = Date.now();
        this.resetInactivityTimer();
        console.log("Distraction & focus tracking enabled for study session.");
    },

    stopSession: function() {
        this.activeSession = false;
        if (this.inactivityTimeout) {
            clearTimeout(this.inactivityTimeout);
        }
        return {
            distractions: this.distractionCount,
            outOfFocusTime: Math.round(this.totalOutOfFocusTime)
        };
    },

    handleDistraction: function(reason) {
        this.distractionCount++;
        this.blurStartTime = Date.now();
        
        // Sound a warning beep using Web Audio API
        this.playWarningBeep();

        // Push temporary alert in HTML
        this.showDistractionWarning(reason);

        // Track distraction event in console
        console.warn(`Distraction alert: ${reason}. Total distractions: ${this.distractionCount}`);
    },

    handleReturn: function() {
        if (this.blurStartTime) {
            const outTime = (Date.now() - this.blurStartTime) / 1000;
            this.totalOutOfFocusTime += outTime;
            this.blurStartTime = null;
        }
        
        // Remove warning banner if visible
        const banner = document.getElementById('distraction-warning-banner');
        if (banner) banner.remove();
    },

    resetInactivityTimer: function() {
        if (!this.activeSession) return;
        
        if (this.inactivityTimeout) {
            clearTimeout(this.inactivityTimeout);
        }

        this.inactivityTimeout = setTimeout(() => {
            this.handleDistraction("Inactivity Detected");
        }, this.inactivityThreshold);
    },

    playWarningBeep: function() {
        try {
            // Lazy init audio context
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }

            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, this.audioCtx.currentTime); // A4 note
            gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);

            // Beep duration 0.25 seconds
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.25);
        } catch (e) {
            console.error("Audio beep synthesis failed:", e);
        }
    },

    showDistractionWarning: function(reason) {
        // Remove existing banner first
        const oldBanner = document.getElementById('distraction-warning-banner');
        if (oldBanner) oldBanner.remove();

        const banner = document.createElement('div');
        banner.id = 'distraction-warning-banner';
        banner.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--status-error-bg);
            border: 1px solid var(--status-error);
            color: var(--status-error);
            padding: 0.75rem 1.5rem;
            border-radius: var(--radius-md);
            z-index: 9999;
            font-size: 0.9rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            animation: slideDown 0.3s ease;
        `;
        banner.innerHTML = `
            <i data-lucide="alert-triangle" style="width:18px; height:18px;"></i>
            <span>Warning: Distraction Detected (${reason}). Please focus on StudyTrack!</span>
        `;
        document.body.appendChild(banner);
        if (window.lucide) lucide.createIcons();
    }
};

// Initialize visibility listeners
visibilityTracker.init();
window.visibilityTracker = visibilityTracker;
