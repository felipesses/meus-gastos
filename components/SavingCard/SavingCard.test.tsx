import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Saving, SavingCard } from ".";

const saving: Saving = {
  id: "1",
  amount: "500.00",
  description: "Reserva de emergência",
  date: "2025-06-20T00:00:00.000Z",
  type: "saving",
  categoryName: "Poupança",
};

describe("SavingCard", () => {
  it("renderiza a descrição, data, categoria e valor formatado", () => {
    render(
      <SavingCard saving={saving} onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    expect(screen.getByText("Reserva de emergência")).toBeInTheDocument();
    expect(screen.getByText("20/06/2025")).toBeInTheDocument();
    expect(screen.getByText(/Poupança/)).toBeInTheDocument();
    expect(screen.getByText("R$ 500,00")).toBeInTheDocument();
  });

  it("renderiza 'Sem categoria' se categoryName for null", () => {
    render(
      <SavingCard
        saving={{ ...saving, categoryName: null }}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText("Sem categoria")).toBeInTheDocument();
  });

  it("chama onEdit ao clicar no botão de editar", () => {
    const onEdit = jest.fn();
    render(<SavingCard saving={saving} onEdit={onEdit} onDelete={jest.fn()} />);
    const editButton = screen.getAllByRole("button")[0];
    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledWith("1");
  });

  it("chama onDelete ao clicar no botão de deletar", () => {
    const onDelete = jest.fn();
    render(
      <SavingCard saving={saving} onEdit={jest.fn()} onDelete={onDelete} />
    );
    const deleteButton = screen.getAllByRole("button")[1];
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith("1");
  });
});
