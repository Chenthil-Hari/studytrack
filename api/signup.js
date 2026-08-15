const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('./db');

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(450).json({ error: 'Method not allowed' });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please enter all fields: username, email, and password.' });
  }

  if (username.length < 3 || password.length < 6) {
    return res.status(400).json({ error: 'Username must be at least 3 chars and password at least 6 chars.' });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Check existing
    const existingEmail = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const existingUsername = await usersCollection.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date()
    };

    await usersCollection.insertOne(newUser);

    // Create token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET || 'studytrack_secret_fallback',
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      token,
      user: {
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error occurred.' });
  }
};
