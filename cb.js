// api/cb.js - Vercel Serverless Function
// Usage: https://YOUR_DOMAIN/api/cb?code=...  (set this as REDIRECT_URI & OA Callback URL)
// It proxies the OAuth 'code' to your Google Apps Script Web App /exec endpoint.
export default async function handler(req, res) {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing code");
    const target = process.env.APPS_SCRIPT_EXEC + "?code=" + encodeURIComponent(code);
    // Fire and forget; Apps Script doGet() will exchange code -> token
    await fetch(target, { method: "GET" });
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send("OK – token saved");
  } catch (err) {
    return res.status(500).send("Proxy error: " + (err && err.message ? err.message : String(err)));
  }
}
