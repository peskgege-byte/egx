import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { db } from '../db.js';
import { alertRules } from '../../../drizzle/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const rules = await db.select().from(alertRules).where(eq(alertRules.userId, req.userId!));
  res.json(rules);
});

router.post('/', requireAuth, async (req, res) => {
  const { symbol, ruleType, threshold, cooldownMinutes, isEnabled } = req.body;
  const [result] = await db.insert(alertRules).values({
    userId: req.userId!,
    symbol,
    ruleType,
    threshold,
    cooldownMinutes,
    isEnabled,
  });
  res.json({ id: result.insertId, success: true });
});

router.put('/:id', requireAuth, async (req, res) => {
  const { isEnabled } = req.body;
  await db.update(alertRules)
    .set({ isEnabled, updatedAt: new Date() })
    .where(eq(alertRules.id, Number(req.params.id)));
  res.json({ success: true });
});

router.delete('/:id', requireAuth, async (req, res) => {
  await db.delete(alertRules).where(eq(alertRules.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;
