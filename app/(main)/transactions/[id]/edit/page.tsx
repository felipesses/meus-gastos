import React from "react";
import { db } from "@/lib/db";
import { transactions, users, categories } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import TransactionForm from "@/components/Forms/Transaction/TransactionForm";

const toLocalDateInputValue = (dateInput: string | Date) => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toISOString().slice(0, 10);
};

interface TransactionDataForForm {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: "income" | "expense" | "saving";
  categoryId: string | undefined;
  categoryName?: string | null;
}

export default async function EditTransactionPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { userId: clerkUserId } = await auth();

  const { id } = await params;

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  const transactionId = parseInt(id);

  if (isNaN(transactionId)) {
    notFound();
  }

  try {
    const [userInDb] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));

    if (!userInDb) {
      console.error(
        `User with clerkUserId ${clerkUserId} not found in the database.`
      );
      notFound();
    }

    const [transaction] = await db
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
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userInDb.clerkUserId)
        )
      );

    if (!transaction) {
      notFound();
    }

    const transactionData: TransactionDataForForm = {
      id: transaction.id.toString(),
      amount: parseFloat(transaction.amount),
      description: transaction.description,
      date: toLocalDateInputValue(transaction.date),
      type: transaction.type,
      categoryId: transaction.categoryId
        ? transaction.categoryId.toString()
        : undefined,
      categoryName: transaction.categoryName,
    };

    return (
      <div className="w-full">
        <TransactionForm existingTransaction={transactionData} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching transaction for editing:", error);
    notFound();
  }
}
