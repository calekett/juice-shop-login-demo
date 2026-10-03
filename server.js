const path = require('path');
const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers, including a strict Content-Security-Policy that blocks
// inline scripts. All client JavaScript lives in /public/app.js.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"]
      }
    }
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory SQLite database, seeded with one account whose password is stored
// only as a bcrypt hash (never in plain text).
const db = new Database(':memory:');
db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
`);

const seedPassword = 'Password123';
const seedHash = bcrypt.hashSync(seedPassword, 12);
db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(
  'admin@juice.test',
  seedHash
);

// Same rules the browser enforces, re-checked here because client-side checks
// can be skipped or tampered with.
function validate(email, password) {
  if (typeof email !== 'string' || typeof password !== 'string') return false;
  if (email.trim() === '' || password === '') return false;
  if (!email.includes('@')) return false;
  if (password.length < 8) return false;
  return true;
}

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!validate(email, password)) {
    return res.status(400).json({ ok: false, message: 'Invalid email or password format.' });
  }

  // Parameterized query: the input is bound as data, so it can never change
  // the structure of the SQL statement (this is what stops SQL injection).
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  // Generic message for both "no user" and "wrong password" so attackers
  // cannot tell which emails are registered.
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
  }

  return res.json({ ok: true, message: 'Login successful. Welcome back!' });
});

app.listen(PORT, () => {
  console.log(`Login demo running at http://localhost:${PORT}`);
  console.log(`Test account: admin@juice.test / ${seedPassword}`);
});
