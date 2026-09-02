export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url required' });
  let targetUrl = url.startsWith('http') ? url : `https://${url}`;
  try {
    const redirects = [];
    let currentUrl = targetUrl;
    // Follow redirects manually 5 times
    for(let i=0; i<5; i++){
      const r = await fetch(currentUrl, { redirect: 'manual', headers: {'User-Agent':'Mozilla/5.0'} });
      const loc = r.headers.get('location');
      redirects.push({ url: currentUrl, status: r.status, headers: Object.fromEntries(r.headers.entries()) });
      if(loc){
        currentUrl = loc.startsWith('http') ? loc : new URL(loc, currentUrl).href;
      } else {
        break;
      }
    }
    // Final fetch with content
    const finalRes = await fetch(currentUrl, { headers: {'User-Agent':'Mozilla/5.0'} });
    const html = await finalRes.text();
    const title = html.match(/<title>(.*?)<\/title>/i)?.[1] || 'No Title';
    const isMalware = /phish|malware|scam|fake login/i.test(html) || finalRes.url.includes('phishing');
    
    return res.json({
      original: url,
      finalUrl: currentUrl,
      finalStatus: finalRes.status,
      redirects,
      title,
      ssl: currentUrl.startsWith('https'),
      malwareSuspect: isMalware,
      htmlPreview: html.substring(0, 15000), // first 15k chars
      headers: Object.fromEntries(finalRes.headers.entries())
    });
  } catch(e){
    return res.status(500).json({ error: e.message, original: url });
  }
}
