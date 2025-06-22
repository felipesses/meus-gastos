import Button from "@/components/Button";
import { toLocalDateInputValue } from "@/utils/localeDateInput";

import { EditIcon, Trash2Icon } from "lucide-react";

export interface Expense {
  id: string;
  amount: string;
  description: string;
  date: string;
  type: "expense";
  categoryName: string | null;
}

interface Props {
  expense: Expense;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ExpenseCard = ({ expense, onEdit, onDelete }: Props) => {
  return (
    <div className="relative bg-white p-4 rounded-xl shadow-md border border-gray-200">
      <div className="absolute top-2 right-2 flex space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(expense.id)}
          className="p-1"
        >
          <EditIcon size={16} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(expense.id)}
          className="p-1 text-red-500 hover:text-red-700"
        >
          <Trash2Icon size={16} />
        </Button>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 break-words mb-1 pr-16">
        {expense.description}
      </h3>

      <p className="text-sm text-gray-600 mb-1">
        <span className="font-medium">Data:</span>{" "}
        {toLocalDateInputValue(expense.date)}
      </p>

      {expense.categoryName && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Categoria:</span> {expense.categoryName}
        </p>
      )}

      <div className="flex justify-end items-center mt-2">
        <span className="text-xl font-bold text-red-600">
          - R${" "}
          {new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(parseFloat(expense.amount))}
        </span>
      </div>
    </div>
  );
};
