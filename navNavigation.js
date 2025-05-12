// navNavigation.js
document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation elements
    const dashboardLink = document.getElementById('dashboardLink');
    const donationsLink = document.getElementById('donationsLink');
    const implementProjectLink = document.getElementById('implementProjectLink');
    const fundraisingLink = document.getElementById('fundraisingLink');
    
    // Get all content sections
    const dashboardContent = document.getElementById('dashboardContent');
    const donationsContent = document.getElementById('donationsContent');
    const implementProjectContent = document.getElementById('implementProjectContent');
    const fileManagerContent = document.getElementById('fileManagerContent');
    
    // Set active nav item function
    function setActiveNavItem(activeItem) {
        // Remove active class from all nav items
        document.querySelectorAll('.sidebar-menu li a').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked item
        activeItem.classList.add('active');
    }
    
    // Dashboard navigation
    if (dashboardLink) {
        dashboardLink.addEventListener('click', function(e) {
            e.preventDefault();
            dashboardContent.style.display = 'block';
            donationsContent.style.display = 'none';
            implementProjectContent.style.display = 'none';
            fileManagerContent.style.display = 'none';
            setActiveNavItem(this);
        });
    }
    
    // Donations navigation
    if (donationsLink) {
        donationsLink.addEventListener('click', function(e) {
            e.preventDefault();
            dashboardContent.style.display = 'none';
            donationsContent.style.display = 'block';
            implementProjectContent.style.display = 'none';
            fileManagerContent.style.display = 'none';
            setActiveNavItem(this);
            
            // Load donations data when showing this content
            if (typeof loadDonations === 'function') {
                loadDonations();
            }
        });
    }
    
    // Implement Project navigation
    if (implementProjectLink) {
        implementProjectLink.addEventListener('click', function(e) {
            e.preventDefault();
            dashboardContent.style.display = 'none';
            donationsContent.style.display = 'none';
            implementProjectContent.style.display = 'block';
            fileManagerContent.style.display = 'none';
            setActiveNavItem(this);
            
            // Show role selection by default
            const roleSelection = document.getElementById('roleSelection');
            const directorDashboard = document.getElementById('directorDashboard');
            if (roleSelection) roleSelection.style.display = 'block';
            if (directorDashboard) directorDashboard.style.display = 'none';
        });
    }
    
    // Fundraising Documents navigation
    if (fundraisingLink) {
        fundraisingLink.addEventListener('click', function(e) {
            e.preventDefault();
            dashboardContent.style.display = 'none';
            donationsContent.style.display = 'none';
            implementProjectContent.style.display = 'none';
            fileManagerContent.style.display = 'block';
            setActiveNavItem(this);
            
            // Load content for current path
            if (typeof loadFolderContents === 'function') {
                const folderId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : '';
                loadFolderContents(folderId);
            }
        });
    }
    
    // Set initial active state based on current display
    function setInitialActiveState() {
        if (donationsContent.style.display === 'block') {
            setActiveNavItem(donationsLink);
        } else if (implementProjectContent.style.display === 'block') {
            setActiveNavItem(implementProjectLink);
        } else if (fileManagerContent.style.display === 'block') {
            setActiveNavItem(fundraisingLink);
        } else {
            setActiveNavItem(dashboardLink);
        }
    }
    
    // Call the initial state function
    setInitialActiveState();
});
