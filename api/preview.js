export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Content-Type','application/json');
  try{
    let url = (req.query.url||'').trim();
    if(!url) return res.json({finalUrl:'', original:'', status:0, ssl:false, headers:{}, redirects:[], malwareSuspect:false, htmlPreview:''});
    if(!url.startsWith('http')) url = 'https://' + url.replace(/^https?:\/\//,'');

    const r = await fetch(url, {headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36','Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'}, redirect:'follow'});
    const html = await r.text();

    return res.status(200).json({
      original: req.query.url,
      finalUrl: r.url,
      status: r.status,
      ssl: r.url.startsWith('https://'),
      headers: Object.fromEntries(r.headers.entries()),
      redirects: [],
      malwareSuspect: html.toLowerCase().includes('eval(') || html.toLowerCase().includes('document.write(unescape'),
      htmlPreview: html.slice(0,20000)
    });
  }catch(e){
    return res.status(200).json({
      original: req.query.url||'',
      finalUrl: req.query.url||'',
      status: 0,
      ssl: false,
      headers: {'x-error': e.message},
      redirects: [],
      malwareSuspect: false,
      htmlPreview: `<div style="color:red;padding:20px"><h3>⚠️ Site Blocks Vercel</h3><p>${e.message}</p><p>Domain: ${req.query.url}</p><p>Try example.com / wikipedia.org for testing</p><p>If this is your site (karthick.com), turn off Cloudflare Bot Fight Mode</p></div>`
    });
  }
}
