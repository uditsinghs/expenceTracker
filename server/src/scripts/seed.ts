import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { Expense } from '../models/Expense.js';
import { Income } from '../models/Income.js';
import { Udhaar } from '../models/Udhaar.js';
import { recalculateUdhaar, type UdhaarDocument } from '../models/Udhaar.js';
import { toUtcDate } from '../utils/dates.js';

/**
 * Fills the database with a small, realistic month of data.
 * Run with `npm run seed` - this replaces everything that is already stored.
 */
async function seed() {
  await connectDatabase();

  await Promise.all([Income.deleteMany({}), Expense.deleteMany({}), Udhaar.deleteMany({})]);

  await Income.create([
    { amount: 22000, source: 'Salary', date: toUtcDate('2026-08-01'), description: 'August salary' },
    { amount: 5000, source: 'Freelance', date: toUtcDate('2026-08-06'), description: 'Logo design' },
    { amount: 1000, source: 'Other', date: toUtcDate('2026-08-09'), description: 'Cashback' },
    { amount: 22000, source: 'Salary', date: toUtcDate('2026-07-01'), description: 'July salary' },
  ]);

  await Expense.create([
    { amount: 7000, category: 'Rent', date: toUtcDate('2026-08-02'), description: 'August rent' },
    { amount: 500, category: 'Food', date: toUtcDate('2026-08-12'), description: 'Lunch' },
    { amount: 1200, category: 'Food', date: toUtcDate('2026-08-08'), description: 'Groceries' },
    { amount: 1500, category: 'Travel', date: toUtcDate('2026-08-05'), description: 'Cab to office' },
    { amount: 999, category: 'Shopping', date: toUtcDate('2026-08-07'), description: 'T-shirt' },
    { amount: 850, category: 'Bills', date: toUtcDate('2026-08-04'), description: 'Electricity' },
    { amount: 450, category: 'Entertainment', date: toUtcDate('2026-08-10'), description: 'Movie' },
    { amount: 6800, category: 'Rent', date: toUtcDate('2026-07-02'), description: 'July rent' },
  ]);

  const rahul = new Udhaar({
    personName: 'Rahul',
    type: 'I_GAVE',
    originalAmount: 10000,
    remainingAmount: 10000,
    date: toUtcDate('2026-08-10'),
    description: 'Emergency help',
    repayments: [
      { amount: 2000, date: toUtcDate('2026-08-12'), note: 'UPI' },
      { amount: 2000, date: toUtcDate('2026-08-15'), note: 'Cash' },
    ],
  }) as UdhaarDocument;
  recalculateUdhaar(rahul);

  const amit = new Udhaar({
    personName: 'Amit',
    type: 'I_TOOK',
    originalAmount: 3000,
    remainingAmount: 3000,
    date: toUtcDate('2026-08-05'),
    description: 'Borrowed for shopping',
    repayments: [{ amount: 1000, date: toUtcDate('2026-08-11'), note: 'Part payment' }],
  }) as UdhaarDocument;
  recalculateUdhaar(amit);

  const priya = new Udhaar({
    personName: 'Priya',
    type: 'I_GAVE',
    originalAmount: 1500,
    remainingAmount: 1500,
    date: toUtcDate('2026-07-20'),
    description: 'Lunch money',
    repayments: [{ amount: 1500, date: toUtcDate('2026-08-03'), note: 'Returned fully' }],
  }) as UdhaarDocument;
  recalculateUdhaar(priya);

  await Promise.all([rahul.save(), amit.save(), priya.save()]);

  console.log('[seed] sample data inserted');
  await disconnectDatabase();
}

seed().catch(async (error) => {
  console.error('[seed] failed:', error);
  await disconnectDatabase();
  process.exit(1);
});
