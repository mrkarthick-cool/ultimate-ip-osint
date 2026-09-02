export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { key, target, query } = req.query;
  const input = query || target;
  const VALID = ["THG-DEV-MrKarthickR-2026"];
  if(!VALID.includes(key)) return res.status(401).json({status:"error", message:"Invalid Key - Contact cybercimeinvestigationagent@gmail.com", tg:"Drak24Evil", dev:"MrKarthickR"});
  if(!input) return res.json({usage:"/api/v2/query?key=YOUR_KEY&target=8.8.8.8"});
  try{
    const r = await fetch(`https://ipwho.is/${input}`);
    const d = await r.json();
    return res.json({status:"success", dev:"MrKarthickR", query:input, data:d});
  }catch(e){return res.status(500).json({error:e.message})}
}
