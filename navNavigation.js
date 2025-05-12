document.addEventListener('DOMContentLoaded', function() {
    // Get all main navigation links
    const navLinks = document.querySelectorAll('.sidebar-menu > li > a');
    
    // Get all content sections
    const contentSections = {
        dashboard: document.getElementById('dashboardContent'),
        fileManager: document.getElementById('fileManagerContent'),
        donations: document.getElementById('donationsContent'),
        implementProject: document.getElementById('implementProjectContent')
    };

    // Function to set active nav item and show corresponding content
    function setActiveNavItem(clickedLink, contentToShow) {
        // Remove active class from all nav items
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to clicked link
        clickedLink.classList.add('active');
        
        // Hide all content sections
        Object.values(contentSections).forEach(section => {
            if (section) section.style.display = 'none';
        });
        
        // Show the selected content
        if (contentToShow && contentToShow in contentSections) {
            contentSections[contentToShow].style.display = 'block';
        }
    }

    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Determine which content to show based on link ID
            let contentKey;
            if (this.id === 'dashboardLink') {
                contentKey = 'dashboard';
            } else if (this.id === 'fundraisingLink') {
                contentKey = 'fileManager';
            } else if (this.id === 'donationsLink') {
                contentKey = 'donations';
            } else if (this.id === 'implementProjectLink') {
                contentKey = 'implementProject';
            }
            
            if (contentKey) {
                setActiveNavItem(this, contentKey);
            }
        });
    });

    // Set dashboard as default view
    const dashboardLink = document.getElementById('dashboardLink');
    if (dashboardLink) {
        setActiveNavItem(dashboardLink, 'dashboard');
    }
});
