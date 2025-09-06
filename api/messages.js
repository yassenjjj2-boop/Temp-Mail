const UA = 'Mozilla/5.0 (X11; Windows x86_64; rv:91.0) Gecko/20100402 Firefox/91.0';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const auth = req.headers['authorization'] || '';
  const token = req.query.token || (auth.startsWith('Bearer ') ? auth.slice(7) : null);
  if (!token) return res.status(400).json({ error: 'Missing token' });

  try {
    const r = await fetch('https://ext2.temp-mail.org/messages', {
      headers: { 'User-Agent': UA, Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(r.ok ? 200 : r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Upstream error', details: String(e) });
  }
};