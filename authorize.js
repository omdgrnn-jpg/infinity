export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ allowed: false, error: "Method not allowed" });
    return;
  }

  const { robloxUserId, roleId } = req.body || {};
  const allowedIds = new Set(["123456789"]);

  const ok =
    String(roleId) === "1522202846357880975" &&
    allowedIds.has(String(robloxUserId));

  res.json({ allowed: ok });
}
