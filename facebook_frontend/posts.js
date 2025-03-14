const API_URL = 'http://localhost:3001';

if (!localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

async function fetchPosts() {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(API_URL + '/posts', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (response.status === 401 || response.status === 403) {
      alert('Session expired or invalid. Please login again.');
      localStorage.removeItem('token');
      window.location.href = 'index.html';
      return;
    }
    const posts = await response.json();
    const postsList = document.getElementById('postsList');
    postsList.innerHTML = '';
    posts.forEach(post => {
      const postDiv = document.createElement('div');
      postDiv.className = 'post';
      postDiv.innerText = post.content;
      postsList.appendChild(postDiv);
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
});

document.getElementById('createPostForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const content = document.getElementById('postContent').value;
  try {
    const response = await fetch(API_URL + '/posts', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ content })
    });
    const data = await response.json();
    document.getElementById('postMessage').innerText = data.message || 'Post created successfully!';
    fetchPosts();
  } catch (error) {
    console.error('Error creating post:', error);
    document.getElementById('postMessage').innerText = 'Error creating post.';
  }
});

fetchPosts();
