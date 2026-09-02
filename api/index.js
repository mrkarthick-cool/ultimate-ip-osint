export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { key, target } = req.query;
  if (key !== 'THG-DEV-MrKarthickR-2026') {
    return res.status(401).json({ error: 'Invalid API Key' });
  }
  if (!target) return res.status(400).json({ error: 'target required' });
  
  try {
    const r = await fetch(`http://ip-api.com/json/${target}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
    const data = await r.json();
    return res.status(200).json({
      dev: "MrKarthickR",
      group: "Telugu Hackers Group",
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
