import Button from "@/components/Button";
import { toLocalDateInputValue } from "@/utils/localeDateInput";

import { EditIcon, Trash2Icon } from "lucide-react";

export interface Income {
  id: string;
  amount: string;
  description: string;
  date: string;
  type: "income";
  categoryName: string | null;
}

interface Props {
  income: Income;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const IncomeCard = ({ income, onEdit, onDelete }: Props) => {
  return (
    <div className="relative bg-white p-4 rounded-xl shadow-md border border-gray-200">
      <div className="absolute top-2 right-2 flex space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(income.id)}
          className="p-1"
        >
          <EditIcon size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(income.id)}
          className="p-1 text-red-500 hover:text-red-700"
        >
          <Trash2Icon size={16} />
        </Button>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 break-words mb-1 pr-16">
        {income.description}
      </h3>

      <p className="text-sm text-gray-600 mb-1">
        <span className="font-medium">Date:</span>{" "}
        {toLocalDateInputValue(income.date)}
      </p>
      <p className="text-sm text-gray-600 mb-2">
        <span className="font-medium">Category:</span>{" "}
        {income.categoryName || "No Category"}
      </p>

      <div className="flex justify-end items-center mt-2">
        <span className="text-xl font-bold text-green-600">
          + R${" "}
          {new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(parseFloat(income.amount))}
        </span>
      </div>
    </div>
  );
};
