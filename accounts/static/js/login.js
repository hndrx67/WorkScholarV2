// Form submission handler
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userRole = document.getElementById('user-role').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Form validation
    if (!username.trim()) {
        showError('username', 'Please enter your username or ID number');
        return;
    }
    
    if (!password.trim()) {
        showError('password', 'Please enter your password');
        return;
    }
    
    // In a real application, you would send these credentials to a server
    // For demo purposes, we'll redirect based on user role
    switch(userRole) {
        case 'student-fulltime':
            window.location.href = 'fulltime-dashboard.html';
            break;
        case 'student-working':
            window.location.href = 'working-dashboard.html';
            break;
        case 'supervisor':
            window.location.href = 'supervisor-dashboard.html';
            break;
        case 'director':
            window.location.href = 'director-dashboard.html';
            break;
        case 'admin':
            window.location.href = 'admin-dashboard.html';
            break;
        default:
            alert('Invalid user role');
    }
});

// Form validation helper
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const existingError = input.parentElement.querySelector('.error-message');
    
    // Remove existing error if any
    if (existingError) {
        existingError.remove();
    }
    
    // Create and add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#ff3860';
    errorDiv.style.fontSize = '14px';
    errorDiv.style.marginTop = '5px';
    errorDiv.textContent = message;
    
    input.parentElement.appendChild(errorDiv);
    
    // Highlight input
    input.style.borderColor = '#ff3860';
    
    // Reset after 3 seconds
    setTimeout(() => {
        errorDiv.remove();
        input.style.borderColor = '';
    }, 3000);
}

// Footer toggle functionality for mobile
document.getElementById('footerToggle').addEventListener('click', function() {
    const footer = document.getElementById('siteFooter');
    
    if (footer.classList.contains('footer-collapsed')) {
        footer.classList.remove('footer-collapsed');
        footer.classList.add('footer-expanded');
    } else {
        footer.classList.remove('footer-expanded');
        footer.classList.add('footer-collapsed');
    }
});

// Navigation dropdown functionality
const navDropdown = document.querySelector('.nav-dropdown');
const navDropdownToggle = document.querySelector('.nav-dropdown-toggle');

navDropdownToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    navDropdown.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', function() {
    navDropdown.classList.remove('active');
});

// Prevent dropdown from closing when clicking inside
document.querySelector('.nav-dropdown-menu').addEventListener('click', function(e) {
    e.stopPropagation();
});

// Automatically set footer state based on screen size
function setInitialFooterState() {
    const footer = document.getElementById('siteFooter');
    if (window.innerWidth <= 768) {
        footer.classList.add('footer-collapsed');
        footer.classList.remove('footer-expanded');
    } else {
        footer.classList.remove('footer-collapsed');
        footer.classList.add('footer-expanded');
    }
}

// Run on page load and resize
setInitialFooterState();
window.addEventListener('resize', setInitialFooterState);