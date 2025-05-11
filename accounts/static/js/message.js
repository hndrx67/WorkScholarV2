// messages.js - message dropdown functionality

document.addEventListener('DOMContentLoaded', function() {
    const messageBtn = document.querySelector('.message-btn');
    const messageDropdown = document.querySelector('.message-dropdown');
    const markAllReadBtn = document.querySelector('.mark-all-read');
    const messageItems = document.querySelectorAll('.message-item');
    const messageBadge = document.querySelector('.message-badge');
    
    // Function to update message count
    function updatemessageCount() {
        const unreadCount = document.querySelectorAll('.message-item.unread').length;
        
        if (unreadCount > 0) {
            messageBadge.textContent = unreadCount;
            messageBadge.style.display = 'flex';
        } else {
            messageBadge.style.display = 'none';
        }
    }
    
    // Toggle message dropdown
    messageBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        messageDropdown.classList.toggle('active');
        
        // Close other dropdowns if open
        document.querySelectorAll('.user-dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    });
    
    // Close message dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!messageDropdown.contains(e.target)) {
            messageDropdown.classList.remove('active');
        }
    });
    
    // Mark all messages as read
    markAllReadBtn.addEventListener('click', function() {
        messageItems.forEach(item => {
            item.classList.remove('unread');
        });
        updatemessageCount();
    });
    
    // Mark individual message as read when clicked
    messageItems.forEach(item => {
        item.addEventListener('click', function() {
            this.classList.remove('unread');
            updatemessageCount();
            
            // Implement navigation to the message content here
            const messageText = this.querySelector('.message-text p').textContent;
            console.log(`Navigating to message: ${messageText}`);
            
            // Close the dropdown after a short delay
            setTimeout(() => {
                messageDropdown.classList.remove('active');
            }, 200);
        });
    });
    
    // Initialize message count
    updatemessageCount();
    
    // Function to simulate new messages (for demo purposes)
    window.addNewmessage = function(title, time, icon = 'fa-bell') {
        const messageList = document.querySelector('.message-list');
        
        const newmessage = document.createElement('div');
        newmessage.className = 'message-item unread';
        
        newmessage.innerHTML = `
            <div class="message-icon"><i class="fas ${icon}"></i></div>
            <div class="message-text">
                <p>${title}</p>
                <span class="message-time">${time}</span>
            </div>
        `;
        
        // Add click handler
        newmessage.addEventListener('click', function() {
            this.classList.remove('unread');
            updatemessageCount();
            
            // Close the dropdown after a short delay
            setTimeout(() => {
                messageDropdown.classList.remove('active');
            }, 200);
        });
        
        // Add to the top of the list
        messageList.insertBefore(newmessage, messageList.firstChild);
        
        // Update count
        updatemessageCount();
        
        // Flash message icon
        messageBtn.classList.add('message-flash');
        setTimeout(() => {
            messageBtn.classList.remove('message-flash');
        }, 1000);
    };
    
    // Add responsive behavior for mobile view
    function handleResponsivemessages() {
        if (window.innerWidth <= 480) {
            // Create backdrop for mobile
            if (!document.querySelector('.message-backdrop')) {
                const backdrop = document.createElement('div');
                backdrop.className = 'message-backdrop';
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
                
                // Close messages when backdrop is clicked
                backdrop.addEventListener('click', function() {
                    messageDropdown.classList.remove('active');
                    this.style.display = 'none';
                });
            }
            
            // Show backdrop when messages are opened
            messageBtn.addEventListener('click', function() {
                const backdrop = document.querySelector('.message-backdrop');
                if (messageDropdown.classList.contains('active')) {
                    backdrop.style.display = 'block';
                } else {
                    backdrop.style.display = 'none';
                }
            });
        }
    }
    
    // Call once on load and add resize listener
    handleResponsivemessages();
    window.addEventListener('resize', handleResponsivemessages);
});