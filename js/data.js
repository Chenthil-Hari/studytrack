// Official GATE CSE 2027 Syllabus Template
const OFFICIAL_GATE_SYLLABUS = {
    "em": {
        name: "Engineering Mathematics",
        topics: [
            { id: "em_la", name: "Linear Algebra (Matrix Algebra, Systems of Linear Equations, Eigenvalues/vectors)", unit: "Linear Algebra" },
            { id: "em_calc", name: "Calculus (Limits, Continuity, Differentiability, Maxima/Minima, Integration)", unit: "Calculus" },
            { id: "em_prob", name: "Probability & Statistics (Mean, Median, Mode, Random Variables, Distributions, Conditional Probability)", unit: "Probability & Statistics" }
        ]
    },
    "dm": {
        name: "Discrete Mathematics",
        topics: [
            { id: "dm_logic", name: "Propositional and First-Order Logic", unit: "Mathematical Logic" },
            { id: "dm_sets", name: "Sets, Relations, Functions, Partial Orders, Lattices", unit: "Set Theory & Algebra" },
            { id: "dm_groups", name: "Monoids, Groups", unit: "Set Theory & Algebra" },
            { id: "dm_graphs", name: "Graphs (Connectivity, Matching, Coloring)", unit: "Graph Theory" },
            { id: "dm_comb", name: "Combinatorics (Counting, Recurrence Relations, Generating Functions)", unit: "Combinatorics" }
        ]
    },
    "dl": {
        name: "Digital Logic",
        topics: [
            { id: "dl_bool", name: "Boolean Algebra & Minimization (K-Maps)", unit: "Logic Design" },
            { id: "dl_comb", name: "Combinational Circuits (Mux, Decoders, Adders)", unit: "Logic Design" },
            { id: "dl_seq", name: "Sequential Circuits (Latches, Flip-Flops, Registers, Counters)", unit: "Logic Design" },
            { id: "dl_num", name: "Number Representations & Computer Arithmetic", unit: "Data Representation" }
        ]
    },
    "coa": {
        name: "Computer Organization & Architecture",
        topics: [
            { id: "coa_instr", name: "Machine Instructions & Addressing Modes", unit: "CPU Design" },
            { id: "coa_alu", name: "ALU, Data-Path & Control Unit Design", unit: "CPU Design" },
            { id: "coa_pipe", name: "Instruction Pipelining & Hazards", unit: "Pipelining" },
            { id: "coa_mem", name: "Memory Hierarchy (Cache Mapping, Replacement, Virtual Memory)", unit: "Memory Hierarchy" },
            { id: "coa_io", name: "I/O Interface (Interrupt, DMA)", unit: "I/O Organization" }
        ]
    },
    "ds": {
        name: "Programming & Data Structures",
        topics: [
            { id: "ds_c", name: "Programming in C (Pointers, Recursion, Scope)", unit: "C Programming" },
            { id: "ds_arrays", name: "Arrays, Stacks, Queues, Linked Lists", unit: "Linear Data Structures" },
            { id: "ds_trees", name: "Binary Trees, BSTs, Binary Heaps", unit: "Trees" },
            { id: "ds_graphs", name: "Graph Representations & Basic Algorithms", unit: "Graphs" }
        ]
    },
    "algo": {
        name: "Algorithms",
        topics: [
            { id: "algo_comp", name: "Asymptotic Complexity & Analysis", unit: "Analysis" },
            { id: "algo_sort", name: "Searching, Sorting & Hashing", unit: "Sorting & Searching" },
            { id: "algo_design", name: "Divide-and-Conquer, Greedy, Dynamic Programming", unit: "Design Techniques" },
            { id: "algo_graphs", name: "Graph Traversals, MSTs, Shortest Paths", unit: "Graph Algorithms" }
        ]
    },
    "toc": {
        name: "Theory of Computation",
        topics: [
            { id: "toc_fa", name: "Regular Expressions & Finite Automata (DFA, NFA, Regular Langs)", unit: "Automata & Regular Languages" },
            { id: "toc_cfg", name: "CFGs, Pushdown Automata, CFD, Pumping Lemma", unit: "Context Free Languages" },
            { id: "toc_tm", name: "Turing Machines & Undecidability", unit: "Computability" }
        ]
    },
    "cd": {
        name: "Compiler Design",
        topics: [
            { id: "cd_lex", name: "Lexical Analysis & Parsing (LL, LR, LALR)", unit: "Syntax Analysis" },
            { id: "cd_sdt", name: "Syntax-Directed Translation & Intermediate Code", unit: "Code Generation" },
            { id: "cd_opt", name: "Runtime Environments, Code Optimization & Reg Allocation", unit: "Optimization" }
        ]
    },
    "os": {
        name: "Operating Systems",
        topics: [
            { id: "os_proc", name: "Processes, Threads, CPU Scheduling", unit: "Process Management" },
            { id: "os_sync", name: "Concurrency & Synchronization (Semaphores, Locks)", unit: "Process Management" },
            { id: "os_dl", name: "Deadlocks (Detection, Avoidance, Prevention)", unit: "Process Management" },
            { id: "os_mem", name: "Memory Management (Paging, Segmentation, Virtual Memory)", unit: "Memory Management" },
            { id: "os_fs", name: "File Systems & Disk Scheduling", unit: "Storage Management" }
        ]
    },
    "dbms": {
        name: "Database Management Systems",
        topics: [
            { id: "dbms_er", name: "ER-Model & Relational Model (Relational Algebra, SQL)", unit: "Relational Databases" },
            { id: "dbms_norm", name: "Functional Dependencies & Normal Forms (3NF, BCNF)", unit: "Database Design" },
            { id: "dbms_tx", name: "Transactions & Concurrency Control (Serializability)", unit: "Transactions" },
            { id: "dbms_idx", name: "File Organization & Indexing (B/B+ Trees)", unit: "Storage" }
        ]
    },
    "cn": {
        name: "Computer Networks",
        topics: [
            { id: "cn_layers", name: "OSI & TCP/IP Layering Concepts", unit: "Network Models" },
            { id: "cn_flow", name: "Flow & Error Control, Sliding Window", unit: "Data Link Layer" },
            { id: "cn_ip", name: "IPv4/IPv6, Subnetting, Routing Algorithms", unit: "Network Layer" },
            { id: "cn_tcp", name: "TCP/UDP, Sockets & Congestion Control", unit: "Transport Layer" },
            { id: "cn_app", name: "Application Layer Protocols (DNS, SMTP, HTTP)", unit: "Application Layer" },
            { id: "cn_sec", name: "Network Security (Cryptography, Firewalls)", unit: "Security" }
        ]
    }
};

const DEFAULT_ONBOARDING_SETTINGS = {
    examDate: "2027-02-06",
    targetScore: 75,
    targetRank: 100,
    dailyHours: 4,
    preferredTimings: "morning", // morning, afternoon, evening
    studyDays: ["1", "2", "3", "4", "5", "6", "7"], // 1=Mon, 7=Sun
    onboarded: false
};

// Database class
class StudyTrackDb {
    constructor() {
        this.data = null;
    }

    init() {
        const stored = localStorage.getItem('studytrack_db');
        if (stored) {
            try {
                this.data = JSON.parse(stored);
            } catch (e) {
                this.data = this.createNewState();
            }
        } else {
            this.data = this.createNewState();
            this.save();
        }
    }

    createNewState() {
        // Initialize syllabus with official topics and clear masteries
        const syllabusState = {};
        for (const [subId, subData] of Object.entries(OFFICIAL_GATE_SYLLABUS)) {
            syllabusState[subId] = {
                name: subData.name,
                topics: subData.topics.map(t => ({
                    ...t,
                    status: "Not Started", // Completed, Learning, Needs Revision, Not Started
                    confidence: 0,         // 1 to 5
                    accuracy: 0,           // 0 to 100
                    attempts: 0,
                    solvingTime: 0,        // avg in seconds
                    wrongCount: 0,
                    mastery: 0             // calculated mastery rating 0-100
                }))
            };
        }

        return {
            settings: { ...DEFAULT_ONBOARDING_SETTINGS },
            syllabus: syllabusState,
            studyLogs: [],             // { id, subject, topic, minutes, date, type, distractions, elapsed }
            pyqAttempts: [],           // { id, questionId, subject, topic, status (Correct/Wrong/Skipped), wrongReason, timeTaken, date }
            mockTests: [],             // { id, name, score, correct, wrong, unattempted, date }
            revisionQueue: [],         // { id, subject, topic, origin (Wrong PYQ, Low Confidence, Manual), dateAdded, timeframe }
            streak: 0,
            lastActivityDate: null
        };
    }

    save() {
        localStorage.setItem('studytrack_db', JSON.stringify(this.data));
    }

    updateSettings(newSettings) {
        this.data.settings = { ...this.data.settings, ...newSettings };
        this.save();
    }

    updateTopicStatus(subjectId, topicId, updates) {
        const sub = this.data.syllabus[subjectId];
        if (sub) {
            const topic = sub.topics.find(t => t.id === topicId);
            if (topic) {
                Object.assign(topic, updates);
                topic.mastery = this.calculateMastery(topic);
                this.save();
            }
        }
    }

    calculateMastery(topic) {
        const accuracyWeight = 0.4;
        const confidenceWeight = 0.3;
        const speedWeight = 0.15;
        const attemptsWeight = 0.15;

        const confidenceScore = (topic.confidence / 5) * 100;
        
        let speedScore = 100;
        if (topic.solvingTime > 180) {
            speedScore = Math.max(20, 100 - (topic.solvingTime - 180) / 3);
        }

        let attemptsScore = Math.min(100, topic.attempts * 25);
        if (topic.status === "Completed") {
            attemptsScore = Math.max(attemptsScore, 60);
        }

        const mastery = (topic.accuracy * accuracyWeight) + 
                        (confidenceScore * confidenceWeight) + 
                        (speedScore * speedWeight) + 
                        (attemptsScore * attemptsWeight);

        return Math.min(100, Math.round(mastery));
    }

    recalculateAllMastery() {
        for (const sub of Object.values(this.data.syllabus)) {
            sub.topics.forEach(t => {
                t.mastery = this.calculateMastery(t);
            });
        }
        this.save();
    }

    addPYQAttempt(subjectId, topicId, status, wrongReason, timeTaken) {
        const attempt = {
            id: Date.now(),
            subjectId,
            topicId,
            status,
            wrongReason: status === 'Wrong' ? wrongReason : null,
            timeTaken,
            date: new Date().toISOString().split('T')[0]
        };
        this.data.pyqAttempts.push(attempt);

        // Update topic tracking stats
        const sub = this.data.syllabus[subjectId];
        if (sub) {
            const topic = sub.topics.find(t => t.id === topicId);
            if (topic) {
                topic.attempts++;
                if (status === 'Correct') {
                    topic.accuracy = Math.round((topic.accuracy * (topic.attempts - 1) + 100) / topic.attempts);
                } else if (status === 'Wrong') {
                    topic.accuracy = Math.round((topic.accuracy * (topic.attempts - 1)) / topic.attempts);
                    topic.wrongCount++;
                    // Automatically append to revision queue
                    this.addToRevision(subjectId, topicId, "Wrong PYQ");
                }
                
                // average solving speed
                topic.solvingTime = Math.round((topic.solvingTime * (topic.attempts - 1) + timeTaken) / topic.attempts);
                topic.mastery = this.calculateMastery(topic);
            }
        }
        this.save();
    }

    addToRevision(subjectId, topicId, origin) {
        const exists = this.data.revisionQueue.some(r => r.subjectId === subjectId && r.topicId === topicId);
        if (!exists) {
            this.data.revisionQueue.push({
                id: Date.now(),
                subjectId,
                topicId,
                origin,
                dateAdded: new Date().toISOString().split('T')[0],
                timeframe: "Today"
            });
            this.save();
        }
    }

    completeRevision(revisionId) {
        const index = this.data.revisionQueue.findIndex(r => r.id === revisionId);
        if (index !== -1) {
            const rev = this.data.revisionQueue[index];
            const sub = this.data.syllabus[rev.subjectId];
            if (sub) {
                const topic = sub.topics.find(t => t.id === rev.topicId);
                if (topic) {
                    topic.status = "Completed";
                    topic.confidence = Math.min(5, topic.confidence + 1);
                    topic.mastery = this.calculateMastery(topic);
                }
            }
            this.data.revisionQueue.splice(index, 1);
            this.save();
        }
    }

    logStudySession(subjectId, topicId, minutes, distractionsCount, elapsedMinutes, type) {
        const log = {
            id: Date.now(),
            subjectId,
            topicId,
            minutes,
            distractions: distractionsCount,
            elapsed: elapsedMinutes,
            type,
            date: new Date().toISOString().split('T')[0]
        };
        this.data.studyLogs.push(log);

        // Update topic state if it was learning
        const sub = this.data.syllabus[subjectId];
        if (sub) {
            const topic = sub.topics.find(t => t.id === topicId);
            if (topic) {
                if (topic.status === "Not Started") {
                    topic.status = "Learning";
                }
                topic.mastery = this.calculateMastery(topic);
            }
        }

        // Update streak
        const today = new Date().toISOString().split('T')[0];
        if (this.data.lastActivityDate !== today) {
            this.data.streak++;
            this.data.lastActivityDate = today;
        }

        this.save();
    }

    addMockTest(name, score, correct, wrong, unattempted) {
        const mock = {
            id: Date.now(),
            name,
            score: parseFloat(score),
            correct: parseInt(correct),
            wrong: parseInt(wrong),
            unattempted: parseInt(unattempted),
            date: new Date().toISOString().split('T')[0]
        };
        this.data.mockTests.push(mock);
        this.save();
    }

    calculateHealthScore() {
        let totalTopics = 0;
        let completedTopics = 0;
        for (const sub of Object.values(this.data.syllabus)) {
            totalTopics += sub.topics.length;
            completedTopics += sub.topics.filter(t => t.status === 'Completed').length;
        }
        const syllabusPercent = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
        
        const attempted = this.data.pyqAttempts.length;
        const correct = this.data.pyqAttempts.filter(p => p.status === 'Correct').length;
        const pyqAccuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
        
        const mocks = this.data.mockTests;
        const mockAvg = mocks.length > 0 ? mocks.reduce((sum, t) => sum + t.score, 0) / mocks.length : 0;
        
        const streakFactor = Math.min(100, (this.data.streak / 7) * 100);
        
        let score = 0;
        let weights = 0;
        
        score += syllabusPercent * 0.4;
        weights += 0.4;
        
        score += streakFactor * 0.1;
        weights += 0.1;
        
        if (attempted > 0) {
            score += pyqAccuracy * 0.3;
            weights += 0.3;
        }
        if (mocks.length > 0) {
            score += mockAvg * 0.2;
            weights += 0.2;
        }
        
        return Math.round(score / weights);
    }

    getExamRiskAnalysis() {
        const settings = this.data.settings;
        const examDate = new Date(settings.examDate);
        const today = new Date();
        const diffTime = examDate - today;
        const daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        
        let totalTopics = 0;
        let completedTopics = 0;
        for (const sub of Object.values(this.data.syllabus)) {
            totalTopics += sub.topics.length;
            completedTopics += sub.topics.filter(t => t.status === 'Completed').length;
        }
        const remainingTopics = totalTopics - completedTopics;
        
        // Est. hours needed: 3 hours per pending topic
        const hoursNeeded = remainingTopics * 3;
        const activeDaysFactor = settings.studyDays.length / 7;
        const studyDaysLeft = Math.max(1, Math.round(daysLeft * activeDaysFactor));
        const availableHours = studyDaysLeft * settings.dailyHours;

        let riskLevel = "LOW";
        let riskColor = "var(--status-success)";
        let explanation = "";

        if (hoursNeeded > availableHours) {
            riskLevel = "CRITICAL HIGH";
            riskColor = "var(--status-error)";
            const extraDaysNeeded = Math.ceil((hoursNeeded - availableHours) / settings.dailyHours);
            explanation = `At your current rate of ${settings.dailyHours}h/day, you will complete the syllabus ${extraDaysNeeded} days LATE (after the exam date!). Recommendation: Increase daily commitment to ${Math.ceil(hoursNeeded / studyDaysLeft)}h/day.`;
        } else if (availableHours - hoursNeeded < 50) {
            riskLevel = "MEDIUM";
            riskColor = "var(--status-warning)";
            const bufferDays = Math.round((availableHours - hoursNeeded) / settings.dailyHours);
            explanation = `Syllabus will be completed on track, but leaves a tight ${bufferDays} days buffer for revision and mock series. Minimize missed days.`;
        } else {
            riskLevel = "LOW";
            riskColor = "var(--status-success)";
            const bufferDays = Math.round((availableHours - hoursNeeded) / settings.dailyHours);
            explanation = `On track. Syllabus completion leaves a comfortable ${bufferDays} days buffer for revision, mock exams, and test series.`;
        }

        return {
            riskLevel,
            riskColor,
            explanation,
            daysLeft,
            hoursNeeded,
            availableHours,
            studyDaysLeft
        };
    }

    getMistakesList() {
        return this.data.pyqAttempts.filter(p => p.status === 'Wrong');
    }

    clearAllData() {
        this.data = this.createNewState();
        this.save();
    }
}

// Global DB instance
const db = new StudyTrackDb();
db.init();

window.db = db;
