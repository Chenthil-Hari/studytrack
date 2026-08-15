const DashboardPage = {
    render: function() {
        if (!db.data.settings.onboarded) {
            setTimeout(() => router.navigate('/onboarding'), 50);
            return '<div class="text-center p-6"><p class="text-secondary">Loading onboarding wizard...</p></div>';
        }

        // Run rebalance checks automatically on dashboard load
        scheduler.rebalanceTimetable();

        // Calculate Stats
        const settings = db.data.settings;
        const healthScore = db.calculateHealthScore();
        const risk = db.getExamRiskAnalysis();

        // Syllabus Completion
        let totalTopics = 0;
        let completedTopics = 0;
        for (const sub of Object.values(db.data.syllabus)) {
            totalTopics += sub.topics.length;
            completedTopics += sub.topics.filter(t => t.status === 'Completed').length;
        }
        const completionRate = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

        // PYQ Mastery (Avg Accuracy of attempted topics)
        const attemptedPyqs = db.data.pyqAttempts.length;
        const correctPyqs = db.data.pyqAttempts.filter(p => p.status === 'Correct').length;
        const pyqMastery = attemptedPyqs > 0 ? Math.round((correctPyqs / attemptedPyqs) * 100) : 0;

        // Today's Study Target Vs Actual
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysLogs = db.data.studyLogs.filter(log => log.date === todayStr);
        const actualStudyMin = todaysLogs.reduce((sum, log) => sum + log.minutes, 0);
        const targetStudyMin = settings.dailyHours * 60;
        const studyTargetPercent = Math.min(100, Math.round((actualStudyMin / targetStudyMin) * 100));

        // Get next recommended task using intelligence engine
        const recommendation = this.getStudyRecommendation();

        // Get Today's Plan
        const todaysTasks = scheduler.getTodaysPlan();
        const tasksHtml = todaysTasks.length > 0 ? todaysTasks.map(task => `
            <div class="task-item">
                <div class="task-info">
                    <div class="custom-checkbox ${task.completed ? 'checked' : ''}" onclick="scheduler.toggleTaskCompletion(${task.id}); router.handleRoute();">
                        <i data-lucide="check"></i>
                    </div>
                    <div>
                        <div class="task-subject">${task.subjectName}</div>
                        <div class="task-topic">${task.topicName}</div>
                    </div>
                </div>
                <div class="task-duration">
                    <i data-lucide="clock" style="width:12px; height:12px; display:inline-block; vertical-align:-1px;"></i> ${task.duration} min
                </div>
            </div>
        `).join('') : '<p class="text-secondary text-sm p-4 text-center">No tasks scheduled for today.</p>';

        // Get Weakest Topics (mastery < 50%)
        const weakList = [];
        for (const [subId, subData] of Object.entries(db.data.syllabus)) {
            subData.topics.forEach(t => {
                if (t.mastery > 0 && t.mastery < 50) {
                    weakList.push({ ...t, subjectName: subData.name, subjectId: subId });
                }
            });
        }
        weakList.sort((a, b) => a.mastery - b.mastery);
        const weakAreaHtml = weakList.slice(0, 4).map(topic => `
            <div class="task-item" style="padding: 0.75rem 1rem;">
                <div>
                    <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom: 0.25rem;">
                        ${createBadge(topic.mastery + '% Mastery', 'error')}
                        <span class="text-sm font-medium">${topic.subjectName} — ${topic.name}</span>
                    </div>
                    <div class="text-secondary text-xs">Accuracy: ${topic.accuracy}% | Confidence: ${topic.confidence}/5</div>
                </div>
                <button class="btn btn-secondary text-xs" onclick="DashboardPage.quickStartSession('${topic.subjectId}', '${topic.name}', 'Revision')">Revise</button>
            </div>
        `).join('');

        // Dynamic health style colors
        let healthColor = "var(--status-error)";
        let healthText = "Critical Action Required";
        if (healthScore >= 80) {
            healthColor = "var(--status-success)";
            healthText = "Optimal Prep Condition";
        } else if (healthScore >= 60) {
            healthColor = "var(--status-info)";
            healthText = "Stable Prep Condition";
        } else if (healthScore >= 40) {
            healthColor = "var(--status-warning)";
            healthText = "Attention Required";
        }

        return `
            <div class="dashboard-page">
                <!-- GATE Command Center Top Overview -->
                <div class="card mb-6" style="padding: 1.5rem; background: linear-gradient(90deg, #131316 0%, #1e1e24 100%); border-color: var(--border-light);">
                    <div class="flex justify-between items-center">
                        <div>
                            <h2 class="text-xl font-bold" style="color:var(--text-primary);">GATE CSE Command Center</h2>
                            <p class="text-secondary text-xs mt-1">Real-time adaptive metrics dashboard</p>
                        </div>
                        <div class="flex gap-6" style="text-align: right;">
                            <div>
                                <span class="text-secondary text-xs block">COUNTDOWN</span>
                                <span class="text-xl font-bold" style="color:var(--accent-primary);">${risk.daysLeft} Days</span>
                            </div>
                            <div style="border-left: 1px solid var(--border-color); padding-left: 1.5rem;">
                                <span class="text-secondary text-xs block">STREAK</span>
                                <span class="text-xl font-bold" style="color:var(--status-warning);"><i data-lucide="flame" style="width:18px; height:18px; vertical-align:-3px; display:inline;"></i> ${db.data.streak} Days</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Forecasting & Health score Row -->
                <div class="grid grid-cols-2 mb-6">
                    <!-- Preparation Health Score -->
                    <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <h3 class="font-semibold text-base">Preparation Health Score</h3>
                                ${createBadge(healthText, healthScore >= 80 ? 'success' : healthScore >= 60 ? 'info' : 'warning')}
                            </div>
                            <p class="text-secondary text-xs mb-4">Integrates syllabus coverage depth, aggregate accuracy ratings, and consistency trends.</p>
                        </div>
                        <div class="flex items-center gap-6 mt-2">
                            <div style="font-size: 3rem; font-weight:700; color:${healthColor}; line-height:1;">${healthScore}%</div>
                            <div style="flex:1;">
                                <div class="progress-bg" style="height:8px;">
                                    <div class="progress-fill" style="width: ${healthScore}%; background:${healthColor}"></div>
                                </div>
                                <div class="text-secondary text-xs mt-2 flex justify-between">
                                    <span>Syllabus: ${completionRate}%</span>
                                    <span>Accuracy: ${pyqMastery}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Exam Risk + "What if I fall behind?" -->
                    <div class="card">
                        <div class="flex justify-between items-center mb-2">
                            <h3 class="font-semibold text-base">Exam Completion Risk</h3>
                            <span class="badge-tag" style="background:${risk.riskColor}20; color:${risk.riskColor}; border-color:${risk.riskColor}30; font-weight:600;">${risk.riskLevel} RISK</span>
                        </div>
                        <p class="text-secondary text-xs mb-3">Predictive projection model of syllabus completion dates compared to date constraints.</p>
                        
                        <div style="background:var(--bg-app); border:1px solid var(--border-color); padding:0.75rem 1rem; border-radius:var(--radius-md);">
                            <div class="text-secondary text-xs font-semibold uppercase mb-1">What if I fall behind?</div>
                            <div class="text-xs text-primary leading-relaxed">${risk.explanation}</div>
                        </div>
                        
                        <div class="flex justify-between items-center mt-3 text-xs text-secondary">
                            <span>Syllabus hours needed: <b>${risk.hoursNeeded}h</b></span>
                            <span>Syllabus hours budgeted: <b>${risk.availableHours}h</b></span>
                        </div>
                    </div>
                </div>

                <!-- Metrics Grid -->
                <div class="stats-grid mb-6" style="grid-template-columns: repeat(5, 1fr);">
                    <div class="stat-card">
                        <div class="stat-label"><i data-lucide="compass"></i> Syllabus Completed</div>
                        <div class="stat-value">${completionRate}%</div>
                        ${createProgressBar(completionRate)}
                    </div>
                    <div class="stat-card">
                        <div class="stat-label"><i data-lucide="file-text"></i> PYQ Mastery</div>
                        <div class="stat-value">${pyqMastery}%</div>
                        ${createProgressBar(pyqMastery)}
                    </div>
                    <div class="stat-card">
                        <div class="stat-label"><i data-lucide="repeat"></i> Revision Queue</div>
                        <div class="stat-value">${db.data.revisionQueue.length} Tasks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label"><i data-lucide="clock"></i> Today's Study</div>
                        <div class="stat-value">${Math.round(actualStudyMin)} / ${targetStudyMin}m</div>
                        ${createProgressBar(studyTargetPercent)}
                    </div>
                    <div class="stat-card">
                        <div class="stat-label"><i data-lucide="check-square"></i> Active Streak</div>
                        <div class="stat-value">${db.data.streak} Days</div>
                    </div>
                </div>

                <!-- What Should I Study Now? (Engine Output) -->
                <div class="card study-now-card mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <div class="flex items-center gap-2">
                            <i data-lucide="sparkles" style="color:var(--accent-primary); width:18px; height:18px;"></i>
                            <h2 class="text-lg font-semibold">What should I study now?</h2>
                        </div>
                        ${createBadge('ADAPTIVE RECOMMENDER', 'warning')}
                    </div>
                    
                    ${recommendation ? `
                        <div class="flex justify-between items-end">
                            <div>
                                <h3 class="text-2xl font-bold mb-1">${recommendation.subjectName} — ${recommendation.topicName}</h3>
                                <p class="text-secondary text-sm flex gap-4 mt-2">
                                    <span>Mastery Score: <b>${recommendation.mastery}%</b></span>
                                    <span>Confidence: <b>${recommendation.confidence}/5</b></span>
                                    <span>Reason: <span style="color:var(--status-warning)">${recommendation.reason}</span></span>
                                </p>
                            </div>
                            <button class="btn btn-primary" onclick="DashboardPage.quickStartSession('${recommendation.subjectId}', '${recommendation.topicName}', '${recommendation.type}')" style="padding: 0.75rem 2rem;">
                                <i data-lucide="play"></i> Start Session (45m)
                            </button>
                        </div>
                    ` : `
                        <p class="text-secondary text-sm">All syllabus topics are fully completed! Focus on Mock Tests and active Revision.</p>
                    `}
                </div>

                <!-- Today's Plan & Weak Areas Grid -->
                <div class="grid grid-cols-2 mt-6">
                    <div class="card">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-semibold text-base">Today's Schedule Plan</h3>
                        </div>
                        <div class="task-list">
                            ${tasksHtml}
                        </div>
                    </div>

                    <div class="card">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-semibold text-base text-error" style="color:var(--status-error)">Weak Performance Topics</h3>
                        </div>
                        <div class="task-list">
                            ${weakAreaHtml.length > 0 ? weakAreaHtml : '<p class="text-secondary text-sm p-4 text-center">No weak performance topics logged yet.</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getStudyRecommendation: function() {
        // Intelligence Engine logic
        // Checks topics by status, confidence, and accuracy
        const candidates = [];
        for (const [subId, subData] of Object.entries(db.data.syllabus)) {
            subData.topics.forEach(t => {
                if (t.status !== 'Completed') {
                    let score = 0;
                    let reason = '';
                    
                    if (t.status === 'Needs Revision') {
                        score += 50;
                        reason = 'Flagged for revision';
                    } else if (t.status === 'Learning') {
                        score += 30;
                        reason = 'In progress topic';
                    } else if (t.status === 'Not Started') {
                        score += 20;
                        reason = 'New topic in syllabus';
                    }

                    // Lower confidence increases score
                    score += (5 - t.confidence) * 10;
                    
                    // Low accuracy increases score
                    if (t.attempts > 0 && t.accuracy < 60) {
                        score += (60 - t.accuracy) * 1.5;
                        reason = 'Low PYQ accuracy';
                    }

                    candidates.push({
                        subjectId: subId,
                        subjectName: subData.name,
                        topicName: t.name,
                        mastery: t.mastery,
                        confidence: t.confidence,
                        score,
                        reason: reason || 'High-priority syllabus component',
                        type: t.status === 'Needs Revision' ? 'Revision' : 'Study'
                    });
                }
            });
        }

        if (candidates.length === 0) return null;

        // Sort candidates by recommendation score descending
        candidates.sort((a, b) => b.score - a.score);
        return candidates[0];
    },

    quickStartSession: function(subjectId, topicName, type) {
        localStorage.setItem('prefilled_session', JSON.stringify({
            subject: subjectId,
            topic: topicName,
            duration: 45,
            type: type
        }));
        router.navigate('/session');
    }
};

window.DashboardPage = DashboardPage;
