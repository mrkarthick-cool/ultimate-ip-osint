export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Content-Type','application/json');
  try{
    if(req.query.key!== 'THG-DEV-MrKarthickR-2026'){
      return res.json({target:req.query.target, location:'Invalid Key', isp:'N/A', loc:'N/A', ip:'N/A'});
    }
    let target = (req.query.target||'').trim().replace(/^https?:\/\//,'').split('/')[0];
    if(!target) return res.json({target:'', location:'N/A', isp:'N/A'});
    let ip = target;
    if(!/^\d+\.\d+\.\d+\.\d+$/.test(target)){
      try{ const d=await fetch(`https://dns.google/resolve?name=${target}&type=A`).then(r=>r.json()); if(d.Answer) ip=d.Answer[0].data; }catch{}
    }
    let geo={};
    try{ geo=await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,isp,org,query,status,lat,lon`).then(r=>r.json()); }catch{}
    return res.json({target, ip:geo.query||ip, location:`${geo.city||''} ${geo.regionName||''} ${geo.country||''}`.trim()||'N/A', isp:geo.isp||geo.org||'N/A', loc:geo.country||'N/A', lat:geo.lat, lon:geo.lon, org:geo.org});
  }catch(e){ return res.json({target:req.query.target, location:'Error:'+e.message, isp:'N/A'}); }
}
