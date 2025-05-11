// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Navigation and section visibility
    const menuItems = document.querySelectorAll('.menu li');
    const sections = document.querySelectorAll('.content-section');
    
    // Modal elements
    const modal = document.getElementById('notification-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalOk = document.getElementById('modal-ok');
    const closeModal = document.querySelector('.close-modal');
    
    // Forms
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const notificationForm = document.getElementById('notification-form');
    
    // Buttons
    const updateProfileBtn = document.getElementById('update-profile');
    const changePasswordBtn = document.getElementById('change-password');
    const saveNotificationsBtn = document.getElementById('save-notifications');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Unit filters
    const unitFilters = document.querySelectorAll('.unit-filters button');
    const unitCards = document.querySelectorAll('.unit-card');
    
    // Password strength
    const newPassword = document.getElementById('new-password');
    const strengthIndicator = document.getElementById('strength-indicator');
    const strengthText = document.getElementById('strength-text');

    // Handle navigation menu clicks
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.querySelector('a').getAttribute('href');
            
            // Update active menu item
            menuItems.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === target.substring(1)) {
                    section.classList.add('active');
                }
            });
        });
    });

    // Handle unit filters
    unitFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter');
            
            // Update active filter
            unitFilters.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter unit cards
            unitCards.forEach(card => {
                if (filterType === 'all' || card.classList.contains(filterType)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Handle profile update
    updateProfileBtn.addEventListener('click', function() {
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        // Validation
        if (!firstName || !lastName || !email) {
            showModal('Error', 'Please fill in all required fields.');
            return;
        }
        
        // Email validation
        if (!isValidEmail(email)) {
            showModal('Error', 'Please enter a valid email address.');
            return;
        }
        
        // Update display name
        document.getElementById('user-name').textContent = `${firstName} ${lastName}`;
        document.getElementById('display-name').textContent = `${firstName} ${lastName}`;
        
        showModal('Success', 'Profile updated successfully.');
    });

    // Handle password change
    changePasswordBtn.addEventListener('click', function() {
        const currentPassword = document.getElementById('current-password').value;
        const newPasswordValue = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validation
        if (!currentPassword || !newPasswordValue || !confirmPassword) {
            showModal('Error', 'Please fill in all password fields.');
            return;
        }
        
        // Password match validation
        if (newPasswordValue !== confirmPassword) {
            showModal('Error', 'New password and confirmation do not match.');
            return;
        }
        
        // Password strength validation
        const strength = checkPasswordStrength(newPasswordValue);
        if (strength < 2) {
            showModal('Error', 'Password is too weak. Please choose a stronger password.');
            return;
        }
        
        // Reset password fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        strengthIndicator.style.width = '0%';
        strengthText.textContent = 'Password strength';
        
        showModal('Success', 'Password changed successfully.');
    });

    // Handle notification preferences
    saveNotificationsBtn.addEventListener('click', function() {
        showModal('Success', 'Notification preferences saved successfully.');
    });

    // Handle logout
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showModal('Logout', 'You have been logged out successfully. Click OK to redirect to login page.');
        modalOk.addEventListener('click', function() {
            // In a real application, redirect to login page
            window.location.href = '#';
        }, { once: true });
    });

    // Password strength meter
    if (newPassword) {
        newPassword.addEventListener('input', function() {
            const password = this.value;
            const strength = checkPasswordStrength(password);
            
            // Update strength indicator
            switch(strength) {
                case 0:
                    strengthIndicator.style.width = '0%';
                    strengthIndicator.style.backgroundColor = 'var(--danger-color)';
                    strengthText.textContent = 'Password strength: Empty';
                    break;
                case 1:
                    strengthIndicator.style.width = '25%';
                    strengthIndicator.style.backgroundColor = 'var(--danger-color)';
                    strengthText.textContent = 'Password strength: Weak';
                    break;
                case 2:
                    strengthIndicator.style.width = '50%';
                    strengthIndicator.style.backgroundColor = 'var(--warning-color)';
                    strengthText.textContent = 'Password strength: Moderate';
                    break;
                case 3:
                    strengthIndicator.style.width = '75%';
                    strengthIndicator.style.backgroundColor = 'var(--secondary-color)';
                    strengthText.textContent = 'Password strength: Strong';
                    break;
                case 4:
                    strengthIndicator.style.width = '100%';
                    strengthIndicator.style.backgroundColor = 'var(--secondary-color)';
                    strengthText.textContent = 'Password strength: Very Strong';
                    break;
            }
        });
    }

    // Calculate total work experience
    calculateTotalExperience();

    // Modal functions
    function showModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.style.display = 'flex';
    }

    function closeModalFunc() {
        modal.style.display = 'none';
    }

    modalOk.addEventListener('click', closeModalFunc);
    closeModal.addEventListener('click', closeModalFunc);
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModalFunc();
        }
    });

    // Utility functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function checkPasswordStrength(password) {
        if (!password) return 0;
        
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength += 1;
        
        // Contains lowercase
        if (/[a-z]/.test(password)) strength += 1;
        
        // Contains uppercase
        if (/[A-Z]/.test(password)) strength += 1;
        
        // Contains number
        if (/[0-9]/.test(password)) strength += 1;
        
        // Contains special character
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        return Math.min(4, Math.floor(strength / 1.25));
    }

    function calculateTotalExperience() {
        // Get all timeline items
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        // Calculate total experience in months
        let totalMonths = 0;
        
        timelineItems.forEach(item => {
            // Get the duration text
            const durationText = item.querySelector('.duration').textContent;
            
            // Parse years and months
            const yearsMatch = durationText.match(/(\d+) years?/);
            const monthsMatch = durationText.match(/(\d+) months?/);
            
            const years = yearsMatch ? parseInt(yearsMatch[1]) : 0;
            const months = monthsMatch ? parseInt(monthsMatch[1]) : 0;
            
            totalMonths += (years * 12) + months;
        });
        
        // Convert months to years and months
        const totalYears = Math.floor(totalMonths / 12);
        const remainingMonths = totalMonths % 12;
        
        // Update the total experience text
        const expText = totalYears > 0 ? 
            `${totalYears} year${totalYears !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : 
            `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
        
        document.getElementById('total-experience').textContent = expText;
    }

    // Function to handle hash in URL for direct navigation
    function handleHashChange() {
        const hash = window.location.hash;
        if (hash) {
            const targetMenuItem = document.querySelector(`.menu li a[href="${hash}"]`);
            if (targetMenuItem) {
                targetMenuItem.parentElement.click();
            }
        }
    }

    // Handle hash on page load
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
});