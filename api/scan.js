export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL missing" });

  try {
    let target = url;
    if (!target.startsWith('http')) target = 'https://' + target;

    const response = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0 OSINT-Bot' },
      redirect: 'follow'
    });
    
    const html = await response.text();
    const headers = Object.fromEntries(response.headers.entries());

    res.status(200).json({
      finalUrl: response.url,
      status: response.status,
      headers: headers,
      html: html.substring(0, 50000) // limit
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
