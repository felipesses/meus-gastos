import React from "react";
import { Expense, ExpenseCard } from ".";
import { render, screen, fireEvent } from "@testing-library/react";

const expense: Expense = {
  id: "1",
  amount: "123.45",
  description: "Supermercado",
  date: "2025-06-12T00:00:00.000Z",
  type: "expense",
  categoryName: "Alimentação",
};

describe("ExpenseCard", () => {
  it("renderiza a descrição, data, categoria e valor formatado", () => {
    render(
      <ExpenseCard expense={expense} onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    expect(screen.getByText("Supermercado")).toBeInTheDocument();
    expect(screen.getByText("12/06/2025")).toBeInTheDocument();
    expect(screen.getByText(/Alimentação/)).toBeInTheDocument();
    expect(screen.getByText("- R$ 123,45")).toBeInTheDocument();
  });

  it("não renderiza categoria se categoryName for null", () => {
    render(
      <ExpenseCard
        expense={{ ...expense, categoryName: null }}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.queryByText(/Categoria:/)).not.toBeInTheDocument();
  });

  it("chama onEdit ao clicar no botão de editar", () => {
    const onEdit = jest.fn();
    render(
      <ExpenseCard expense={expense} onEdit={onEdit} onDelete={jest.fn()} />
    );
    const editButton = screen.getAllByRole("button")[0];
    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledWith("1");
  });

  it("chama onDelete ao clicar no botão de deletar", () => {
    const onDelete = jest.fn();
    render(
      <ExpenseCard expense={expense} onEdit={jest.fn()} onDelete={onDelete} />
    );
    const deleteButton = screen.getAllByRole("button")[1];
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith("1");
  });
});
