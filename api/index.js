import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const scan = async () => {
    setLoading(true);
    setData(null);
    const res = await fetch(`/api/scan?url=${encodeURIComponent(url)}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  const getPreviewHtml = () => {
    if (!data?.html) return "";
    let html = data.html;
    // FIX for blank screen
    if (!html.toLowerCase().includes('<base')) {
      const baseTag = `<base href="${data.finalUrl}">`;
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${baseTag}`);
      } else {
        html = baseTag + html;
      }
    }
    return html;
  };

  return (
    <div style={{ background: '#0a0a0a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 ULTIMATE IP OSINT</h1>
      
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        <input 
          value={url} 
          onChange={e => setUrl(e.target.value)} 
          placeholder="example.com or google.com"
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none' }}
        />
        <button onClick={scan} style={{ padding: '12px 20px', background: '#00ff88', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Scanning...' : 'SCAN'}
        </button>
      </div>

      {data && (
        <>
          <p>Status: {data.status} | Final: {data.finalUrl}</p>
          
          <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '10px', marginTop: '20px' }}>
            <h3>👁️ HTML Preview (Safe Sandbox):</h3>
            <iframe
              srcDoc={getPreviewHtml()}
              sandbox="allow-scripts allow-same-origin allow-forms"
              style={{ width: '100%', height: '600px', background: 'white', borderRadius: '8px', border: 'none' }}
            />
          </div>

          <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '15px', marginTop: '20px', maxHeight: '300px', overflow: 'auto' }}>
            <h3>📄 Source (first 2000 chars):</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', color: '#aaa' }}>
              {data.html.substring(0, 2000)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
