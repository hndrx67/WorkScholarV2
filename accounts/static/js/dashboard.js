// dashboard.js - Common dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle functionality
    const openSidebarBtn = document.getElementById('open-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    
    if (openSidebarBtn) {
        openSidebarBtn.addEventListener('click', function() {
            sidebar.classList.add('active');
        });
    }
    
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', function() {
            sidebar.classList.remove('active');
        });
    }
    
    // Handle dropdown menu toggle
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    
    if (dropdownBtn && dropdownContent) {
        dropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownContent.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdownBtn.contains(e.target)) {
                if (dropdownContent.classList.contains('show')) {
                    dropdownContent.classList.remove('show');
                }
            }
        });
    }
    
    // Navigation active state
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(item => {
                item.parentElement.classList.remove('active');
            });
            this.parentElement.classList.add('active');
        });
    });
    
    // Set user information from localStorage (would be set at login in a real app)
    const userRole = localStorage.getItem('userRole') || 'Full-time Student';
    const userName = localStorage.getItem('userName') || 'John Doe';
    
    const userNameElements = document.querySelectorAll('#user-name, #dropdown-username');
    const userRoleElements = document.querySelectorAll('#user-role');
    
    userNameElements.forEach(element => {
        if (element) element.textContent = userName;
    });
    
    userRoleElements.forEach(element => {
        if (element) element.textContent = userRole;
    });
    
    // Load dynamic content based on current page
    loadPageContent();

    // Message auto-dismiss
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
        setTimeout(() => {
            message.style.transform = 'translateX(100%)';
            message.style.opacity = '0';
            setTimeout(() => message.remove(), 300);
        }, 5000);
    });

    // CSRF token handling for AJAX requests
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    // Timesheet approval handling
    window.approveTimesheet = async function(timesheetId) {
        if (!confirm('Are you sure you want to approve this timesheet?')) {
            return;
        }

        try {
            const response = await fetch(`/timesheet/${timesheetId}/approve/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (response.ok) {
                // Update UI
                const timesheetElement = document.querySelector(`[data-timesheet-id="${timesheetId}"]`);
                if (timesheetElement) {
                    timesheetElement.remove();
                }
                
                // Update pending count
                const pendingBadge = document.querySelector('.notifications .badge');
                if (pendingBadge) {
                    const currentCount = parseInt(pendingBadge.textContent);
                    pendingBadge.textContent = currentCount - 1;
                }
                
                // Show success message
                showNotification('Timesheet approved successfully', 'success');
                
                // Update stats if they exist
                updateDashboardStats(data);
            } else {
                throw new Error(data.error || 'Failed to approve timesheet');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    // Timesheet rejection handling
    window.rejectTimesheet = async function(timesheetId) {
        const reason = prompt('Please enter a reason for rejecting this timesheet:');
        if (!reason) {
            return;
        }

        try {
            const response = await fetch(`/timesheet/${timesheetId}/reject/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });

            const data = await response.json();
            
            if (response.ok) {
                // Update UI
                const timesheetElement = document.querySelector(`[data-timesheet-id="${timesheetId}"]`);
                if (timesheetElement) {
                    timesheetElement.remove();
                }
                
                // Update pending count
                const pendingBadge = document.querySelector('.notifications .badge');
                if (pendingBadge) {
                    const currentCount = parseInt(pendingBadge.textContent);
                    pendingBadge.textContent = currentCount - 1;
                }
                
                // Show success message
                showNotification('Timesheet rejected successfully', 'success');
            } else {
                throw new Error(data.error || 'Failed to reject timesheet');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    // Helper function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `message ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Helper function to update dashboard statistics
    function updateDashboardStats(data) {
        if (data.total_hours !== undefined) {
            const totalHoursElement = document.querySelector('.total-hours');
            if (totalHoursElement) {
                totalHoursElement.textContent = data.total_hours.toFixed(2);
            }
        }
    }

    // Navigation handling
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                navLinks.forEach(l => l.parentElement.classList.remove('active'));
                this.parentElement.classList.add('active');
            }
        });
    });

    // Profile dropdown
    const profileDropdown = document.querySelector('.profile-dropdown');
    if (profileDropdown) {
        profileDropdown.addEventListener('click', function(e) {
            this.classList.toggle('active');
            e.stopPropagation();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });
    }

    // Quick actions handling
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!this.getAttribute('href')) {
                e.preventDefault();
                const action = this.dataset.action;
                
                switch(action) {
                    case 'generate-report':
                        alert('Report generation functionality will be implemented soon.');
                        break;
                    case 'send-announcement':
                        alert('Announcement system will be implemented soon.');
                        break;
                    case 'system-settings':
                        alert('Settings panel will be implemented soon.');
                        break;
                }
            }
        });
    });

    // Notifications handling
    const notificationsBell = document.querySelector('.notifications');
    if (notificationsBell) {
        notificationsBell.addEventListener('click', function() {
            // TODO: Implement notifications panel
            alert('Notifications panel will be implemented soon.');
        });
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            // TODO: Implement search functionality
            console.log('Search query:', e.target.value);
        });
    }

    // Mobile responsive handling
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.toggle-btn');
    const closeSidebarBtn = document.querySelector('.close-sidebar');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.add('active');
        });
    }

    if (closeSidebarBtn && sidebar) {
        closeSidebarBtn.addEventListener('click', function() {
            sidebar.classList.remove('active');
        });
    }

    // Add hover effect for stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Initialize any charts or data visualizations here if needed
    // TODO: Add chart initialization code when implementing dashboard analytics
});

function loadPageContent() {
    // Get current page from URL or default to dashboard
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
    const mainContent = document.getElementById('main-content');
    const pageTitle = document.getElementById('page-title');
    
    if (!mainContent) return;
    
    // Set page title
    if (pageTitle) {
        pageTitle.textContent = currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('-', ' ');
    }
    
    // In a real application, you would load content based on the current page
    // For demo purposes, we'll just simulate loading the dashboard content
    if (currentPage === 'dashboard') {
        loadDashboardContent();
    }
}

function loadDashboardContent() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    // Get user role from localStorage
    const userRole = localStorage.getItem('userRole') || 'Full-time Student';
    
    // Create dashboard content based on user role
    let dashboardHTML = '';
    
    // Common stats section
    dashboardHTML += `
        <div class="stats-cards">
            <div class="stat-card">
                <div class="stat-icon blue">
                    <i class="fas fa-book"></i>
                </div>
                <div class="stat-info">
                    <h3>5</h3>
                                        <p>Current Courses</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="stat-info">
                    <h3>${userRole.includes('Working') ? '15' : '0'}</h3>
                    <p>Work Hours This Week</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange">
                    <i class="fas fa-tasks"></i>
                </div>
                <div class="stat-info">
                    <h3>3</h3>
                    <p>Pending Assignments</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon purple">
                    <i class="fas fa-graduation-cap"></i>
                </div>
                <div class="stat-info">
                    <h3>3.75</h3>
                    <p>Current GPA</p>
                </div>
            </div>
        </div>
    `;

    // Add role-specific sections
    if (userRole.includes('Working')) {
        dashboardHTML += `
            <div class="dashboard-section">
                <h2 class="section-title">Work Schedule</h2>
                <div class="work-schedule">
                    <div class="schedule-calendar">
                        <!-- Calendar would be implemented here -->
                        <div class="calendar-placeholder">Work Calendar View</div>
                    </div>
                    <div class="upcoming-shifts">
                        <h3>Upcoming Shifts</h3>
                        <ul class="shift-list">
                            <li>
                                <span class="shift-day">Monday</span>
                                <span class="shift-time">2:00 PM - 5:00 PM</span>
                                <span class="shift-location">Campus Library</span>
                            </li>
                            <li>
                                <span class="shift-day">Wednesday</span>
                                <span class="shift-time">9:00 AM - 12:00 PM</span>
                                <span class="shift-location">IT Help Desk</span>
                            </li>
                            <li>
                                <span class="shift-day">Friday</span>
                                <span class="shift-time">1:00 PM - 4:00 PM</span>
                                <span class="shift-location">Admin Office</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    // Add academic section for all users
    dashboardHTML += `
        <div class="dashboard-section">
            <h2 class="section-title">Academic Overview</h2>
            <div class="academic-overview">
                <div class="course-progress">
                    <h3>Course Progress</h3>
                    <div class="progress-bars">
                        <div class="progress-item">
                            <div class="progress-title">CS 301 - Data Structures</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%"></div>
                            </div>
                            <div class="progress-percent">75%</div>
                        </div>
                        <div class="progress-item">
                            <div class="progress-title">MATH 245 - Linear Algebra</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 60%"></div>
                            </div>
                            <div class="progress-percent">60%</div>
                        </div>
                        <div class="progress-item">
                            <div class="progress-title">ENG 220 - Technical Writing</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 90%"></div>
                            </div>
                            <div class="progress-percent">90%</div>
                        </div>
                    </div>
                </div>
                <div class="upcoming-deadlines">
                    <h3>Upcoming Deadlines</h3>
                    <ul class="deadline-list">
                        <li>
                            <span class="deadline-date">Apr 20</span>
                            <span class="deadline-course">CS 301</span>
                            <span class="deadline-task">Algorithm Project</span>
                        </li>
                        <li>
                            <span class="deadline-date">Apr 22</span>
                            <span class="deadline-course">MATH 245</span>
                            <span class="deadline-task">Chapter 5 Exercises</span>
                        </li>
                        <li>
                            <span class="deadline-date">Apr 25</span>
                            <span class="deadline-course">ENG 220</span>
                            <span class="deadline-task">Research Paper Draft</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    // Add admin section if user is admin
    if (userRole.includes('Admin')) {
        dashboardHTML += `
            <div class="dashboard-section">
                <h2 class="section-title">Administration</h2>
                <div class="admin-actions">
                    <div class="admin-card" onclick="navigateTo('manage-users')">
                        <i class="fas fa-users"></i>
                        <h3>Manage Users</h3>
                    </div>
                    <div class="admin-card" onclick="navigateTo('work-assignments')">
                        <i class="fas fa-briefcase"></i>
                        <h3>Work Assignments</h3>
                    </div>
                    <div class="admin-card" onclick="navigateTo('reports')">
                        <i class="fas fa-chart-bar"></i>
                        <h3>Generate Reports</h3>
                    </div>
                    <div class="admin-card" onclick="navigateTo('system-settings')">
                        <i class="fas fa-cog"></i>
                        <h3>System Settings</h3>
                    </div>
                </div>
            </div>
        `;
    }

    // Add announcements section
    dashboardHTML += `
        <div class="dashboard-section">
            <h2 class="section-title">Announcements</h2>
            <div class="announcements">
                <div class="announcement-card">
                    <div class="announcement-date">Apr 15, 2025</div>
                    <h3 class="announcement-title">Midterm Exam Schedule</h3>
                    <p class="announcement-content">The midterm exam schedule has been posted. Please check your student portal for your individual exam times and locations.</p>
                </div>
                <div class="announcement-card">
                    <div class="announcement-date">Apr 10, 2025</div>
                    <h3 class="announcement-title">Library Extended Hours</h3>
                    <p class="announcement-content">During finals week, the library will be open 24 hours. Please bring your student ID for access after midnight.</p>
                </div>
                ${userRole.includes('Working') ? `
                <div class="announcement-card">
                    <div class="announcement-date">Apr 5, 2025</div>
                    <h3 class="announcement-title">Work Study Payroll Update</h3>
                    <p class="announcement-content">All working students must submit their timesheets by Friday at 5pm to ensure timely payment.</p>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    mainContent.innerHTML = dashboardHTML;

    // Initialize any dashboard-specific functionality
    initDashboardFeatures();
}

function initDashboardFeatures() {
    // Initialize tooltips
    const tooltipElems = document.querySelectorAll('.tooltip-trigger');
    tooltipElems.forEach(elem => {
        elem.addEventListener('mouseenter', showTooltip);
        elem.addEventListener('mouseleave', hideTooltip);
    });

    // Initialize click handlers for admin cards
    const adminCards = document.querySelectorAll('.admin-card');
    adminCards.forEach(card => {
        card.addEventListener('click', function() {
            const target = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            navigateTo(target);
        });
    });
}

function showTooltip(e) {
    const tooltipText = e.target.dataset.tooltip;
    if (!tooltipText) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;
    
    document.body.appendChild(tooltip);
    positionTooltip(e.target, tooltip);
}

function positionTooltip(element, tooltip) {
    const rect = element.getBoundingClientRect();
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
    tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) tooltip.remove();
}

function navigateTo(page) {
    // In a real app, this would load the appropriate page
    console.log(`Navigating to ${page}`);
    // window.location.href = `${page}.html`;
}

// Export for Node.js environment if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadPageContent,
        loadDashboardContent,
        initDashboardFeatures
    };
}