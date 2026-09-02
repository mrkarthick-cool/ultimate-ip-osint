export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Content-Type','application/json');
  res.setHeader('Cache-Control','no-cache');

  const DEV = {
    developer: "MrKarthickR",
    telegram_id: "@Drak24Evil",
    telegram_group: "https://t.me/teluguhackersgroup1",
    tool: "ULTIMATE OSINT V3",
    version: "3.0"
  };

  try{
    if(req.query.key!== 'THG-DEV-MrKarthickR-2026'){
      return res.status(401).json({error:"Invalid Key",...DEV});
    }

    let target = (req.query.target||'').trim().replace(/^https?:\/\//,'').split('/')[0].split(':')[0];
    if(!target) return res.json({error:"No target",...DEV});

    let ip = target;
    let hostname = target;
    let ipv4 = "DataNotFound";
    let ipv6 = "DataNotFound";

    // DNS Resolve
    try{
      if(!/^\d+\.\d+\.\d+\.\d+$/.test(target)){
        const dnsA = await fetch(`https://dns.google/resolve?name=${target}&type=A`).then(r=>r.json());
        if(dnsA.Answer && dnsA.Answer.length>0){ ip = dnsA.Answer[0].data; ipv4 = ip; hostname = target; }
        const dnsAAAA = await fetch(`https://dns.google/resolve?name=${target}&type=AAAA`).then(r=>r.json());
        if(dnsAAAA.Answer) ipv6 = dnsAAAA.Answer.map(a=>a.data).join(', ');
      } else {
        ipv4 = target;
        try{ hostname = await fetch(`https://dns.google/resolve?name=${ip.split('.').reverse().join('.')}.in-addr.arpa&type=PTR`).then(r=>r.json()).then(d=>d.Answer?d.Answer[0].data:'DataNotFound'); }catch{ hostname="DataNotFound"; }
      }
    }catch{}

    // DNS Records
    const getDNS = async (type)=>{
      try{ const r=await fetch(`https://dns.google/resolve?name=${target}&type=${type}`).then(j=>j.json()); return r.Answer?r.Answer.map(a=>a.data):["DataNotFound"]; }catch{ return ["DataNotFound"]; }
    };
    const [dnsA, dnsMX, dnsNS, dnsTXT, dnsSOA] = await Promise.all([getDNS('A'), getDNS('MX'), getDNS('NS'), getDNS('TXT'), getDNS('SOA')]);

    // IP Geo + ISP - Primary
    let geo = {};
    try{ geo = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,reverse,mobile,proxy,hosting`).then(r=>r.json()); }catch{ geo={status:"fail"}; }

    // Fallback geo
    let ipinfo = {};
    try{ ipinfo = await fetch(`https://ipapi.co/${ip}/json/`).then(r=>r.json()).catch(()=>({})); }catch{}

    const lat = geo.lat || ipinfo.latitude || "DataNotFound";
    const lon = geo.lon || ipinfo.longitude || "DataNotFound";
    const city = geo.city || ipinfo.city || "DataNotFound";
    const region = geo.regionName || ipinfo.region || "DataNotFound";
    const country = geo.country || ipinfo.country_name || "DataNotFound";
    const countryCode = geo.countryCode || ipinfo.country_code || "DataNotFound";
    const zip = geo.zip || ipinfo.postal || "DataNotFound";
    const timezone = geo.timezone || ipinfo.timezone || "DataNotFound";
    const isp = geo.isp || ipinfo.org || "DataNotFound";
    const org = geo.org || "DataNotFound";
    const asn = geo.as || "DataNotFound";

    // Final JSON
    const finalJson = {
      target: target,
      hostname: hostname,
      ip: ip,
      ipv4: ipv4,
      ipv6: ipv6,
      location: `${city} ${region} ${country}`.replace(/DataNotFound/g,'').trim() || "DataNotFound",
      city: city,
      region: region,
      state: region,
      country: country,
      countryCode: countryCode,
      zip: zip,
      latitude: lat,
      longitude: lon,
      lat: lat,
      lon: lon,
      timezone: timezone,
      isp: isp,
      org: org,
      as: asn,
      asn: asn,
      loc: country,
      reverse_dns: geo.reverse || "DataNotFound",
      is_mobile: geo.mobile || false,
      is_proxy: geo.proxy || false,
      is_hosting: geo.hosting || false,

      dns: {
        A: dnsA,
        MX: dnsMX,
        NS: dnsNS,
        TXT: dnsTXT,
        SOA: dnsSOA
      },

      map_links: {
        google_maps: lat!=="DataNotFound"? `https://www.google.com/maps?q=${lat},${lon}` : "DataNotFound",
        openstreetmap: lat!=="DataNotFound"? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}` : "DataNotFound",
        google_earth: lat!=="DataNotFound"? `https://earth.google.com/web/@${lat},${lon},1000a,1000d,30y,0h,0t,0r` : "DataNotFound"
      },

      official_checks: {
        virustotal: `https://www.virustotal.com/gui/domain/${target}`,
        abuseipdb: `https://www.abuseipdb.com/check/${ip}`,
        shodan: `https://www.shodan.io/host/${ip}`,
        censys: `https://search.censys.io/hosts/${ip}`,
        whois: `https://who.is/whois/${target}`,
        dns_lookup: `https://dnschecker.org/#A/${target}`,
        ssl_check: `https://www.ssllabs.com/ssltest/analyze.html?d=${target}`,
        google_safe: `https://transparencyreport.google.com/safe-browsing/search?url=${target}`
      },

      dev: DEV,
      note: "If any field is DataNotFound = Not available in public sources"
    };

    return res.json(finalJson);

  }catch(e){
    return res.json({error:e.message,...DEV, note:"Exception - DataNotFound for many fields"});
  }
}
