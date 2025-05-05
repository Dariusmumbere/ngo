// donations.js

// Global variables
let currentDonorId = null;
let currentDonationId = null;

// Initialize donations functionality
document.addEventListener('DOMContentLoaded', function() {
    setupDonationsPage();
});

function setupDonationsPage() {
    // Initialize tab switching
    setupTabSwitching();
    
    // Set up event listeners
    document.getElementById('addDonationBtn').addEventListener('click', openAddDonationModal);
    document.getElementById('addDonorBtn').addEventListener('click', openAddDonorModal);
    
    // Load initial data based on active tab
    const activeTab = document.querySelector('.donations-tabs .tab-btn.active');
    if (activeTab) {
        loadTabContent(activeTab.getAttribute('data-tab'));
    }
    
    // Set up form submission handlers
    document.getElementById('donationForm').addEventListener('submit', handleDonationSubmit);
    document.getElementById('donorForm').addEventListener('submit', handleDonorSubmit);
}

function setupTabSwitching() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Load content for the active tab
            loadTabContent(tabId);
        });
    });
}

function loadTabContent(tabId) {
    switch(tabId) {
        case 'donationHistory':
            loadDonations();
            break;
        case 'receipts':
            loadReceipts();
            break;
        case 'donorProfiles':
            loadDonorProfiles();
            break;
    }
}

// Donation CRUD Operations
async function loadDonations() {
    try {
        const response = await fetch('https://man-m681.onrender.com/donations/');
        if (!response.ok) throw new Error('Failed to fetch donations');
        
        const donations = await response.json();
        const tableBody = document.querySelector('.donations-table tbody');
        tableBody.innerHTML = '';
        
        // Sort by date (newest first)
        donations.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        donations.forEach(donation => {
            const row = document.createElement('tr');
            row.setAttribute('data-donation-id', donation.id);
            row.innerHTML = `
                <td>${formatDate(donation.date)}</td>
                <td>${donation.donor_name}</td>
                <td>UGX ${donation.amount.toLocaleString()}</td>
                <td>${formatPaymentMethod(donation.payment_method)}</td>
                <td>${donation.project || 'General Fund'}</td>
                <td><span class="status-badge ${donation.status}">${donation.status}</span></td>
                <td>
                    <button class="action-btn view-btn" onclick="viewDonation(${donation.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="editDonation(${donation.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteDonation(${donation.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading donations:', error);
        showToast('Failed to load donations', 'error');
    }
}

async function viewDonation(donationId) {
    try {
        const response = await fetch(`https://man-m681.onrender.com/donations/${donationId}`);
        if (!response.ok) throw new Error('Failed to fetch donation');
        
        const donation = await response.json();
        
        // Create and show modal with donation details
        const modalHtml = `
            <div class="donation-modal show" id="viewDonationModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Donation Details</h3>
                        <button class="close-btn" onclick="closeModal('viewDonationModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="donor-stats">
                            <div class="stat-item">
                                <span class="stat-label">Donor Name:</span>
                                <span class="stat-value">${donation.donor_name}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Amount:</span>
                                <span class="stat-value">UGX ${donation.amount.toLocaleString()}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Date:</span>
                                <span class="stat-value">${formatDate(donation.date)}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Payment Method:</span>
                                <span class="stat-value">${formatPaymentMethod(donation.payment_method)}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Project:</span>
                                <span class="stat-value">${donation.project || 'General Fund'}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Status:</span>
                                <span class="stat-value">${donation.status}</span>
                            </div>
                            ${donation.notes ? `
                            <div class="stat-item">
                                <span class="stat-label">Notes:</span>
                                <span class="stat-value">${donation.notes}</span>
                            </div>` : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="file-manager-btn" onclick="editDonation(${donation.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="file-manager-btn secondary" onclick="closeModal('viewDonationModal')">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    } catch (error) {
        console.error('Error viewing donation:', error);
        showToast('Failed to load donation details', 'error');
    }
}

async function editDonation(donationId) {
    try {
        // Close any open modals
        closeModal('viewDonationModal');
        
        const response = await fetch(`https://man-m681.onrender.com/donations/${donationId}`);
        if (!response.ok) throw new Error('Failed to fetch donation');
        
        const donation = await response.json();
        
        // Populate the form
        document.getElementById('donorName').value = donation.donor_name;
        document.getElementById('donationAmount').value = donation.amount;
        document.getElementById('paymentMethod').value = donation.payment_method;
        document.getElementById('donationDate').value = donation.date.split('T')[0]; // Format date for input
        document.getElementById('donationProject').value = donation.project || '';
        document.getElementById('donationNotes').value = donation.notes || '';
        
        // Update modal title and button text
        document.querySelector('#addDonationModal .modal-header h3').textContent = 'Edit Donation';
        document.querySelector('#addDonationModal .modal-footer .file-manager-btn').textContent = 'Update Donation';
        
        // Store donation ID for update
        document.getElementById('addDonationModal').dataset.donationId = donationId;
        
        // Open modal
        document.getElementById('addDonationModal').classList.add('show');
    } catch (error) {
        console.error('Error editing donation:', error);
        showToast('Failed to load donation for editing', 'error');
    }
}

async function deleteDonation(donationId) {
    if (!confirm('Are you sure you want to delete this donation record?')) {
        return;
    }
    
    try {
        const response = await fetch(`https://man-m681.onrender.com/donations/${donationId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete donation');
        
        // Remove from UI
        document.querySelector(`.donations-table tbody tr[data-donation-id="${donationId}"]`)?.remove();
        document.getElementById(`receipt-${donationId}`)?.remove();
        
        showToast('Donation deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting donation:', error);
        showToast('Failed to delete donation', 'error');
    }
}

// Donor CRUD Operations
async function loadDonorProfiles(search = '') {
    try {
        const response = await fetch(`https://man-m681.onrender.com/donors/?search=${encodeURIComponent(search)}`);
        if (!response.ok) throw new Error('Failed to fetch donors');
        
        const donors = await response.json();
        const donorCardsContainer = document.querySelector('.donor-cards');
        donorCardsContainer.innerHTML = '';
        
        if (donors.length === 0) {
            donorCardsContainer.innerHTML = '<p class="no-results">No donors found</p>';
            return;
        }
        
        // Get donor stats in parallel
        const statsResponse = await fetch('https://man-m681.onrender.com/donors/stats/');
        const statsData = await statsResponse.json();
        const stats = statsData.donor_stats;
        
        donors.forEach(donor => {
            const donorStats = stats[donor.id] || {
                donation_count: 0,
                total_donated: 0,
                first_donation: null,
                last_donation: null
            };
            
            const card = document.createElement('div');
            card.className = 'donor-card';
            card.innerHTML = `
                <div class="donor-avatar">
                    <i class="fas ${donor.donor_type === 'corporate' ? 'fa-building' : 'fa-user'}"></i>
                </div>
                <div class="donor-info">
                    <h3 class="donor-name">${donor.name}</h3>
                    <div class="donor-contact">
                        ${donor.email ? `<span><i class="fas fa-envelope"></i> ${donor.email}</span>` : ''}
                        ${donor.phone ? `<span><i class="fas fa-phone"></i> ${donor.phone}</span>` : ''}
                    </div>
                    <div class="donor-stats">
                        <div class="stat-item">
                            <span class="stat-label">Total Donations:</span>
                            <span class="stat-value">UGX ${donorStats.total_donated.toLocaleString()}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Donation Count:</span>
                            <span class="stat-value">${donorStats.donation_count}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">First Donation:</span>
                            <span class="stat-value">${donorStats.first_donation || '-'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Last Donation:</span>
                            <span class="stat-value">${donorStats.last_donation || '-'}</span>
                        </div>
                    </div>
                </div>
                <div class="donor-actions">
                    <button class="file-manager-btn secondary" onclick="editDonor(${donor.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="file-manager-btn" onclick="viewDonorHistory(${donor.id})">
                        <i class="fas fa-history"></i> View History
                    </button>
                    <button class="file-manager-btn delete-btn" onclick="deleteDonor(${donor.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            donorCardsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading donors:', error);
        showToast('Failed to load donor profiles', 'error');
    }
}

async function editDonor(donorId) {
    currentDonorId = donorId;
    try {
        const response = await fetch(`https://man-m681.onrender.com/donors/${donorId}`);
        if (!response.ok) throw new Error('Failed to fetch donor');
        
        const donor = await response.json();
        
        // Populate the form
        document.getElementById('donorProfileName').value = donor.name;
        document.getElementById('donorEmail').value = donor.email || '';
        document.getElementById('donorPhone').value = donor.phone || '';
        document.getElementById('donorAddress').value = donor.address || '';
        document.getElementById('donorType').value = donor.donor_type || 'individual';
        document.getElementById('donorCategory').value = donor.category || 'one-time';
        document.getElementById('donorNotes').value = donor.notes || '';
        
        // Load donation history
        await loadDonorDonations(donorId);
        
        // Update modal title and button
        document.getElementById('donorModalTitle').textContent = 'Edit Donor Profile';
        document.getElementById('saveDonorBtn').textContent = 'Update Donor';
        
        // Show modal
        document.getElementById('donorModal').classList.add('show');
    } catch (error) {
        console.error('Error loading donor:', error);
        showToast('Failed to load donor details', 'error');
    }
}

async function deleteDonor(donorId) {
    if (!confirm('Are you sure you want to delete this donor? All associated donations will be kept but unlinked.')) {
        return;
    }
    
    try {
        const response = await fetch(`https://man-m681.onrender.com/donors/${donorId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete donor');
        
        showToast('Donor deleted successfully', 'success');
        loadDonorProfiles();
    } catch (error) {
        console.error('Error deleting donor:', error);
        showToast('Failed to delete donor', 'error');
    }
}

async function loadDonorDonations(donorId) {
    try {
        const response = await fetch(`https://man-m681.onrender.com/donors/${donorId}/donations`);
        if (!response.ok) throw new Error('Failed to fetch donor donations');
        
        const data = await response.json();
        const tbody = document.querySelector('#donorDonationsTable tbody');
        tbody.innerHTML = '';
        
        if (data.donations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No donation history</td></tr>';
        } else {
            data.donations.forEach(donation => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formatDate(donation.date)}</td>
                    <td>UGX ${donation.amount.toLocaleString()}</td>
                    <td>${donation.project || 'General Fund'}</td>
                    <td>${donation.status}</td>
                `;
                tbody.appendChild(row);
            });
        }
        
        // Update stats
        document.getElementById('totalDonations').textContent = `UGX ${data.total_donations.toLocaleString()}`;
        document.getElementById('donationCount').textContent = data.donation_count;
        document.getElementById('firstDonation').textContent = data.first_donation || '-';
        document.getElementById('lastDonation').textContent = data.last_donation || '-';
    } catch (error) {
        console.error('Error loading donor donations:', error);
        showToast('Failed to load donation history', 'error');
    }
}

// Receipts Management
async function loadReceipts() {
    try {
        const response = await fetch('https://man-m681.onrender.com/donations/');
        if (!response.ok) throw new Error('Failed to fetch donations');
        
        const donations = await response.json();
        const receiptsGrid = document.getElementById('receiptsGrid');
        receiptsGrid.innerHTML = '';
        
        if (donations.length === 0) {
            receiptsGrid.innerHTML = '<p class="no-receipts">No receipts available</p>';
            return;
        }
        
        // Generate receipts for all donations
        donations.forEach(donation => {
            generateReceipt(donation);
        });
    } catch (error) {
        console.error('Error loading receipts:', error);
        showToast('Failed to load receipts', 'error');
    }
}

function generateReceipt(donation) {
    const receiptHTML = `
        <div class="receipt-card" id="receipt-${donation.id}">
            <div class="receipt-header">
                <div class="receipt-org-info">
                    <img src="logo.jpg" alt="RCDNET Logo" class="receipt-logo">
                    <h2>RWENZORI COMMUNITY DEVELOPMENT NETWORK (RCDNET)</h2>
                </div>
                <div class="receipt-title">
                    <h3>DONATION CONFIRMATION</h3>
                    <p>Receipt issued at RCDNET</p>
                    <p>P.O.Box 558, Kasese, Western Uganda</p>
                    <p>Tax ID No. 1027222682</p>
                    <p>Registration No: 808593</p>
                    <p>Community Registration No. CE/CBS/008</p>
                </div>
            </div>
            
            <div class="receipt-body">
                <div class="receipt-donor-info">
                    <div class="receipt-row">
                        <span class="receipt-label">To:</span>
                        <span class="receipt-value">${donation.donor_name}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">Date:</span>
                        <span class="receipt-value">${formatDate(donation.date)}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">Amount:</span>
                        <span class="receipt-value">UGX ${donation.amount.toLocaleString()}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">Payment Method:</span>
                        <span class="receipt-value">${formatPaymentMethod(donation.payment_method)}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="stat-label">Project:</span>
                        <span class="stat-value">${donation.project || 'General Fund'}</span>
                    </div>
                </div>
                
                <div class="receipt-message">
                    <p>Dear ${donation.donor_name},</p>
                    <p>RCDNET confirms your donation of UGX ${donation.amount.toLocaleString()} on ${formatDate(donation.date)}. Thank you so much for caring about ${donation.project || 'our cause'}. We are deeply grateful for your generous gift.</p>
                    
                    <div class="receipt-contact-info">
                        <p>For enquiries call +256 704240309 or email to info@rwenzori-development.org</p>
                        <p>Website: www.rwenzori-development.org</p>
                        <p>YouTube: https://youtube.com/@rwenzoricommunitydevelopme7810?si=zYLqI2Iajh0iQuAq</p>
                        <p>Instagram: https://www.instagram.com/rwenzoridevelopment_rcdnet</p>
                        <p>Facebook: https://www.facebook.com/profile.php?id=100066779636297</p>
                    </div>
                </div>
                
                <div class="receipt-footer">
                    <p>This receipt serves as official confirmation of your donation to RCDNET.</p>
                    <p>Thank you for your support!</p>
                </div>
            </div>
            
            <div class="receipt-actions">
                <button class="file-manager-btn" onclick="downloadReceipt(${donation.id})">
                    <i class="fas fa-download"></i> Download PDF
                </button>
                <button class="file-manager-btn secondary" onclick="emailReceipt(${donation.id})">
                    <i class="fas fa-envelope"></i> Email Receipt
                </button>
                <button class="file-manager-btn secondary" onclick="printReceipt(${donation.id})">
                    <i class="fas fa-print"></i> Print Receipt
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('receiptsGrid').insertAdjacentHTML('afterbegin', receiptHTML);
}

function downloadReceipt(donationId) {
    const receiptElement = document.getElementById(`receipt-${donationId}`);
    if (!receiptElement) {
        showToast('Receipt not found', 'error');
        return;
    }
    
    // Create a clone to remove action buttons
    const clone = receiptElement.cloneNode(true);
    clone.querySelector('.receipt-actions').remove();
    
    // Generate PDF
    const opt = {
        margin: 10,
        filename: `RCDNET_Donation_Receipt_${donationId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(clone).save();
}

function emailReceipt(donationId) {
    const recipient = "rcdnetciuganda@gmail.com";
    const subject = encodeURIComponent("Donation acknowledgement");
    const body = encodeURIComponent(
        `Dear Donor, we are thrilled to receive your generous support. Your donation has been well received. Kindly find the donation confirmation attached here in.With kind regards. Mrs. Muhindo Justine. Board treasurer`
    );

    const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;
    window.open(gmailURL, '_blank');
}

function printReceipt(donationId) {
    const receiptElement = document.getElementById(`receipt-${donationId}`);
    if (!receiptElement) {
        showToast('Receipt not found', 'error');
        return;
    }
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print Receipt</title>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(receiptElement.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

// Form Handlers
function openAddDonationModal() {
    document.getElementById('addDonationModal').dataset.donationId = '';
    document.querySelector('#addDonationModal .modal-header h3').textContent = 'Add New Donation';
    document.querySelector('#addDonationModal .modal-footer .file-manager-btn').textContent = 'Save Donation';
    document.getElementById('donationForm').reset();
    document.getElementById('addDonationModal').classList.add('show');
    
    // Populate donor dropdown
    populateDonorDropdown();
}

function openAddDonorModal() {
    currentDonorId = null;
    document.getElementById('donorModalTitle').textContent = 'Add New Donor';
    document.getElementById('saveDonorBtn').textContent = 'Add Donor';
    document.getElementById('donorForm').reset();
    
    // Clear donation history
    document.querySelector('#donorDonationsTable tbody').innerHTML = 
        '<tr><td colspan="4">No donation history available</td></tr>';
    
    // Reset stats
    document.getElementById('totalDonations').textContent = 'UGX 0';
    document.getElementById('donationCount').textContent = '0';
    document.getElementById('firstDonation').textContent = '-';
    document.getElementById('lastDonation').textContent = '-';
    
    document.getElementById('donorModal').classList.add('show');
}

async function handleDonationSubmit(e) {
    e.preventDefault();
    
    const donationId = document.getElementById('addDonationModal').dataset.donationId;
    const isEdit = !!donationId;
    
    // Get form data
    const formData = {
        donor_name: document.getElementById('donorName').value.trim(),
        amount: parseFloat(document.getElementById('donationAmount').value),
        payment_method: document.getElementById('paymentMethod').value,
        date: document.getElementById('donationDate').value,
        project: document.getElementById('donationProject').value || null,
        notes: document.getElementById('donationNotes').value || null
    };
    
    // Validate
    if (!formData.donor_name || !formData.amount || !formData.payment_method || !formData.date) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        const submitBtn = document.querySelector('#addDonationModal .modal-footer .file-manager-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;
        
        const url = isEdit 
            ? `https://man-m681.onrender.com/donations/${donationId}`
            : 'https://man-m681.onrender.com/donations/';
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to save donation');
        
        const data = await response.json();
        
        // Update UI
        if (isEdit) {
            // Update existing row in table
            const row = document.querySelector(`.donations-table tr[data-donation-id="${donationId}"]`);
            if (row) {
                row.cells[0].textContent = formatDate(data.date);
                row.cells[1].textContent = data.donor_name;
                row.cells[2].textContent = `UGX ${data.amount.toLocaleString()}`;
                row.cells[3].textContent = formatPaymentMethod(data.payment_method);
                row.cells[4].textContent = data.project || 'General Fund';
            }
            
            // Update receipt if exists
            const receiptElement = document.getElementById(`receipt-${donationId}`);
            if (receiptElement) {
                receiptElement.remove();
            }
        }
        
        // Generate receipt
        generateReceipt(data);
        
        // Refresh donations list
        await loadDonations();
        
        showToast(`Donation ${isEdit ? 'updated' : 'added'} successfully`, 'success');
        closeDonationModal();
    } catch (error) {
        console.error('Error saving donation:', error);
        showToast(`Failed to ${isEdit ? 'update' : 'add'} donation`, 'error');
    } finally {
        const submitBtn = document.querySelector('#addDonationModal .modal-footer .file-manager-btn');
        submitBtn.innerHTML = isEdit ? 'Update Donation' : 'Save Donation';
        submitBtn.disabled = false;
    }
}

async function handleDonorSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('donorProfileName').value.trim(),
        email: document.getElementById('donorEmail').value.trim() || null,
        phone: document.getElementById('donorPhone').value.trim() || null,
        address: document.getElementById('donorAddress').value.trim() || null,
        donor_type: document.getElementById('donorType').value,
        notes: document.getElementById('donorNotes').value.trim() || null,
        category: document.getElementById('donorCategory').value
    };
    
    // Validate
    if (!formData.name) {
        showToast('Name is required', 'error');
        return;
    }
    
    try {
        const submitBtn = document.getElementById('saveDonorBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;
        
        const url = currentDonorId 
            ? `https://man-m681.onrender.com/donors/${currentDonorId}`
            : 'https://man-m681.onrender.com/donors/';
        const method = currentDonorId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to save donor');
        
        showToast(`Donor ${currentDonorId ? 'updated' : 'added'} successfully`, 'success');
        
        // Refresh donor list
        await loadDonorProfiles();
        
        // Close modal if not editing with existing donor
        if (!currentDonorId) {
            closeDonorModal();
        }
    } catch (error) {
        console.error('Error saving donor:', error);
        showToast(`Failed to ${currentDonorId ? 'update' : 'add'} donor`, 'error');
    } finally {
        const submitBtn = document.getElementById('saveDonorBtn');
        submitBtn.innerHTML = currentDonorId ? 'Update Donor' : 'Add Donor';
        submitBtn.disabled = false;
    }
}

// Helper Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatPaymentMethod(method) {
    const methodMap = {
        'mobile_money': 'Mobile Money',
        'bank_transfer': 'Bank Transfer',
        'western_union': 'Western Union',
        'paypal': 'PayPal',
        'cash': 'Cash',
        'other': 'Other'
    };
    
    return methodMap[method.toLowerCase()] || method;
}

function closeDonationModal() {
    document.getElementById('addDonationModal').classList.remove('show');
}

function closeDonorModal() {
    document.getElementById('donorModal').classList.remove('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

async function populateDonorDropdown() {
    try {
        const response = await fetch('https://man-m681.onrender.com/donors/');
        if (!response.ok) throw new Error('Failed to fetch donors');
        
        const donors = await response.json();
        const donorNameInput = document.getElementById('donorName');
        
        // Create or update datalist
        let datalist = document.getElementById('donorNamesList');
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = 'donorNamesList';
            donorNameInput.setAttribute('list', 'donorNamesList');
            document.body.appendChild(datalist);
        }
        
        datalist.innerHTML = '';
        donors.forEach(donor => {
            const option = document.createElement('option');
            option.value = donor.name;
            datalist.appendChild(option);
        });
    } catch (error) {
        console.error('Error populating donor dropdown:', error);
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
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

// Expose functions to global scope
window.viewDonation = viewDonation;
window.editDonation = editDonation;
window.deleteDonation = deleteDonation;
window.downloadReceipt = downloadReceipt;
window.emailReceipt = emailReceipt;
window.printReceipt = printReceipt;
window.closeDonationModal = closeDonationModal;
window.closeDonorModal = closeDonorModal;
window.closeModal = closeModal;
window.editDonor = editDonor;
window.deleteDonor = deleteDonor;
window.viewDonorHistory = viewDonorHistory;
