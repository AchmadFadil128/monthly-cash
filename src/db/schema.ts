import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  tanggal: timestamp('tanggal', { mode: 'date' }).notNull(),
  namaKeperluan: text('nama_keperluan').notNull(), // Changed from snake_case to camelCase
  kategori: text('kategori').notNull().$type<'Income' | 'Expense'>(), // Using text with TypeScript type
  nominal: integer('nominal').notNull(), // Amount in cents to avoid floating point issues
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// For use in TypeScript to reference the type
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;