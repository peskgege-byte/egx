import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { db } from '../db.js';
import { watchlistItems } from '../../../drizzle/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const items = await db.select().from(watchlistItems).where(eq(watchlistItems.userId, req.userId!));
  res.json(items);
});

router.post('/', requireAuth, async (req, res) => {
  const { symbol, label } = req.body;
  const [result] = await db.insert(watchlistItems).values({ userId: req.userId!, symbol, label });
  res.json({ id: result.insertId, success: true });
});

router.delete('/:id', requireAuth, async (req, res) => {
  await db.delete(watchlistItems).where(eq(watchlistItems.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;
