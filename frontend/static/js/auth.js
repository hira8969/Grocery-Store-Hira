document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    
    const loginMessage = document.getElementById('login-message');
    const signupMessage = document.getElementById('signup-message');

    function openLoginForm() {
        signupMessage.style.display = 'none';
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
    }

    function openSignupForm() {
        loginMessage.style.display = 'none';
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
        loginTab.classList.remove('active');
        signupTab.classList.add('active');
    }

    // --- Toggle Forms ---
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        openSignupForm();
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        openLoginForm();
    });

    loginTab.addEventListener('click', openLoginForm);
    signupTab.addEventListener('click', openSignupForm);
    
    /**
     * Shows a feedback message.
     */
    function showMessage(element, message, isError = false) {
        element.textContent = message;
        element.className = isError ? 'message error' : 'message success';
        element.style.display = 'block';
    }

    // --- Handle Login ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/customer/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            if (result.success) {
                // Save user data to sessionStorage
                sessionStorage.setItem('groceryUser', JSON.stringify(result.user));
                showMessage(loginMessage, 'Login successful! Redirecting...', false);
                // Redirect to homepage
                setTimeout(() => { window.location.href = '/'; }, 1000);
            } else {
                showMessage(loginMessage, result.message, true);
            }
        } catch (err) {
            showMessage(loginMessage, 'An error occurred. Please try again.', true);
        }
    });

    // --- Handle Signup ---
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;

        try {
            const response = await fetch('/api/customer/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, password })
            });

            const result = await response.json();
            if (result.success) {
                showMessage(signupMessage, 'Signup successful! Please log in.', false);
                // Switch to login form
                setTimeout(() => {
                    openLoginForm();
                }, 1000);
            } else {
                showMessage(signupMessage, result.message, true);
            }
        } catch (err) {
            showMessage(signupMessage, 'An error occurred. Please try again.', true);
        }
    });
});
