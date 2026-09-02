export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Content-Type','application/json');
  try{
    const key = req.query.key;
    if(key!== 'THG-DEV-MrKarthickR-2026'){
      return res.status(200).json({target:req.query.target, error:'Invalid key'});
    }
    let target = (req.query.target||'').trim();
    if(!target) return res.json({target:'', location:'N/A', isp:'N/A'});

    // IP info - ip-api.com free
    let ip = target;
    if(!/^\d+\.\d+\.\d+\.\d+$/.test(target)){
      try{
        const dns = await fetch(`https://dns.google/resolve?name=${target}&type=A`).then(r=>r.json());
        ip = dns.Answer? dns.Answer[0].data : target;
      }catch{ ip = target; }
    }
    let geo = {};
    try{
      geo = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,isp,org,query`).then(r=>r.json());
    }catch{ geo = {}; }

    return res.status(200).json({
      target: target,
      ip: geo.query || ip,
      location: `${geo.city||''} ${geo.regionName||''} ${geo.country||''}`.trim() || 'N/A',
      isp: geo.isp || geo.org || 'N/A',
      loc: geo.country || 'N/A'
    });
  }catch(e){
    return res.status(200).json({target:req.query.target, location:'Error: '+e.message, isp:'N/A', error:e.message});
  }
}
