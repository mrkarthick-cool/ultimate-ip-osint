export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Content-Type','application/json');
  try{
    let url = (req.query.url||'').trim();
    if(!url) return res.json({error:'no url'});
    if(!url.startsWith('http')) url = 'https://' + url;

    const r = await fetch(url, {headers:{'User-Agent':'Mozilla/5.0'}, redirect:'follow'});
    const html = await r.text();
    const headers = Object.fromEntries(r.headers.entries());
    const redirects = [];

    return res.status(200).json({
      original: req.query.url,
      finalUrl: r.url,
      status: r.status,
      ssl: r.url.startsWith('https'),
      headers: headers,
      redirects: redirects,
      malwareSuspect: html.includes('eval(') || html.includes('atob('),
      htmlPreview: html.slice(0,20000),
      html: html
    });
  }catch(e){
    return res.status(200).json({original:req.query.url, finalUrl:req.query.url, status:0, ssl:false, headers:{}, redirects:[], malwareSuspect:false, htmlPreview:`<h3>Blocked: ${e.message}. Try example.com</h3>`, html:`<h3>Error ${e.message}</h3>`});
  }
}
