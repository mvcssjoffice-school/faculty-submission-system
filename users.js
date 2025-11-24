// CENTRALIZED USER MANAGEMENT
// Admins can manage all users through the Admin Dashboard

const USERS = {
    // Admin accounts (can access admin dashboard)
    admin: {
        'admin': { password: 'admin123', role: 'admin' },
        'e.deguzman@mvcs.edu.ph': { password: 'admin123', role: 'admin' },
        'm.viuya@mvcs.edu.ph': { password: 'admin123', role: 'admin' },
        'r.deguzman@mvcs.edu.ph': { password: 'admin123', role: 'admin' }
    },
    
    // Faculty accounts (can access submissions and attendance)
    faculty: {
        'faculty': { password: 'faculty123', role: 'faculty' },
        'gg.deguzman@mvcs.edu.ph': { password: 'teach2025', role: 'faculty' },
        'g.pagaduan@mvcs.edu.ph': { password: 'teach2025', role: 'faculty' },
        'j.deguzman@mvcs.edu.ph': { password: 'teach2025', role: 'faculty' },
        'c.verzon@mvcs.edu.ph': { password: 'teach2025', role: 'faculty' },
        'ml.ferrer@mvcs.edu.ph': { password: 'teach2025', role: 'faculty' },
        'e.guillermo@mvcs.edu.ph': { password: 'teach2025', role: 'faculty' }
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
