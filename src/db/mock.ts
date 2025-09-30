// This is a temporary mock implementation for development without a database
// In production, replace this with actual database operations

import { Transaction, NewTransaction } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

// Mock data for demonstration
let mockTransactions: Transaction[] = [
  {
    id: 1,
    tanggal: new Date('2025-09-01'),
    namaKeperluan: 'Salary',
    kategori: 'Income',
    nominal: 5000,
    createdAt: new Date('2025-09-01T10:00:00Z'),
  },
  {
    id: 2,
    tanggal: new Date('2025-09-05'),
    namaKeperluan: 'Groceries',
    kategori: 'Expense',
    nominal: 200,
    createdAt: new Date('2025-09-05T12:00:00Z'),
  },
  {
    id: 3,
    tanggal: new Date('2025-09-10'),
    namaKeperluan: 'Internet Bill',
    kategori: 'Expense',
    nominal: 50,
    createdAt: new Date('2025-09-10T09:00:00Z'),
  },
];

let nextId = 4;

// A more comprehensive mock implementation with Drizzle ORM compatibility
export const db = {
  select: () => ({
    from: (table: any) => {
      // Return the current mock transactions
      return {
        orderBy: (field: any, order: any) => {
          // Sort by tanggal descending by default
          return [...mockTransactions].sort((a, b) => {
            if (order === 'desc') {
              return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
            }
            return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
          });
        },
        where: (condition: any, ...args: any[]) => {
          // Simple where implementation for the expected conditions
          if (!condition) return [...mockTransactions];
          
          // Handle common Drizzle ORM patterns
          if (condition._ === 'eq') {
            // For: where(eq(transactions.id, id))
            const field = condition.left?.name || condition.left?.column?.name;
            const value = condition.right?.value || condition.right;
            if (field === 'id') {
              return mockTransactions.filter(t => t.id === value);
            }
          } else if (condition._ === 'and') {
            // For: where(and(gte(transactions.tanggal, start), lte(transactions.tanggal, end)))
            const left = condition.left;
            const right = condition.right;
            
            return mockTransactions.filter(transaction => {
              let leftMatch = true;
              let rightMatch = true;
              
              // Handle left condition
              if (left && left._ === 'gte') {
                const field = left.left?.name || left.left?.column?.name;
                const value = left.right?.value || left.right;
                if (field === 'tanggal') {
                  leftMatch = new Date(transaction.tanggal) >= new Date(value);
                }
              }
              
              // Handle right condition
              if (right && right._ === 'lte') {
                const field = right.left?.name || right.left?.column?.name;
                const value = right.right?.value || right.right;
                if (field === 'tanggal') {
                  rightMatch = new Date(transaction.tanggal) <= new Date(value);
                }
              }
              
              return leftMatch && rightMatch;
            });
          }
          
          return [...mockTransactions];
        },
        limit: (limit: number) => mockTransactions.slice(0, limit),
      };
    },
  }),
  
  insert: (table: any) => ({
    values: (data: NewTransaction) => ({
      returning: () => {
        const newTransaction: Transaction = {
          ...data,
          id: nextId++,
          createdAt: new Date(),
          tanggal: new Date(data.tanggal),
        };
        mockTransactions.push(newTransaction);
        return [newTransaction];
      },
    }),
  }),
  
  update: (table: any) => ({
    set: (data: Partial<NewTransaction>) => ({
      where: (condition: any, ...args: any[]) => {
        if (condition._ === 'eq') {
          const field = condition.left?.name || condition.left?.column?.name;
          const value = condition.right?.value || condition.right;
          
          if (field === 'id') {
            const index = mockTransactions.findIndex(t => t.id === value);
            if (index !== -1) {
              mockTransactions[index] = {
                ...mockTransactions[index],
                ...data,
                id: mockTransactions[index].id, // Keep the original id
                createdAt: mockTransactions[index].createdAt, // Keep the original creation date
              };
              return {
                returning: () => [mockTransactions[index]]
              };
            }
          }
        }
        return {
          returning: () => []
        };
      },
    }),
  }),
  
  delete: (table: any) => ({
    where: (condition: any) => {
      if (condition._ === 'eq') {
        const field = condition.left?.name || condition.left?.column?.name;
        const value = condition.right?.value || condition.right;
        
        if (field === 'id') {
          const index = mockTransactions.findIndex(t => t.id === value);
          if (index !== -1) {
            const deleted = mockTransactions.splice(index, 1);
            return {
              returning: () => deleted,
              count: deleted.length
            };
          }
        }
      }
      return {
        returning: () => [],
        count: 0
      };
    },
  }),
};