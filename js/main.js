document.addEventListener('DOMContentLoaded', () => {
    // Navigation Items
    const navItems = [
        { id: 'dashboard', name: 'Dashboard', icon: 'layout-dashboard', path: '/' },
        { id: 'subjects', name: 'Subjects', icon: 'book', path: '/subjects' },
        { id: 'pyqs', name: 'PYQs', icon: 'file-text', path: '/pyqs' },
        { id: 'session', name: 'Study Session', icon: 'clock', path: '/session' },
        { id: 'mocks', name: 'Mock Tests', icon: 'check-circle', path: '/mocks' },
        { id: 'analytics', name: 'Analytics', icon: 'bar-chart-2', path: '/analytics' },
        { id: 'revision', name: 'Revision', icon: 'repeat', path: '/revision' },
        { id: 'mistakes', name: 'Mistake Bank', icon: 'alert-octagon', path: '/mistakes' },
        { id: 'settings', name: 'Settings', icon: 'settings', path: '/settings' }
    ];

    const sidebarNav = document.getElementById('sidebar-nav');
    
    // Generate Sidebar Links
    navItems.forEach(item => {
        const link = document.createElement('a');
        link.className = 'nav-item';
        link.href = '#' + item.path;
        link.innerHTML = `
            <i data-lucide="${item.icon}"></i>
            <span>${item.name}</span>
        `;
        sidebarNav.appendChild(link);
    });

    // Quick Start Navigation
    document.getElementById('quick-start-btn').addEventListener('click', () => {
        router.navigate('/session');
    });

    // Function to update sidebar stats dynamically
    window.updateSidebarStats = function() {
        const streakEl = document.querySelector('.streak-value');
        if (streakEl) {
            streakEl.textContent = `${db.data.streak} Day Streak`;
        }

        const targetEl = document.querySelector('.target-value');
        if (targetEl) {
            targetEl.textContent = `GATE ${new Date(db.data.settings.examDate).getFullYear()}`;
        }
        
        // Dynamic greeting & date
        const greetingTitle = document.getElementById('greeting-title');
        const currentDate = document.getElementById('current-date');
        
        if (greetingTitle && currentDate) {
            const now = new Date();
            const hours = now.getHours();
            let greeting = "Good morning";
            if (hours >= 12 && hours < 17) greeting = "Good afternoon";
            else if (hours >= 17) greeting = "Good evening";
            
            greetingTitle.innerHTML = `${greeting}, Hari <span class="wave">👋</span>`;
            
            const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
            currentDate.textContent = now.toLocaleDateString('en-US', options);
        }
    };

    // Initialize lucide icons
    lucide.createIcons();
    
    // Initial stats update
    updateSidebarStats();
    
    // Initialize Router
    router.init();
});
