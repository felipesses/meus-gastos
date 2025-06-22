import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MessageBox from ".";

describe("MessageBox", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: "Test Title",
    message: "Test message",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("não renderiza quando isOpen é false", () => {
    render(<MessageBox {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Test Title")).toBeNull();
  });

  it("renderiza título e mensagem", () => {
    render(<MessageBox {...defaultProps} />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("chama onClose ao clicar no botão OK (alert)", () => {
    render(<MessageBox {...defaultProps} />);
    fireEvent.click(screen.getByText("OK"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("renderiza botões de confirmar e cancelar no modo confirm", () => {
    render(
      <MessageBox {...defaultProps} type="confirm" onConfirm={jest.fn()} />
    );
    expect(screen.getByText("OK")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("chama onConfirm e onClose ao clicar em OK no modo confirm", () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    render(
      <MessageBox
        {...defaultProps}
        type="confirm"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByText("OK"));
    expect(onConfirm).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("chama apenas onClose ao clicar em Cancelar no modo confirm", () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    render(
      <MessageBox
        {...defaultProps}
        type="confirm"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("permite customizar textos dos botões", () => {
    render(
      <MessageBox
        {...defaultProps}
        type="confirm"
        confirmText="Sim"
        cancelText="Não"
      />
    );
    expect(screen.getByText("Sim")).toBeInTheDocument();
    expect(screen.getByText("Não")).toBeInTheDocument();
  });
});
