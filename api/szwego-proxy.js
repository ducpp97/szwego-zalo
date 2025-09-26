export default async (req, res) => {
  try {
    const method = (req.method === 'POST' ? (req.body?.method || 'POST') : (req.query?.method || 'POST')).toUpperCase();
    const url = req.method === 'POST' ? (req.body?.url || '') : (req.query?.url || '');
    const payload = req.method === 'POST' ? (req.body?.payload || '') : (req.query?.payload || '');
    const rawHeaders = req.method === 'POST' ? (req.body?.headers || '{}') : (req.query?.headers || '{}');

    if (!url) { res.status(400).send('Missing url'); return; }

    const hdr = JSON.parse(rawHeaders || '{}');

    const r = await fetch(url, {
      method,
      headers: {
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
      },
      body: method === 'POST' ? payload : undefined
    });

    const text = await r.text();
    res.status(r.status).send(text);
  } catch (e) {
    res.status(500).send(String(e));
  }
};
