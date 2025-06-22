/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Input } from "./index";
import { render, screen, fireEvent } from "@testing-library/react";

describe("Input", () => {
  it("renders with label", () => {
    render(<Input id="test" label="Nome" value="" onChange={() => {}} />);
    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
  });

  it("renders with error message", () => {
    render(
      <Input
        id="test"
        label="Nome"
        value=""
        error="Campo obrigatório"
        onChange={() => {}}
      />
    );
    expect(screen.getByText("Campo obrigatório")).toBeInTheDocument();
  });

  it("renders with initial value", () => {
    render(<Input id="test" value="abc" onChange={() => {}} />);
    expect(screen.getByDisplayValue("abc")).toBeInTheDocument();
  });

  it("calls onChange for normal input", () => {
    const onChange = jest.fn();
    render(<Input id="test" value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "xyz" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("renders currency value formatted when isCurrency is true and value is number", () => {
    render(
      <Input id="currency" isCurrency value={1234.56} onChange={() => {}} />
    );
    expect(screen.getByDisplayValue("1.234,56")).toBeInTheDocument();
  });

  it("formats input as currency on change", () => {
    const onChange = jest.fn();
    render(<Input id="currency" isCurrency value={0} onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "123456" } });
    expect(input).toHaveValue("1.234,56");
    expect(onChange).toHaveBeenCalled();
  });

  it("formats input as currency on blur", () => {
    render(<Input id="currency" isCurrency value={0} onChange={() => {}} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "123456" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("1.234,56");
  });

  it("shows empty string for invalid currency value", () => {
    render(
      <Input id="currency" isCurrency value={null as any} onChange={() => {}} />
    );
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("applies error classes when error is present", () => {
    render(
      <Input
        id="test"
        value=""
        error="Erro"
        onChange={() => {}}
        className="custom"
      />
    );
    const input = screen.getByRole("textbox");
    expect(input.className).toMatch(/border-red-500/);
    expect(input.className).toMatch(/custom/);
  });

  it("renders empty string if value is undefined and isCurrency is true", () => {
    render(
      <Input
        id="currency"
        isCurrency
        value={undefined as any}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("formats currency correctly for values with less than 2 digits", () => {
    render(<Input id="currency" isCurrency value={1} onChange={() => {}} />);
    expect(screen.getByDisplayValue("1,00")).toBeInTheDocument();

    render(<Input id="currency" isCurrency value={0.5} onChange={() => {}} />);
    expect(screen.getByDisplayValue("0,50")).toBeInTheDocument();
  });

  it("renders input without label", () => {
    render(<Input id="test" value="abc" onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
