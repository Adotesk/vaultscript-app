export const config = { maxDuration: 60 };

// Simple in-memory rate limit store (resets per edge instance)
// For demo requests only - limits abuse without needing Redis
const demoRequests = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000; // 24 hours
  const maxRequests = 3; // max 3 demo generations per IP per day

  const record = demoRequests.get(ip);

  if (!record) {
    demoRequests.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (now > record.resetAt) {
    demoRequests.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count++;
  return false;
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { messages, max_tokens = 4000, type = 'tool' } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // For demo requests: rate limit by IP and cap tokens
    if (type === 'demo') {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || req.headers.get('cf-connecting-ip')
        || 'unknown';

      if (isRateLimited(ip)) {
        return new Response(JSON.stringify({ error: 'Demo limit reached. Upgrade to Pro for unlimited generations.' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Cap demo tokens — no full scripts for free
      const cappedTokens = Math.min(max_tokens, 900);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: cappedTokens,
          messages,
        }),
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // For tool requests: verify secret so only paying customers can use full generation
    const toolSecret = process.env.TOOL_SECRET;
    const requestSecret = req.headers.get('x-tool-secret');

    if (toolSecret && requestSecret !== toolSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Full tool generation
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens,
        messages,
      }),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
