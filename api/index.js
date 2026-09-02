const scan = async () => {
  setLoading(true);
  setData(null);
  try {
    const res = await fetch(`/api/scan?url=${encodeURIComponent(url)}`);
    const text = await res.text(); // JSON kaadu, text ga chudu
    try {
      const json = JSON.parse(text);
      setData(json);
    } catch (e) {
      // Vercel HTML error isthe
      setData({ html: text, status: 500, finalUrl: url, headers: {}, errorMsg: "Server blocked this domain. Try example.com" });
    }
  } catch (err) {
    alert(err.message);
  }
  setLoading(false);
};
