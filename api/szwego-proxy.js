export default async (req, res) => {
  try {
    const srcIsPost = req.method === 'POST';
    const method = (srcIsPost ? (req.body?.method || 'POST') : (req.query?.method || 'POST')).toUpperCase();
    const url = srcIsPost ? (req.body?.url || '') : (req.query?.url || '');
    const payload = srcIsPost ? (req.body?.payload || '') : (req.query?.payload || '');
    const rawHeaders = srcIsPost ? (req.body?.headers || '{}') : (req.query?.headers || '{}');
    const warm = (srcIsPost ? req.body?.warm : req.query?.warm) === '1';
    const debug = (srcIsPost ? req.body?.debug : req.query?.debug) === '1';

    if (!url) return res.status(400).send('Missing url');

    const hdr = JSON.parse(rawHeaders || '{}');

    const baseHeaders = {
      ...hdr,
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': 'https://www.szwego.com',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
      'sec-ch-ua': '"Chromium";v="124", "Not.A/Brand";v="99"',
      'sec-ch-ua-platform': '"Windows"',
      'sec-ch-ua-mobile': '?0',
      'User-Agent': hdr['User-Agent'] || 'Mozilla/5.0'
    };

    // Helper to normalize Set-Cookie array -> cookie string
    const makeCookie = (h) => {
      try {
        const get = h.get ? h.get.bind(h) : undefined;
        let raw = get ? get('set-cookie') : null;
        if (!raw && h.raw) {
          const rawMap = h.raw();
          raw = rawMap && rawMap['set-cookie'];
        }
        const arr = Array.isArray(raw) ? raw : (raw ? [raw] : []);
        return arr.map(c => (c || '').split(';')[0]).filter(Boolean).join('; ');
      } catch { return ''; }
    };

    let cookieFromWarm = '';
    if (warm) {
      // Warm-up: hit the Referer page (or homepage) to get fresh cookies on this Vercel IP
      const referer = hdr['Referer'] || 'https://www.szwego.com/static/index.html';
      const r0 = await fetch(referer, { headers: { 'User-Agent': baseHeaders['User-Agent'], 'Accept': 'text/html,*/*' } });
      cookieFromWarm = makeCookie(r0.headers);
    }

    // Merge cookies: warm cookies first, then any cookie you sent (if any)
    const mergedCookie = [cookieFromWarm, hdr['Cookie']].filter(Boolean).join('; ');
    const upstreamHeaders = { ...baseHeaders };
    if (mergedCookie) upstreamHeaders['Cookie'] = mergedCookie;
    if (method === 'POST' && !upstreamHeaders['Content-Type']) {
      upstreamHeaders['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    }

    const r = await fetch(url, {
      method,
      headers: upstreamHeaders,
      body: method === 'POST' ? payload : undefined
    });

    const text = await r.text();
    if (debug) {
      return res.status(200).json({
        status: r.status,
        url,
        method,
        sentHeaders: upstreamHeaders,
        warmCookieLen: cookieFromWarm.length,
        sample: text.slice(0, 600)
      });
    }
    res.status(r.status).send(text);
  } catch (e) {
    res.status(500).send(String(e));
  }
};
