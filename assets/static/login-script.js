document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const userTypeSelect = document.getElementById('userType');

    // 1. URL Parameter Se Role Check Karna
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');

    if (roleParam && userTypeSelect) {
        const formattedRole = roleParam.charAt(0).toUpperCase() + roleParam.slice(1).toLowerCase();
        userTypeSelect.value = formattedRole;
    }

    // 2. Form Submission Handle Karna
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // 3. Django API Call
           fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: email, 
                    password: password
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Invalid Username/Email or Password');
                }
                return response.json();
            })
            .then(data => {
                alert(`Login Successful as ${data.role.toUpperCase()}!`);
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('username', data.username);
                localStorage.setItem('userId', data.user_id);
                const safeRole = data.role ? String(data.role).toLowerCase() : ''; 
                if (safeRole === 'admin') {
                    window.location.href = '/ab-admin/'; 
                } else if (safeRole === 'employee') {
                    window.location.href = '/employee-dash/';
                } else {
                    window.location.href = '/'; 
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Login Failed: " + error.message);
            });
        });
    }
});