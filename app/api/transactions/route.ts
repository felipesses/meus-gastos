import { NextResponse } from "next/server";
import {
  transactions,
  users,
  transactionTypeEnum,
  categories,
} from "@/lib/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import * as z from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const transactionApiSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  amount: z.number().min(0.01, "O valor deve ser maior que zero."),
  description: z
    .string()
    .min(3, "A descrição deve ter pelo menos 3 caracteres."),
  date: z.string().transform((str) => new Date(str)),
  type: z.enum(transactionTypeEnum.enumValues),
  categoryId: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [userInDb] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));

    if (!userInDb) {
      return new NextResponse("User not synchronized in the database.", {
        status: 404,
      });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const transactionId = searchParams.get("id");

    const conditions = [eq(transactions.userId, userInDb.clerkUserId)];

    if (type && ["income", "expense", "saving"].includes(type)) {
      conditions.push(
        eq(
          transactions.type,
          type as (typeof transactionTypeEnum.enumValues)[number]
        )
      );
    }

    if (startDateParam) {
      const startDate = new Date(startDateParam);
      conditions.push(gte(transactions.date, startDate));
    }

    if (endDateParam) {
      const endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(transactions.date, endDate));
    }

    if (transactionId) {
      conditions.push(eq(transactions.id, parseInt(transactionId)));
    }

    const userTransactions = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        type: transactions.type,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(transactions.date));

    if (transactionId && userTransactions.length > 0) {
      return NextResponse.json(userTransactions[0], { status: 200 });
    } else if (transactionId && userTransactions.length === 0) {
      return new NextResponse(
        "Transaction not found or does not belong to the user.",
        { status: 404 }
      );
    }

    return NextResponse.json(userTransactions, { status: 200 });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const validationResult = transactionApiSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Validation error (POST):", validationResult.error.errors);
      return new NextResponse(
        "Invalid data: " +
          validationResult.error.errors.map((e) => e.message).join(", "),
        { status: 400 }
      );
    }

    const { amount, description, date, type, categoryId } =
      validationResult.data;

    console.log("amount veio:", amount);

    const [userInDb] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));

    if (!userInDb) {
      console.error(
        `User with clerkUserId ${clerkUserId} not found in the database.`
      );
      return new NextResponse(
        "User not synchronized in the database. Please try again or contact support.",
        { status: 404 }
      );
    }

    const data = {
      userId: userInDb.clerkUserId,
      amount: amount.toString(),
      description,
      date,
      type,
      categoryId: categoryId ? Number(categoryId) : undefined,
      updatedAt: new Date(),
    };

    const [newTransaction] = await db
      .insert(transactions)
      .values(data)
      .returning();

    console.log("Transaction created:", newTransaction);
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const validationResult = transactionApiSchema.safeParse(body);

    if (!validationResult.success || !validationResult.data.id) {
      console.error(
        "Validation error (PUT):",
        validationResult.error?.errors || "Transaction ID missing."
      );
      return new NextResponse("Invalid data or transaction ID missing.", {
        status: 400,
      });
    }

    const {
      id: transactionId,
      amount,
      description,
      date,
      type,
      categoryId,
    } = validationResult.data;

    const [existingTransaction] = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, parseInt(transactionId)),
          eq(transactions.userId, clerkUserId)
        )
      );

    if (!existingTransaction) {
      return new NextResponse(
        "Transaction not found or does not belong to the user.",
        { status: 404 }
      );
    }

    const [updatedTransaction] = await db
      .update(transactions)
      .set({
        amount: amount.toFixed(2),
        description: description,
        date: date,
        type: type,
        categoryId: categoryId ? Number(categoryId) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, parseInt(transactionId)))
      .returning();

    console.log("Transaction updated:", updatedTransaction);
    return NextResponse.json(updatedTransaction, { status: 200 });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("id");

    if (!transactionId) {
      console.error("Validation error (DELETE): Transaction ID missing.");
      return new NextResponse("Transaction ID is required.", { status: 400 });
    }

    const [existingTransaction] = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, parseInt(transactionId)),
          eq(transactions.userId, clerkUserId)
        )
      );

    if (!existingTransaction) {
      return new NextResponse(
        "Transaction not found or does not belong to the user.",
        { status: 404 }
      );
    }

    await db
      .delete(transactions)
      .where(eq(transactions.id, parseInt(transactionId)));

    console.log(`Transaction with ID ${transactionId} deleted.`);
    return new NextResponse("Transaction deleted successfully.", {
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
