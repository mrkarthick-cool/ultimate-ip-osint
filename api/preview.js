export default async function handler(req,res){
 res.setHeader('Access-Control-Allow-Origin','*');
 res.setHeader('Content-Type','application/json');
 try{
  let url=(req.query.url||'').trim();
  if(!url) return res.json({error:'no url'});
  if(!url.startsWith('http')) url='https://'+url;

  let redirects=[];
  let currentUrl=url;
  let finalRes=null;
  let html='';

  // Manual redirect trace (like previewer.to)
  for(let i=0;i<10;i++){
    try{
      const r=await fetch(currentUrl,{method:'GET', headers:{'User-Agent':'Mozilla/5.0'}, redirect:'manual'});
      redirects.push(currentUrl + ` [${r.status}]`);
      if(r.status>=300 && r.status<400){
        const loc=r.headers.get('location');
        if(!loc) break;
        currentUrl=loc.startsWith('http')?loc:new URL(loc, currentUrl).href;
        continue;
      } else {
        finalRes=r;
        html=await r.text();
        break;
      }
    }catch(e){ redirects.push(currentUrl + ` [ERROR: ${e.message}]`); break; }
  }
  if(!finalRes){
    // fallback direct fetch
    try{ const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}}); finalRes=r; html=await r.text(); currentUrl=r.url; }catch(e){ html=`<h3>Blocked: ${e.message}</h3>`; }
  }

  const headers=finalRes?Object.fromEntries(finalRes.headers.entries()):{};
  const isMalware=html.toLowerCase().includes('eval(') || html.toLowerCase().includes('atob(') || headers['x-phishing']=='1';

  return res.json({
    original:req.query.url,
    finalUrl:finalRes?finalRes.url:currentUrl,
    status:finalRes?finalRes.status:0,
    ssl:(finalRes?finalRes.url:currentUrl).startsWith('https://'),
    headers:headers,
    redirects:redirects,
    malwareSuspect:isMalware,
    htmlPreview:html.slice(0,25000),
    title:(html.match(/<title>(.*?)<\/title>/i)||['','N/A'])[1]
  });
 }catch(e){
  return res.json({original:req.query.url, finalUrl:req.query.url, status:0, ssl:false, headers:{'x-error':e.message}, redirects:[req.query.url], malwareSuspect:false, htmlPreview:`Error: ${e.message}`});
 }
}
