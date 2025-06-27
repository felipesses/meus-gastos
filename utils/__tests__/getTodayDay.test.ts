/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTodayDay } from "../getTodayDay";

describe("getTodayDay", () => {
  it("deve retornar o dia de hoje com dois dígitos", () => {
    // Mocka a data para garantir resultado previsível
    const mockDate = new Date(2025, 5, 7); // 7 de junho de 2025
    jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

    expect(getTodayDay()).toBe("07");

    (Date as any).mockRestore();
  });
});
