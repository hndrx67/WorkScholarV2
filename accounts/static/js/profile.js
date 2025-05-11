document.addEventListener('DOMContentLoaded', function() {
    // Sample data (in a real app, this would come from an API)
    const studentData = {
        id: "ST2023001",
        name: "John Doe",
        program: "Computer Science",
        year: "3rd Year",
        status: "Active",
        avatar: "https://ui-avatars.com/api/?name=John+Doe&background=6c5ce7&color=fff",
        units: [
            { code: "CS 101", name: "Introduction to Programming", semester: "1st Year - 1st Sem", grade: "A", status: "taken" },
            { code: "CS 201", name: "Data Structures", semester: "2nd Year - 1st Sem", grade: "B+", status: "taken" },
            { code: "CS 301", name: "Algorithms", semester: "3rd Year - 1st Sem", grade: "", status: "current" },
            { code: "CS 401", name: "Software Engineering", semester: "4th Year - 1st Sem", grade: "", status: "required" },
            { code: "CS 315", name: "Machine Learning", semester: "3rd Year - 2nd Sem", grade: "", status: "elective" }
        ],
        workHistory: [
            { department: "IT Department", position: "IT Assistant", startDate: "Jan 2023", endDate: "Present", 
              description: "Providing technical support to faculty and students, maintaining computer labs" },
            { department: "University Library", position: "Library Assistant", startDate: "Sep 2021", endDate: "Dec 2022", 
              description: "Managed book circulation, assisted students with research" }
        ],
        profile: {
            email: "john.doe@university.edu",
            phone: "+1 (555) 123-4567"
        },
        departments: [
            { name: "IT Department", startDate: "Jan 2023", endDate: "Present", 
              description: "Provides technical support and maintains university IT infrastructure", 
              supervisor: "Dr. Sarah Johnson", status: "current" },
            { name: "University Library", startDate: "Sep 2021", endDate: "Dec 2022", 
              description: "Managed book circulation and research assistance services", 
              supervisor: "Prof. Michael Brown", status: "previous" }
        ]
    };

    // DOM Elements
    const tabButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const unitsGrid = document.querySelector('.units-grid');
    const workSummary = document.querySelector('.work-summary');
    const workTimeline = document.querySelector('.work-timeline');
    const profileForm = document.getElementById('profileForm');
    const departmentCards = document.querySelector('.department-cards');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const avatarModal = document.getElementById('avatarModal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const saveAvatarBtn = document.getElementById('saveAvatarBtn');
    const avatarUpload = document.getElementById('avatarUpload');
    const printUnitsBtn = document.getElementById('printUnitsBtn');
    const addWorkBtn = document.getElementById('addWorkBtn');
    const workModal = document.getElementById('workModal');
    const workForm = document.getElementById('workForm');
    const requestTransferBtn = document.getElementById('requestTransferBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const backButton = document.querySelector('.back-button');

    // Initialize the page
    initProfile();

    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding content
            const target = button.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
            
            // Update URL hash
            window.location.hash = target;
        });
    });

    // Check URL hash on load
    if (window.location.hash) {
        const targetTab = document.querySelector(`.nav-btn[data-target="${window.location.hash.substring(1)}"]`);
        if (targetTab) targetTab.click();
    }

    // Avatar change modal
    changeAvatarBtn.addEventListener('click', () => {
        avatarModal.style.display = 'flex';
    });

    // Close modals
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Avatar upload
    avatarUpload.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.querySelector('.avatar').src = e.target.result;
            }
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Save avatar changes
    saveAvatarBtn.addEventListener('click', () => {
        avatarModal.style.display = 'none';
        // In a real app, you would save to server here
        showToast('Avatar updated successfully!');
    });

    // Print units
    printUnitsBtn.addEventListener('click', () => {
        window.print();
    });

    // Add work experience
    addWorkBtn.addEventListener('click', () => {
        workModal.style.display = 'flex';
    });

    // Submit work form
    workForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // In a real app, you would save to server here
        showToast('Work experience added successfully!');
        workModal.style.display = 'none';
    });

    // Request department transfer
    requestTransferBtn.addEventListener('click', () => {
        // In a real app, this would open a transfer request form
        showToast('Transfer request submitted!');
    });

    // Cancel profile edits
    cancelEditBtn.addEventListener('click', () => {
        populateProfileForm();
        showToast('Changes discarded');
    });

    // Submit profile form
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // In a real app, you would send data to server here
        showToast('Profile updated successfully!');
    });

    // Back button for mobile
    backButton.addEventListener('click', () => {
        window.history.back();
    });

    // Toggle password visibility
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('toggle-password')) {
            const input = e.target.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                e.target.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                input.type = 'password';
                e.target.innerHTML = '<i class="fas fa-eye"></i>';
            }
        }
    });

    // Initialize profile data
    function initProfile() {
        // Set basic info
        document.querySelector('.student-name').textContent = studentData.name;
        document.querySelector('.student-id').textContent = `ID: ${studentData.id}`;
        document.querySelector('.avatar').src = studentData.avatar;
        document.querySelector('.status-badge').textContent = studentData.status;
        
        // Populate all sections
        populateUnits();
        populateWorkHistory();
        populateProfileForm();
        populateDepartments();
    }

    function populateUnits() {
        unitsGrid.innerHTML = '';
        studentData.units.forEach(unit => {
            const unitCard = document.createElement('div');
            unitCard.className = `unit-card ${unit.status}`;
            
            let gradeOrStatus = '';
            if (unit.grade) {
                gradeOrStatus = `<span class="grade">${unit.grade}</span>`;
            } else {
                const statusText = unit.status === 'current' ? 'In Progress' : 
                                  unit.status === 'required' ? 'Required' : 'Elective';
                gradeOrStatus = `<span class="status">${statusText}</span>`;
            }
            
            unitCard.innerHTML = `
                <h3>${unit.code}</h3>
                <p>${unit.name}</p>
                <div class="unit-meta">
                    ${gradeOrStatus}
                    <span class="semester">${unit.semester}</span>
                </div>
                <button class="unit-details-btn">Details</button>
            `;
            
            unitCard.querySelector('.unit-details-btn').addEventListener('click', () => {
                // In a real app, this would show unit details
                showToast(`Showing details for ${unit.code}`);
            });
            
            unitsGrid.appendChild(unitCard);
        });
    }

    function populateWorkHistory() {
        // Calculate total work experience
        const startDate = new Date('2021-09-01');
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        
        workSummary.innerHTML = `
            <div class="work-stat">
                <h3>Total Work Experience</h3>
                <p class="highlight">${years} years ${months} months</p>
                <p>Started: September 2021</p>
            </div>
            <div class="work-stat">
                <h3>Current Position</h3>
                <p class="highlight">${studentData.workHistory[0].position}</p>
                <p>Since: ${studentData.workHistory[0].startDate}</p>
            </div>
        `;
        
        // Populate timeline
        workTimeline.innerHTML = '';
        studentData.workHistory.forEach(job => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            
            timelineItem.innerHTML = `
                <div class="timeline-date">${job.startDate} - ${job.endDate}</div>
                <div class="timeline-content">
                    <h3>${job.department}</h3>
                    <p class="position">${job.position}</p>
                    <p>${job.description}</p>
                    <div class="timeline-actions">
                        <button class="btn edit-btn"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn delete-btn"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </div>
            `;
            
            // Add event listeners for edit/delete
            timelineItem.querySelector('.edit-btn').addEventListener('click', () => {
                // In a real app, this would open edit modal
                showToast(`Editing ${job.position} at ${job.department}`);
            });
            
            timelineItem.querySelector('.delete-btn').addEventListener('click', () => {
                if (confirm(`Are you sure you want to delete ${job.position} at ${job.department}?`)) {
                    // In a real app, this would delete from server
                    showToast('Work experience deleted');
                }
            });
            
            workTimeline.appendChild(timelineItem);
        });
    }

    function populateProfileForm() {
        profileForm.innerHTML = `
            <div class="form-group">
                <label for="fullname">Full Name</label>
                <input type="text" id="fullname" value="${studentData.name}">
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" value="${studentData.profile.email}">
            </div>
            <div class="form-group">
                <label for="phone">Phone</label>
                <input type="tel" id="phone" value="${studentData.profile.phone}">
            </div>
            <div class="form-group">
                <label for="password">Change Password</label>
                <input type="password" id="password" placeholder="Enter new password">
                <span class="toggle-password"><i class="fas fa-eye"></i></span>
            </div>
            <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" placeholder="Confirm new password">
                <span class="toggle-password"><i class="fas fa-eye"></i></span>
            </div>
            <div class="form-actions">
                <button type="button" class="btn cancel" id="cancelEditBtn">Cancel</button>
                <button type="submit" class="btn save">Save Changes</button>
            </div>
        `;
    }

    function populateDepartments() {
        departmentCards.innerHTML = '';
        studentData.departments.forEach(dept => {
            const deptCard = document.createElement('div');
            deptCard.className = `dept-card ${dept.status}`;
            
            deptCard.innerHTML = `
                <h3>${dept.name}</h3>
                <p class="dept-meta">
                    <span><i class="fas fa-calendar-alt"></i> ${dept.startDate} - ${dept.endDate}</span>
                    <span><i class="fas fa-clock"></i> ${calculateDuration(dept.startDate, dept.endDate)}</span>
                </p>
                <p class="dept-description">
                    ${dept.description}
                </p>
                <div class="dept-supervisor">
                    <i class="fas fa-user-tie"></i> Supervisor: ${dept.supervisor}
                </div>
                <div class="dept-actions">
                    <button class="btn contact-btn"><i class="fas fa-envelope"></i> Contact Supervisor</button>
                </div>
            `;
            
            // Add event listener for contact button
            deptCard.querySelector('.contact-btn').addEventListener('click', () => {
                // In a real app, this would open email client
                showToast(`Contacting ${dept.supervisor}`);
            });
            
            departmentCards.appendChild(deptCard);
        });
    }

    function calculateDuration(startDateStr, endDateStr) {
        // Simple duration calculation for demo
        const startYear = parseInt(startDateStr.split(' ')[1]);
        const endYear = endDateStr === 'Present' ? new Date().getFullYear() : parseInt(endDateStr.split(' ')[1]);
        const years = endYear - startYear;
        
        if (years === 1) return '1 year';
        if (years > 1) return `${years} years`;
        return 'Less than 1 year';
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
});

// Add this to your existing profile.js
document.addEventListener('DOMContentLoaded', function() {
    // Dropdown functionality
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    // Toggle dropdown on click
    dropdownToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      const isOpen = dropdownMenu.style.opacity === '1';
      
      if (isOpen) {
        dropdownMenu.style.opacity = '0';
        dropdownMenu.style.visibility = 'hidden';
        dropdownMenu.style.transform = 'translateY(10px)';
        document.querySelector('.dropdown-arrow').style.transform = 'rotate(0deg)';
      } else {
        dropdownMenu.style.opacity = '1';
        dropdownMenu.style.visibility = 'visible';
        dropdownMenu.style.transform = 'translateY(0)';
        document.querySelector('.dropdown-arrow').style.transform = 'rotate(180deg)';
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
      dropdownMenu.style.opacity = '0';
      dropdownMenu.style.visibility = 'hidden';
      dropdownMenu.style.transform = 'translateY(10px)';
      document.querySelector('.dropdown-arrow').style.transform = 'rotate(0deg)';
    });
    
    // Prevent dropdown from closing when clicking inside
    dropdownMenu.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  });