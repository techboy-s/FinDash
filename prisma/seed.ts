import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, RecordType } from '../src/generated/prisma/client';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Rent',
  'Utilities',
  'Groceries',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Education',
  'Insurance',
  'Subscriptions',
  'Dining Out',
  'Travel',
  'Clothing',
];

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments'];
const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => !INCOME_CATEGORIES.includes(c));

const NOTES_POOL = [
  'Monthly recurring payment',
  'One-time expense',
  'Quarterly review',
  'Annual subscription',
  'Client project payment',
  'Reimbursement pending',
  'Tax deductible',
  'Emergency fund allocation',
  'Bonus payment received',
  'Holiday spending',
  null,
  null,
  null, // Some records without notes
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(startDaysAgo: number, endDaysAgo: number): Date {
  const now = new Date();
  const start = new Date(now.getTime() - startDaysAgo * 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() - endDaysAgo * 24 * 60 * 60 * 1000);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log(' Starting database seed...\n');

  // Clean existing data
  await prisma.record.deleteMany();
  await prisma.user.deleteMany();
  console.log(' Cleared existing data');

  // Hash password (same for all seed users for convenience)
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash('Password123!', salt);

  // Create users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@financedash.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log(` Created ADMIN: ${admin.email}`);

  const analyst = await prisma.user.create({
    data: {
      name: 'Analyst User',
      email: 'analyst@financedash.com',
      password: hashedPassword,
      role: Role.ANALYST,
    },
  });
  console.log(` Created ANALYST: ${analyst.email}`);

  const viewer = await prisma.user.create({
    data: {
      name: 'Viewer User',
      email: 'viewer@financedash.com',
      password: hashedPassword,
      role: Role.VIEWER,
    },
  });
  console.log(` Created VIEWER: ${viewer.email}`);

  // Create 50 random financial records
  const users = [admin, analyst, viewer];
  const records = [];

  for (let i = 0; i < 50; i++) {
    const isIncome = Math.random() < 0.35; // ~35% income, ~65% expenses
    const type = isIncome ? RecordType.INCOME : RecordType.EXPENSE;
    const category = isIncome
      ? randomElement(INCOME_CATEGORIES)
      : randomElement(EXPENSE_CATEGORIES);

    // Amounts in cents: income $500-$10,000, expenses $10-$3,000
    const amount = isIncome ? randomInt(50000, 1000000) : randomInt(1000, 300000);

    records.push({
      amount,
      type,
      category,
      date: randomDate(365, 0), // Random date within the past year
      notes: randomElement(NOTES_POOL),
      userId: randomElement(users).id,
    });
  }

  await prisma.record.createMany({ data: records });
  console.log(`\n Created ${records.length} financial records`);

  // Summary
  const incomeRecords = records.filter((r) => r.type === RecordType.INCOME);
  const expenseRecords = records.filter((r) => r.type === RecordType.EXPENSE);
  const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = expenseRecords.reduce((sum, r) => sum + r.amount, 0);

  console.log('\n Seed Summary:');
  console.log(`   Users: 3 (Admin, Analyst, Viewer)`);
  console.log(`   Records: ${records.length}`);
  console.log(`   Income records: ${incomeRecords.length} (Total: $${(totalIncome / 100).toFixed(2)})`);
  console.log(`   Expense records: ${expenseRecords.length} (Total: $${(totalExpenses / 100).toFixed(2)})`);
  console.log(`   Net Balance: $${((totalIncome - totalExpenses) / 100).toFixed(2)}`);

  console.log('\n Login Credentials (all passwords: Password123!):');
  console.log(`   Admin:   admin@financedash.com`);
  console.log(`   Analyst: analyst@financedash.com`);
  console.log(`   Viewer:  viewer@financedash.com`);

  console.log('\n Seed completed successfully!');
}

main()
  .catch((error) => {
    console.error(' Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
