// notifications.js - Notification dropdown functionality

document.addEventListener('DOMContentLoaded', function() {
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationDropdown = document.querySelector('.notification-dropdown');
    const markAllReadBtn = document.querySelector('.mark-all-read');
    const notificationItems = document.querySelectorAll('.notification-item');
    const notificationBadge = document.querySelector('.notification-badge');
    
    // Function to update notification count
    function updateNotificationCount() {
        const unreadCount = document.querySelectorAll('.notification-item.unread').length;
        
        if (unreadCount > 0) {
            notificationBadge.textContent = unreadCount;
            notificationBadge.style.display = 'flex';
        } else {
            notificationBadge.style.display = 'none';
        }
    }
    
    // Toggle notification dropdown
    notificationBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        notificationDropdown.classList.toggle('active');
        
        // Close other dropdowns if open
        document.querySelectorAll('.user-dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    });
    
    // Close notification dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!notificationDropdown.contains(e.target)) {
            notificationDropdown.classList.remove('active');
        }
    });
    
    // Mark all notifications as read
    markAllReadBtn.addEventListener('click', function() {
        notificationItems.forEach(item => {
            item.classList.remove('unread');
        });
        updateNotificationCount();
    });
    
    // Mark individual notification as read when clicked
    notificationItems.forEach(item => {
        item.addEventListener('click', function() {
            this.classList.remove('unread');
            updateNotificationCount();
            
            // Implement navigation to the notification content here
            const notificationText = this.querySelector('.notification-text p').textContent;
            console.log(`Navigating to notification: ${notificationText}`);
            
            // Close the dropdown after a short delay
            setTimeout(() => {
                notificationDropdown.classList.remove('active');
            }, 200);
        });
    });
    
    // Initialize notification count
    updateNotificationCount();
    
    // Function to simulate new notifications (for demo purposes)
    window.addNewNotification = function(title, time, icon = 'fa-bell') {
        const notificationList = document.querySelector('.notification-list');
        
        const newNotification = document.createElement('div');
        newNotification.className = 'notification-item unread';
        
        newNotification.innerHTML = `
            <div class="notification-icon"><i class="fas ${icon}"></i></div>
            <div class="notification-text">
                <p>${title}</p>
                <span class="notification-time">${time}</span>
            </div>
        `;
        
        // Add click handler
        newNotification.addEventListener('click', function() {
            this.classList.remove('unread');
            updateNotificationCount();
            
            // Close the dropdown after a short delay
            setTimeout(() => {
                notificationDropdown.classList.remove('active');
            }, 200);
        });
        
        // Add to the top of the list
        notificationList.insertBefore(newNotification, notificationList.firstChild);
        
        // Update count
        updateNotificationCount();
        
        // Flash notification icon
        notificationBtn.classList.add('notification-flash');
        setTimeout(() => {
            notificationBtn.classList.remove('notification-flash');
        }, 1000);
    };
    
    // Add responsive behavior for mobile view
    function handleResponsiveNotifications() {
        if (window.innerWidth <= 480) {
            // Create backdrop for mobile
            if (!document.querySelector('.notification-backdrop')) {
                const backdrop = document.createElement('div');
                backdrop.className = 'notification-backdrop';
                backdrop.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 998;
                    display: none;
                `;
                
                document.body.appendChild(backdrop);
                
                // Close notifications when backdrop is clicked
                backdrop.addEventListener('click', function() {
                    notificationDropdown.classList.remove('active');
                    this.style.display = 'none';
                });
            }
            
            // Show backdrop when notifications are opened
            notificationBtn.addEventListener('click', function() {
                const backdrop = document.querySelector('.notification-backdrop');
                if (notificationDropdown.classList.contains('active')) {
                    backdrop.style.display = 'block';
                } else {
                    backdrop.style.display = 'none';
                }
            });
        }
    }
    
    // Call once on load and add resize listener
    handleResponsiveNotifications();
    window.addEventListener('resize', handleResponsiveNotifications);
});