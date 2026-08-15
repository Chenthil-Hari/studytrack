const SAMPLE_QUESTION_BANK = [
    {
        id: "q1",
        subjectId: "os",
        topic: "Page Replacement",
        year: 2021,
        difficulty: "Medium",
        type: "Official",
        text: "Consider a virtual memory system with 3 page frames. The program references pages in the order: 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5. How many page faults occur under LRU replacement policy?",
        options: ["7", "8", "9", "10"],
        correctIndex: 3, // 10 faults
        explanation: "LRU page replacement tracking: Refs: 1(F), 2(F), 3(F), 4(F, replaces 1), 1(F, replaces 2), 2(F, replaces 3), 5(F, replaces 4), 1(Hit), 2(Hit), 3(F, replaces 5), 4(F, replaces 1), 5(F, replaces 2). Total faults = 10."
    },
    {
        id: "q2",
        subjectId: "dbms",
        topic: "Normalization",
        year: 2022,
        difficulty: "Hard",
        type: "Official",
        text: "A relation R(A, B, C, D, E, F) has functional dependencies: A -> B, C -> D, D -> E, E -> F. What is the candidate key?",
        options: ["AC", "AD", "ACD", "ACEF"],
        correctIndex: 0, // AC
        explanation: "Candidate key must functionally determine all attributes. Closure of AC: (AC)+ = {A, C, B, D, E, F}. Thus, AC is the unique candidate key."
    },
    {
        id: "q3",
        subjectId: "cn",
        topic: "TCP Congestion Control",
        year: 2023,
        difficulty: "Hard",
        type: "Official",
        text: "In TCP congestion control, if the current congestion window size is 32 KB and a timeout occurs, what are the new values of congestion window and slow-start threshold (ssthresh)? (Assuming MSS = 2 KB)",
        options: ["2 KB, 16 KB", "2 KB, 8 KB", "32 KB, 16 KB", "4 KB, 16 KB"],
        correctIndex: 0, // ssthresh = cwnd / 2 = 16KB, cwnd resets to 1 MSS = 2KB
        explanation: "On timeout, ssthresh is set to half of the current congestion window size (32 KB / 2 = 16 KB), and cwnd is reset to 1 MSS (2 KB)."
    }
];

const PYQsPage = {
    stage: 'config', // config, active, summary
    config: {
        subject: 'os',
        topic: '',
        difficulty: 'Medium',
        count: 3,
        timeLimit: 10 // minutes
    },
    questions: [],
    currentIndex: 0,
    userAnswers: [], // stores correctIndex or selectionIndex
    wrongReasons: [], // stores wrong reason string per question
    questionTimes: [], // stores time taken in seconds per question
    questionStartTime: null,
    totalStartTime: null,
    answerSubmitted: false,

    render: function() {
        if (this.stage === 'config') {
            return this.renderConfig();
        } else if (this.stage === 'active') {
            return this.renderActive();
        } else if (this.stage === 'summary') {
            return this.renderSummary();
        }
    },

    renderConfig: function() {
        const subId = this.config.subject;
        const topics = subjectTopics[subId] || ["General"];

        return `
            <div class="pyq-arena max-w-2xl" style="max-width: 600px; margin: 2rem auto;">
                <div class="card" style="padding: 2rem;">
                    <div class="text-center mb-6">
                        <i data-lucide="award" style="width:40px; height:40px; color: var(--accent-primary); margin-bottom: 0.5rem;"></i>
                        <h2 class="text-2xl font-bold">PYQ Arena</h2>
                        <p class="text-secondary text-sm">Strict simulated testing mode with live score updates</p>
                    </div>

                    <form onsubmit="PYQsPage.startArena(event)">
                        <div class="mb-4">
                            <label class="block text-sm font-semibold mb-2">Select Subject</label>
                            <select id="arena-sub" class="btn btn-secondary btn-full" style="text-align: left; background: var(--bg-card-hover);" onchange="PYQsPage.handleSubjectChange(this.value)">
                                ${Object.entries(db.data.syllabus).map(([id, s]) => `<option value="${id}" ${subId === id ? 'selected' : ''}>${s.name}</option>`).join('')}
                            </select>
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-semibold mb-2">Select Topic</label>
                            <select id="arena-topic" class="btn btn-secondary btn-full" style="text-align: left; background: var(--bg-card-hover);">
                                ${topics.map(t => `<option value="${t}">${t}</option>`).join('')}
                            </select>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom: 1.5rem;">
                            <div>
                                <label class="block text-sm font-semibold mb-2">Questions Count</label>
                                <select id="arena-count" class="btn btn-secondary btn-full" style="text-align: left; background: var(--bg-card-hover);">
                                    <option value="3">3 Questions</option>
                                    <option value="5">5 Questions</option>
                                    <option value="10">10 Questions</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold mb-2">Time Limit</label>
                                <select id="arena-time" class="btn btn-secondary btn-full" style="text-align: left; background: var(--bg-card-hover);">
                                    <option value="5">5 Minutes</option>
                                    <option value="10" selected>10 Minutes</option>
                                    <option value="20">20 Minutes</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary btn-full" style="padding: 0.75rem;">
                            <i data-lucide="play"></i> Start Practice Session
                        </button>
                    </form>
                </div>
            </div>
        `;
    },

    renderActive: function() {
        const q = this.questions[this.currentIndex];
        const progressPercent = Math.round(((this.currentIndex) / this.questions.length) * 100);

        return `
            <div class="pyq-active max-w-3xl" style="max-width: 700px; margin: 1rem auto;">
                <!-- Header Stats -->
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <span class="text-sm font-semibold">Question ${this.currentIndex + 1} of ${this.questions.length}</span>
                        <div class="progress-bg" style="width: 150px; height:4px; margin-top: 0.25rem;">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                    <div>
                        ${createBadge(q.type + ' GATE Question', q.type === 'Official' ? 'success' : 'warning')}
                    </div>
                </div>

                <div class="card mb-6" style="padding: 2rem;">
                    <!-- Question Text -->
                    <div style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem; white-space: pre-wrap;">${q.text}</div>

                    <!-- Options List -->
                    <div style="display:flex; flex-direction:column; gap: 1rem;">
                        ${q.options.map((opt, idx) => {
                            let optionStyle = 'border-color: var(--border-color); background: var(--bg-card-hover);';
                            let iconHtml = '';

                            if (this.answerSubmitted) {
                                if (idx === q.correctIndex) {
                                    optionStyle = 'border-color: var(--status-success); background: var(--status-success-bg); color: var(--status-success);';
                                    iconHtml = '<i data-lucide="check" style="width:16px; height:16px;"></i>';
                                } else if (idx === this.userAnswers[this.currentIndex]) {
                                    optionStyle = 'border-color: var(--status-error); background: var(--status-error-bg); color: var(--status-error);';
                                    iconHtml = '<i data-lucide="x" style="width:16px; height:16px;"></i>';
                                }
                            }

                            const disabledAttr = this.answerSubmitted ? 'disabled' : '';

                            return `
                                <button class="btn btn-secondary text-left flex justify-between items-center" 
                                        style="padding: 1rem; border-radius: var(--radius-md); text-align:left; ${optionStyle}" 
                                        onclick="PYQsPage.submitAnswer(${idx})" ${disabledAttr}>
                                    <span>${String.fromCharCode(65 + idx)}. &nbsp; ${opt}</span>
                                    ${iconHtml}
                                </button>
                            `;
                        }).join('')}
                    </div>

                    <!-- Explanation & Wrong Reason Classification (revealed after submission) -->
                    ${this.answerSubmitted ? `
                        <div class="mt-6 pt-6 border-t border-color">
                            <h4 class="font-semibold text-sm mb-2" style="color: var(--accent-primary);">Solution & Explanation</h4>
                            <p class="text-sm text-secondary mb-4">${q.explanation}</p>

                            ${this.userAnswers[this.currentIndex] !== q.correctIndex ? `
                                <div style="background: var(--status-error-bg); border: 1px dashed var(--status-error); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
                                    <label class="block text-xs font-bold text-error mb-2" style="color:var(--status-error)">CLASSIFY WRONG ANSWER REASON</label>
                                    <select class="btn btn-secondary btn-full" style="text-align:left; background:var(--bg-app); font-size:0.85rem;" onchange="PYQsPage.selectWrongReason(this.value)">
                                        <option value="">-- Choose Mistake Category --</option>
                                        <option value="Concept Mistake">Concept Mistake (Misunderstood formula/rule)</option>
                                        <option value="Calculation Mistake">Calculation Mistake (Arithmetic error)</option>
                                        <option value="Careless Mistake">Careless Mistake (Read question wrong)</option>
                                        <option value="Didn't Know">Didn't Know (Syllabus topic not studied)</option>
                                        <option value="Guess">Guess (Unsure of calculation)</option>
                                    </select>
                                </div>
                            ` : ''}

                            <div class="flex justify-end">
                                <button class="btn btn-primary" onclick="PYQsPage.nextQuestion()">
                                    ${this.currentIndex < this.questions.length - 1 ? 'Next Question' : 'Finish Session'}
                                    <i data-lucide="arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    renderSummary: function() {
        const correctCount = this.questions.filter((q, idx) => this.userAnswers[idx] === q.correctIndex).length;
        const total = this.questions.length;
        const accuracy = Math.round((correctCount / total) * 100);

        return `
            <div class="pyq-summary max-w-2xl" style="max-width: 600px; margin: 2rem auto;">
                <div class="card" style="padding: 2rem; text-align:center;">
                    <i data-lucide="check-circle" style="width:48px; height:48px; color: var(--status-success); margin-bottom: 1rem;"></i>
                    <h2 class="text-2xl font-bold mb-1">Session Complete!</h2>
                    <p class="text-secondary text-sm">Practice metrics have been updated and synced to the syllabus mastery index.</p>

                    <div class="grid grid-cols-3 mt-6 mb-6">
                        <div class="card" style="padding: 1rem; background: var(--bg-app);">
                            <span class="text-secondary text-xs block">ACCURACY</span>
                            <span class="text-xl font-bold" style="color: var(--accent-primary);">${accuracy}%</span>
                        </div>
                        <div class="card" style="padding: 1rem; background: var(--bg-app);">
                            <span class="text-secondary text-xs block">CORRECT</span>
                            <span class="text-xl font-bold" style="color: var(--status-success);">${correctCount} / ${total}</span>
                        </div>
                        <div class="card" style="padding: 1rem; background: var(--bg-app);">
                            <span class="text-secondary text-xs block">TIME TAKEN</span>
                            <span class="text-xl font-bold">${Math.round(this.questionTimes.reduce((sum, t) => sum + t, 0))}s</span>
                        </div>
                    </div>

                    <h4 class="font-semibold text-sm text-left mb-2">Question breakdown</h4>
                    <div class="task-list mb-6" style="text-align:left;">
                        ${this.questions.map((q, idx) => {
                            const isCorrect = this.userAnswers[idx] === q.correctIndex;
                            return `
                                <div class="task-item">
                                    <div>
                                        <div class="font-medium text-sm">Q${idx + 1}: ${q.topic}</div>
                                        <div class="text-secondary text-xs mt-1">Time: ${this.questionTimes[idx]}s ${this.wrongReasons[idx] ? `| Reason: <span style="color:var(--status-error)">${this.wrongReasons[idx]}</span>` : ''}</div>
                                    </div>
                                    ${createBadge(isCorrect ? 'Correct' : 'Wrong', isCorrect ? 'success' : 'error')}
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <button class="btn btn-primary btn-full" onclick="PYQsPage.exitSummary()">
                        Return to Command Center
                    </button>
                </div>
            </div>
        `;
    },

    handleSubjectChange: function(val) {
        this.config.subject = val;
        router.handleRoute();
    },

    startArena: function(e) {
        e.preventDefault();
        const sub = document.getElementById('arena-sub').value;
        const topic = document.getElementById('arena-topic').value;
        const count = parseInt(document.getElementById('arena-count').value);
        const timeLimit = parseInt(document.getElementById('arena-time').value);

        this.config = { subject: sub, topic, count, timeLimit };
        this.currentIndex = 0;
        this.userAnswers = [];
        this.wrongReasons = [];
        this.questionTimes = [];
        this.answerSubmitted = false;

        // Generate questions list
        this.questions = this.generateQuestionsList(sub, topic, count);
        this.stage = 'active';
        this.questionStartTime = Date.now();
        this.totalStartTime = Date.now();

        router.handleRoute();
    },

    generateQuestionsList: function(subId, topic, count) {
        // Filter sample bank for official questions matching subject
        const matches = SAMPLE_QUESTION_BANK.filter(q => q.subjectId === subId && q.topic.toLowerCase() === topic.toLowerCase());
        
        const list = [...matches];
        
        // Fill remaining count with dynamic labeled AI questions
        while (list.length < count) {
            const idx = list.length + 1;
            list.push({
                id: `ai_${Date.now()}_${idx}`,
                subjectId: subId,
                topic: topic,
                year: 2026,
                difficulty: "Medium",
                type: "AI-Practice", // Clearly labeled
                text: `[AI-Practice Question] Consider a sample test case for ${topic} in ${subId.toUpperCase()}. What is the optimal complexity or output under maximum workload constraints?`,
                options: ["O(log N) optimal", "O(N) expected", "O(N log N) worst-case", "O(N^2) suboptimal"],
                correctIndex: 0,
                explanation: "Under optimal memory layout structures, binary reductions yield logarithmic index execution complexities."
            });
        }

        return list;
    },

    submitAnswer: function(selectionIndex) {
        if (this.answerSubmitted) return;
        
        this.userAnswers[this.currentIndex] = selectionIndex;
        this.answerSubmitted = true;
        
        // Calculate seconds spent
        const timeSpent = Math.max(1, Math.round((Date.now() - this.questionStartTime) / 1000));
        this.questionTimes[this.currentIndex] = timeSpent;
        this.wrongReasons[this.currentIndex] = null; // default clear

        router.handleRoute();
    },

    selectWrongReason: function(val) {
        this.wrongReasons[this.currentIndex] = val;
    },

    nextQuestion: function() {
        const q = this.questions[this.currentIndex];
        const isCorrect = this.userAnswers[this.currentIndex] === q.correctIndex;
        
        // Log attempt to state/database
        db.addPYQAttempt(
            q.subjectId,
            // Find topic id
            this.findTopicId(q.subjectId, q.topic),
            isCorrect ? 'Correct' : 'Wrong',
            this.wrongReasons[this.currentIndex] || 'Concept Mistake',
            this.questionTimes[this.currentIndex]
        );

        if (this.currentIndex < this.questions.length - 1) {
            this.currentIndex++;
            this.answerSubmitted = false;
            this.questionStartTime = Date.now();
            router.handleRoute();
        } else {
            this.stage = 'summary';
            router.handleRoute();
        }
    },

    findTopicId: function(subId, topicName) {
        const sub = db.data.syllabus[subId];
        if (sub) {
            const topic = sub.topics.find(t => t.name.toLowerCase() === topicName.toLowerCase() || t.id.toLowerCase().includes(topicName.toLowerCase().slice(0, 4)));
            if (topic) return topic.id;
        }
        return topicName;
    },

    exitSummary: function() {
        this.stage = 'config';
        router.navigate('/');
    }
};

window.PYQsPage = PYQsPage;
