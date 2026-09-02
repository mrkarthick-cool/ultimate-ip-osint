export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Content-Type','application/json');
  try{
    const key = req.query.key;
    if(key!== 'THG-DEV-MrKarthickR-2026'){
      return res.status(200).json({target:req.query.target||'', location:'Invalid Key', isp:'N/A', loc:'N/A', ip:'N/A'});
    }
    let target = (req.query.target||'').trim().replace(/^https?:\/\//,'').split('/')[0];
    if(!target) return res.json({target:'', location:'N/A', isp:'N/A', loc:'N/A', ip:'N/A'});

    let ip = target;
    if(!/^\d+\.\d+\.\d+\.\d+$/.test(target)){
      try{
        const dns = await fetch(`https://dns.google/resolve?name=${target}&type=A`).then(r=>r.json());
        if(dns.Answer && dns.Answer[0]) ip = dns.Answer[0].data;
      }catch{}
    }
    let geo = {};
    try{
      geo = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,isp,org,query,status`, {headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.json());
    }catch{ geo = {}; }

    return res.status(200).json({
      target: target,
      ip: geo.query || ip,
      location: `${geo.city||''} ${geo.regionName||''} ${geo.country||''}`.trim() || 'N/A',
      isp: geo.isp || geo.org || 'N/A',
      loc: geo.country || 'N/A'
    });
  }catch(e){
    return res.status(200).json({target:req.query.target||'', location:'Error: '+e.message, isp:'N/A', loc:'N/A', ip:'N/A'});
  }
}
