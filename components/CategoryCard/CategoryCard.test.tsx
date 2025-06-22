import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategoryCard, Category } from ".";

describe("CategoryCard", () => {
  const baseCategory: Category = {
    id: "1",
    name: "Alimentação",
    isCustom: false,
    userId: null,
  };

  it("renderiza o nome da categoria", () => {
    render(
      <CategoryCard
        category={baseCategory}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText("Alimentação")).toBeInTheDocument();
  });

  it("exibe 'Padrão' para categorias não customizadas", () => {
    render(
      <CategoryCard
        category={baseCategory}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText("Padrão")).toBeInTheDocument();
  });

  it("exibe 'Personalizada' para categorias customizadas", () => {
    render(
      <CategoryCard
        category={{ ...baseCategory, isCustom: true }}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText("Personalizada")).toBeInTheDocument();
  });

  it("exibe botões de editar e deletar apenas se isCustom for true", () => {
    render(
      <CategoryCard
        category={{ ...baseCategory, isCustom: true }}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getAllByRole("button").length).toBe(2);
  });

  it("não exibe botões de editar e deletar se isCustom for false", () => {
    render(
      <CategoryCard
        category={baseCategory}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("chama onEdit ao clicar no botão de editar", () => {
    const onEdit = jest.fn();
    render(
      <CategoryCard
        category={{ ...baseCategory, isCustom: true }}
        onEdit={onEdit}
        onDelete={jest.fn()}
      />
    );
    const editButton = screen.getAllByRole("button")[0];
    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledWith({ ...baseCategory, isCustom: true });
  });

  it("chama onDelete ao clicar no botão de deletar", () => {
    const onDelete = jest.fn();
    render(
      <CategoryCard
        category={{ ...baseCategory, isCustom: true }}
        onEdit={jest.fn()}
        onDelete={onDelete}
      />
    );
    const deleteButton = screen.getAllByRole("button")[1];
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith("1");
  });
});
