/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getMonthName, monthOptions } from "@/utils/dashboard";
import { useUser } from "@clerk/nextjs";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DashboardTransaction {
  id: string;
  amount: string;
  description: string;
  date: string;
  type: "income" | "expense" | "saving";
  categoryName: string | null;
}

const COLORS = [
  "#FF8042",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#A28DFF",
  "#FF6B6B",
];

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    try {
      const storedMonth = localStorage.getItem("lastSelectedDashboardMonth");
      if (
        storedMonth &&
        monthOptions.some((option) => option.value === storedMonth)
      ) {
        return storedMonth;
      }
    } catch (e) {
      console.error(
        "Failed to load selected month from localStorage during initialization:",
        e
      );
    }
    return monthOptions[11].value;
  });
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [expenseByCategory, setExpenseByCategory] = useState<any[]>([]);

  useEffect(() => {
    try {
      const storedMonth = localStorage.getItem("lastSelectedDashboardMonth");
      if (
        storedMonth &&
        monthOptions.some((option) => option.value === storedMonth)
      ) {
        setSelectedMonth(storedMonth);
      }
    } catch (e) {
      console.error("Failed to load selected month from localStorage:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("lastSelectedDashboardMonth", selectedMonth);
    } catch (e) {
      console.error("Failed to save selected month to localStorage:", e);
    }
  }, [selectedMonth]);

  const fetchDashboardData = useCallback(async () => {
    if (!isLoaded || !isSignedIn || !user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [yearStr, monthStr] = selectedMonth.split("-");
      const year = parseInt(yearStr);
      const month = parseInt(monthStr) - 1;

      const startDate = format(
        startOfMonth(new Date(year, month)),
        "yyyy-MM-dd"
      );
      const endDate = format(endOfMonth(new Date(year, month)), "yyyy-MM-dd");

      const response = await fetch(
        `/api/transactions?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch dashboard data.");
      }

      const data: DashboardTransaction[] = await response.json();

      let income = 0;
      let expenses = 0;
      let savings = 0;
      const categoryMap = new Map<string, number>();

      data.forEach((transaction) => {
        const amount = parseFloat(transaction.amount);
        if (transaction.type === "income") {
          income += amount;
        } else if (transaction.type === "expense") {
          expenses += amount;
          const category = transaction.categoryName || "Sem categoria";
          categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
        } else if (transaction.type === "saving") {
          savings += amount;
        }
      });

      setTotalIncome(income);
      setTotalExpenses(expenses);
      setTotalSavings(savings);
      setRemainingBalance(income - expenses - savings);

      const chartData = Array.from(categoryMap.entries())
        .map(([name, value]) => ({
          name,
          value,
        }))
        .sort((a, b) => b.value - a.value);

      setExpenseByCategory(chartData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Erro ao carregar dashboard. Por favor, tente novamente.");

      setTotalIncome(0);
      setTotalExpenses(0);
      setTotalSavings(0);
      setRemainingBalance(0);
      setExpenseByCategory([]);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user?.id, selectedMonth]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(event.target.value);
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex flex-col gap-2 justify-center items-center h-[calc(100vh-80px)] text-gray-700">
        <Loader2 className="animate-spin text-gray-800" size={48} />
        <p className="ml-3 text-lg">Carregando dashboard...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center h-full text-gray-700">
        <p>Faça o login para ver o Dashboard.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 md:mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-center md:text-left mb-4 md:mb-2">
            Dashboard
          </h1>
          <p className="hidden md:block text-gray-600 text-left md:text-left mb-4 md:mb-0">
            Veja o seu balanço do mês e selecione o mês que desejar.
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <label htmlFor="month-select" className="sr-only">
            Selecione o mês
          </label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="px-4 py-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800 text-lg"
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-800">Rendas</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">
            R${" "}
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(totalIncome)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-800">Despesas</h2>
          <p className="text-3xl font-bold text-red-600 mt-2">
            R${" "}
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(totalExpenses)}
          </p>
        </div>

        <div className="bg-white md:hidden p-6 rounded-xl shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-800">Economias</h2>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            R${" "}
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(totalSavings)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Saldo Restante
          </h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            R${" "}
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(remainingBalance)}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Gastos por categoria no mês de {getMonthName(selectedMonth)}
        </h2>

        {expenseByCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseByCategory}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {expenseByCategory.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
                <Tooltip formatter={(value: number) => `R$ ${value}`} />
                <Legend />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 w-full flex items-center justify-center text-gray-500">
            <p>Sem despesas no mês.</p>
          </div>
        )}
      </div>
    </div>
  );
}
