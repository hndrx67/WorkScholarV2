document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle Functionality
    const themeSwitch = document.getElementById('theme-switch');
    
    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme)) {
        document.body.classList.add('dark-theme');
        themeSwitch.checked = true;
    }
    
    // Toggle theme when switch is clicked
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Tab Functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');
            
            // Save active tab to session storage
            sessionStorage.setItem('activeTab', tabName);
        });
    });
    
    // Restore active tab from session storage
    const activeTab = sessionStorage.getItem('activeTab');
    if (activeTab) {
        document.querySelector(`.tab-btn[data-tab="${activeTab}"]`).click();
    }
    
    // Profile Picture Upload
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarPreview = document.getElementById('avatar-preview');
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    
    changeAvatarBtn.addEventListener('click', function() {
        avatarUpload.click();
    });
    
    avatarUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Create image element
                const img = document.createElement('img');
                img.src = e.target.result;
                
                // Clear avatar preview and add new image
                avatarPreview.innerHTML = '';
                avatarPreview.appendChild(img);
                
                // Store image data in local storage
                localStorage.setItem('profileImage', e.target.result);
            }
            
            reader.readAsDataURL(file);
        }
    });
    
    // Load profile image from local storage if available
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
        const img = document.createElement('img');
        img.src = savedProfileImage;
        avatarPreview.innerHTML = '';
        avatarPreview.appendChild(img);
    }
    
    // Form handling
    const settingsForm = document.getElementById('settings-form');
    const saveBtn = document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-btn');
    const successModal = document.getElementById('success-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
    
    // Load saved form data
    loadFormData();
    
    // Update display name when first or last name changes
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const displayName = document.getElementById('display-name');
    
    [firstNameInput, lastNameInput].forEach(input => {
        input.addEventListener('input', updateDisplayName);
    });
    
    function updateDisplayName() {
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        
        if (firstName || lastName) {
            displayName.textContent = `${firstName} ${lastName}`.trim();
        } else {
            displayName.textContent = 'Student Name';
        }
    }
    
    // Save button functionality
    saveBtn.addEventListener('click', function() {
        saveFormData();
        
        // Show success modal
        successModal.style.display = 'flex';
    });
    
    // Reset button functionality
    resetBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all changes?')) {
            settingsForm.reset();
            loadFormData(); // Reload last saved data
            updateDisplayName();
        }
    });
    
    // Close modal functionality
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            successModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === successModal) {
            successModal.style.display = 'none';
        }
    });
    
    // Save form data to local storage
    function saveFormData() {
        const formData = {};
        
        // Get all form inputs
        const inputs = settingsForm.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            const name = input.name;
            
            if (!name) return;
            
            if (input.type === 'checkbox') {
                formData[name] = input.checked;
            } else {
                formData[name] = input.value;
            }
        });
        
        // Save to local storage
        localStorage.setItem('studentProfileData', JSON.stringify(formData));
        
        // Update display name
        updateDisplayName();
    }
    
    // Load form data from local storage
    function loadFormData() {
        const savedData = localStorage.getItem('studentProfileData');
        
        if (!savedData) {
            // Set default data for demo
            setDemoData();
            return;
        }
        
        const formData = JSON.parse(savedData);
        
        // Populate form fields
        for (const key in formData) {
            const input = settingsForm.querySelector(`[name="${key}"]`);
            
            if (!input) continue;
            
            if (input.type === 'checkbox') {
                input.checked = formData[key];
            } else {
                input.value = formData[key];
            }
        }
        
        // Update display name
        updateDisplayName();
    }
    
    // Set demo data for first load
    function setDemoData() {
        const demoData = {
            'first-name': 'Alex',
            'last-name': 'Johnson',
            'username': 'alex.johnson',
            'email': 'alex.johnson@university.edu',
            'phone': '(555) 123-4567',
            'course': 'computer-science',
            'major': 'Software Engineering',
            'year': '3',
            'address-line1': '123 Campus Drive',
            'city': 'University City',
            'state': 'California',
            'postal-code': '90210',
            'country': 'us',
            'enrollment-date': '2023-09-01',
            'expected-graduation': '2026-06-30',
            'dob': '2002-05-15'
        };
        
        // Populate form fields with demo data
        for (const key in demoData) {
            const input = settingsForm.querySelector(`[name="${key}"]`);
            if (input) input.value = demoData[key];
        }
        
        // Set default checkboxes
        document.getElementById('email-notifications').checked = true;
        document.getElementById('sms-notifications').checked = false;
        document.getElementById('public-profile').checked = true;
        
        // Update display name
        updateDisplayName();
        
        // Save demo data
        saveFormData();
    }
    
    // Form validation
    function validateForm() {
        let isValid = true;
        const requiredFields = ['first-name', 'last-name', 'email', 'phone'];
        
        requiredFields.forEach(field => {
            const input = document.querySelector(`[name="${field}"]`);
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });
        
        // Email validation
        const emailInput = document.querySelector('[name="email"]');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value.trim() && !emailRegex.test(emailInput.value)) {
            emailInput.classList.add('error');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Apply validation on form submission
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            saveFormData();
            successModal.style.display = 'flex';
        }
    });
    
    // Remove error class when input changes
    settingsForm.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
        });
    });
    
    // Responsive adjustments
    function handleResponsive() {
        const windowWidth = window.innerWidth;
        
        if (windowWidth <= 768) {
            // Mobile adjustments if needed
        } else {
            // Desktop adjustments if needed
        }
    }
    
    // Call responsive handler on load and resize
    handleResponsive();
    window.addEventListener('resize', handleResponsive);
});