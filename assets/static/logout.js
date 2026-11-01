/**
 * Logout Page Logic
 * Handles session clearing and automatic redirection
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Session cleared. Securely logged out.");

    // 1. Clear any stored authentication data
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('userToken');
    sessionStorage.clear();

    // 2. Automatic Redirection after 3 seconds
    setTimeout(() => {
        // Change 'login.html' to your actual login page file
        window.location.href = '/login/'; 
    }, 3000);
});