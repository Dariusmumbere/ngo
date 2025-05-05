// hr-management.js - Debugged version

document.addEventListener('DOMContentLoaded', function() {
    // Initialize payment functionality
    initPaymentProcessing();
    
    // Rest of your existing initialization code...
});

// Payment Processing Functions
function initPaymentProcessing() {
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
    document.getElementById('paymentRequestForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const employeeId = document.getElementById('paymentEmployee').value;
        const amount = parseFloat(document.getElementById('paymentAmount').value);
        const paymentPeriod = document.getElementById('paymentPeriod').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        const description = document.getElementById('paymentDescription').value;
        
        // Validation
        if (!employeeId || !amount || !paymentPeriod || !paymentMethod) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (amount <= 0) {
            alert('Payment amount must be greater than 0');
            return;
        }
        
        try {
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
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
            this.reset();
            
            // Refresh pending payments tab
            loadPendingPayments();
        } catch (error) {
            console.error('Error submitting payment request:', error);
            alert(`Error: ${error.message}`);
        } finally {
            const submitBtn = document.querySelector('#paymentRequestForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Request';
                submitBtn.disabled = false;
            }
        }
    });
    
    // Initialize modal close buttons
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Set the first tab as active by default if none is active
    if (!document.querySelector('.payment-tab-btn.active')) {
        document.querySelector('.payment-tab-btn').classList.add('active');
        document.querySelector('.payment-tab-content').classList.add('active');
        loadEmployeesForPayment();
    }
}

// Load employees for payment dropdown
async function loadEmployeesForPayment() {
    try {
        const response = await fetch('https://man-m681.onrender.com/employees/');
        if (!response.ok) throw new Error('Failed to fetch employees');
        
        const data = await response.json();
        const dropdown = document.getElementById('paymentEmployee');
        if (!dropdown) return;
        
        dropdown.innerHTML = '<option value="">Select Employee</option>';
        
        data.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.id;
            option.textContent = `${employee.name} (${employee.nin})`;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading employees:', error);
        alert('Failed to load employee list');
    }
}

// Load pending payments
async function loadPendingPayments() {
    try {
        const tbody = document.getElementById('pendingPaymentsBody');
        if (!tbody) return;
        
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
        const searchInput = document.getElementById('pendingSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const rows = tbody.querySelectorAll('tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }
    } catch (error) {
        console.error('Error loading pending payments:', error);
        const tbody = document.getElementById('pendingPaymentsBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load pending payments</td></tr>';
        }
    }
}

// Load payment history
async function loadPaymentHistory(statusFilter = '') {
    try {
        const tbody = document.getElementById('paymentHistoryBody');
        if (!tbody) return;
        
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
        const searchInput = document.getElementById('historySearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const rows = tbody.querySelectorAll('tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }
        
        // Status filter change
        const statusFilter = document.getElementById('historyStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', function() {
                loadPaymentHistory(this.value);
            });
        }
    } catch (error) {
        console.error('Error loading payment history:', error);
        const tbody = document.getElementById('paymentHistoryBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load payment history</td></tr>';
        }
    }
}

// Helper function to format payment method
function formatPaymentMethod(method) {
    const methodMap = {
        'bank_transfer': 'Bank Transfer',
        'mobile_money': 'Mobile Money',
        'cash': 'Cash'
    };
    return methodMap[method] || method;
}

// Open approval modal
function openApprovalModal(paymentId, employeeName, amount, period, requestDate) {
    const modal = document.getElementById('approvalModal');
    if (!modal) return;
    
    document.getElementById('approvalPaymentId').value = paymentId;
    document.getElementById('modalEmployee').textContent = employeeName;
    document.getElementById('modalAmount').textContent = `UGX ${amount.toLocaleString()}`;
    document.getElementById('modalPeriod').textContent = period;
    document.getElementById('modalRequestDate').textContent = requestDate;
    
    modal.style.display = 'block';
}

// Process approval/rejection
async function processApproval(approve) {
    const paymentId = document.getElementById('approvalPaymentId').value;
    const remarks = document.getElementById('approvalRemarks').value;
    
    if (!paymentId) {
        alert('Invalid payment ID');
        return;
    }
    
    try {
        const btn = approve ? document.getElementById('approveBtn') : document.getElementById('rejectBtn');
        const originalText = btn.innerHTML;
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
        alert(data.message || 'Payment processed successfully');
        
        // Close modal and refresh data
        document.getElementById('approvalModal').style.display = 'none';
        document.getElementById('approvalRemarks').value = '';
        
        // Refresh both pending and history tabs
        loadPendingPayments();
        loadPaymentHistory();
    } catch (error) {
        console.error('Error processing approval:', error);
        alert(`Error: ${error.message}`);
    } finally {
        const approveBtn = document.getElementById('approveBtn');
        const rejectBtn = document.getElementById('rejectBtn');
        if (approveBtn) {
            approveBtn.innerHTML = '<i class="fas fa-check"></i> Approve';
            approveBtn.disabled = false;
        }
        if (rejectBtn) {
            rejectBtn.innerHTML = '<i class="fas fa-times"></i> Reject';
            rejectBtn.disabled = false;
        }
    }
}

// Attach event listeners to approval buttons
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('approveBtn')?.addEventListener('click', async function() {
        await processApproval(true);
    });
    
    document.getElementById('rejectBtn')?.addEventListener('click', async function() {
        await processApproval(false);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('approvalModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Make functions available globally
window.loadEmployeesForPayment = loadEmployeesForPayment;
window.loadPendingPayments = loadPendingPayments;
window.loadPaymentHistory = loadPaymentHistory;
window.openApprovalModal = openApprovalModal;
window.processApproval = processApproval;
