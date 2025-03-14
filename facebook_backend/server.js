const express = require('express');
const mysql = require('mysql2/promise'); 
const bcrypt = require('bcrypt');
const cors = require('cors'); 
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'webdev_user',        
  password: 'Web_dev2',   
  database: 'facebookDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


const JWT_SECRET = "MySecret";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); 

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); 
    req.user = user; 
    next();
  });
};


app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
  
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;


    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const [rows] = await pool.execute(
      'SELECT id, username FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/posts', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM posts');
    res.json(rows);
  } catch (error) {
    console.error('Error in GET /posts route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.userId;

    const [result] = await pool.execute(
      'INSERT INTO posts (user_id, content) VALUES (?, ?)',
      [userId, content]
    );

    res.status(201).json({ message: 'Post created successfully', postId: result.insertId });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.put('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    const [rows] = await pool.execute('SELECT * FROM posts WHERE id = ?', [postId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const post = rows[0];


    if (post.user_id !== req.user.userId) {
      return res.status(403).json({ message: 'You are not authorized to edit this post' });
    }

    await pool.execute('UPDATE posts SET content = ? WHERE id = ?', [content, postId]);
    res.json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error('Edit post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
