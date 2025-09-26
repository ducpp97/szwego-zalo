# Zalo OA Callback (Vercel) — ultra-minimal

This project gives you a short callback URL on your own domain and proxies the `code`
to your Google Apps Script Web App (`/exec`) so it can exchange the code for tokens.

## Files
- `api/cb.js` → callback endpoint (`/api/cb`).
- `public/` → put Zalo verify file here EXACTLY as requested (e.g. `zalo_verify_xxx.txt`).
  The content of that file must match the token Zalo shows on the Verify Domain page.

## Deploy (quick)
1) Create a Vercel account → "Add New Project" → "Import" this folder.
2) In "Environment Variables" add:
   - `APPS_SCRIPT_EXEC` = your Google Apps Script Web App URL ending with `/exec`
3) Deploy.
4) Add your custom domain (e.g. `oa.yourdomain.com`) to the project and update DNS.
5) Verify domain with Zalo:
   - Download the verify requirement from Zalo (filename + content).
   - Add that file under `public/` with the exact filename and content.
   - Re-deploy, then press "Verify" in Zalo.
6) Use `https://oa.yourdomain.com/api/cb` as:
   - Official Account Callback URL (in Zalo developer console)
   - `REDIRECT_URI` in your Apps Script config.
