// CENTRALIZED USER MANAGEMENT
// Admins can manage all users through the Admin Dashboard

const USERS = {
    // Admin accounts (can access admin dashboard)
    admin: {
        'admin': { password: 'admin123', role: 'admin' },
        'principal': { password: 'principal2024', role: 'admin' },
        'headteacher': { password: 'head2024', role: 'admin' }
    },
    
    // Faculty accounts (can access submissions and attendance)
    faculty: {
        'faculty': { password: 'faculty123', role: 'faculty' },
        'teacher1': { password: 'teach2024', role: 'faculty' },
        'teacher2': { password: 'teach2024', role: 'faculty' },
        'juan.cruz': { password: 'password123', role: 'faculty' },
        'maria.santos': { password: 'password123', role: 'faculty' }
    }
};

// Function to get users by role
function getUsersByRole(role) {
    return USERS[role] || {};
}

// Function to get all admin users
function getAdminUsers() {
    return USERS.admin;
}

// Function to get all faculty users
function getFacultyUsers() {
    return USERS.faculty;
}