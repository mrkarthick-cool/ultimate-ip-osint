export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  try {
    let u = (req.query.url || '').toString().trim();
    if(!u) return res.json({status:0, finalUrl:'', html:'', headers:{}});
    if(!u.startsWith('http')) u = 'https://' + u;
    const r = await fetch(u, {headers:{'User-Agent':'Mozilla/5.0'}});
    const html = await r.text();
    return res.status(200).json({status:r.status, finalUrl:r.url, html:html.slice(0,80000), headers:Object.fromEntries(r.headers.entries())});
  } catch(e) {
    return res.status(200).json({status:0, finalUrl:req.query.url, html:`<h2 style=color:red>Blocked: ${e.message}<br>Try example.com</h2>`, headers:{'x-error':e.message}});
  }
}
