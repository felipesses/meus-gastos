import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { IncomeCard, Income } from ".";

const income: Income = {
  id: "1",
  amount: "1500.50",
  description: "Salário",
  date: "2025-06-20T00:00:00.000Z",
  type: "income",
  categoryName: "Trabalho",
};

describe("IncomeCard", () => {
  it("renderiza a descrição, data, categoria e valor formatado", () => {
    render(
      <IncomeCard income={income} onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    expect(screen.getByText("Salário")).toBeInTheDocument();
    expect(screen.getByText("20/06/2025")).toBeInTheDocument();
    expect(screen.getByText(/Trabalho/)).toBeInTheDocument();
    expect(screen.getByText("+ R$ 1.500,50")).toBeInTheDocument();
  });

  it("renderiza 'No Category' se categoryName for null", () => {
    render(
      <IncomeCard
        income={{ ...income, categoryName: null }}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText("No Category")).toBeInTheDocument();
  });

  it("chama onEdit ao clicar no botão de editar", () => {
    const onEdit = jest.fn();
    render(<IncomeCard income={income} onEdit={onEdit} onDelete={jest.fn()} />);
    const editButton = screen.getAllByRole("button")[0];
    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledWith("1");
  });

  it("chama onDelete ao clicar no botão de deletar", () => {
    const onDelete = jest.fn();
    render(
      <IncomeCard income={income} onEdit={jest.fn()} onDelete={onDelete} />
    );
    const deleteButton = screen.getAllByRole("button")[1];
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith("1");
  });
});
