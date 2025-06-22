import { EditIcon, Trash2Icon } from "lucide-react";
import Button from "@/components/Button";

export interface Category {
  id: string;
  name: string;
  isCustom: boolean;
  userId: string | null;
}

export const CategoryCard: React.FC<{
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}> = ({ category, onEdit, onDelete }) => {
  return (
    <div className="relative bg-white p-4 rounded-xl shadow-md border border-gray-200 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800 break-words pr-16">
          {category.name}
        </h3>
        {category.isCustom && (
          <div className="absolute top-2 right-2 flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(category)}
              className="p-1"
            >
              <EditIcon size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(category.id)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              <Trash2Icon size={16} />
            </Button>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600">
        {category.isCustom ? "Personalizada" : "Padrão"}
      </p>
    </div>
  );
};
