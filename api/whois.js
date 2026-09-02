export default async function handler(req,res){
 res.setHeader('Access-Control-Allow-Origin','*');
 res.setHeader('Content-Type','application/json');
 try{
  let domain=(req.query.domain||'').trim().replace(/^https?:\/\//,'').split('/')[0];
  if(!domain) return res.json({error:'no domain'});

  // DNS Records via Google DNS
  const getDNS = async (type) => {
    try{ const r=await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`).then(j=>j.json()); return r.Answer?r.Answer.map(a=>a.data):[]; }catch{return []}
  };
  const [A, MX, NS, TXT] = await Promise.all([getDNS('A'), getDNS('MX'), getDNS('NS'), getDNS('TXT')]);

  // Tech detection via headers + html
  let tech=[];
  try{
    const r=await fetch(`https://${domain}`,{headers:{'User-Agent':'Mozilla/5.0'}});
    const h=Object.fromEntries(r.headers.entries());
    const html=await r.text().then(t=>t.slice(0,5000).toLowerCase());
    if(h['server']) tech.push('Server:'+h['server']);
    if(h['x-powered-by']) tech.push(h['x-powered-by']);
    if(html.includes('wp-content')) tech.push('WordPress');
    if(html.includes('react')) tech.push('React');
    if(html.includes('cloudflare')) tech.push('Cloudflare');
    if(h['cf-ray']) tech.push('Cloudflare');
  }catch{}

  // WHOIS via who.is free API
  let whois={};
  try{ whois=await fetch(`https://whoisjson.com/api/v1/whois?domain=${domain}`).then(r=>r.json()).catch(()=>({})); }catch{}

  return res.json({domain, dns:{A,MX,NS,TXT}, tech, whois:whois||{note:'WHOIS limited on free plan, use who.is manually'}, created:whois.created||'N/A'});
 }catch(e){ return res.json({error:e.message}); }
}
