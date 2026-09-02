export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let { key, target } = req.query;
  if (key !== 'THG-DEV-MrKarthickR-2026') {
    return res.status(401).json({ error: 'Invalid API Key' });
  }
  if (!target) return res.status(400).json({ error: 'target required' });

  try {
    target = target.trim();
    // If target is domain, resolve to IP using Cloudflare DNS
    if (/[a-zA-Z]/.test(target)) {
      try {
        const dns = await fetch(`https://cloudflare-dns.com/dns-query?name=${target}&type=A`, {
          headers: { 'Accept': 'application/dns-json' }
        });
        const dnsData = await dns.json();
        if (dnsData.Answer && dnsData.Answer[0]) {
          target = dnsData.Answer[0].data;
        }
      } catch(e) {}
    }

    const r = await fetch(`http://ip-api.com/json/${target}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
    const data = await r.json();
    
    if (data.status === 'fail') {
      return res.status(404).json({ error: data.message || 'not found', target });
    }

    return res.status(200).json({
      dev: "MrKarthickR @Drak24Evil",
      TGgroupTiTle: "Telugu Hackers Group",
      TGgrouplink: "https://t.me/teluguhackersgroup1",
      target: data.query,
      location: `${data.city}, ${data.regionName}, ${data.country}`,
      isp: data.isp,
      org: data.org,
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
      full_data: data
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
