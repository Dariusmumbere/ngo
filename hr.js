// HR Management System JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all HR management functionality
    initHRManagement();
});

function initHRManagement() {
    // Form validation setup
    setupEmployeeFormValidation();
    
    // Load initial data
    loadEmployees();
    loadActivitiesForDeployment();
    
    // Collapsible sections setup
    setupCollapsibleSections();
    
    // Work opportunities setup
    setupWorkOpportunities();
    
    // Payment processing setup
    setupPaymentProcessing();
    
    // Modal setup
    setupModals();
}

// Form Validation
function setupEmployeeFormValidation() {
    const employeeForm = document.getElementById('employeeForm');
    const validationErrors = {
        name: document.getElementById('nameError'),
        nin: document.getElementById('ninError'),
        dob: document.getElementById('dobError'),
        qualification: document.getElementById('qualificationError'),
        email: document.getElementById('emailError'),
        phone: document.getElementById('phoneError')
    };

    employeeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Reset all error messages
        Object.values(validationErrors).forEach(error => {
            error.style.display = 'none';
        });
        
        // Validate each field
        let isValid = true;
        
        if (!document.getElementById('employeeName').value.trim()) {
            validationErrors.name.style.display = 'block';
            isValid = false;
        }
        
        if (!document.getElementById('employeeNIN').value.trim()) {
            validationErrors.nin.style.display = 'block';
            isValid = false;
        }
        
        if (!document.getElementById('employeeDOB').value) {
            validationErrors.dob.style.display = 'block';
            isValid = false;
        }
        
        if (!document.getElementById('employeeQualification').value) {
            validationErrors.qualification.style.display = 'block';
            isValid = false;
        }
        
        const email = document.getElementById('employeeEmail').value;
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            validationErrors.email.style.display = 'block';
            isValid = false;
        }
        
        const phone = document.getElementById('employeePhone').value;
        if (phone && !/^\d{10}$/.test(phone)) {
            validationErrors.phone.style.display = 'block';
            isValid = false;
        }
        
        if (isValid) {
            await saveEmployee();
        }
    });

    // Reset form
    document.getElementById('resetFormBtn').addEventListener('click', function() {
        employeeForm.reset();
        Object.values(validationErrors).forEach(error => {
            error.style.display = 'none';
        });
    });
}

// Employee Management
async function saveEmployee() {
    const employeeData = {
        name: document.getElementById('employeeName').value.trim(),
        nin: document.getElementById('employeeNIN').value.trim(),
        dob: document.getElementById('employeeDOB').value,
        qualification: document.getElementById('employeeQualification').value,
        email: document.getElementById('employeeEmail').value.trim(),
        phone: document.getElementById('employeePhone').value.trim(),
        profession: document.getElementById('text').value.trim(),
        status: 'active'
    };
    
    const submitBtn = document.querySelector('#employeeForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;
        
        const response = await fetch('https://man-m681.onrender.com/employees/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to save employee');
        }
        
        const data = await response.json();
        alert('Employee saved successfully!');
        document.getElementById('employeeForm').reset();
        await loadEmployees();
    } catch (error) {
        console.error('Error saving employee:', error);
        alert(`Error: ${error.message}`);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function loadEmployees() {
    try {
        const tbody = document.getElementById('employeesTableBody');
        tbody.innerHTML = '<tr><td colspan="5" class="loading"><div class="spinner"></div></td></tr>';
        
        const response = await fetch('https://man-m681.onrender.com/employees/');
        
        if (!response.ok) {
            throw new Error('Failed to fetch employees');
        }
        
        const data = await response.json();
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No employees found</td></tr>';
            return;
        }
        
        data.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.name}</td>
                <td>${employee.nin}</td>
                <td>${formatQualification(employee.qualification)}</td>
                <td><span class="status-badge ${employee.status === 'active' ? 'active' : 'inactive'}">${employee.status}</span></td>
                <td>
                    <button class="action-btn edit-btn" onclick="editEmployee(${employee.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteEmployee(${employee.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Populate employee dropdowns
        populateEmployeeDropdowns(data);
    } catch (error) {
        console.error('Error loading employees:', error);
        document.getElementById('employeesTableBody').innerHTML = 
            '<tr><td colspan="5" style="text-align: center; color: red;">Failed to load employees</td></tr>';
    }
}

function populateEmployeeDropdowns(employees) {
    // Deployment dropdown
    const deployDropdown = document.getElementById('deployEmployee');
    deployDropdown.innerHTML = '<option value="">Select employee</option>';
    
    // Assignment dropdown
    const assignDropdown = document.getElementById('employeeToAssign');
    assignDropdown.innerHTML = '<option value="">Select employee</option>';
    
    // Payment dropdown
    const paymentDropdown = document.getElementById('paymentEmployee');
    if (paymentDropdown) {
        paymentDropdown.innerHTML = '<option value="">Select employee</option>';
    }
    
    employees.forEach(employee => {
        // Deployment dropdown
        const deployOption = document.createElement('option');
        deployOption.value = employee.id;
        deployOption.textContent = employee.name;
        deployDropdown.appendChild(deployOption);
        
        // Assignment dropdown
        const assignOption = document.createElement('option');
        assignOption.value = employee.id;
        assignOption.textContent = employee.name;
        assignDropdown.appendChild(assignOption);
        
        // Payment dropdown
        if (paymentDropdown) {
            const paymentOption = document.createElement('option');
            paymentOption.value = employee.id;
            paymentOption.textContent = `${employee.name} (${employee.nin})`;
            paymentDropdown.appendChild(paymentOption);
        }
    });
}

function formatQualification(qualification) {
    const qualifications = {
        'primary': 'Primary',
        'secondary': 'Secondary',
        'diploma': 'Diploma',
        'bachelors': "Bachelor's",
        'masters': "Master's",
        'phd': 'PhD',
        'other': 'Other'
    };
    return qualifications[qualification] || qualification;
}

// Deployment Management
async function loadActivitiesForDeployment() {
    try {
        const response = await fetch('https://man-m681.onrender.com/activities/');
        
        if (!response.ok) {
            throw new Error('Failed to fetch activities');
        }
        
        const data = await response.json();
        const dropdown = document.getElementById('deployActivity');
        dropdown.innerHTML = '<option value="">Select activity</option>';
        
        // Handle both array response and object with activities property
        const activities = Array.isArray(data) ? data : (data.activities || []);
        
        activities.forEach(activity => {
            const option = document.createElement('option');
            option.value = activity.id;
            option.textContent = `${activity.name} (${activity.project_name})`;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

async function deployEmployee() {
    const employeeId = document.getElementById('deployEmployee').value;
    const activityId = document.getElementById('deployActivity').value;
    const role = document.getElementById('deployRole').value;
    
    if (!employeeId || !activityId) {
        alert('Please select both employee and activity');
        return;
    }
    
    const btn = document.getElementById('deployBtn');
    const originalText = btn.innerHTML;
    
    try {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deploying...';
        btn.disabled = true;
        
        const response = await fetch('https://man-m681.onrender.com/deployments/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                employee_id: employeeId,
                activity_id: activityId,
                role: role
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create deployment');
        }
        
        const data = await response.json();
        alert('Employee deployed successfully!');
        await loadDeployments();
    } catch (error) {
        console.error('Error deploying employee:', error);
        alert('Failed to deploy employee. Please try again.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function loadDeployments() {
    try {
        const response = await fetch('https://man-m681.onrender.com/deployments/');
        
        if (!response.ok) {
            throw new Error('Failed to fetch deployments');
        }
        
        const data = await response.json();
        const deploymentList = document.getElementById('deploymentList');
        
        // Clear existing content except the heading
        deploymentList.innerHTML = '<h3>Current Deployments</h3>';
        
        if (data.length === 0) {
            deploymentList.innerHTML += '<p>No current deployments</p>';
            return;
        }
        
        data.forEach(deployment => {
            const deploymentItem = document.createElement('div');
            deploymentItem.className = 'deployment-item';
            deploymentItem.innerHTML = `
                <div class="deployment-info">
                    <div class="deployment-employee">${deployment.employee_name}</div>
                    <div class="deployment-activity">
                        <span><i class="fas fa-tasks"></i> ${deployment.activity_name}</span>
                    </div>
                    <div class="deployment-project">
                        <span><i class="fas fa-project-diagram"></i> ${deployment.project_name}</span>
                        <span><i class="fas fa-user-tag"></i> ${formatRole(deployment.role)}</span>
                    </div>
                </div>
                
                <div class="deployment-actions">
                    <button class="action-btn edit-btn" onclick="editDeployment(${deployment.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteDeployment(${deployment.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            deploymentList.appendChild(deploymentItem);
        });
    } catch (error) {
        console.error('Error loading deployments:', error);
        document.getElementById('deploymentList').innerHTML = 
            '<h3>Current Deployments</h3><p style="color: red;">Failed to load deployments</p>';
    }
}

function formatRole(role) {
    const roles = {
        'team_leader': 'Team Leader',
        'field_officer': 'Field Officer',
        'trainer': 'Trainer',
        'monitor': 'Monitor',
        'other': 'Other'
    };
    return roles[role] || role;
}

// Work Opportunities
function setupWorkOpportunities() {
    document.getElementById('createOpportunityBtn').addEventListener('click', createOpportunity);
}

async function createOpportunity() {
    const title = document.getElementById('opportunityTitle').value.trim();
    const description = document.getElementById('opportunityDescription').value.trim();
    
    // Reset errors
    document.getElementById('opportunityTitleError').style.display = 'none';
    document.getElementById('opportunityDescError').style.display = 'none';
    
    let isValid = true;
    
    if (!title) {
        document.getElementById('opportunityTitleError').style.display = 'block';
        isValid = false;
    }
    
    if (!description) {
        document.getElementById('opportunityDescError').style.display = 'block';
        isValid = false;
    }
    
    if (!isValid) return;
    
    const btn = document.getElementById('createOpportunityBtn');
    const originalText = btn.innerHTML;
    
    try {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        btn.disabled = true;
        
        const response = await fetch('https://man-m681.onrender.com/work-opportunities/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                description: description
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create opportunity');
        }
        
        const data = await response.json();
        alert('Opportunity created successfully!');
        document.getElementById('opportunityTitle').value = '';
        document.getElementById('opportunityDescription').value = '';
        await loadWorkOpportunities();
    } catch (error) {
        console.error('Error creating opportunity:', error);
        alert('Failed to create opportunity. Please try again.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function loadWorkOpportunities() {
    try {
        const opportunityList = document.getElementById('opportunityList');
        
        // Clear existing cards except the header
        opportunityList.innerHTML = '<h3>Current Opportunities</h3>';
        
        // Show loading state
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading';
        loadingElement.innerHTML = '<div class="spinner"></div>';
        opportunityList.appendChild(loadingElement);
        
        // Fetch opportunities
        const response = await fetch('https://man-m681.onrender.com/work-opportunities/');
        
        if (!response.ok) {
            throw new Error('Failed to fetch work opportunities');
        }
        
        const opportunities = await response.json();
        
        // Remove loading element
        loadingElement.remove();
        
        if (opportunities.length === 0) {
            opportunityList.innerHTML += '<p>No work opportunities found</p>';
            return;
        }
        
        // Create cards for each opportunity
        for (const opportunity of opportunities) {
            // Get assignments for this opportunity
            let assignments = [];
            try {
                const assignmentsResponse = await fetch(`https://man-m681.onrender.com/opportunity-assignments/${opportunity.id}`);
                if (assignmentsResponse.ok) {
                    assignments = await assignmentsResponse.json();
                }
            } catch (error) {
                console.error(`Error loading assignments for opportunity ${opportunity.id}:`, error);
            }
            
            const opportunityCard = document.createElement('div');
            opportunityCard.className = 'opportunity-card';
            opportunityCard.innerHTML = `
                <div class="opportunity-header">
                    <h3 class="opportunity-title">${opportunity.title}</h3>
                    <div class="opportunity-meta">
                        <span><i class="fas fa-calendar-alt"></i> ${new Date(opportunity.created_at).toLocaleDateString()}</span>
                        <span><i class="fas fa-circle" style="color: ${opportunity.status === 'open' ? '#2ecc71' : '#e74c3c'}"></i> ${opportunity.status}</span>
                    </div>
                </div>
                
                <div class="opportunity-description">
                    ${opportunity.description}
                </div>
                
                <div class="opportunity-footer">
                    <div class="assigned-employees">
                        <span>Assigned:</span>
                        ${assignments.slice(0, 3).map(assignment => `
                            <div class="employee-avatar" title="${assignment.employee_name}">
                                ${getInitials(assignment.employee_name)}
                            </div>
                        `).join('')}
                        ${assignments.length > 3 ? `<div class="employee-avatar">+${assignments.length - 3}</div>` : ''}
                        ${assignments.length === 0 ? '<span>None</span>' : ''}
                    </div>
                    
                    <button class="btn btn-primary btn-sm" onclick="openAssignEmployeeModal(${opportunity.id})">
                        <i class="fas fa-plus"></i> Assign Employee
                    </button>
                </div>
            `;
            
            opportunityList.appendChild(opportunityCard);
        }
    } catch (error) {
        console.error('Error loading work opportunities:', error);
        const opportunityList = document.getElementById('opportunityList');
        opportunityList.innerHTML = '<h3>Current Opportunities</h3>';
        const errorElement = document.createElement('p');
        errorElement.style.color = 'red';
        errorElement.textContent = 'Failed to load work opportunities';
        opportunityList.appendChild(errorElement);
    }
}

function getInitials(name) {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
}

// Payment Processing
function setupPaymentProcessing() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.payment-tab-btn');
    const tabContents = document.querySelectorAll('.payment-tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Load content for the active tab
            switch(tabId) {
                case 'request-payment':
                    loadEmployeesForPayment();
                    break;
                case 'pending-approvals':
                    loadPendingPayments();
                    break;
                case 'payment-history':
                    loadPaymentHistory();
                    break;
            }
        });
    });
    
    // Form submission for payment request
    document.getElementById('paymentRequestForm').addEventListener('submit', submitPaymentRequest);
    
    // Initialize the first tab
    if (tabBtns.length > 0) {
        tabBtns[0].click();
    }
}

async function submitPaymentRequest(e) {
    e.preventDefault();
    
    const employeeId = document.getElementById('paymentEmployee').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const paymentPeriod = document.getElementById('paymentPeriod').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const description = document.getElementById('paymentDescription').value;
    
    if (!employeeId || !amount || !paymentPeriod || !paymentMethod) {
        alert('Please fill in all required fields');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        const response = await fetch('https://man-m681.onrender.com/payments/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                employee_id: parseInt(employeeId),
                amount: amount,
                payment_period: paymentPeriod,
                description: description,
                payment_method: paymentMethod
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to submit payment request');
        }
        
        const data = await response.json();
        alert('Payment request submitted successfully!');
        e.target.reset();
        
        // Refresh pending payments tab
        await loadPendingPayments();
    } catch (error) {
        console.error('Error submitting payment request:', error);
        alert(`Error: ${error.message}`);
    } finally {
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Request';
        submitBtn.disabled = false;
    }
}

async function loadPendingPayments() {
    try {
        const tbody = document.getElementById('pendingPaymentsBody');
        tbody.innerHTML = '<tr><td colspan="6" class="loading"><div class="spinner"></div></td></tr>';
        
        const response = await fetch('https://man-m681.onrender.com/payments/pending');
        
        if (!response.ok) {
            throw new Error('Failed to fetch pending payments');
        }
        
        const payments = await response.json();
        tbody.innerHTML = '';
        
        if (payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No pending payments found</td></tr>';
            return;
        }
        
        payments.forEach(payment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${payment.employee_name}</td>
                <td>UGX ${payment.amount.toLocaleString()}</td>
                <td>${payment.payment_period}</td>
                <td>${formatPaymentMethod(payment.payment_method)}</td>
                <td>${new Date(payment.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn approve-btn" onclick="openApprovalModal(${payment.id}, '${payment.employee_name}', ${payment.amount}, '${payment.payment_period}', '${new Date(payment.created_at).toLocaleDateString()}')">
                        <i class="fas fa-check-circle"></i> Process
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Initialize search functionality
        document.getElementById('pendingSearch').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = tbody.querySelectorAll('tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    } catch (error) {
        console.error('Error loading pending payments:', error);
        document.getElementById('pendingPaymentsBody').innerHTML = 
            '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load pending payments</td></tr>';
    }
}

async function loadPaymentHistory(statusFilter = '') {
    try {
        const tbody = document.getElementById('paymentHistoryBody');
        tbody.innerHTML = '<tr><td colspan="6" class="loading"><div class="spinner"></div></td></tr>';
        
        let url = 'https://man-m681.onrender.com/payments/history';
        if (statusFilter) {
            url += `?status=${statusFilter}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch payment history');
        }
        
        const payments = await response.json();
        tbody.innerHTML = '';
        
        if (payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No payment history found</td></tr>';
            return;
        }
        
        payments.forEach(payment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${payment.employee_name}</td>
                <td>UGX ${payment.amount.toLocaleString()}</td>
                <td>${payment.payment_period}</td>
                <td><span class="status-badge ${payment.status}">${payment.status}</span></td>
                <td>${new Date(payment.created_at).toLocaleDateString()}</td>
                <td>${payment.approved_at ? new Date(payment.approved_at).toLocaleDateString() : 'N/A'}</td>
            `;
            tbody.appendChild(row);
        });
        
        // Initialize search functionality
        document.getElementById('historySearch').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = tbody.querySelectorAll('tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
        
        // Status filter change
        document.getElementById('historyStatusFilter').addEventListener('change', function() {
            loadPaymentHistory(this.value);
        });
    } catch (error) {
        console.error('Error loading payment history:', error);
        document.getElementById('paymentHistoryBody').innerHTML = 
            '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load payment history</td></tr>';
    }
}

function formatPaymentMethod(method) {
    const methodMap = {
        'bank_transfer': 'Bank Transfer',
        'mobile_money': 'Mobile Money',
        'cash': 'Cash'
    };
    return methodMap[method] || method;
}

// Modals
function setupModals() {
    // Assign Employee Modal
    const assignEmployeeModal = document.getElementById('assignEmployeeModal');
    const assignEmployeeForm = document.getElementById('assignEmployeeForm');
    const cancelAssignBtn = document.getElementById('cancelAssignBtn');
    
    window.openAssignEmployeeModal = function(opportunityId) {
        document.getElementById('currentOpportunityId').value = opportunityId;
        assignEmployeeModal.style.display = 'block';
    };
    
    cancelAssignBtn.addEventListener('click', function() {
        assignEmployeeModal.style.display = 'none';
        assignEmployeeForm.reset();
    });
    
    assignEmployeeForm.addEventListener('submit', assignEmployeeToOpportunity);
    
    // Approval Modal
    const approvalModal = document.getElementById('approvalModal');
    const closeApprovalBtn = document.querySelector('#approvalModal .close-btn');
    
    closeApprovalBtn.addEventListener('click', function() {
        approvalModal.style.display = 'none';
    });
    
    document.getElementById('approveBtn').addEventListener('click', function() {
        processApproval(true);
    });
    
    document.getElementById('rejectBtn').addEventListener('click', function() {
        processApproval(false);
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === assignEmployeeModal) {
            assignEmployeeModal.style.display = 'none';
            assignEmployeeForm.reset();
        }
        if (event.target === approvalModal) {
            approvalModal.style.display = 'none';
        }
    });
}

async function assignEmployeeToOpportunity(e) {
    e.preventDefault();
    
    const employeeId = document.getElementById('employeeToAssign').value;
    const opportunityId = document.getElementById('currentOpportunityId').value;
    
    // Reset error
    document.getElementById('assignEmployeeError').style.display = 'none';
    
    if (!employeeId) {
        document.getElementById('assignEmployeeError').style.display = 'block';
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Assigning...';
        submitBtn.disabled = true;
        
        const response = await fetch('https://man-m681.onrender.com/opportunity-assignments/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                opportunity_id: opportunityId,
                employee_id: employeeId
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to assign employee');
        }
        
        const data = await response.json();
        alert('Employee assigned successfully!');
        e.target.reset();
        document.getElementById('assignEmployeeModal').style.display = 'none';
        await loadWorkOpportunities();
    } catch (error) {
        console.error('Error assigning employee:', error);
        alert('Failed to assign employee. Please try again.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function openApprovalModal(paymentId, employeeName, amount, period, requestDate) {
    const modal = document.getElementById('approvalModal');
    document.getElementById('approvalPaymentId').value = paymentId;
    document.getElementById('modalEmployee').textContent = employeeName;
    document.getElementById('modalAmount').textContent = `UGX ${amount.toLocaleString()}`;
    document.getElementById('modalPeriod').textContent = period;
    document.getElementById('modalRequestDate').textContent = requestDate;
    
    modal.style.display = 'block';
}

async function processApproval(approve) {
    const paymentId = document.getElementById('approvalPaymentId').value;
    const remarks = document.getElementById('approvalRemarks').value;
    
    if (!paymentId) {
        alert('Invalid payment ID');
        return;
    }
    
    const btn = approve ? document.getElementById('approveBtn') : document.getElementById('rejectBtn');
    const originalText = btn.innerHTML;
    
    try {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;
        
        const response = await fetch('https://man-m681.onrender.com/payments/approve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                payment_id: parseInt(paymentId),
                approved: approve,
                remarks: remarks
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to process approval');
        }
        
        const data = await response.json();
        alert(data.message);
        
        // Close modal and refresh data
        document.getElementById('approvalModal').style.display = 'none';
        document.getElementById('approvalRemarks').value = '';
        
        // Refresh both pending and history tabs
        await loadPendingPayments();
        await loadPaymentHistory();
    } catch (error) {
        console.error('Error processing approval:', error);
        alert(`Error: ${error.message}`);
    } finally {
        btn.innerHTML = approve ? '<i class="fas fa-check"></i> Approve' : '<i class="fas fa-times"></i> Reject';
        btn.disabled = false;
    }
}

// Collapsible Sections
function setupCollapsibleSections() {
    const opportunitiesHeading = document.getElementById('opportunitiesHeading');
    const opportunitiesContent = document.getElementById('opportunitiesContent');
    const deploymentsHeading = document.getElementById('deploymentsHeading');
    const deploymentsContent = document.getElementById('deploymentsContent');
    
    // Set initial state (collapsed)
    opportunitiesContent.style.maxHeight = '0';
    deploymentsContent.style.maxHeight = '0';
    
    // Toggle opportunities section
    opportunitiesHeading.addEventListener('click', function() {
        if (opportunitiesContent.style.maxHeight === '0px') {
            opportunitiesContent.style.maxHeight = opportunitiesContent.scrollHeight + 'px';
            loadWorkOpportunities();
        } else {
            opportunitiesContent.style.maxHeight = '0';
        }
    });
    
    // Toggle deployments section
    deploymentsHeading.addEventListener('click', function() {
        if (deploymentsContent.style.maxHeight === '0px') {
            deploymentsContent.style.maxHeight = deploymentsContent.scrollHeight + 'px';
            loadDeployments();
        } else {
            deploymentsContent.style.maxHeight = '0';
        }
    });
}

// Global functions
window.editEmployee = async function(employeeId) {
    try {
        const response = await fetch(`https://man-m681.onrender.com/employees/${employeeId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch employee');
        }
        
        const employee = await response.json();
        
        // Populate form
        document.getElementById('employeeName').value = employee.name;
        document.getElementById('employeeNIN').value = employee.nin;
        document.getElementById('employeeDOB').value = employee.dob;
        document.getElementById('employeeQualification').value = employee.qualification;
        document.getElementById('employeeEmail').value = employee.email || '';
        document.getElementById('employeePhone').value = employee.phone || '';
        document.getElementById('text').value = employee.profession || '';
        
        // Change form title and button
        document.querySelector('.employee-form-container .section-title').textContent = 'Edit Employee';
        document.getElementById('employeeForm').querySelector('button[type="submit"]').textContent = 'Update Employee';
        
        // Scroll to form
        document.querySelector('.employee-form-container').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error editing employee:', error);
        alert('Failed to load employee for editing');
    }
};

window.deleteEmployee = async function(employeeId) {
    if (!confirm('Are you sure you want to delete this employee?')) {
        return;
    }
    
    try {
        const response = await fetch(`https://man-m681.onrender.com/employees/${employeeId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete employee');
        }
        
        alert('Employee deleted successfully');
        await loadEmployees();
    } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Failed to delete employee');
    }
};

window.editDeployment = function(deploymentId) {
    alert(`Edit deployment ${deploymentId} functionality will be implemented`);
};

window.deleteDeployment = async function(deploymentId) {
    if (!confirm('Are you sure you want to remove this deployment?')) {
        return;
    }
    
    try {
        const response = await fetch(`https://man-m681.onrender.com/deployments/${deploymentId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete deployment');
        }
        
        alert('Deployment removed successfully');
        await loadDeployments();
    } catch (error) {
        console.error('Error deleting deployment:', error);
        alert('Failed to delete deployment');
    }
};
