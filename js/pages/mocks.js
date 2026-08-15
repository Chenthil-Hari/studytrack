const MocksPage = {
    showForm: false,

    render: function() {
        const tests = db.data.mockTests;
        const highestScore = tests.length > 0 ? Math.max(...tests.map(t => t.score)) : 0;
        const averageScore = tests.length > 0 ? Math.round((tests.reduce((sum, t) => sum + t.score, 0) / tests.length) * 10) / 10 : 0;

        // Generate SVG chart path dynamically
        let svgChartHtml = '';
        if (tests.length > 1) {
            const width = 600;
            const height = 150;
            const paddingLeft = 40;
            const paddingRight = 20;
            const paddingTop = 20;
            const paddingBottom = 20;
            const chartWidth = width - paddingLeft - paddingRight;
            const chartHeight = height - paddingTop - paddingBottom;

            const points = tests.map((t, idx) => {
                const x = paddingLeft + (idx / (tests.length - 1)) * chartWidth;
                const y = paddingTop + chartHeight - (t.score / 100) * chartHeight;
                return { x, y, score: t.score, name: t.name };
            });

            const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

            svgChartHtml = `
                <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible;">
                    <!-- Grid Lines -->
                    <line x1="${paddingLeft}" y1="${paddingTop}" x2="${width - paddingRight}" y2="${paddingTop}" stroke="var(--border-color)" stroke-dasharray="3,3" />
                    <line x1="${paddingLeft}" y1="${paddingTop + chartHeight/2}" x2="${width - paddingRight}" y2="${paddingTop + chartHeight/2}" stroke="var(--border-color)" stroke-dasharray="3,3" />
                    <line x1="${paddingLeft}" y1="${paddingTop + chartHeight}" x2="${width - paddingRight}" y2="${paddingTop + chartHeight}" stroke="var(--border-color)" />
                    
                    <!-- Axis Labels -->
                    <text x="${paddingLeft - 10}" y="${paddingTop + 4}" fill="var(--text-secondary)" font-size="10" text-anchor="end">100</text>
                    <text x="${paddingLeft - 10}" y="${paddingTop + chartHeight/2 + 4}" fill="var(--text-secondary)" font-size="10" text-anchor="end">50</text>
                    <text x="${paddingLeft - 10}" y="${paddingTop + chartHeight + 4}" fill="var(--text-secondary)" font-size="10" text-anchor="end">0</text>

                    <!-- Score Path -->
                    <polyline fill="none" stroke="var(--accent-primary)" stroke-width="2.5" points="${polylinePoints}" />
                    
                    <!-- Plot points -->
                    ${points.map(p => `
                        <circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--bg-card)" stroke="var(--accent-primary)" stroke-width="2.5" />
                        <text x="${p.x}" y="${p.y - 10}" fill="var(--text-primary)" font-size="10" font-weight="600" text-anchor="middle">${p.score}%</text>
                    `).join('')}
                </svg>
            `;
        } else {
            svgChartHtml = `
                <div class="text-secondary text-sm" style="padding: 2rem; text-align:center;">
                    Add at least 2 mock test logs to draw score progression curves.
                </div>
            `;
        }

        const formHtml = this.showForm ? `
            <div class="card mb-6" style="border-color: var(--accent-primary);">
                <h3 class="font-medium mb-4">Log Mock Test Result</h3>
                <form id="add-mock-form" onsubmit="MocksPage.handleSubmit(event)">
                    <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <label class="text-secondary text-sm block mb-1">Test Name</label>
                            <input type="text" id="mock-name" class="btn btn-secondary btn-full" placeholder="e.g. MadeEasy Subject Test 1" style="text-align:left; background: var(--bg-card-hover);" required>
                        </div>
                        <div>
                            <label class="text-secondary text-sm block mb-1">Score (out of 100)</label>
                            <input type="number" id="mock-score" class="btn btn-secondary btn-full" placeholder="e.g. 68.5" step="0.1" min="0" max="100" style="text-align:left; background: var(--bg-card-hover);" required>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <label class="text-secondary text-sm block mb-1">Correct Qs</label>
                            <input type="number" id="mock-correct" class="btn btn-secondary btn-full" placeholder="25" min="0" style="text-align:left; background: var(--bg-card-hover);" required>
                        </div>
                        <div>
                            <label class="text-secondary text-sm block mb-1">Wrong Qs</label>
                            <input type="number" id="mock-wrong" class="btn btn-secondary btn-full" placeholder="10" min="0" style="text-align:left; background: var(--bg-card-hover);" required>
                        </div>
                        <div>
                            <label class="text-secondary text-sm block mb-1">Unattempted</label>
                            <input type="number" id="mock-unattempt" class="btn btn-secondary btn-full" placeholder="5" min="0" style="text-align:left; background: var(--bg-card-hover);" required>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button type="button" class="btn btn-secondary" onclick="MocksPage.toggleForm(false)">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Result</button>
                    </div>
                </form>
            </div>
        ` : '';

        return `
            <div class="mocks-page">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-semibold">Mock Tests</h2>
                    <button class="btn btn-primary" onclick="MocksPage.toggleForm(true)">
                        <i data-lucide="plus"></i> Log Test Result
                    </button>
                </div>
                
                ${formHtml}
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Average Score</div>
                        <div class="stat-value">${averageScore} / 100</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Highest Score</div>
                        <div class="stat-value" style="color: var(--status-success)">${highestScore} / 100</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Tests Completed</div>
                        <div class="stat-value">${tests.length}</div>
                    </div>
                </div>

                <div class="card mt-6">
                    <h3 class="font-medium mb-4">Score Progression</h3>
                    <div style="height: 180px; width: 100%; padding-top: 1rem;">
                        ${svgChartHtml}
                    </div>
                </div>
                
                <div class="card mt-6">
                    <h3 class="font-medium mb-4">Mock History</h3>
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size:0.85rem;">
                                <th style="padding: 1rem 0; font-weight: 500;">Date</th>
                                <th style="padding: 1rem 0; font-weight: 500;">Test Name</th>
                                <th style="padding: 1rem 0; font-weight: 500;">Score</th>
                                <th style="padding: 1rem 0; font-weight: 500;">C / W / U</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tests.length > 0 ? tests.map(t => `
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 1rem 0;">${t.date}</td>
                                    <td class="font-medium">${t.name}</td>
                                    <td>${t.score} %</td>
                                    <td class="text-secondary">${t.correct} Correct, ${t.wrong} Wrong, ${t.unattempted} Unattempted</td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="4" class="text-secondary text-center" style="padding: 2rem 0;">No mock tests logged yet.</td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    toggleForm: function(show) {
        this.showForm = show;
        router.handleRoute();
    },

    handleSubmit: function(e) {
        e.preventDefault();
        const name = document.getElementById('mock-name').value;
        const score = document.getElementById('mock-score').value;
        const correct = document.getElementById('mock-correct').value;
        const wrong = document.getElementById('mock-wrong').value;
        const unattempted = document.getElementById('mock-unattempt').value;

        db.addMockTest(name, score, correct, wrong, unattempted);
        this.showForm = false;
        router.handleRoute();
    }
};

window.MocksPage = MocksPage;
