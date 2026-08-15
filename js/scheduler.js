const scheduler = {
    generateTimetable: function() {
        const settings = db.data.settings;
        const examDate = new Date(settings.examDate);
        const today = new Date();
        
        // Calculate days between today and exam date
        const timeDiff = examDate - today;
        const totalDays = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
        
        // Find all pending topics (Not Started, Learning, Needs Revision)
        const pendingTopics = [];
        for (const [subId, subData] of Object.entries(db.data.syllabus)) {
            subData.topics.forEach(topic => {
                if (topic.status !== "Completed") {
                    pendingTopics.push({
                        subjectId: subId,
                        subjectName: subData.name,
                        topicId: topic.id,
                        topicName: topic.name
                    });
                }
            });
        }

        // List of dates from today until the exam date
        const activeDays = [];
        for (let i = 0; i < totalDays; i++) {
            const d = new Date();
            d.setDate(today.getDate() + i);
            const dayOfWeek = (d.getDay() === 0 ? 7 : d.getDay()).toString(); // 1=Mon, 7=Sun
            
            if (settings.studyDays.includes(dayOfWeek)) {
                activeDays.push(d.toISOString().split('T')[0]);
            }
        }

        if (activeDays.length === 0 || pendingTopics.length === 0) {
            db.data.timetable = [];
            db.save();
            return;
        }

        // Distribute topics among active study days
        // We will schedule them sequentially, mapping multiple topics per day if needed,
        // or spacing them out if we have plenty of days.
        const timetable = [];
        const topicsPerDay = Math.ceil(pendingTopics.length / activeDays.length);
        
        let topicIdx = 0;
        activeDays.forEach(dateStr => {
            // Schedule up to topicsPerDay for this day
            for (let i = 0; i < topicsPerDay && topicIdx < pendingTopics.length; i++) {
                const topic = pendingTopics[topicIdx++];
                timetable.push({
                    id: Date.now() + topicIdx,
                    date: dateStr,
                    subjectId: topic.subjectId,
                    subjectName: topic.subjectName,
                    topicId: topic.topicId,
                    topicName: topic.topicName,
                    completed: false,
                    duration: 45 // default minutes
                });
            }
        });

        db.data.timetable = timetable;
        db.save();
    },

    rebalanceTimetable: function() {
        if (!db.data.timetable) {
            this.generateTimetable();
            return;
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const timetable = db.data.timetable;
        
        // Find missed tasks (scheduled before today and not completed)
        const missedTasks = [];
        const completedTasks = [];
        const futureTasks = [];

        timetable.forEach(task => {
            if (task.date < todayStr) {
                if (task.completed) {
                    completedTasks.push(task);
                } else {
                    missedTasks.push(task);
                }
            } else {
                futureTasks.push(task);
            }
        });

        if (missedTasks.length === 0) {
            // No missed tasks, timetable is on track
            return;
        }

        // Get future study days (starting from today)
        const settings = db.data.settings;
        const examDate = new Date(settings.examDate);
        const today = new Date();
        const timeDiff = examDate - today;
        const totalDays = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));

        const activeDays = [];
        for (let i = 0; i < totalDays; i++) {
            const d = new Date();
            d.setDate(today.getDate() + i);
            const dayOfWeek = (d.getDay() === 0 ? 7 : d.getDay()).toString();
            if (settings.studyDays.includes(dayOfWeek)) {
                activeDays.push(d.toISOString().split('T')[0]);
            }
        }

        if (activeDays.length === 0) return;

        // Collect all tasks to reschedule (missed + future tasks)
        // Ensure completed tasks remain untouched in past dates log
        const tasksToSchedule = [...missedTasks.map(t => ({...t, completed: false})), ...futureTasks];
        
        // Clear old date assignments for tasks to reschedule
        const newTimetable = [...completedTasks];
        const tasksPerDay = Math.ceil(tasksToSchedule.length / activeDays.length);
        
        let taskIdx = 0;
        activeDays.forEach(dateStr => {
            for (let i = 0; i < tasksPerDay && taskIdx < tasksToSchedule.length; i++) {
                const task = tasksToSchedule[taskIdx++];
                task.date = dateStr;
                newTimetable.push(task);
            }
        });

        db.data.timetable = newTimetable;
        db.save();
    },

    getTodaysPlan: function() {
        const todayStr = new Date().toISOString().split('T')[0];
        if (!db.data.timetable) {
            this.generateTimetable();
        }
        return db.data.timetable.filter(task => task.date === todayStr);
    },

    toggleTaskCompletion: function(taskId) {
        const task = db.data.timetable.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            
            // Sync with syllabus completion status
            const sub = db.data.syllabus[task.subjectId];
            if (sub) {
                const topic = sub.topics.find(t => t.id === task.topicId);
                if (topic) {
                    topic.status = task.completed ? "Completed" : "Learning";
                    topic.confidence = task.completed ? 4 : 2; // Auto-update confidence rating
                    topic.mastery = db.calculateMastery(topic);
                }
            }
            
            db.save();
            this.rebalanceTimetable(); // Rebalance schedule based on completion change
        }
    }
};

window.scheduler = scheduler;
