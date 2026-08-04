const express = require('express');
const app = express();
app.use(express.json());

const ALLOWED = new Set(['123456789']);

app.post('/authorize', (req, res) => {
  const { robloxUserId, roleId } = req.body || {};
  const ok =
    String(roleId) === '1522202846357880975' &&
    ALLOWED.has(String(robloxUserId));

  res.json({ allowed: ok });
});

app.get('/', (req, res) => {
  res.send('ok');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('auth server running');
});
