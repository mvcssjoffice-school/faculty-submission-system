let currentTab = 'submissions';
let submissions = [];
let attendance = [];

document.addEventListener('DOMContentLoaded', function() {
    loadSubmissions();
});

function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (tab === 'submissions') {
        document.getElementById('submissionsTab').classList.add('active');
        if (submissions.length === 0) loadSubmissions();
    } else {
        document.getElementById('attendanceTab').classList.add('active');
        if (attendance.length === 0) loadAttendance();
    }
}

async function loadSubmissions() {
    const container = document.getElementById('submissionsTable');
    container.innerHTML = '<p class="loading">Loading submissions...</p>';
    
    try {
        const response = await fetch(CONFIG.APPS_SCRIPT_URL + '?action=getSubmissions');
        const result = await response.json();
        
        if (result.status === 'success') {
            submissions = result.data;
            renderSubmissionsTable(submissions);
        } else {
            container.innerHTML = '<p class="error">Failed to load submissions</p>';
        }
    } catch (error) {
        container.innerHTML = '<p class="error">Error: ' + error.message + '</p>';
    }
}

async function loadAttendance() {
    const container = document.getElementById('attendanceTable');
    container.innerHTML = '<p class="loading">Loading attendance records...</p>';
    
    try {
        const response = await fetch(CONFIG.APPS_SCRIPT_URL + '?action=getAttendance');
        const result = await response.json();
        
        if (result.status === 'success') {
            attendance = result.data;
            renderAttendanceTable(attendance);
        } else {
            container.innerHTML = '<p class="error">Failed to load attendance</p>';
        }
    } catch (error) {
        container.innerHTML = '<p class="error">Error: ' + error.message + '</p>';
    }
}

function renderSubmissionsTable(data) {
    const container = document.getElementById('submissionsTable');
    
    if (data.length === 0) {
        container.innerHTML = '<p class="loading">No submissions found</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Grade/Subject</th>
                    <th>School Level</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>File Link</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach(row => {
        const statusClass = getStatusClass(row.status);
        html += `
            <tr>
                <td>${row.fullName}</td>
                <td>${row.gradeLevel}</td>
                <td>${row.schoolLevel}</td>
                <td>${row.fileType}</td>
                <td>${formatDate(row.timestamp)}</td>
                <td><a href="${row.fileLink}" target="_blank">View File</a></td>
                <td><span class="status-badge ${statusClass}">${row.status}</span></td>
                <td>${row.adminRemarks || '-'}</td>
                <td class="action-buttons">
                    <button class="btn-action btn-edit" onclick="openStatusModal('${row.id}', 'submission')">Edit</button>
                    <button class="btn-danger" onclick="deleteSubmission('${row.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderAttendanceTable(data) {
    const container = document.getElementById('attendanceTable');
    
    if (data.length === 0) {
        container.innerHTML = '<p class="loading">No attendance records found</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Selfie</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach(row => {
        const statusClass = getStatusClass(row.status);
        const fullName = `${row.surname}, ${row.firstName} ${row.middleName || ''}`.trim();
        html += `
            <tr>
                <td>${fullName}</td>
                <td>${formatDate(row.timestamp)}</td>
                <td>${formatTime(row.timestamp)}</td>
                <td><a href="${row.selfieLink}" target="_blank">View Photo</a></td>
                <td><span class="status-badge ${statusClass}">${row.status}</span></td>
                <td>${row.adminRemarks || '-'}</td>
                <td class="action-buttons">
                    <button class="btn-action btn-edit" onclick="openStatusModal('${row.id}', 'attendance')">Edit</button>
                    <button class="btn-danger" onclick="deleteAttendance('${row.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function openStatusModal(id, type) {
    document.getElementById('modalRowId').value = id;
    document.getElementById('modalType').value = type;
    
    // Find current data
    const data = type === 'submission' ? submissions : attendance;
    const item = data.find(d => d.id === id);
    
    if (item) {
        document.getElementById('modalStatus').value = item.status;
        document.getElementById('modalRemarks').value = item.adminRemarks || '';
    }
    
    document.getElementById('actionModal').classList.add('active');
}

function closeModal() {
    document.getElementById('actionModal').classList.remove('active');
}

async function saveStatus() {
    const id = document.getElementById('modalRowId').value;
    const type = document.getElementById('modalType').value;
    const status = document.getElementById('modalStatus').value;
    const remarks = document.getElementById('modalRemarks').value;
    
    try {
        const formData = new FormData();
        formData.append('action', 'updateStatus');
        formData.append('id', id);
        formData.append('type', type);
        formData.append('status', status);
        formData.append('remarks', remarks);
        
        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            closeModal();
            if (type === 'submission') {
                loadSubmissions();
            } else {
                loadAttendance();
            }
            alert('Status updated successfully!');
        } else {
            alert('Failed to update status: ' + result.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function deleteSubmission(id) {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'deleteSubmission');
        formData.append('id', id);
        
        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            loadSubmissions();
            alert('Submission deleted successfully!');
        } else {
            alert('Failed to delete: ' + result.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function deleteAttendance(id) {
    if (!confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'deleteAttendance');
        formData.append('id', id);
        
        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            loadAttendance();
            alert('Attendance record deleted successfully!');
        } else {
            alert('Failed to delete: ' + result.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function getStatusClass(status) {
    switch(status) {
        case 'Approved': return 'status-approved';
        case 'Rejected': return 'status-rejected';
        case 'For Revision': return 'status-revision';
        default: return 'status-pending';
    }
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}