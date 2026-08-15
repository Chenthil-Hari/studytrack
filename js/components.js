// Utility functions for UI components

function createBadge(text, type) {
    let className = 'badge-tag';
    if (type === 'error' || type === 'High' || type === 'Wrong') className += ' badge-red';
    else if (type === 'warning' || type === 'Medium' || type === 'Skipped' || type === 'Needs Revision' || type === 'Learning') className += ' badge-orange';
    else if (type === 'success' || type === 'Completed' || type === 'Correct' || type === 'Official') className += ' badge-green';
    
    return `<span class="${className}">${text}</span>`;
}

function createProgressBar(percentage) {
    return `
        <div class="progress-bg">
            <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
    `;
}

function createTaskItem(task) {
    const checkedClass = task.completed ? 'checked' : '';
    return `
        <div class="task-item">
            <div class="task-info">
                <div class="custom-checkbox ${checkedClass}" onclick="toggleTask(${task.id}, this)">
                    <i data-lucide="check"></i>
                </div>
                <div>
                    <div class="task-subject">${task.subject}</div>
                    <div class="task-topic">${task.topic}</div>
                </div>
            </div>
            <div class="task-duration">
                <i data-lucide="clock" style="width:12px; height:12px; display:inline-block; vertical-align:-1px;"></i> ${task.duration} min
            </div>
        </div>
    `;
}

window.toggleTask = function(taskId, el) {
    // Call scheduler toggler which handles syllabus sync & rebalance
    if (window.scheduler) {
        scheduler.toggleTaskCompletion(taskId);
        if (window.router) {
            window.router.handleRoute();
        }
    }
};

function createWeakTopicCard(topic) {
    return `
        <div class="task-item" style="padding: 1rem;">
            <div>
                <div style="display:flex; align-items:center; gap: 0.5rem; margin-bottom: 0.25rem;">
                    ${createBadge(topic.priority, topic.priority)}
                    <span class="text-sm font-medium">${topic.subject} — ${topic.topic}</span>
                </div>
                <div class="text-secondary text-sm" style="display:flex; gap: 1rem;">
                    <span>Accuracy: ${topic.accuracy}%</span>
                    <span>Attempts: ${topic.attempts}</span>
                    <span>Last: ${topic.lastStudied}</span>
                </div>
            </div>
            <button class="btn btn-secondary text-sm">Revise Now</button>
        </div>
    `;
}
