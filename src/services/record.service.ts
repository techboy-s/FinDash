import prisma from '../utils/prisma';
import { CreateRecordInput, UpdateRecordInput, RecordQueryInput } from '../schemas/record.schema';
import { NotFoundError } from '../utils/app-error';
import { Prisma, RecordType } from '../generated/prisma/client';

interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function createRecord(data: CreateRecordInput, userId: string) {
  const record = await prisma.record.create({
    data: {
      amount: data.amount,
      type: data.type as RecordType,
      category: data.category,
      date: new Date(data.date),
      notes: data.notes ?? null,
      userId,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return record;
}

export async function getRecords(
  query: RecordQueryInput
): Promise<PaginatedResult<Prisma.RecordGetPayload<{ include: { user: { select: { id: true; name: true; email: true } } } }>>> {
  const { startDate, endDate, category, type, page = 1, limit = 20 } = query;

  // Build dynamic where clause
  const where: Prisma.RecordWhereInput = {};

  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate);
    }
    if (endDate) {
      where.date.lte = new Date(endDate);
    }
  }

  if (category) {
    where.category = {
      equals: category,
      mode: 'insensitive',
    };
  }

  if (type) {
    where.type = type as RecordType;
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    prisma.record.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.record.count({ where }),
  ]);

  return {
    data: records,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getRecordById(id: string) {
  const record = await prisma.record.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!record) {
    throw new NotFoundError(`Record with ID ${id} not found`);
  }

  return record;
}

export async function updateRecord(id: string, data: UpdateRecordInput) {
  // Check if record exists
  await getRecordById(id);

  const updateData: Prisma.RecordUpdateInput = {};

  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.type !== undefined) updateData.type = data.type as RecordType;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.date !== undefined) updateData.date = new Date(data.date);
  if (data.notes !== undefined) updateData.notes = data.notes;

  const record = await prisma.record.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return record;
}

export async function deleteRecord(id: string) {
  // Check if record exists
  await getRecordById(id);

  await prisma.record.delete({
    where: { id },
  });

  return { message: `Record with ID ${id} has been deleted` };
}
