// api/scan.js - FINAL FIXED VERSION
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(200).json({ status: 0, finalUrl: '', html: '', headers: {}, error: 'URL missing' });
  }

  let url = targetUrl.trim();
  if (!url.startsWith('http')) url = 'https://' + url;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });

    const html = await response.text();
    
    return res.status(200).json({
      status: response.status,
      finalUrl: response.url,
      html: html.substring(0, 80000),
      headers: Object.fromEntries(response.headers.entries())
    });

  } catch (err) {
    // CRASH AVVAKUNDA JSON NE PAMPALI - IDE KEY!
    return res.status(200).json({
      status: 0,
      finalUrl: url,
      html: `<html><body style="background:#111;color:white;padding:20px;font-family:monospace"><h2>⚠️ This site blocks Vercel</h2><p>Error: ${err.message}</p><p>Domain: ${url}</p><p>Try: example.com, wikipedia.org</p></body></html>`,
      headers: { 'x-error': err.message }
    });
  }
};
