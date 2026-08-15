const RevisionPage = {
    render: function() {
        const queue = db.data.revisionQueue;

        const todayItems = queue.filter(r => r.timeframe === 'Today');
        const weekItems = queue.filter(r => r.timeframe === 'This Week');

        // Dynamic checks for topics that haven't been studied recently or have low confidence
        // and inject them as recommendations on the fly!
        const autoRecs = [];
        for (const [subId, subData] of Object.entries(db.data.syllabus)) {
            subData.topics.forEach(t => {
                if (t.confidence > 0 && t.confidence <= 2 && t.status !== 'Completed') {
                    // Check if already in revision queue
                    const alreadyQueued = queue.some(r => r.subjectId === subId && r.topicId === t.id);
                    if (!alreadyQueued) {
                        autoRecs.push({
                            subjectId: subId,
                            subjectName: subData.name,
                            topicName: t.name,
                            origin: "Low Confidence",
                            timeframe: "This Week"
                        });
                    }
                }
            });
        }

        const renderRevisionRow = (r, isDbItem = true) => {
            const subName = db.data.syllabus[r.subjectId]?.name || r.subjectId;
            const topicName = r.topicName || db.data.syllabus[r.subjectId]?.topics.find(t => t.id === r.topicId)?.name || r.topicId;
            
            return `
                <div class="task-item">
                    <div class="task-info">
                        <div class="custom-checkbox" onclick="${isDbItem ? `RevisionPage.completeRevision(${r.id})` : `RevisionPage.addToDbQueue('${r.subjectId}', '${r.topicId || r.topicName}', '${r.origin}')`}">
                            <i data-lucide="check"></i>
                        </div>
                        <div>
                            <span class="task-subject">${subName}</span>
                            <div class="task-topic">${topicName} <span class="text-secondary text-xs">(${r.origin})</span></div>
                        </div>
                    </div>
                    <button class="btn btn-secondary text-sm" onclick="DashboardPage.quickStartSession('${r.subjectId}', '${topicName}', 'Revision')">Revise</button>
                </div>
            `;
        };

        return `
            <div class="revision-page">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-semibold">Revision Queue</h2>
                    <button class="btn btn-primary" onclick="RevisionPage.startFirstRevision()">
                        <i data-lucide="play"></i> Start Revision Session
                    </button>
                </div>

                <div class="card mb-6" style="background: var(--status-warning-bg); border-color: rgba(212,149,36,0.3);">
                    <h3 class="font-medium mb-1" style="color:var(--status-warning);">Auto-generated Revision Queues</h3>
                    <p class="text-xs">Topics are automatically pushed here when answers are incorrect in the PYQ Arena, confidence ratings drop, or mock-test weakness limits are exceeded.</p>
                </div>

                <div class="grid grid-cols-2">
                    <!-- Revision list -->
                    <div>
                        <h3 class="font-semibold text-base text-secondary mb-4">Today's Focus Revision (${todayItems.length})</h3>
                        <div class="task-list mb-6">
                            ${todayItems.length > 0 ? todayItems.map(r => renderRevisionRow(r)).join('') : '<p class="text-secondary text-sm p-4 text-center">No revision tasks scheduled for today.</p>'}
                        </div>

                        <h3 class="font-semibold text-base text-secondary mb-4">Scheduled for This Week (${weekItems.length})</h3>
                        <div class="task-list">
                            ${weekItems.length > 0 ? weekItems.map(r => renderRevisionRow(r)).join('') : '<p class="text-secondary text-sm p-4 text-center">No weekly scheduled revision.</p>'}
                        </div>
                    </div>

                    <!-- Recommended system triggers -->
                    <div class="card">
                        <h3 class="font-semibold text-base mb-4"><i data-lucide="sparkles" style="color:var(--status-warning); width:16px; height:16px; vertical-align:-2px; display:inline-block;"></i> Recommended Revisions</h3>
                        <p class="text-secondary text-xs mb-4">System-identified low-confidence components recommended for active review:</p>
                        
                        <div class="task-list">
                            ${autoRecs.length > 0 ? autoRecs.map(r => renderRevisionRow(r, false)).join('') : '<p class="text-secondary text-sm p-4 text-center">All active syllabus components show robust confidence levels.</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    completeRevision: function(id) {
        db.completeRevision(id);
        router.handleRoute();
    },

    addToDbQueue: function(subId, topicName, origin) {
        const sub = db.data.syllabus[subId];
        if (sub) {
            const topic = sub.topics.find(t => t.name.toLowerCase() === topicName.toLowerCase() || t.id === topicName);
            if (topic) {
                db.addToRevision(subId, topic.id, origin);
                router.handleRoute();
            }
        }
    },

    startFirstRevision: function() {
        const queue = db.data.revisionQueue;
        if (queue.length > 0) {
            const r = queue[0];
            const topicName = r.topicName || db.data.syllabus[r.subjectId]?.topics.find(t => t.id === r.topicId)?.name || r.topicId;
            DashboardPage.quickStartSession(r.subjectId, topicName, 'Revision');
        } else {
            alert("No tasks currently in the revision queue.");
        }
    }
};

window.RevisionPage = RevisionPage;
