const API_URL = 'http://localhost:3001';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  try {
    const response = await fetch(API_URL + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    document.getElementById('registerMessage').innerText = data.message || 'Registered successfully!';
  } catch (error) {
    console.error('Registration error:', error);
    document.getElementById('registerMessage').innerText = 'Registration failed';
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  try {
    const response = await fetch(API_URL + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      document.getElementById('loginMessage').innerText = 'Login successful!';
      window.location.href = 'posts.html';
    } else {
      document.getElementById('loginMessage').innerText = data.message || 'Login failed';
    }
  } catch (error) {
    console.error('Login error:', error);
    document.getElementById('loginMessage').innerText = 'Login failed';
  }
});
