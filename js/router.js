const MistakesPage = {
    render: function() {
        const mistakes = db.getMistakesList();
        const conceptMistakes = mistakes.filter(m => m.wrongReason === 'Concept Mistake').length;
        const calcMistakes = mistakes.filter(m => m.wrongReason === 'Calculation Mistake').length;
        const carelessMistakes = mistakes.filter(m => m.wrongReason === 'Careless Mistake').length;

        const tableRows = mistakes.map(m => {
            const subName = db.data.syllabus[m.subjectId]?.name || m.subjectId;
            const topicName = db.data.syllabus[m.subjectId]?.topics.find(t => t.id === m.topicId)?.name || m.topicId;
            return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem 0.5rem;" class="font-medium">${subName}</td>
                    <td style="padding: 1rem 0.5rem;">${topicName}</td>
                    <td style="padding: 1rem 0.5rem;">${createBadge(m.wrongReason, 'Wrong')}</td>
                    <td style="padding: 1rem 0.5rem;">${m.timeTaken}s</td>
                    <td style="padding: 1rem 0.5rem;" class="text-secondary">${m.date}</td>
                    <td style="padding: 1rem 0.5rem; text-align:right;">
                        <button class="btn btn-primary text-xs" onclick="MistakesPage.practiceAgain('${m.subjectId}', '${topicName}')">
                            <i data-lucide="play" style="width:12px; height:12px; vertical-align:-2px; display:inline-block;"></i> Practice Again
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        return `
            <div class="mistake-bank-page">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h2 class="text-2xl font-bold">Mistake Bank</h2>
                        <p class="text-secondary text-sm">Review incorrect attempts and resolve conceptual weaknesses</p>
                    </div>
                </div>

                <div class="stats-grid mb-6">
                    <div class="stat-card">
                        <div class="stat-label">Total Errors Logged</div>
                        <div class="stat-value" style="color:var(--status-error);">${mistakes.length}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Concept Mistakes</div>
                        <div class="stat-value">${conceptMistakes}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Calculation Mistakes</div>
                        <div class="stat-value">${calcMistakes}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Careless Mistakes</div>
                        <div class="stat-value">${carelessMistakes}</div>
                    </div>
                </div>

                <div class="card">
                    <h3 class="font-semibold text-base mb-4">Logged Mistakes Log</h3>
                    <table style="width:100%; border-collapse:collapse; text-align:left;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border-color); color:var(--text-secondary); font-size:0.85rem;">
                                <th style="padding: 0.5rem; font-weight:500;">Subject</th>
                                <th style="padding: 0.5rem; font-weight:500;">Topic</th>
                                <th style="padding: 0.5rem; font-weight:500;">Wrong Reason</th>
                                <th style="padding: 0.5rem; font-weight:500;">Solving Time</th>
                                <th style="padding: 0.5rem; font-weight:500;">Date</th>
                                <th style="padding: 0.5rem; font-weight:500; text-align:right;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${mistakes.length > 0 ? tableRows : `
                                <tr>
                                    <td colspan="6" class="text-secondary text-center" style="padding:2rem 0;">No incorrect answers logged yet! Keep it up.</td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    practiceAgain: function(subId, topicName) {
        PYQsPage.config.subject = subId;
        PYQsPage.config.topic = topicName;
        router.navigate('/pyqs');
    }
};

const SettingsPage = {
    render: function() {
        const settings = db.data.settings;
        return `
            <div class="settings-page" style="max-width: 600px; margin: 0 auto;">
                <h2 class="text-2xl font-semibold mb-6">Settings</h2>
                
                <div class="card mb-6">
                    <h3 class="font-semibold text-base mb-4">Preparation Preferences</h3>
                    
                    <form onsubmit="SettingsPage.handleSave(event)">
                        <div class="mb-4">
                            <label class="block text-sm text-secondary mb-1">GATE Exam Date</label>
                            <input type="date" id="settings-date" class="btn btn-secondary btn-full" value="${settings.examDate}" style="text-align:left; background:var(--bg-card-hover);" required>
                        </div>
                        
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom: 1.5rem;">
                            <div>
                                <label class="block text-sm text-secondary mb-1">Target Score (out of 100)</label>
                                <input type="number" id="settings-score" class="btn btn-secondary btn-full" value="${settings.targetScore}" min="10" max="100" style="text-align:left; background:var(--bg-card-hover);" required>
                            </div>
                            <div>
                                <label class="block text-sm text-secondary mb-1">Target Rank</label>
                                <input type="number" id="settings-rank" class="btn btn-secondary btn-full" value="${settings.targetRank}" min="1" style="text-align:left; background:var(--bg-card-hover);" required>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm text-secondary mb-1">Daily Study Target Commitment (Hours)</label>
                            <input type="number" id="settings-hours" class="btn btn-secondary btn-full" value="${settings.dailyHours}" min="1" max="16" style="text-align:left; background:var(--bg-card-hover);" required>
                        </div>

                        <button type="submit" class="btn btn-primary btn-full" style="padding: 0.75rem;">Save Preferences</button>
                    </form>
                </div>

                <div class="card mb-6">
                    <h3 class="font-semibold text-base mb-4">Backup & Restore</h3>
                    <p class="text-secondary text-xs mb-4">Export your current syllabus completions, streaks, and PYQ attempts log, or restore them from backup files.</p>
                    <div class="flex gap-2">
                        <button class="btn btn-secondary flex-1" onclick="SettingsPage.exportBackup()"><i data-lucide="download"></i> Export JSON</button>
                        <button class="btn btn-secondary flex-1" onclick="document.getElementById('backup-file-input').click()"><i data-lucide="upload"></i> Restore Backup</button>
                        <input type="file" id="backup-file-input" style="display:none;" accept=".json" onchange="SettingsPage.importBackup(event)">
                    </div>
                </div>
                
                <button class="btn btn-secondary btn-full" onclick="SettingsPage.resetApp()" style="color: var(--status-error); border-color: rgba(224, 75, 75, 0.2); padding:0.75rem;">
                    <i data-lucide="trash-2"></i> Reset Application Database
                </button>
            </div>
        `;
    },

    handleSave: function(e) {
        e.preventDefault();
        const settings = {
            examDate: document.getElementById('settings-date').value,
            targetScore: parseFloat(document.getElementById('settings-score').value),
            targetRank: parseInt(document.getElementById('settings-rank').value),
            dailyHours: parseFloat(document.getElementById('settings-hours').value)
        };
        db.updateSettings(settings);
        scheduler.rebalanceTimetable(); // Rebalance schedule based on modified settings
        alert("Settings saved and study timetable rebalanced successfully!");
        router.navigate('/');
    },

    exportBackup: function() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db.data));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `studytrack_backup_${new Date().toISOString().split('T')[0]}.json`);
        dlAnchorElem.click();
    },

    importBackup: function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const parsed = JSON.parse(event.target.result);
                if (parsed.settings && parsed.syllabus) {
                    db.data = parsed;
                    db.save();
                    alert("Backup restored successfully!");
                    window.location.reload();
                } else {
                    alert("Invalid backup file structure.");
                }
            } catch (err) {
                alert("Failed to parse JSON backup file.");
            }
        };
        reader.readAsText(file);
    },

    resetApp: function() {
        if (confirm("Are you sure you want to restore StudyTrack to its initial fresh state? All logged data and settings will be permanently deleted.")) {
            db.clearAllData();
            window.location.reload();
        }
    }
};

const routes = {
    '/': DashboardPage,
    '/onboarding': OnboardingPage,
    '/subjects': SubjectsPage,
    '/pyqs': PYQsPage,
    '/session': SessionPage,
    '/mocks': MocksPage,
    '/analytics': AnalyticsPage,
    '/revision': RevisionPage,
    '/mistakes': MistakesPage,
    '/settings': SettingsPage
};

const router = {
    navigate: function(path) {
        window.location.hash = path;
    },
    
    handleRoute: function() {
        let path = window.location.hash.replace('#', '') || '/';
        if (path === '') path = '/';
        
        // Force redirect to onboarding if not onboarded
        if (db.data.settings && !db.data.settings.onboarded && path !== '/onboarding') {
            path = '/onboarding';
            window.location.hash = '/onboarding';
        }

        const page = routes[path] || routes['/'];
        const contentDiv = document.getElementById('page-content');
        if (contentDiv) {
            contentDiv.innerHTML = page.render();
        }
        
        // Re-initialize lucide icons for newly injected HTML
        if (window.lucide) {
            lucide.createIcons();
        }
        
        // Update active nav state in sidebar
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === '#' + path) {
                item.classList.add('active');
            }
        });

        // Hide sidebar navigation links if we are inside onboarding flow
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            if (path === '/onboarding') {
                document.getElementById('sidebar-nav').style.pointerEvents = 'none';
                document.getElementById('sidebar-nav').style.opacity = '0.3';
                document.getElementById('quick-start-btn').disabled = true;
            } else {
                document.getElementById('sidebar-nav').style.pointerEvents = 'auto';
                document.getElementById('sidebar-nav').style.opacity = '1';
                document.getElementById('quick-start-btn').disabled = false;
            }
        }
    },
    
    init: function() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    }
};

window.router = router;
