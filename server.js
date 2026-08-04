const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const REQUIRED_ROLE_ID = '1522202846357880975';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'creatorisgay';
const ALLOWED_FILE = path.join(__dirname, 'authorized.json');

function loadAllowedUsers() {
  try {
    const raw = fs.readFileSync(ALLOWED_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.map(String));
    }
  } catch (_) {
    // File does not exist yet, so start empty.
  }

  return new Set();
}

function saveAllowedUsers(set) {
  const list = [...set].sort((a, b) => Number(a) - Number(b));
  fs.writeFileSync(ALLOWED_FILE, JSON.stringify(list, null, 2));
}

const ALLOWED = loadAllowedUsers();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

function requireAdmin(req, res, next) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/(?:^|;\s*)session=([^;]+)/);

  if (match && match[1] === 'admin') {
    return next();
  }

  return res.redirect('/login.html');
}

app.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.setHeader('Set-Cookie', 'session=admin; Path=/; HttpOnly; SameSite=Lax');
    return res.redirect('/admin.html');
  }

  return res.status(401).send('Invalid username or password.');
});

app.get('/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  res.redirect('/login.html');
});

app.get('/api/allowed', requireAdmin, (req, res) => {
  res.json({ allowed: [...ALLOWED].sort((a, b) => Number(a) - Number(b)) });
});

app.post('/api/allowed', requireAdmin, (req, res) => {
  const { robloxUserId } = req.body || {};

  if (!robloxUserId || String(robloxUserId).trim() === '') {
    return res.status(400).json({ error: 'robloxUserId is required' });
  }

  ALLOWED.add(String(robloxUserId).trim());
  saveAllowedUsers(ALLOWED);

  return res.json({ allowed: [...ALLOWED].sort((a, b) => Number(a) - Number(b)) });
});

app.delete('/api/allowed/:id', requireAdmin, (req, res) => {
  const id = String(req.params.id).trim();

  if (!id) {
    return res.status(400).json({ error: 'robloxUserId is required' });
  }

  ALLOWED.delete(id);
  saveAllowedUsers(ALLOWED);

  return res.json({ allowed: [...ALLOWED].sort((a, b) => Number(a) - Number(b)) });
});

app.post('/authorize', (req, res) => {
  const { robloxUserId, roleId } = req.body || {};
  const ok =
    String(roleId) === REQUIRED_ROLE_ID &&
    ALLOWED.has(String(robloxUserId));

  res.json({ allowed: ok, message: ok ? 'authorized' : 'you dont have access stfu' });
});

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.listen(PORT, () => {
  console.log(`auth server running on http://localhost:${PORT}`);
});
