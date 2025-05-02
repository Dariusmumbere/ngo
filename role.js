// Auth state management
let currentUser = null;
const authTokenKey = 'rcdnet_auth_token';

// Check auth state on page load
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem(authTokenKey);
    if (token) {
        verifyAuthToken(token);
    } else {
        showLoginModal();
    }
});

// Show login modal
function showLoginModal() {
    document.getElementById('loginModal').classList.add('show');
    document.getElementById('container').style.display = 'none'; // Hide main content
}

// Hide login modal
function hideLoginModal() {
    document.getElementById('loginModal').classList.remove('show');
    document.getElementById('container').style.display = 'flex'; // Show main content
}

// Login function
async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('https://man-m681.onrender.com/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }
        
        const data = await response.json();
        
        // Store token and user data
        localStorage.setItem(authTokenKey, data.access_token);
        currentUser = data.user;
        
        // Hide login modal and show main content
        hideLoginModal();
        
        // Update UI with user info
        updateUserUI();
        
        // Load appropriate content based on role
        loadRoleSpecificContent();
        
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
}

// Verify auth token
async function verifyAuthToken(token) {
    try {
        const response = await fetch('https://man-m681.onrender.com/users/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Invalid token');
        }
        
        const user = await response.json();
        currentUser = user;
        updateUserUI();
        loadRoleSpecificContent();
        hideLoginModal();
        
    } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem(authTokenKey);
        showLoginModal();
    }
}

// Update UI with user info
function updateUserUI() {
    if (!currentUser) return;
    
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        const userName = userProfile.querySelector('.user-name');
        const userRole = userProfile.querySelector('.user-role');
        
        if (userName) userName.textContent = currentUser.full_name || currentUser.username;
        if (userRole) userRole.textContent = currentUser.role;
    }
    
    // Show/hide admin features based on role
    const adminFeatures = document.querySelectorAll('[data-role="director"]');
    adminFeatures.forEach(feature => {
        if (currentUser.role === 'director') {
            feature.style.display = 'block';
        } else {
            feature.style.display = 'none';
        }
    });
}

// Load content based on user role
function loadRoleSpecificContent() {
    if (!currentUser) return;
    
    // Example: Show different dashboards based on role
    if (currentUser.role === 'director') {
        document.getElementById('directorDashboard').style.display = 'block';
    } else if (currentUser.role === 'program_officer') {
        document.getElementById('programOfficerDashboard').style.display = 'block';
    }
}

// Logout function
function logout() {
    localStorage.removeItem(authTokenKey);
    currentUser = null;
    showLoginModal();
    
    // Reset the UI
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    
    // Hide all dashboards
    document.getElementById('directorDashboard').style.display = 'none';
    document.getElementById('programOfficerDashboard').style.display = 'none';
}

// Add event listeners
document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('logoutBtn').addEventListener('click', logout); // Add logout button to your header
// User management functions
async function loadUsers() {
    try {
        const response = await fetch('https://man-m681.onrender.com/users/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(authTokenKey)}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load users');
        
        const users = await response.json();
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.full_name || '-'}</td>
                <td>${user.role}</td>
                <td>${user.email || '-'}</td>
                <td>${user.is_active ? 'Active' : 'Inactive'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Failed to load users');
    }
}

async function addUser() {
    const userData = {
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newPassword').value,
        role: document.getElementById('newRole').value,
        full_name: document.getElementById('newFullName').value || null,
        email: document.getElementById('newEmail').value || null
    };
    
    try {
        const response = await fetch('https://man-m681.onrender.com/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(authTokenKey)}`
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) throw new Error('Failed to add user');
        
        alert('User added successfully');
        closeModal('addUserModal');
        loadUsers();
    } catch (error) {
        console.error('Error adding user:', error);
        alert('Failed to add user: ' + error.message);
    }
}

// Add event listener for user management button
document.getElementById('addUserBtn').addEventListener('click', function() {
    document.getElementById('userForm').reset();
    document.getElementById('addUserModal').classList.add('show');
});
