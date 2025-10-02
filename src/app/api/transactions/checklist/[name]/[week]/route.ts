import { NextRequest } from 'next/server';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string; week: string }> }
) {
  try {
    const { name, week } = await params;
    
    // Construct the expected transaction name pattern
    const transactionName = `Iuran ${name} - Minggu ${week}`;
    
    // Delete the transaction that matches the checklist pattern
    const deletedTransactions = await db
      .delete(transactions)
      .where(
        and(
          eq(transactions.namaKeperluan, transactionName),
          eq(transactions.kategori, 'Income')
        )
      )
      .returning();
    
    if (deletedTransactions.length === 0) {
      return new Response(JSON.stringify({ message: 'No matching checklist transaction found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      message: 'Checklist transaction deleted successfully',
      deletedCount: deletedTransactions.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting checklist transaction:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete checklist transaction' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}