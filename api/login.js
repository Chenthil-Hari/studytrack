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

  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: 'Please enter all fields: email/username and password.' });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const searchKey = emailOrUsername.toLowerCase();
    // Find by email or username
    const user = await usersCollection.findOne({
      $or: [
        { email: searchKey },
        { username: searchKey }
      ]
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials. User not found.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials. Password incorrect.' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'studytrack_secret_fallback',
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      token,
      user: {
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error occurred.' });
  }
};
