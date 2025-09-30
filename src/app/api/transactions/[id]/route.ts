import { NextRequest } from 'next/server';
import { db } from '@/db';
import { transactions, Transaction, NewTransaction } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

// GET: Get a specific transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Invalid transaction ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    
    if (!transaction) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify(transaction), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch transaction' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PUT: Update a specific transaction by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Invalid transaction ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const data: NewTransaction = await request.json();
    
    // Validate required fields
    if (!data.tanggal || !data.namaKeperluan || !data.kategori || data.nominal === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Validate that kategori is either 'Income' or 'Expense'
    if (data.kategori !== 'Income' && data.kategori !== 'Expense') {
      return new Response(JSON.stringify({ error: 'Kategori must be either "Income" or "Expense"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Ensure nominal is a number and not zero if it was entered
    const nominalValue = Number(data.nominal) || 0;
    
    // Update the transaction
    const [updatedTransaction] = await db
      .update(transactions)
      .set({
        tanggal: new Date(data.tanggal),
        namaKeperluan: data.namaKeperluan,
        kategori: data.kategori,
        nominal: nominalValue,
      })
      .where(eq(transactions.id, id))
      .returning();
    
    if (!updatedTransaction) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify(updatedTransaction), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return new Response(JSON.stringify({ error: 'Failed to update transaction' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// DELETE: Delete a specific transaction by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Invalid transaction ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const deletedRows = await db
      .delete(transactions)
      .where(eq(transactions.id, id));
    
    if (deletedRows.count === 0) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ message: 'Transaction deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete transaction' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}