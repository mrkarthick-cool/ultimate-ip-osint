export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const urlQuery = req.query.url;
    if (!urlQuery) {
      return res.status(200).json({ error: "URL ivvu bro" });
    }

    let target = urlQuery.trim();
    if (!target.startsWith('http://') &&!target.startsWith('https://')) {
      target = 'https://' + target;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OSINT',
        'Accept': 'text/html'
      },
      signal: controller.signal,
      redirect: 'follow'
    });
    clearTimeout(timeout);

    const html = await response.text();
    const headers = {};
    response.headers.forEach((v, k) => { headers[k] = v; });

    return res.status(200).json({
      finalUrl: response.url,
      status: response.status,
      headers: headers,
      html: html.slice(0, 80000)
    });

  } catch (err) {
    // IMPORTANT: Error kuda JSON lone pampali, HTML kaadu
    return res.status(200).json({
      error: false,
      finalUrl: req.query.url,
      status: 0,
      headers: { "x-error": err.message },
      html: `<html><body><h1>Error: ${err.message}</h1><p>Site might be blocking Vercel. Try example.com</p></body></html>`
    });
  }
}
