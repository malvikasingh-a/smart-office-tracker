document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Handle Navigation Active States
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 2. Login Button Interaction
    const loginBtn = document.getElementById('loginDropdown');
    loginBtn.addEventListener('click', () => {
        alert('Redirecting to the Smart Office Login Portal...');
    });

    // 3. Simple Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });

    console.log("Smart Office System Initialized.");
});