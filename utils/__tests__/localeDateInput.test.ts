import { toLocalDateInputValue } from "../localeDateInput";

describe("toLocalDateInputValue", () => {
  it("formata string YYYY-MM-DD para dd/MM/yyyy", () => {
    expect(toLocalDateInputValue("2025-06-20")).toBe("20/06/2025");
  });

  it("formata string YYYY-MM-DDTHH:mm:ss.sssZ para dd/MM/yyyy", () => {
    expect(toLocalDateInputValue("2025-06-20T00:00:00.000Z")).toBe(
      "20/06/2025"
    );
  });

  it("retorna data inválida para string inválida", () => {
    expect(toLocalDateInputValue("invalid-date")).toBe(
      new Date("invalid-date").toLocaleDateString("pt-BR")
    );
  });

  it("retorna data formatada para objeto Date ", () => {
    const date = new Date(2023, 4, 15);
    const result = toLocalDateInputValue(date);
    expect(result).toBe(date.toLocaleDateString("pt-BR"));
  });
});
