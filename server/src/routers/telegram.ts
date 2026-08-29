import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { db } from '../db.js';
import { telegramSubscriptions } from '../../../drizzle/schema.js';
import { sendMessage, verifyToken } from '../telegram.js';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const subs = await db.select().from(telegramSubscriptions).where(eq(telegramSubscriptions.userId, req.userId!));
  res.json(subs[0] || null);
});

router.post('/', requireAuth, async (req, res) => {
  const { chatId, username, isEnabled } = req.body;
  
  const existing = await db.select().from(telegramSubscriptions).where(eq(telegramSubscriptions.userId, req.userId!));
  
  if (existing.length > 0) {
    await db.update(telegramSubscriptions)
      .set({ chatId, username, isEnabled, updatedAt: new Date() })
      .where(eq(telegramSubscriptions.userId, req.userId!));
  } else {
    await db.insert(telegramSubscriptions).values({ userId: req.userId!, chatId, username, isEnabled });
  }
  
  res.json({ success: true });
});

router.post('/test', requireAuth, async (req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return res.status(400).json({ error: 'TELEGRAM_BOT_TOKEN not configured' });
  }

  const { chatId, message = '🔔 اختبار من دفتر الإشارات الهادئ' } = req.body;
  if (!chatId) {
    return res.status(400).json({ error: 'chatId required' });
  }

  const result = await sendMessage(token, chatId, message);
  res.json(result);
});

router.get('/verify-token', requireAuth, async (req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return res.json({ valid: false, error: 'Token not configured' });
  }
  const valid = await verifyToken(token);
  res.json({ valid });
});

export default router;
