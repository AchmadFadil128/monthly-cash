import { NextRequest } from 'next/server';
import { db } from '@/db';
import { transactions, Transaction } from '@/db/schema';
import { sql, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get the current month's start and end dates
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(startOfMonth.getMonth() + 1);
    endOfMonth.setDate(0); // Last day of the month
    endOfMonth.setHours(23, 59, 59, 999);
    
    // Get all transactions for the current month
    const allTransactions = await db
      .select()
      .from(transactions)
      .where(and(
        gte(transactions.tanggal, startOfMonth),
        lte(transactions.tanggal, endOfMonth)
      )) as Transaction[]; // Type assertion to ensure correct typing
    
    // Calculate total balance
    let totalBalance = 0;
    for (const transaction of allTransactions) {
      if (transaction.kategori === 'Income') {
        totalBalance += transaction.nominal;
      } else {
        totalBalance -= transaction.nominal;
      }
    }
    
    // Group transactions by week
    const weeklyData: { [key: string]: { Income: number; Expense: number } } = {};
    
    for (const transaction of allTransactions) {
      // Calculate week number of the month
      const transactionDate = new Date(transaction.tanggal);
      const dayOfMonth = transactionDate.getDate();
      const weekNumber = Math.ceil(dayOfMonth / 7); // Approximate week number
      
      // Create week key (Week 1, Week 2, etc.)
      const weekKey = `Week ${weekNumber}`;
      
      // Initialize the week if not already present
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { Income: 0, Expense: 0 };
      }
      
      // Add the transaction amount to the appropriate category
      if (transaction.kategori === 'Income') {
        weeklyData[weekKey].Income += transaction.nominal;
      } else {
        weeklyData[weekKey].Expense += transaction.nominal;
      }
    }
    
    // Convert the object to an array and sort by week
    const weeklySummary = Object.entries(weeklyData)
      .map(([week, data]) => ({
        week,
        Income: data.Income,
        Expense: data.Expense,
      }))
      .sort((a, b) => {
        // Sort weeks in ascending order (Week 1, Week 2, etc.)
        const weekA = parseInt(a.week.split(' ')[1]);
        const weekB = parseInt(b.week.split(' ')[1]);
        return weekA - weekB;
      });
    
    // Ensure all weeks are represented (some weeks might have no transactions)
    const expectedWeeks = Math.ceil(endOfMonth.getDate() / 7);
    for (let i = 1; i <= expectedWeeks; i++) {
      const weekKey = `Week ${i}`;
      if (!weeklySummary.some(w => w.week === weekKey)) {
        weeklySummary.push({
          week: weekKey,
          Income: 0,
          Expense: 0,
        });
      }
    }
    
    // Sort again after ensuring all weeks exist
    const sortedWeeklySummary = weeklySummary.sort((a, b) => {
      const weekA = parseInt(a.week.split(' ')[1]);
      const weekB = parseInt(b.week.split(' ')[1]);
      return weekA - weekB;
    });
    
    const response = {
      weeklyData: sortedWeeklySummary,
      totalBalance,
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch weekly summary' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}