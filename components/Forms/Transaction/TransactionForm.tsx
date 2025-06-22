"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Input";
import Button from "@/components/Button";
import { transactionTypeEnum } from "@/lib/schema";
import { Loader2 } from "lucide-react";
import { useMessage } from "@/context/MessageContext";

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const transactionFormSchema = z.object({
  id: z.string().optional(),
  amount: z.preprocess((val) => {
    if (val === null || val === undefined || val === "") {
      return 0;
    }

    if (typeof val === "string") {
      const normalized = val.replace(/\./g, "").replace(",", ".");
      return parseFloat(normalized);
    }
    return val;
  }, z.number().min(0.01, "O valor deve ser maior que zero.")),
  description: z
    .string()
    .min(3, "A descrição deve ter pelo menos 3 caracteres."),

  date: z
    .string()
    .refine((dateString) => !isNaN(new Date(dateString).getTime()), {
      message: "Data inválida.",
    }),

  type: z.enum(transactionTypeEnum.enumValues),
  categoryId: z.string().optional(),
});

type TransactionFormValues = {
  id?: string;
  amount?: number | unknown | string;
  description: string;
  date: string;
  type: "income" | "expense" | "saving";
  categoryId?: string;
};

interface ExistingTransaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: "income" | "expense" | "saving";
  categoryId?: string;
}

interface TransactionFormProps {
  existingTransaction?: ExistingTransaction;
}

interface Category {
  id: string;
  name: string;
}

export default function TransactionForm({
  existingTransaction,
}: TransactionFormProps) {
  const { user, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const clerkUserId = user?.id;
  const router = useRouter();

  const { showAlert } = useMessage();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [, setCategoriesError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: 0,
      description: "",
      date: getTodayDateString(),
      type: "income",
      categoryId: "",
      ...(existingTransaction && {
        id: existingTransaction.id,
        amount: existingTransaction.amount,
        description: existingTransaction.description,
        date: existingTransaction.date,
        type: existingTransaction.type,
        categoryId: existingTransaction.categoryId || "",
      }),
    },
  });

  useEffect(() => {
    if (existingTransaction) {
      reset({
        id: existingTransaction.id,
        amount: existingTransaction.amount,
        description: existingTransaction.description,
        date: existingTransaction.date,
        type: existingTransaction.type,
        categoryId: existingTransaction.categoryId || "",
      });
    } else {
      reset({
        amount: 0,
        description: "",
        date: getTodayDateString(),
        type: "income",
        categoryId: "",
      });
    }
  }, [existingTransaction, reset]);

  const fetchCategories = useCallback(async () => {
    if (!isClerkLoaded || !isSignedIn || !clerkUserId) {
      setCategoriesLoading(false);
      return;
    }
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const response = await fetch("/api/categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch categories.");
      }

      const data: Category[] = await response.json();
      const formattedCategories = data.map((cat) => ({
        ...cat,
        id: String(cat.id),
      }));
      setCategories(formattedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoriesError("Error ao carregar categorias.");
    } finally {
      setCategoriesLoading(false);
    }
  }, [isClerkLoaded, isSignedIn, clerkUserId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const selectedType = watch("type");

  const selectedTypePlaceholder =
    selectedType === "income"
      ? "Salário, Renda Extra, Bônus..."
      : selectedType === "expense"
      ? "Cartão de Crédito, Roupas, Mercado..."
      : "Poupança, Investimento, Reserva de Emergência...";

  const onSubmit = async (data: TransactionFormValues) => {
    if (!clerkUserId) {
      console.error("Clerk user id not found.");
      return;
    }
    const method = existingTransaction ? "PUT" : "POST";

    const url = `/api/transactions`;

    const payload = { ...data, id: existingTransaction?.id };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(
          errorData.message ||
            `Failed to ${
              existingTransaction ? "update" : "register"
            } transaction.`
        );
      }

      const result = await response.json();
      console.log(
        `Transaction ${
          existingTransaction ? "updated" : "saved"
        } successfully!`,
        result
      );

      showAlert(
        "Sucesso",
        `Transação ${
          existingTransaction ? "atualizada" : "criada"
        } com sucesso!`
      );

      const type = data?.type;

      router.push(type ? `/${type}s` : "/dashboard");

      reset();
    } catch (error) {
      console.error(
        `Error ${existingTransaction ? "updating" : "saving"} transaction:`,
        error
      );
      console.error(
        `Error ${
          existingTransaction ? "updating" : "registering"
        } transaction. Please try again.`
      );
    }
  };

  if (!isClerkLoaded || categoriesLoading) {
    return (
      <div className="flex flex-col gap-2 justify-center items-center h-[calc(100vh-80px)] text-gray-700">
        <Loader2 className="animate-spin text-gray-800" size={48} />
        <p className="ml-3 text-lg">Carregando formulário...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center h-full text-gray-700">
        <p>Por favor, faça o login para ver suas rendas.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg md:max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">
        {existingTransaction ? "Editar Transação" : "Nova Transação"}
      </h1>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          {existingTransaction && <input type="hidden" {...register("id")} />}

          <Input
            id="description"
            label="Descrição"
            type="text"
            placeholder={selectedTypePlaceholder ?? ""}
            {...register("description")}
            error={errors.description?.message}
            containerClassName="mb-6"
          />

          <Input
            id="amount"
            label="Valor"
            type="text"
            isCurrency={true}
            placeholder="0,00"
            {...register("amount")}
            value={existingTransaction ? existingTransaction.amount : undefined}
            error={errors.amount?.message}
            containerClassName="mb-6"
          />

          <Input
            id="date"
            label="Data"
            type="date"
            {...register("date")}
            error={errors.date?.message}
            containerClassName="mb-6"
          />

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Transação
            </label>

            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="income"
                  {...register("type")}
                  className="form-radio h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  disabled={!!existingTransaction}
                />
                <span className="ml-2 text-gray-700">Receita</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="expense"
                  {...register("type")}
                  className="form-radio h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  disabled={!!existingTransaction}
                />
                <span className="ml-2 text-gray-700">Despesa</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="saving"
                  {...register("type")}
                  className="form-radio h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={!!existingTransaction}
                />
                <span className="ml-2 text-gray-700">Economia</span>
              </label>
            </div>

            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Categoria (Opcional)
            </label>
            <select
              id="categoryId"
              {...register("categoryId")}
              className="block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm
                             focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option
                  key={`${category.id} - ${category.name}`}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? existingTransaction
                ? "Atualizando..."
                : "Registrando..."
              : existingTransaction
              ? "Salvar Alterações"
              : "Registrar Transação"}
          </Button>
        </form>
      </div>
    </div>
  );
}
