const SubjectsPage = {
    activeSubject: null,

    render: function() {
        if (!this.activeSubject) {
            this.activeSubject = Object.keys(db.data.syllabus)[0];
        }

        const subjectsListHtml = Object.entries(db.data.syllabus).map(([id, sub]) => {
            const completed = sub.topics.filter(t => t.status === 'Completed').length;
            const total = sub.topics.length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isActive = this.activeSubject === id ? 'active' : '';

            return `
                <div class="nav-item ${isActive}" style="display:flex; justify-content:space-between; align-items:center; padding: 0.75rem 1rem; cursor:pointer;" onclick="SubjectsPage.selectSubject('${id}')">
                    <span class="font-medium">${sub.name}</span>
                    <span class="text-xs font-semibold" style="color:var(--text-secondary)">${percent}%</span>
                </div>
            `;
        }).join('');

        const subData = db.data.syllabus[this.activeSubject];
        const topicsTableHtml = subData.topics.map(t => {
            // Get color indicator based on mastery
            let masteryColor = 'var(--status-error)';
            let masteryText = 'Weak';
            if (t.mastery >= 80) {
                masteryColor = 'var(--status-success)';
                masteryText = 'Strong';
            } else if (t.mastery >= 60) {
                masteryColor = 'var(--status-info)';
                masteryText = 'Average';
            } else if (t.mastery >= 40) {
                masteryColor = 'var(--status-warning)';
                masteryText = 'Needs Revision';
            }

            return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 1rem 0.5rem; font-weight:500;">${t.name}</td>
                    <td style="padding: 1rem 0.5rem;" class="text-secondary">${t.unit}</td>
                    <td style="padding: 1rem 0.5rem;">
                        <select class="btn btn-secondary text-sm" style="text-align:left; background:var(--bg-app); padding:0.25rem 0.5rem;" onchange="SubjectsPage.updateStatus('${this.activeSubject}', '${t.id}', this.value)">
                            <option value="Not Started" ${t.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                            <option value="Learning" ${t.status === 'Learning' ? 'selected' : ''}>Learning</option>
                            <option value="Needs Revision" ${t.status === 'Needs Revision' ? 'selected' : ''}>Needs Revision</option>
                            <option value="Completed" ${t.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </td>
                    <td style="padding: 1rem 0.5rem;">
                        <select class="btn btn-secondary text-sm" style="text-align:left; background:var(--bg-app); padding:0.25rem 0.5rem;" onchange="SubjectsPage.updateConfidence('${this.activeSubject}', '${t.id}', this.value)">
                            ${[1, 2, 3, 4, 5].map(v => `<option value="${v}" ${t.confidence === v ? 'selected' : ''}>${v} ★</option>`).join('')}
                        </select>
                    </td>
                    <td style="padding: 1rem 0.5rem; text-align:right;">
                        <div style="font-weight:600; color:${masteryColor}">${t.mastery}%</div>
                        <div style="font-size:0.75rem; color:var(--text-secondary)">${masteryText}</div>
                    </td>
                </tr>
            `;
        }).join('');

        return `
            <div class="subjects-page">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-semibold">GATE Syllabus Tracker</h2>
                </div>

                <div class="grid grid-cols-3" style="grid-template-columns: 280px 1fr; gap:1.5rem; align-items: flex-start;">
                    <!-- Sidebar list of subjects -->
                    <div class="card" style="padding: 0.5rem; display:flex; flex-direction:column; gap:0.25rem;">
                        <div class="text-secondary text-xs font-bold mb-2" style="padding: 0.5rem 1rem;">SUBJECTS</div>
                        ${subjectsListHtml}
                    </div>

                    <!-- Topics checklist table -->
                    <div class="card">
                        <h3 class="font-semibold text-lg mb-4">${subData.name} Topics</h3>
                        <table style="width:100%; border-collapse:collapse; text-align:left;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--border-color); color:var(--text-secondary); font-size:0.85rem;">
                                    <th style="padding: 0.5rem; font-weight:500;">Topic</th>
                                    <th style="padding: 0.5rem; font-weight:500;">Unit</th>
                                    <th style="padding: 0.5rem; font-weight:500;">Status</th>
                                    <th style="padding: 0.5rem; font-weight:500;">Confidence</th>
                                    <th style="padding: 0.5rem; font-weight:500; text-align:right;">Mastery</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${topicsTableHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    selectSubject: function(id) {
        this.activeSubject = id;
        router.handleRoute();
    },

    updateStatus: function(subjectId, topicId, value) {
        db.updateTopicStatus(subjectId, topicId, { status: value });
        // Auto trigger timetable rebalance
        scheduler.rebalanceTimetable();
        router.handleRoute();
    },

    updateConfidence: function(subjectId, topicId, value) {
        db.updateTopicStatus(subjectId, topicId, { confidence: parseInt(value) });
        router.handleRoute();
    }
};

window.SubjectsPage = SubjectsPage;
