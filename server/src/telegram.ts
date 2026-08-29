const rateLimits = new Map<string, number>();

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendMessage(token: string, chatId: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const key = `${token}:${chatId}`;
  const last = rateLimits.get(key) || 0;
  if (Date.now() - last < 60_000) {
    return { ok: false, error: 'Rate limited: Please wait 1 minute between tests.' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(10000),
    });
    const json = await res.json();
    if (json.ok) {
      rateLimits.set(key, Date.now());
      return { ok: true };
    } else {
      return { ok: false, error: json.description || 'Telegram API error' };
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}
