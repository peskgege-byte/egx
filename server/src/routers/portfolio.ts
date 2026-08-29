import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { db } from '../db.js';
import { portfolioPositions } from '../../../drizzle/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const positions = await db.select().from(portfolioPositions).where(eq(portfolioPositions.userId, req.userId!));
  res.json(positions);
});

router.post('/', requireAuth, async (req, res) => {
  const { symbol, quantity, entryPrice, entryAt, note } = req.body;
  const [result] = await db.insert(portfolioPositions).values({
    userId: req.userId!,
    symbol,
    quantity,
    entryPrice,
    entryAt: new Date(entryAt),
    note,
  });
  res.json({ id: result.insertId, success: true });
});

router.delete('/:id', requireAuth, async (req, res) => {
  await db.delete(portfolioPositions).where(eq(portfolioPositions.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;
