import { NextRequest } from 'next/server';
import { db } from '@/db';
import { transactions, Transaction, NewTransaction } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get all transactions ordered by date (newest first)
    const allTransactions = await db
      .select()
      .from(transactions)
      .orderBy(transactions.tanggal, 'desc');
    
    return new Response(JSON.stringify(allTransactions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch transactions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
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
    
    // Insert the new transaction
    const [newTransaction] = await db
      .insert(transactions)
      .values({
        tanggal: new Date(data.tanggal),
        namaKeperluan: data.namaKeperluan,
        kategori: data.kategori,
        nominal: nominalValue,
      })
      .returning();
    
    return new Response(JSON.stringify(newTransaction), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return new Response(JSON.stringify({ error: 'Failed to create transaction' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}