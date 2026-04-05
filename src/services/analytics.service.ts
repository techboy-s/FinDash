import prisma from '../utils/prisma';

interface SummaryResult {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  recordCount: number;
}

interface CategoryBreakdown {
  category: string;
  totalAmount: number;
  count: number;
}

/**
 * Calculates total income, expenses, and net balance across all records.
 * Uses database aggregation for performance.
 */
export async function getSummary(): Promise<SummaryResult> {
  const aggregations = await prisma.record.groupBy({
    by: ['type'],
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });

  let totalIncome = 0;
  let totalExpenses = 0;
  let recordCount = 0;

  for (const agg of aggregations) {
    const amount = agg._sum.amount ?? 0;
    const count = agg._count.id;

    if (agg.type === 'INCOME') {
      totalIncome = amount;
    } else if (agg.type === 'EXPENSE') {
      totalExpenses = amount;
    }

    recordCount += count;
  }

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    recordCount,
  };
}

/**
 * Aggregates expenses by category, ordered by highest amount first.
 */
export async function getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  const result = await prisma.record.groupBy({
    by: ['category'],
    where: {
      type: 'EXPENSE',
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        amount: 'desc',
      },
    },
  });

  return result.map((item) => ({
    category: item.category,
    totalAmount: item._sum.amount ?? 0,
    count: item._count.id,
  }));
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

/**
 * Calculates the total income and expenses for each of the last 6 months.
 */
export async function getMonthlyTrends(): Promise<MonthlyTrend[]> {
  // Fetch records from the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const records = await prisma.record.findMany({
    where: {
      date: {
        gte: sixMonthsAgo,
      },
    },
    orderBy: {
      date: 'asc',
    },
    select: {
      amount: true,
      type: true,
      date: true,
    },
  });

  // Group by YYYY-MM
  const trendsMap: Record<string, MonthlyTrend> = {};

  for (const record of records) {
    // e.g. "2024-04"
    const monthKey = record.date.toISOString().substring(0, 7);
    
    if (!trendsMap[monthKey]) {
      trendsMap[monthKey] = {
        month: monthKey,
        income: 0,
        expense: 0,
      };
    }

    if (record.type === 'INCOME') {
      trendsMap[monthKey].income += record.amount;
    } else {
      trendsMap[monthKey].expense += record.amount;
    }
  }

  return Object.values(trendsMap);
}
