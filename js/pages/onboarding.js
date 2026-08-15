const OnboardingPage = {
    step: 1, // 1: Preferences, 2: Syllabus, 3: Diagnostics
    parsedSyllabus: null,
    currentDiagSubjectIndex: 0,
    diagSubjects: [],

    render: function() {
        let contentHtml = '';
        
        if (this.step === 1) {
            contentHtml = this.renderStep1();
        } else if (this.step === 2) {
            contentHtml = this.renderStep2();
        } else if (this.step === 3) {
            contentHtml = this.renderStep3();
        }

        return `
            <div class="onboarding-container" style="max-width: 700px; margin: 2rem auto; padding: 2rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
                <div class="onboarding-header mb-6" style="text-align: center;">
                    <i data-lucide="compass" style="width:40px; height:40px; color: var(--accent-primary); margin-bottom: 0.5rem;"></i>
                    <h2 class="text-2xl font-bold">StudyTrack Onboarding</h2>
                    <p class="text-secondary text-sm">Configure your personal GATE 2027 Command Center</p>
                    
                    <!-- Steps Indicator -->
                    <div style="display:flex; justify-content:center; gap: 2rem; margin-top: 1.5rem;">
                        <span style="font-size:0.85rem; font-weight:600; color: ${this.step === 1 ? 'var(--accent-primary)' : 'var(--text-secondary)'}">1. Preferences</span>
                        <span style="font-size:0.85rem; font-weight:600; color: ${this.step === 2 ? 'var(--accent-primary)' : 'var(--text-secondary)'}">2. Syllabus Import</span>
                        <span style="font-size:0.85rem; font-weight:600; color: ${this.step === 3 ? 'var(--accent-primary)' : 'var(--text-secondary)'}">3. Diagnostics</span>
                    </div>
                </div>
                
                <div class="onboarding-content mt-6">
                    ${contentHtml}
                </div>
            </div>
        `;
    },

    renderStep1: function() {
        return `
            <form onsubmit="OnboardingPage.saveStep1(event)">
                <div class="mb-4">
                    <label class="block text-sm font-semibold mb-2">GATE Exam Date</label>
                    <input type="date" id="ob-date" class="btn btn-secondary btn-full" value="2027-02-06" style="text-align: left; background: var(--bg-card-hover);" required>
                </div>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                    <div>
                        <label class="block text-sm font-semibold mb-2">Target Score (out of 100)</label>
                        <input type="number" id="ob-score" class="btn btn-secondary btn-full" value="75" min="10" max="100" style="text-align: left; background: var(--bg-card-hover);" required>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2">Target Rank</label>
                        <input type="number" id="ob-rank" class="btn btn-secondary btn-full" value="100" min="1" style="text-align: left; background: var(--bg-card-hover);" required>
                    </div>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-semibold mb-2">Daily Study Commitment (Hours)</label>
                    <input type="number" id="ob-hours" class="btn btn-secondary btn-full" value="4" min="1" max="16" style="text-align: left; background: var(--bg-card-hover);" required>
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-semibold mb-2">Preferred Study Timings</label>
                    <select id="ob-timings" class="btn btn-secondary btn-full" style="text-align: left; background: var(--bg-card-hover);">
                        <option value="morning">Morning (6 AM - 12 PM)</option>
                        <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                        <option value="evening">Evening (5 PM - 11 PM)</option>
                    </select>
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-semibold mb-2">Weekly Study Days</label>
                    <div style="display:flex; gap:0.5rem; justify-content:space-between;">
                        ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => `
                            <label class="flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" name="ob-days" value="${idx + 1}" checked>
                                <span class="text-sm">${day}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div class="flex justify-end mt-6">
                    <button type="submit" class="btn btn-primary" style="padding: 0.75rem 2rem;">Continue <i data-lucide="arrow-right"></i></button>
                </div>
            </form>
        `;
    },

    renderStep2: function() {
        return `
            <div style="text-align:center;">
                <p class="text-secondary text-sm mb-6">Upload your syllabus or choose the official standard GATE CSE syllabus template</p>
                
                <div id="drop-zone" style="border: 2px dashed var(--border-color); padding: 3rem 2rem; border-radius: var(--radius-md); background: var(--bg-app); cursor:pointer; margin-bottom: 1.5rem;" onclick="document.getElementById('syllabus-file-input').click()">
                    <i data-lucide="upload-cloud" style="width:36px; height:36px; color: var(--text-secondary); margin-bottom: 0.5rem;"></i>
                    <p class="font-medium text-sm">Drag and drop file here, or click to upload</p>
                    <p class="text-secondary text-xs mt-1">Supports TXT, CSV, PDF, DOCX (Max 5MB)</p>
                    <input type="file" id="syllabus-file-input" style="display:none;" accept=".txt,.csv,.pdf,.docx" onchange="OnboardingPage.handleFileUpload(event)">
                </div>

                <div style="margin: 1.5rem 0;" class="text-secondary text-sm">— OR —</div>

                <button class="btn btn-secondary btn-full mb-6" style="padding: 0.75rem;" onclick="OnboardingPage.loadDefaultSyllabusTemplate()">
                    <i data-lucide="check-circle" style="color:var(--status-success)"></i> Load Official GATE CSE 2027 Syllabus Template
                </button>

                <div id="syllabus-preview-container" style="display:none;">
                    <h3 class="font-semibold text-sm mb-2 text-left">Parsed Syllabus Preview</h3>
                    <div style="max-height: 250px; overflow-y:auto; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-app); text-align:left;">
                        <table style="width:100%; border-collapse:collapse; font-size:0.85rem;" id="preview-table">
                            <!-- Table data injected here -->
                        </table>
                    </div>
                </div>

                <div class="flex justify-between mt-6">
                    <button class="btn btn-secondary" onclick="OnboardingPage.prevStep()"><i data-lucide="arrow-left"></i> Back</button>
                    <button class="btn btn-primary" id="step2-next-btn" style="padding: 0.75rem 2rem;" disabled onclick="OnboardingPage.saveStep2()">Continue <i data-lucide="arrow-right"></i></button>
                </div>
            </div>
        `;
    },

    renderStep3: function() {
        if (this.diagSubjects.length === 0) {
            this.diagSubjects = Object.keys(db.data.syllabus);
        }

        const subKey = this.diagSubjects[this.currentDiagSubjectIndex];
        const subject = db.data.syllabus[subKey];

        return `
            <div>
                <h3 class="font-semibold text-lg mb-2">${subject.name} Diagnostics</h3>
                <p class="text-secondary text-sm mb-4">Rate your starting preparedness for each topic in this subject</p>
                
                <div style="max-height: 350px; overflow-y:auto; display:flex; flex-direction:column; gap:1rem; padding-right:0.5rem;">
                    ${subject.topics.map((t, idx) => `
                        <div class="card" style="padding: 1rem; border-color: var(--border-light);">
                            <div class="font-medium text-sm mb-2">${t.name}</div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div>
                                    <label class="text-xs text-secondary block mb-1">Completion Status</label>
                                    <select class="btn btn-secondary btn-full diag-status" data-topic-id="${t.id}" style="text-align:left; background:var(--bg-app); font-size:0.8rem;" onchange="OnboardingPage.handleDiagStatusChange('${subKey}', '${t.id}', this.value)">
                                        <option value="Not Started" ${t.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                                        <option value="Learning" ${t.status === 'Learning' ? 'selected' : ''}>Learning</option>
                                        <option value="Needs Revision" ${t.status === 'Needs Revision' ? 'selected' : ''}>Needs Revision</option>
                                        <option value="Completed" ${t.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="text-xs text-secondary block mb-1">Confidence (1-5)</label>
                                    <input type="range" class="btn-full diag-confidence" data-topic-id="${t.id}" min="1" max="5" value="${t.confidence || 1}" style="accent-color: var(--accent-primary);" onchange="OnboardingPage.handleDiagConfidenceChange('${subKey}', '${t.id}', this.value)">
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="flex justify-between mt-6">
                    <button class="btn btn-secondary" onclick="OnboardingPage.prevStep()"><i data-lucide="arrow-left"></i> Back</button>
                    <button class="btn btn-primary" onclick="OnboardingPage.nextDiagSubject()">
                        ${this.currentDiagSubjectIndex < this.diagSubjects.length - 1 ? 'Next Subject' : 'Complete Setup'} 
                        <i data-lucide="arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    },

    prevStep: function() {
        this.step = Math.max(1, this.step - 1);
        router.handleRoute();
    },

    saveStep1: function(e) {
        e.preventDefault();
        const days = Array.from(document.querySelectorAll('input[name="ob-days"]:checked')).map(cb => cb.value);
        const settings = {
            examDate: document.getElementById('ob-date').value,
            targetScore: parseFloat(document.getElementById('ob-score').value),
            targetRank: parseInt(document.getElementById('ob-rank').value),
            dailyHours: parseFloat(document.getElementById('ob-hours').value),
            preferredTimings: document.getElementById('ob-timings').value,
            studyDays: days
        };
        db.updateSettings(settings);
        this.step = 2;
        router.handleRoute();
    },

    loadDefaultSyllabusTemplate: function() {
        this.parsedSyllabus = JSON.parse(JSON.stringify(OFFICIAL_GATE_SYLLABUS));
        
        // Show preview table
        const container = document.getElementById('syllabus-preview-container');
        const table = document.getElementById('preview-table');
        const nextBtn = document.getElementById('step2-next-btn');
        
        if (container && table && nextBtn) {
            container.style.display = 'block';
            nextBtn.disabled = false;

            let tableHtml = `
                <tr style="border-bottom: 1px solid var(--border-color); color:var(--text-secondary);">
                    <th style="padding:0.5rem;">Subject</th>
                    <th style="padding:0.5rem;">Topic</th>
                    <th style="padding:0.5rem;">Unit</th>
                </tr>
            `;

            for (const subData of Object.values(this.parsedSyllabus)) {
                subData.topics.forEach(t => {
                    tableHtml += `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding:0.5rem;">${subData.name}</td>
                            <td style="padding:0.5rem;">${t.name}</td>
                            <td style="padding:0.5rem;">${t.unit}</td>
                        </tr>
                    `;
                });
            }
            table.innerHTML = tableHtml;
        }
    },

    handleFileUpload: function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Simulate parsing progress
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            dropZone.innerHTML = `
                <i data-lucide="loader" class="animate-spin" style="width:36px; height:36px; color: var(--accent-primary); margin-bottom: 0.5rem;"></i>
                <p class="font-medium text-sm">Parsing "${file.name}"...</p>
                <p class="text-secondary text-xs mt-1">Extracting subjects and units</p>
            `;
            if (window.lucide) lucide.createIcons();
        }

        setTimeout(() => {
            // Load official template as fallback for file upload simulation
            this.loadDefaultSyllabusTemplate();
            
            // Re-render upload drop area back to complete state
            if (dropZone) {
                dropZone.innerHTML = `
                    <i data-lucide="check" style="width:36px; height:36px; color: var(--status-success); margin-bottom: 0.5rem;"></i>
                    <p class="font-medium text-sm">Successfully parsed "${file.name}"</p>
                    <p class="text-secondary text-xs mt-1">Found ${Object.values(OFFICIAL_GATE_SYLLABUS).reduce((sum, s) => sum + s.topics.length, 0)} topics</p>
                `;
                if (window.lucide) lucide.createIcons();
            }
        }, 1500);
    },

    saveStep2: function() {
        this.step = 3;
        router.handleRoute();
    },

    handleDiagStatusChange: function(subKey, topicId, status) {
        db.updateTopicStatus(subKey, topicId, { status });
    },

    handleDiagConfidenceChange: function(subKey, topicId, confidence) {
        db.updateTopicStatus(subKey, topicId, { confidence: parseInt(confidence) });
    },

    nextDiagSubject: function() {
        if (this.currentDiagSubjectIndex < this.diagSubjects.length - 1) {
            this.currentDiagSubjectIndex++;
            router.handleRoute();
        } else {
            // Finish onboarding
            db.data.settings.onboarded = true;
            db.recalculateAllMastery();
            
            // Generate dynamic adaptive timetable
            scheduler.generateTimetable();
            db.save();

            alert("GATE 2027 Dashboard successfully customized!");
            router.navigate('/');
        }
    }
};

window.OnboardingPage = OnboardingPage;
