// File Manager Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize file manager
    initFileManager();
    
    // Set up event listeners
    setupFileManagerEvents();
});

// Global variables
let currentPath = [];
let filesToUpload = [];
let currentFileId = null;
let currentFileName = null;
let currentFileType = null;

function initFileManager() {
    // Load initial content (root folder)
    loadFolderContents('');
    
    // Initialize breadcrumb
    updateBreadcrumb();
}

function setupFileManagerEvents() {
    // Upload files button
    document.getElementById('uploadFilesBtn').addEventListener('click', openUploadModal);
    
    // Create folder button
    document.getElementById('createFolderBtn').addEventListener('click', openCreateFolderModal);
    
    // Browse files button
    document.getElementById('browseFilesBtn').addEventListener('click', () => {
        document.getElementById('fileUploadInput').click();
    });
    
    // File input change
    document.getElementById('fileUploadInput').addEventListener('change', handleFileSelect);
    
    // Start upload button
    document.getElementById('startUploadBtn').addEventListener('click', startUpload);
    
    // Upload area drag and drop
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#3498db';
        uploadArea.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#ccc';
        uploadArea.style.backgroundColor = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ccc';
        uploadArea.style.backgroundColor = '';
        
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect({ target: { files: e.dataTransfer.files } });
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('uploadModal')) {
            closeUploadModal();
        }
        if (e.target === document.getElementById('folderCreateModal')) {
            closeCreateFolderModal();
        }
        if (e.target === document.getElementById('filePreviewModal')) {
            closePreview();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeUploadModal();
            closeCreateFolderModal();
            closePreview();
        }
    });
}

// File manager functions
function loadFolderContents(folderId) {
    // In a real application, you would fetch this from your backend
    // For demo purposes, we'll use mock data
    
    const fileManagerGrid = document.getElementById('fileManagerGrid');
    fileManagerGrid.innerHTML = '<div class="loading">Loading folder contents...</div>';
    
    // Simulate API call delay
    setTimeout(() => {
        // Mock data for folders and files
        const mockData = {
            folders: [
                { id: 'proposals', name: 'Proposals' },
                { id: 'reports', name: 'Reports' },
                { id: 'budgets', name: 'Budgets' }
            ],
            files: [
                { id: 'annual_report', name: 'Annual_Report_2023.pdf', type: 'pdf', size: '2.4 MB' },
                { id: 'budget_2024', name: 'Budget_2024.xlsx', type: 'xlsx', size: '1.1 MB' },
                { id: 'fundraising_plan', name: 'Fundraising_Plan.docx', type: 'docx', size: '0.8 MB' },
                { id: 'event_photos', name: 'Event_Photos.zip', type: 'zip', size: '15.2 MB' }
            ]
        };
        
        // Clear the grid
        fileManagerGrid.innerHTML = '';
        
        // Add folders
        mockData.folders.forEach(folder => {
            const folderItem = createFolderElement(folder);
            fileManagerGrid.appendChild(folderItem);
        });
        
        // Add files
        mockData.files.forEach(file => {
            const fileItem = createFileElement(file);
            fileManagerGrid.appendChild(fileItem);
        });
        
        // If no items, show message
        if (mockData.folders.length === 0 && mockData.files.length === 0) {
            fileManagerGrid.innerHTML = '<div class="empty-folder">This folder is empty</div>';
        }
    }, 500);
}

function createFolderElement(folder) {
    const folderItem = document.createElement('div');
    folderItem.className = 'folder-item';
    folderItem.setAttribute('data-folder-id', folder.id);
    folderItem.setAttribute('data-folder-name', folder.name);
    
    folderItem.innerHTML = `
        <div class="folder-icon">
            <i class="fas fa-folder"></i>
        </div>
        <div class="folder-name">${folder.name}</div>
        <div class="file-actions-menu" onclick="event.stopPropagation(); toggleFolderActions(event, '${folder.id}')">
            <i class="fas fa-ellipsis-v"></i>
        </div>
        <div class="file-actions-dropdown" id="folder-actions-${folder.id}">
            <div class="file-action-item" onclick="renameFolder('${folder.id}', '${folder.name}')">
                <i class="fas fa-pencil-alt"></i> Rename
            </div>
            <div class="file-action-item" onclick="deleteFolder('${folder.id}')">
                <i class="fas fa-trash"></i> Delete
            </div>
        </div>
    `;
    
    // Add click event to navigate into folder
    folderItem.addEventListener('click', () => {
        navigateIntoFolder(folder.id, folder.name);
    });
    
    return folderItem;
}

function createFileElement(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.setAttribute('data-file-id', file.id);
    fileItem.setAttribute('data-file-name', file.name);
    
    // Get icon based on file type
    const fileIcon = getFileIcon(file.type);
    
    fileItem.innerHTML = `
        <div class="file-icon">
            <i class="${fileIcon}"></i>
        </div>
        <div class="file-name">${file.name}</div>
        <div class="file-actions-menu" onclick="event.stopPropagation(); toggleFileActions(event, '${file.id}')">
            <i class="fas fa-ellipsis-v"></i>
        </div>
        <div class="file-actions-dropdown" id="file-actions-${file.id}">
            <div class="file-action-item" onclick="previewFile('${file.id}', '${file.name}', '${file.type}')">
                <i class="fas fa-eye"></i> Preview
            </div>
            <div class="file-action-item" onclick="downloadFile('${file.id}', '${file.name}')">
                <i class="fas fa-download"></i> Download
            </div>
            <div class="file-action-item" onclick="renameFile('${file.id}', '${file.name}')">
                <i class="fas fa-pencil-alt"></i> Rename
            </div>
            <div class="file-action-item" onclick="deleteFile('${file.id}', '${file.name}')">
                <i class="fas fa-trash"></i> Delete
            </div>
        </div>
    `;
    
    return fileItem;
}

function getFileIcon(fileType) {
    const iconMap = {
        'pdf': 'fas fa-file-pdf',
        'docx': 'fas fa-file-word',
        'xlsx': 'fas fa-file-excel',
        'pptx': 'fas fa-file-powerpoint',
        'jpg': 'fas fa-file-image',
        'png': 'fas fa-file-image',
        'zip': 'fas fa-file-archive',
        'txt': 'fas fa-file-alt',
        'default': 'fas fa-file'
    };
    
    return iconMap[fileType] || iconMap.default;
}

function navigateIntoFolder(folderId, folderName) {
    // Add to current path
    currentPath.push({ id: folderId, name: folderName });
    
    // Update breadcrumb
    updateBreadcrumb();
    
    // Load folder contents
    loadFolderContents(folderId);
}

function updateBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = '';
    
    // Add root item
    const rootItem = document.createElement('span');
    rootItem.className = 'breadcrumb-item';
    rootItem.textContent = 'Fundraising Documents';
    rootItem.setAttribute('data-path', '');
    rootItem.addEventListener('click', () => {
        currentPath = [];
        updateBreadcrumb();
        loadFolderContents('');
    });
    breadcrumb.appendChild(rootItem);
    
    // Add path items
    currentPath.forEach((folder, index) => {
        const separator = document.createElement('span');
        separator.className = 'breadcrumb-separator';
        separator.textContent = ' / ';
        breadcrumb.appendChild(separator);
        
        const item = document.createElement('span');
        item.className = 'breadcrumb-item';
        item.textContent = folder.name;
        item.setAttribute('data-path', folder.id);
        
        // Navigate to this folder when clicked
        item.addEventListener('click', () => {
            currentPath = currentPath.slice(0, index + 1);
            updateBreadcrumb();
            loadFolderContents(folder.id);
        });
        
        breadcrumb.appendChild(item);
    });
}

// File actions
function toggleFileActions(event, fileId) {
    event.stopPropagation();
    
    // Hide all other dropdowns
    document.querySelectorAll('.file-actions-dropdown').forEach(dropdown => {
        if (dropdown.id !== `file-actions-${fileId}`) {
            dropdown.classList.remove('show');
        }
    });
    
    // Toggle current dropdown
    const dropdown = document.getElementById(`file-actions-${fileId}`);
    dropdown.classList.toggle('show');
}

function toggleFolderActions(event, folderId) {
    event.stopPropagation();
    
    // Hide all other dropdowns
    document.querySelectorAll('.file-actions-dropdown').forEach(dropdown => {
        if (dropdown.id !== `folder-actions-${folderId}`) {
            dropdown.classList.remove('show');
        }
    });
    
    // Toggle current dropdown
    const dropdown = document.getElementById(`folder-actions-${folderId}`);
    dropdown.classList.toggle('show');
}

function previewFile(fileId, fileName, fileType) {
    currentFileId = fileId;
    currentFileName = fileName;
    currentFileType = fileType;
    
    const modal = document.getElementById('filePreviewModal');
    const previewContent = document.getElementById('previewFileContent');
    const fileNameElement = document.getElementById('previewFileName');
    
    fileNameElement.textContent = fileName;
    
    // Clear previous content
    previewContent.innerHTML = '';
    
    // Based on file type, show appropriate preview
    if (fileType === 'pdf') {
        // For PDFs, we'll use an iframe
        const iframe = document.createElement('iframe');
        iframe.className = 'file-preview-iframe';
        iframe.src = `path/to/files/${fileId}`; // In a real app, this would be your file URL
        previewContent.appendChild(iframe);
    } else if (['jpg', 'png', 'jpeg', 'gif'].includes(fileType)) {
        // For images, show the image directly
        const img = document.createElement('img');
        img.className = 'file-preview-image';
        img.src = `path/to/files/${fileId}`; // In a real app, this would be your file URL
        img.alt = fileName;
        previewContent.appendChild(img);
    } else {
        // For unsupported types, show a message
        previewContent.innerHTML = `
            <div class="unsupported-preview">
                <i class="fas fa-file-alt"></i>
                <p>Preview not available for this file type</p>
                <p>Please download the file to view it</p>
            </div>
        `;
    }
    
    modal.classList.add('show');
}

function closePreview() {
    document.getElementById('filePreviewModal').classList.remove('show');
    currentFileId = null;
    currentFileName = null;
    currentFileType = null;
}

function downloadFile(fileId, fileName) {
    // In a real application, this would link to your backend download endpoint
    console.log(`Downloading file: ${fileName} (ID: ${fileId})`);
    
    // Create a temporary link to simulate download
    const link = document.createElement('a');
    link.href = `path/to/files/${fileId}/download`; // This would be your actual download endpoint
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    showToast(`Downloading ${fileName}...`);
}

function downloadCurrentFile() {
    if (currentFileId && currentFileName) {
        downloadFile(currentFileId, currentFileName);
    }
}

function renameFile(fileId, currentName) {
    const newName = prompt('Enter new file name:', currentName);
    if (newName && newName !== currentName) {
        // In a real application, you would send this to your backend
        console.log(`Renaming file ${fileId} from "${currentName}" to "${newName}"`);
        
        // Update the UI
        const fileItem = document.querySelector(`.file-item[data-file-id="${fileId}"]`);
        if (fileItem) {
            fileItem.setAttribute('data-file-name', newName);
            fileItem.querySelector('.file-name').textContent = newName;
        }
        
        showToast(`File renamed to ${newName}`);
    }
}

function deleteFile(fileId, fileName) {
    if (confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
        // In a real application, you would send this to your backend
        console.log(`Deleting file ${fileId} (${fileName})`);
        
        // Remove from UI
        const fileItem = document.querySelector(`.file-item[data-file-id="${fileId}"]`);
        if (fileItem) {
            fileItem.remove();
        }
        
        showToast(`File "${fileName}" deleted`);
    }
}

function renameFolder(folderId, currentName) {
    const newName = prompt('Enter new folder name:', currentName);
    if (newName && newName !== currentName) {
        // In a real application, you would send this to your backend
        console.log(`Renaming folder ${folderId} from "${currentName}" to "${newName}"`);
        
        // Update the UI
        const folderItem = document.querySelector(`.folder-item[data-folder-id="${folderId}"]`);
        if (folderItem) {
            folderItem.setAttribute('data-folder-name', newName);
            folderItem.querySelector('.folder-name').textContent = newName;
            
            // Update breadcrumb if this folder is in the current path
            currentPath.forEach(folder => {
                if (folder.id === folderId) {
                    folder.name = newName;
                }
            });
            updateBreadcrumb();
        }
        
        showToast(`Folder renamed to ${newName}`);
    }
}

function deleteFolder(folderId) {
    const folderItem = document.querySelector(`.folder-item[data-folder-id="${folderId}"]`);
    const folderName = folderItem ? folderItem.getAttribute('data-folder-name') : 'this folder';
    
    if (confirm(`Are you sure you want to delete "${folderName}" and all its contents? This action cannot be undone.`)) {
        // In a real application, you would send this to your backend
        console.log(`Deleting folder ${folderId} (${folderName})`);
        
        // Remove from UI
        if (folderItem) {
            folderItem.remove();
        }
        
        showToast(`Folder "${folderName}" deleted`);
    }
}

// Upload functionality
function openUploadModal() {
    // Reset upload state
    filesToUpload = [];
    document.getElementById('fileUploadInput').value = '';
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('progressBarFill').style.width = '0%';
    document.getElementById('startUploadBtn').disabled = true;
    
    // Open modal
    document.getElementById('uploadModal').classList.add('show');
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.remove('show');
}

function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        filesToUpload = Array.from(files);
        updateUploadList();
        document.getElementById('startUploadBtn').disabled = false;
    }
}

function updateUploadList() {
    const uploadArea = document.getElementById('uploadArea');
    
    // Clear previous content but keep the upload area structure
    uploadArea.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <p>Ready to upload ${filesToUpload.length} file(s)</p>
        <div id="fileList"></div>
        <p class="small">Click "Upload" to proceed</p>
        <input type="file" id="fileUploadInput" multiple>
    `;
    
    // Add file list
    const fileList = document.getElementById('fileList');
    filesToUpload.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-upload-item';
        fileItem.innerHTML = `
            <i class="${getFileIcon(file.name.split('.').pop())}"></i>
            <span>${file.name}</span>
            <span>(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
        `;
        fileList.appendChild(fileItem);
    });
    
    // Reattach event listeners
    document.getElementById('fileUploadInput').addEventListener('change', handleFileSelect);
    document.getElementById('browseFilesBtn').addEventListener('click', () => {
        document.getElementById('fileUploadInput').click();
    });
}

function startUpload() {
    if (filesToUpload.length === 0) return;
    
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBarFill');
    const startUploadBtn = document.getElementById('startUploadBtn');
    
    // Show progress
    uploadProgress.style.display = 'block';
    startUploadBtn.disabled = true;
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Upload complete
            setTimeout(() => {
                uploadComplete();
            }, 500);
        }
        progressBar.style.width = `${progress}%`;
    }, 200);
}

function uploadComplete() {
    // In a real application, you would handle the actual file upload here
    console.log('Upload complete', filesToUpload);
    
    // Show success message
    showToast(`Successfully uploaded ${filesToUpload.length} file(s)`);
    
    // Close modal and refresh file list
    closeUploadModal();
    loadFolderContents(currentPath.length > 0 ? currentPath[currentPath.length - 1].id : '');
}

// Folder creation
function openCreateFolderModal() {
    document.getElementById('newFolderName').value = '';
    document.getElementById('folderCreateModal').classList.add('show');
}

function closeCreateFolderModal() {
    document.getElementById('folderCreateModal').classList.remove('show');
}

function createNewFolder() {
    const folderName = document.getElementById('newFolderName').value.trim();
    if (!folderName) {
        alert('Please enter a folder name');
        return;
    }
    
    // In a real application, you would send this to your backend
    const newFolderId = `folder_${Date.now()}`;
    console.log(`Creating new folder: ${folderName} (ID: ${newFolderId})`);
    
    // Add to UI
    const fileManagerGrid = document.getElementById('fileManagerGrid');
    const folderItem = createFolderElement({ id: newFolderId, name: folderName });
    fileManagerGrid.appendChild(folderItem);
    
    // Close modal
    closeCreateFolderModal();
    showToast(`Folder "${folderName}" created`);
}

// Helper function to show toast messages
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Expose functions to global scope for inline event handlers
window.toggleFileActions = toggleFileActions;
window.toggleFolderActions = toggleFolderActions;
window.previewFile = previewFile;
window.downloadFile = downloadFile;
window.renameFile = renameFile;
window.deleteFile = deleteFile;
window.renameFolder = renameFolder;
window.deleteFolder = deleteFolder;
window.closePreview = closePreview;
window.downloadCurrentFile = downloadCurrentFile;
window.closeCreateFolderModal = closeCreateFolderModal;
window.createNewFolder = createNewFolder;
window.openUploadModal = openUploadModal;
window.closeUploadModal = closeUploadModal;
