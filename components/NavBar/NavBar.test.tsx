import "@testing-library/jest-dom";

import { NavBar } from ".";
import { render, screen } from "@/utils/test-utils";
import { navItems } from "@/utils/navItems";

jest.mock("@clerk/nextjs", () => ({
  UserButton: () => <div data-testid="user-button" />,
}));

describe("NavBar Component", () => {
  it("should render the NavBar component", () => {
    render(<NavBar />);
    expect(screen.getByTestId("nav-bar")).toBeInTheDocument();
  });

  it("should render the title", () => {
    render(<NavBar />);
    expect(screen.getByText("Meus Gastos")).toBeInTheDocument();
  });

  it("should render all nav items", () => {
    render(<NavBar />);
    navItems.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: item.name })).toHaveAttribute(
        "href",
        item.href
      );
    });
  });

  it("sholud render the UserButton", () => {
    render(<NavBar />);
    expect(screen.getByTestId("user-button")).toBeInTheDocument();
  });
});
