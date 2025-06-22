import { EditIcon, Trash2Icon } from "lucide-react";
import Button from "../Button";
import { toLocalDateInputValue } from "@/utils/localeDateInput";

export interface Saving {
  id: string;
  amount: string;
  description: string;
  date: string;
  type: "saving";
  categoryName: string | null;
}

interface Props {
  saving: Saving;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SavingCard = ({ saving, onEdit, onDelete }: Props) => {
  return (
    <div className="relative bg-white p-4 rounded-xl shadow-md border border-gray-200">
      <div className="absolute top-2 right-2 flex space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(saving.id)}
          className="p-1"
        >
          <EditIcon size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(saving.id)}
          className="p-1 text-red-500 hover:text-red-700"
        >
          <Trash2Icon size={16} />
        </Button>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 break-words mb-1 pr-16">
        {saving.description}
      </h3>

      <p className="text-sm text-gray-600 mb-1">
        <span className="font-medium">Date:</span>{" "}
        {toLocalDateInputValue(saving.date)}
      </p>
      <p className="text-sm text-gray-600 mb-2">
        <span className="font-medium">Category:</span>{" "}
        {saving.categoryName || "Sem categoria"}
      </p>

      <div className="flex justify-end items-center mt-2">
        <span className="text-xl font-bold text-blue-600">
          R${" "}
          {new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(parseFloat(saving.amount))}
        </span>
      </div>
    </div>
  );
};
