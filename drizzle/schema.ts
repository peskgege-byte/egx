import { mysqlTable, bigint, varchar, decimal, timestamp, boolean, int, text } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }),
  oauthProvider: varchar('oauth_provider', { length: 50 }),
  oauthId: varchar('oauth_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = mysqlTable('sessions', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id).notNull(),
  token: varchar('token', { length: 255 }).unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const portfolioPositions = mysqlTable('portfolio_positions', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id).notNull(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  quantity: decimal('quantity', { precision: 18, scale: 4 }).notNull(),
  entryPrice: decimal('entry_price', { precision: 18, scale: 6 }).notNull(),
  entryAt: timestamp('entry_at').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const watchlistItems = mysqlTable('watchlist_items', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id).notNull(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  label: varchar('label', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const alertRules = mysqlTable('alert_rules', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id).notNull(),
  symbol: varchar('symbol', { length: 20 }),
  ruleType: varchar('rule_type', { length: 50 }).notNull(),
  threshold: decimal('threshold', { precision: 18, scale: 6 }),
  cooldownMinutes: int('cooldown_minutes').default(5),
  isEnabled: boolean('is_enabled').default(true),
  lastTriggeredAt: timestamp('last_triggered_at'),
  scheduleCronTaskUid: varchar('schedule_cron_task_uid', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const notificationEvents = mysqlTable('notification_events', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id).notNull(),
  alertRuleId: bigint('alert_rule_id', { mode: 'number' }).references(() => alertRules.id),
  channel: varchar('channel', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  title: varchar('title', { length: 255 }),
  body: text('body'),
  source: varchar('source', { length: 100 }),
  sourceCapturedAt: timestamp('source_captured_at'),
  sentAt: timestamp('sent_at'),
  errorDetail: text('error_detail'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const telegramSubscriptions = mysqlTable('telegram_subscriptions', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id).notNull(),
  chatId: varchar('chat_id', { length: 255 }).notNull(),
  username: varchar('username', { length: 255 }),
  isEnabled: boolean('is_enabled').default(true),
  lastTestAt: timestamp('last_test_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
