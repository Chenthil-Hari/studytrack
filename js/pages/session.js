const SessionPage = {
    timerInterval: null,
    totalSeconds: 45 * 60,
    secondsRemaining: 45 * 60,
    isRunning: false,
    activeSubject: 'os',
    activeTopic: '',
    sessionType: 'Study',
    startTime: null,

    render: function() {
        if (!this.isRunning) {
            // Check for prefilled session
            const prefilled = localStorage.getItem('prefilled_session');
            if (prefilled) {
                try {
                    const data = JSON.parse(prefilled);
                    this.totalSeconds = data.duration * 60;
                    this.secondsRemaining = this.totalSeconds;
                    this.activeSubject = data.subject;
                    this.activeTopic = data.topic;
                    this.sessionType = data.type;
                    localStorage.removeItem('prefilled_session');
                } catch (e) {}
            } else {
                this.totalSeconds = 45 * 60;
                this.secondsRemaining = 45 * 60;
            }
        }

        const sub = db.data.syllabus[this.activeSubject];
        const topics = subjectTopics[this.activeSubject] || ["General"];

        // Set default topic if empty
        if (!this.activeTopic && topics.length > 0) {
            this.activeTopic = topics[0];
        }

        const logsHtml = db.data.studyLogs.slice(-4).reverse().map(log => {
            const subName = db.data.syllabus[log.subjectId]?.name || log.subjectId;
            return `
                <div class="card" style="padding: 1rem;">
                    <div class="text-xs text-secondary mb-1">${subName}</div>
                    <div class="font-semibold text-sm">${log.topicId}</div>
                    <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.25rem;">
                        Duration: ${log.minutes}m | Distractions: ${log.distractions}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="session-page" style="max-width: 800px; margin: 0 auto;">
                <h2 class="text-2xl font-semibold mb-6 text-center">Study Timer Command Center</h2>
                
                <div class="card" style="text-align: center; padding: 3rem 2rem; border-color: ${this.isRunning ? 'var(--accent-primary)' : 'var(--border-color)'};">
                    
                    <!-- Timer Countdown -->
                    <div id="session-timer-display" style="font-size: 6rem; font-weight: 700; letter-spacing: -2px; margin-bottom: 1rem; color: var(--text-primary);">
                        ${this.formatTime(this.secondsRemaining)}
                    </div>
                    
                    <!-- Distraction Tracker Panel -->
                    ${this.isRunning ? `
                        <div id="focus-tracker-panel" style="display:inline-flex; gap:1.5rem; justify-content:center; background: var(--bg-app); padding: 0.5rem 1.5rem; border-radius: var(--radius-full); margin-bottom: 2rem; border: 1px solid var(--border-color);">
                            <span class="text-sm font-medium flex items-center gap-1">
                                <i data-lucide="eye" style="width:14px; height:14px; color:var(--accent-primary);"></i> Focus Mode Active
                            </span>
                            <span id="live-distractions-count" class="text-sm font-medium flex items-center gap-1" style="color: ${visibilityTracker.distractionCount > 0 ? 'var(--status-error)' : 'var(--text-secondary)'}">
                                <i data-lucide="alert-triangle" style="width:14px; height:14px;"></i> ${visibilityTracker.distractionCount} Distractions Logged
                            </span>
                        </div>
                    ` : ''}

                    <!-- Selectors -->
                    <div class="flex justify-center gap-4 mb-8">
                        <select id="session-subject" class="btn btn-secondary" style="min-width: 150px; background:var(--bg-app);" onchange="SessionPage.handleSubjectChange(this.value)" ${this.isRunning ? 'disabled' : ''}>
                            ${Object.entries(db.data.syllabus).map(([id, s]) => `<option value="${id}" ${this.activeSubject === id ? 'selected' : ''}>${s.name}</option>`).join('')}
                        </select>
                        <select id="session-topic" class="btn btn-secondary" style="min-width: 150px; background:var(--bg-app);" onchange="SessionPage.handleTopicChange(this.value)" ${this.isRunning ? 'disabled' : ''}>
                            ${topics.map(t => `<option value="${t}" ${this.activeTopic === t ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                        <select id="session-type" class="btn btn-secondary" style="min-width: 150px; background:var(--bg-app);" onchange="SessionPage.handleTypeChange(this.value)" ${this.isRunning ? 'disabled' : ''}>
                            <option value="Study" ${this.sessionType === 'Study' ? 'selected' : ''}>Study</option>
                            <option value="Revision" ${this.sessionType === 'Revision' ? 'selected' : ''}>Revision</option>
                            <option value="PYQ Practice" ${this.sessionType === 'PYQ Practice' ? 'selected' : ''}>PYQ Practice</option>
                        </select>
                    </div>
                    
                    <!-- Action Controls -->
                    <div class="flex justify-center gap-4">
                        <button id="timer-start-btn" class="btn btn-primary" style="padding: 1rem 3rem; font-size: 1.1rem; border-radius: var(--radius-full);" onclick="SessionPage.toggleTimer()">
                            <i data-lucide="${this.isRunning ? 'pause' : 'play'}"></i> ${this.isRunning ? 'Pause Timer' : 'Start Focus'}
                        </button>
                        <button class="btn btn-secondary" style="padding: 1rem 2rem; border-radius: var(--radius-full);" onclick="SessionPage.finishSession()">
                            <i data-lucide="square"></i> Finish Session
                        </button>
                    </div>
                </div>
                
                <div class="mt-8">
                    <h3 class="font-medium mb-4">Recent Focus Logs</h3>
                    <div class="grid grid-cols-4">
                        ${logsHtml.length > 0 ? logsHtml : '<p class="text-secondary text-sm p-4 col-span-4 text-center">No study sessions logged yet.</p>'}
                    </div>
                </div>
            </div>
        `;
    },

    formatTime: function(secs) {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    },

    handleSubjectChange: function(val) {
        this.activeSubject = val;
        const topics = subjectTopics[val] || ["General"];
        this.activeTopic = topics[0];
        router.handleRoute();
    },

    handleTopicChange: function(val) {
        this.activeTopic = val;
    },

    handleTypeChange: function(val) {
        this.sessionType = val;
    },

    toggleTimer: function() {
        if (this.isRunning) {
            // Pause timer
            clearInterval(this.timerInterval);
            this.isRunning = false;
            visibilityTracker.stopSession();
            this.updateButtonUI();
            router.handleRoute();
        } else {
            // Start focus
            this.isRunning = true;
            this.startTime = Date.now();
            visibilityTracker.startSession();
            this.updateButtonUI();
            
            // Poll for updating distraction counter in real time
            this.timerInterval = setInterval(() => {
                this.secondsRemaining--;
                
                const display = document.getElementById('session-timer-display');
                if (display) {
                    display.textContent = this.formatTime(this.secondsRemaining);
                }

                const distEl = document.getElementById('live-distractions-count');
                if (distEl) {
                    distEl.innerHTML = `<i data-lucide="alert-triangle" style="width:14px; height:14px;"></i> ${visibilityTracker.distractionCount} Distractions Logged`;
                    if (visibilityTracker.distractionCount > 0) {
                        distEl.style.color = 'var(--status-error)';
                    }
                }
                
                if (this.secondsRemaining <= 0) {
                    this.finishSession();
                }
            }, 1000);
            
            router.handleRoute();
        }
    },

    updateButtonUI: function() {
        const btn = document.getElementById('timer-start-btn');
        if (!btn) return;
        
        if (this.isRunning) {
            btn.innerHTML = `<i data-lucide="pause"></i> Pause Timer`;
        } else {
            btn.innerHTML = `<i data-lucide="play"></i> Start Focus`;
        }
        if (window.lucide) lucide.createIcons();
    },

    finishSession: function() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        
        const focusStats = visibilityTracker.stopSession();
        
        const totalElapsedSecs = (this.totalSeconds - this.secondsRemaining);
        const elapsedMinutes = Math.max(1, Math.round(totalElapsedSecs / 60));
        
        // Log study session to DB
        db.logStudySession(
            this.activeSubject,
            this.activeTopic,
            elapsedMinutes,
            focusStats.distractions,
            elapsedMinutes,
            this.sessionType
        );

        // Auto trigger timetable rebalance
        scheduler.rebalanceTimetable();

        alert(`Focus complete! Study Logged: ${elapsedMinutes}m. Distractions: ${focusStats.distractions}.`);
        
        // Return to command center dashboard
        router.navigate('/');
    }
};

window.SessionPage = SessionPage;
