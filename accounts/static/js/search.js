// search.js - Global search functionality

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('global-search');
    const searchButton = document.getElementById('search-button');
    const searchResults = document.getElementById('search-results');
    
    // Sample search data (in a real implementation, this would come from an API or database)
    const searchData = [
        { title: 'Introduction to Computer Science', category: 'Course', type: 'course', id: 'cs101', content: 'Learn the fundamentals of computer science and programming.' },
        { title: 'Advanced Programming', category: 'Course', type: 'course', id: 'cs201', content: 'Build on your programming skills with advanced concepts and techniques.' },
        { title: 'Data Structures', category: 'Course', type: 'course', id: 'cs210', content: 'Learn about arrays, linked lists, trees, and other data structures.' },
        { title: 'Fall 2024 Schedule', category: 'Academic', type: 'schedule', id: 'schedule-fall-2024', content: 'Your class schedule for the Fall 2024 semester.' },
        { title: 'Financial Aid Application', category: 'Finance', type: 'document', id: 'fin-aid-2024', content: 'Application for financial assistance for the academic year.' },
        { title: 'Student Housing Agreement', category: 'Administration', type: 'document', id: 'housing-24', content: 'Terms and conditions for on-campus housing.' },
        { title: 'Math 101 Final Exam', category: 'Grade', type: 'assessment', id: 'math101-final', content: 'Final examination for Math 101 - Introduction to Calculus.' },
        { title: 'Career Fair', category: 'Event', type: 'event', id: 'career-fair-spring', content: 'Annual spring career fair with industry professionals.' },
        { title: 'Research Opportunities', category: 'Academic', type: 'opportunity', id: 'research-opps', content: 'Undergraduate research opportunities across departments.' }
    ];
    
    // Category icons mapping
    const categoryIcons = {
        'Course': 'fa-book',
        'Academic': 'fa-graduation-cap',
        'Finance': 'fa-money-bill-wave',
        'Administration': 'fa-building',
        'Grade': 'fa-chart-line',
        'Event': 'fa-calendar-alt',
    };
    
    // Toggle search results on input focus
    searchInput.addEventListener('focus', function() {
        if (searchInput.value.length >= 2) {
            performSearch(searchInput.value);
        }
    });
    
    // Hide search results when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.search-container')) {
            searchResults.classList.remove('active');
        }
    });
    
    // Search on input
    searchInput.addEventListener('input', function() {
        if (searchInput.value.length >= 2) {
            performSearch(searchInput.value);
        } else {
            searchResults.classList.remove('active');
        }
    });
    
    // Search on button click
    searchButton.addEventListener('click', function() {
        if (searchInput.value.length >= 2) {
            performSearch(searchInput.value);
        }
    });
    
    // Function to perform search
    function performSearch(query) {
        // Clear previous results
        searchResults.innerHTML = '';
        
        // Convert query to lowercase for case-insensitive search
        const lowerQuery = query.toLowerCase();
        
        // Filter items that match the query
        const matchedItems = searchData.filter(item => 
            item.title.toLowerCase().includes(lowerQuery) || 
            item.content.toLowerCase().includes(lowerQuery) ||
            item.category.toLowerCase().includes(lowerQuery)
        );
        
        // Display results if any
        if (matchedItems.length > 0) {
            matchedItems.forEach(item => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.setAttribute('data-id', item.id);
                resultItem.setAttribute('data-type', item.type);
                
                // Highlight matching text in title
                const titleHtml = highlightText(item.title, lowerQuery);
                
                // Prepare content extract with highlighted match
                const contentHtml = highlightText(item.content, lowerQuery);
                
                // Get icon for category
                const iconClass = categoryIcons[item.category] || 'fa-file';
                
                resultItem.innerHTML = `
                    <div class="result-title">${titleHtml}</div>
                    <div class="result-category">
                        <i class="fas ${iconClass}"></i> ${item.category}
                    </div>
                    <div class="result-match">${contentHtml}</div>
                `;
                
                // Add click event to navigate to the item
                resultItem.addEventListener('click', function() {
                    navigateToItem(item);
                });
                
                searchResults.appendChild(resultItem);
            });
            
            searchResults.classList.add('active');
        } else {
            // Show no results message
            const noResults = document.createElement('div');
            noResults.className = 'search-result-item';
            noResults.innerHTML = `<div class="result-title">No results found</div>
                                  <div class="result-match">Try different keywords or browse categories</div>`;
            searchResults.appendChild(noResults);
            searchResults.classList.add('active');
        }
    }
    
    // Function to highlight matching text
    function highlightText(text, query) {
        if (!query || query.length < 2) return text;
        
        const lowerText = text.toLowerCase();
        const index = lowerText.indexOf(query);
        
        if (index >= 0) {
            return text.substring(0, index) + 
                   `<span class="highlight">${text.substring(index, index + query.length)}</span>` + 
                   text.substring(index + query.length);
        }
        
        return text;
    }
    
    // Function to navigate to an item (placeholder - implement based on your app structure)
    function navigateToItem(item) {
        console.log(`Navigating to ${item.type}: ${item.id}`);
        
        // Close search results
        searchResults.classList.remove('active');
        
        // Clear search input
        searchInput.value = '';
        
        // Implement navigation based on item type
        switch(item.type) {
            case 'course':
                window.location.href = `course/course-details.html?id=${item.id}`;
                break;
            case 'document':
                window.location.href = `documents/view.html?id=${item.id}`;
                break;
            case 'assessment':
                window.location.href = `grades/detail.html?id=${item.id}`;
                break;
            case 'event':
                window.location.href = `events/detail.html?id=${item.id}`;
                break;
            default:
                window.location.href = `search-results.html?query=${encodeURIComponent(searchInput.value)}`;
        }
    }
});