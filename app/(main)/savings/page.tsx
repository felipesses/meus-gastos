"use client";

import Button from "@/components/Button";
import { Saving, SavingCard } from "@/components/SavingCard";
import { useMessage } from "@/context/MessageContext";
import { monthOptions } from "@/utils/dashboard";
import { getTodayDay } from "@/utils/getTodayDay";
import { toLocalDateInputValue } from "@/utils/localeDateInput";
import { useUser } from "@clerk/nextjs";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { EditIcon, Loader2, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function SavingsPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const router = useRouter();

  const { showAlert, showConfirm } = useMessage();

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

  const fetchSavings = useCallback(async () => {
    const [yearStr, monthStr] = selectedMonth.split("-");
    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1;

    const startDate = format(startOfMonth(new Date(year, month)), "yyyy-MM-dd");
    const endDate = format(endOfMonth(new Date(year, month)), "yyyy-MM-dd");

    if (!isLoaded || !isSignedIn || !user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/transactions?type=saving&startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch savings.");
      }

      const data: Saving[] = await response.json();
      setSavings(data);
    } catch (error) {
      console.error("Error fetching savings:", error);
      setError("Error ao carregar economias. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user?.id, selectedMonth]);

  useEffect(() => {
    fetchSavings();
  }, [fetchSavings]);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(event.target.value);
  };

  const handleDelete = async (id: string) => {
    showConfirm(
      "Confirmar remoção",
      "Tem certeza que deseja remover essa economia?",
      async () => {
        // This callback runs if user confirms
        console.log(`Deleting saving with ID: ${id}`);
        try {
          const response = await fetch(`/api/transactions?id=${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete saving.");
          }

          console.log("Saving deleted successfully!");
          showAlert("Sucesso", "Economia removida com sucesso!");
          fetchSavings();
        } catch (error) {
          console.error("Error deleting saving:", error);
          setError("Erro ao remover economia. Por favor, tente novamente");
          showAlert(
            "Erro",
            "Erro ao remover economia. Por favor, tente novamente"
          );
        }
      },
      "Remover",
      "Cancelar"
    );
  };

  const handleEdit = (id: string) => {
    router.push(`/transactions/${id}/edit`);
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex flex-col gap-2 justify-center items-center h-[calc(100vh-80px)] text-gray-700">
        <Loader2 className="animate-spin text-gray-800" size={48} />
        <p className="ml-3 text-lg">Carregando economias...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center h-full text-gray-700">
        <p>Por favor, faça o login para ver suas economias.</p>
      </div>
    );
  }

  const day = getTodayDay();

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">
        Minhas Economias
      </h1>

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

      {savings.length > 0 && (
        <div className="my-8 flex justify-center items-center">
          <Link
            href={`/transactions?month=${selectedMonth}-${day}&transactionType=saving`}
            passHref
          >
            <Button variant="primary">Registrar nova economia</Button>
          </Link>
        </div>
      )}

      {savings.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <p className="text-gray-600 mb-4">Sem economias registradas. </p>
          <Link
            href={`/transactions?month=${selectedMonth}-${day}&transactionType=saving`}
            passHref
          >
            <Button variant="primary">Registrar nova economia</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="block md:hidden space-y-4">
            {savings.map((saving) => (
              <SavingCard
                key={saving.id}
                saving={saving}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <div className="hidden md:block bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-xl"
                  >
                    Data
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Descrição
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Categoria
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Valor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-xl"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {savings.map((saving) => (
                  <tr key={saving.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {toLocalDateInputValue(saving.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {saving.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {saving.categoryName || "Sem categoria"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-blue-600">
                      R${" "}
                      {new Intl.NumberFormat("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(parseFloat(saving.amount))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEdit(saving.id)}
                          className="px-2 py-1"
                        >
                          <EditIcon size={16} />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(saving.id)}
                          className="px-2 py-1"
                        >
                          <Trash2Icon size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
