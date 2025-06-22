"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2, EditIcon, Trash2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/Button";
import { Input } from "@/components/Input";
import { Category, CategoryCard } from "@/components/CategoryCard";
import { useMessage } from "@/context/MessageContext";

const categoryFormSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters.")
    .max(50, "Category name cannot exceed 50 characters."),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function CategoriesPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { showConfirm, showAlert } = useMessage();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (editingCategory) {
      setValue("id", editingCategory.id);
      setValue("name", editingCategory.name);
    } else {
      reset({ name: "", id: undefined });
    }
  }, [editingCategory, reset, setValue]);

  const fetchCategories = useCallback(async () => {
    if (!isLoaded || !isSignedIn || !user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/categories`, {
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
      const formattedData = data.map((cat) => ({ ...cat, id: String(cat.id) }));
      setCategories(formattedData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Erro ao carregar categorias. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user?.id]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const onSubmit = async (data: CategoryFormValues) => {
    if (!user?.id) {
      console.error(
        "Clerk user ID not found. Cannot perform category operation."
      );
      return;
    }

    const method = editingCategory ? "PUT" : "POST";
    const url = "/api/categories";
    const payload = { ...data, id: editingCategory?.id };

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
        throw new Error(
          errorData.message ||
            `Falha ao ${editingCategory ? "atualizar" : "criar"} categoria.`
        );
      }

      console.log(
        `Category ${editingCategory ? "updated" : "created"} successfully!`
      );
      reset({ name: "", id: undefined });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error(
        `Error ${editingCategory ? "updating" : "creating"} category:`,
        error
      );
      setError(
        `Erro ao ${
          editingCategory ? "atualizar" : "criar"
        } categoria. Por favor, tente novamente.`
      );
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
  };

  const handleDelete = async (id: string) => {
    showConfirm(
      "Confirmar remoção",
      "Tem certeza que deseja remover essa categoria?",
      async () => {
        // This callback runs if user confirms
        console.log(`Deleting category with ID: ${id}`);
        try {
          const response = await fetch(`/api/categories?id=${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete category.");
          }

          console.log("category deleted successfully!");
          showAlert("Sucesso", "Categoria removida com sucesso!");
          fetchCategories();
        } catch (error) {
          console.error("Error deleting category:", error);
          setError("Erro ao remover categoria. Por favor, tente novamente");
          showAlert(
            "Erro",
            "Erro ao remover categoria. Por favor, tente novamente"
          );
        }
      },
      "Remover",
      "Cancelar"
    );
  };
  if (!isLoaded || loading) {
    return (
      <div className="flex flex-col gap-2 justify-center items-center h-[calc(100vh-80px)] text-gray-700">
        <Loader2 className="animate-spin text-gray-800" size={48} />
        <p className="ml-3 text-lg">Carregando categorias...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center h-full text-gray-700">
        <p>Please sign in to manage your categories.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-red-600">
        <p className="mb-4">{error}</p>
        <Button onClick={() => setError(null)} variant="secondary">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">
        Gerenciar Categorias
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 max-w-lg mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
          {editingCategory ? "Editar Categoria" : "Adicionar Nova Categoria"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {editingCategory && <input type="hidden" {...register("id")} />}
          <Input
            id="categoryName"
            label="Nome da Categoria"
            type="text"
            placeholder="ex: Mercado, Aluguel"
            {...register("name")}
            error={errors.name?.message}
            containerClassName="mb-4"
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? editingCategory
                ? "Salvando..."
                : "Adicionando..."
              : editingCategory
              ? "Salvar Alterações"
              : "Adicionar Categoria"}
          </Button>
          {editingCategory && (
            <Button
              variant="secondary"
              onClick={() => setEditingCategory(null)}
              className="w-full mt-2"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
        </form>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <p className="text-gray-600 mb-4">
            Nenhuma categoria cadastrada ainda.
          </p>
        </div>
      ) : (
        <>
          <div className="block md:hidden space-y-4">
            {categories.map((category) => (
              <CategoryCard
                key={`${category.id} - ${category.name}`}
                category={category}
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
                    Nome da Categoria
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tipo
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
                {categories.map((category) => (
                  <tr key={`${category.id} - ${category.name}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {category.isCustom ? "Personalizada" : "Padrão"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {category.isCustom && (
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            className="px-2 py-1"
                          >
                            <EditIcon size={16} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                            className="px-2 py-1"
                          >
                            <Trash2Icon size={16} />
                          </Button>
                        </div>
                      )}
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
