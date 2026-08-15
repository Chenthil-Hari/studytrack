const AnalyticsPage = {
    render: function() {
        // Compute stats from logs
        const logs = db.data.studyLogs;
        const totalMinutes = logs.reduce((sum, l) => sum + l.minutes, 0);
        const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
        
        const totalDistractions = logs.reduce((sum, l) => sum + l.distractions, 0);
        const avgDistractionsPerHour = totalHours > 0 ? Math.round((totalDistractions / totalHours) * 10) / 10 : 0;
        
        // Calculate focus score: base 100, drops by 5 per distraction
        const focusScore = Math.max(0, 100 - (totalDistractions * 5));

        // Syllabus Progress Summary
        let totalTopicsCount = 0;
        let completedCount = 0;
        let learningCount = 0;
        let revisionCount = 0;

        for (const sub of Object.values(db.data.syllabus)) {
            totalTopicsCount += sub.topics.length;
            completedCount += sub.topics.filter(t => t.status === 'Completed').length;
            learningCount += sub.topics.filter(t => t.status === 'Learning').length;
            revisionCount += sub.topics.filter(t => t.status === 'Needs Revision').length;
        }

        // Mistake breakdown
        const mistakeCounts = {
            "Concept Mistake": 0,
            "Calculation Mistake": 0,
            "Careless Mistake": 0,
            "Didn't Know": 0,
            "Guess": 0
        };

        db.data.pyqAttempts.forEach(p => {
            if (p.status === 'Wrong' && p.wrongReason in mistakeCounts) {
                mistakeCounts[p.wrongReason]++;
            }
        });

        const totalMistakes = Object.values(mistakeCounts).reduce((a, b) => a + b, 0);
        const mistakeBarsHtml = Object.entries(mistakeCounts).map(([reason, count]) => {
            const percent = totalMistakes > 0 ? Math.round((count / totalMistakes) * 100) : 0;
            return `
                <div class="mb-3">
                    <div class="flex justify-between text-sm mb-1">
                        <span>${reason}</span>
                        <span class="font-medium">${count} (${percent}%)</span>
                    </div>
                    <div class="progress-bg" style="height: 6px;">
                        <div class="progress-fill" style="width: ${percent}%; background: var(--status-error);"></div>
                    </div>
                </div>
            `;
        }).join('');

        // Subject performance list
        const subjectListHtml = Object.entries(db.data.syllabus).map(([id, sub]) => {
            const completed = sub.topics.filter(t => t.status === 'Completed').length;
            const total = sub.topics.length;
            const subPercent = Math.round((completed / total) * 100);
            
            // Calculate average subject accuracy
            const attempted = db.data.pyqAttempts.filter(a => a.subjectId === id).length;
            const correct = db.data.pyqAttempts.filter(a => a.subjectId === id && a.status === 'Correct').length;
            const subAccuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

            return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.75rem 0.5rem;" class="font-semibold">${sub.name}</td>
                    <td style="padding: 0.75rem 0.5rem;">
                        <div class="flex items-center gap-2">
                            <span>${subPercent}%</span>
                            <div class="progress-bg" style="width: 80px; height: 4px;">
                                <div class="progress-fill" style="width: ${subPercent}%;"></div>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 0.75rem 0.5rem; text-align:right;">${attempted} Qs</td>
                    <td style="padding: 0.75rem 0.5rem; text-align:right; font-weight:600; color: ${subAccuracy >= 70 ? 'var(--status-success)' : subAccuracy >= 50 ? 'var(--status-warning)' : 'var(--status-error)'}">${subAccuracy}%</td>
                </tr>
            `;
        }).join('');

        return `
            <div class="analytics-page">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-semibold">Performance Analytics</h2>
                </div>

                <!-- Stats Grid -->
                <div class="stats-grid mb-6">
                    <div class="stat-card">
                        <div class="stat-label">Total Study Time</div>
                        <div class="stat-value">${totalHours} Hours</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Focus score</div>
                        <div class="stat-value" style="color: ${focusScore >= 80 ? 'var(--status-success)' : 'var(--status-warning)'}">${focusScore}%</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Distractions Logged</div>
                        <div class="stat-value">${totalDistractions}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Avg Interruption Rate</div>
                        <div class="stat-value">${avgDistractionsPerHour} /hr</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 mt-6">
                    <!-- Syllabus breakdown -->
                    <div class="card">
                        <h3 class="font-semibold text-base mb-4">Syllabus Coverage Breakdown</h3>
                        <div style="display:flex; flex-direction:column; gap: 1rem;">
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span>Completed Topics</span>
                                    <span class="text-secondary">${completedCount} / ${totalTopicsCount}</span>
                                </div>
                                <div class="progress-bg"><div class="progress-fill" style="width:${Math.round((completedCount/totalTopicsCount)*100)}%; background:var(--status-success);"></div></div>
                            </div>
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span>Learning (Active)</span>
                                    <span class="text-secondary">${learningCount} / ${totalTopicsCount}</span>
                                </div>
                                <div class="progress-bg"><div class="progress-fill" style="width:${Math.round((learningCount/totalTopicsCount)*100)}%; background:var(--status-info);"></div></div>
                            </div>
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span>Needs Revision</span>
                                    <span class="text-secondary">${revisionCount} / ${totalTopicsCount}</span>
                                </div>
                                <div class="progress-bg"><div class="progress-fill" style="width:${Math.round((revisionCount/totalTopicsCount)*100)}%; background:var(--status-warning);"></div></div>
                            </div>
                        </div>
                    </div>

                    <!-- Mistake Analysis -->
                    <div class="card">
                        <h3 class="font-semibold text-base mb-4">Mistake Category analysis</h3>
                        ${totalMistakes > 0 ? mistakeBarsHtml : '<p class="text-secondary text-sm text-center p-6">No mistake logs recorded yet. Complete incorrect answers in the PYQ Arena.</p>'}
                    </div>
                </div>

                <!-- Subject performance table -->
                <div class="card mt-6">
                    <h3 class="font-semibold text-base mb-4">Subject-wise Mastery Index</h3>
                    <table style="width:100%; border-collapse:collapse; text-align:left;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border-color); color:var(--text-secondary); font-size:0.85rem;">
                                <th style="padding: 0.5rem; font-weight:500;">Subject</th>
                                <th style="padding: 0.5rem; font-weight:500;">Syllabus Progress</th>
                                <th style="padding: 0.5rem; font-weight:500; text-align:right;">Simulated attempts</th>
                                <th style="padding: 0.5rem; font-weight:500; text-align:right;">Avg Accuracy</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subjectListHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
};

window.AnalyticsPage = AnalyticsPage;
