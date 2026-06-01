export const config = { maxDuration: 60 };

const demoRequests = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000;
  const maxRequests = 3;
  const record = demoRequests.get(ip);
  if (!record) {
    demoRequests.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (now > record.resetAt) {
    demoRequests.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (record.count >= maxRequests) return true;
  record.count++;
  return false;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-tool-secret');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, max_tokens = 4000, type = 'tool' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

    if (type === 'demo') {
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
      if (isRateLimited(ip)) {
        return res.status(429).json({ error: 'Demo limit reached. Upgrade for unlimited generations.' });
      }
      const cappedTokens = Math.min(max_tokens, 900);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: cappedTokens, messages }),
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    const toolSecret = process.env.TOOL_SECRET;
    const requestSecret = req.headers['x-tool-secret'];
    if (toolSecret && requestSecret !== toolSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens, messages }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
 
