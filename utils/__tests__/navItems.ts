import { navItems } from "../navItems";

describe("navItems", () => {
  it("deve conter todos os itens esperados", () => {
    expect(navItems).toEqual([
      { name: "Dashboard", href: "/dashboard" },
      { name: "Transações", href: "/transactions" },
      { name: "Rendas", href: "/incomes" },
      { name: "Despesas", href: "/expenses" },
      { name: "Economias", href: "/savings" },
      { name: "Categorias", href: "/categories" },
    ]);
  });

  it("cada item deve ter name e href", () => {
    navItems.forEach((item) => {
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("href");
      expect(typeof item.name).toBe("string");
      expect(typeof item.href).toBe("string");
    });
  });

  it("não deve haver itens duplicados", () => {
    const names = navItems.map((item) => item.name);
    const hrefs = navItems.map((item) => item.href);
    expect(new Set(names).size).toBe(names.length);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
