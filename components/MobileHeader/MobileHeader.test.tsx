/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { MobileHeader } from "./index";
import { render, screen, fireEvent } from "@/utils/test-utils";

// Mock lucide-react MenuIcon
jest.mock("lucide-react", () => ({
  MenuIcon: (props: any) => <svg data-testid="menu-icon" {...props} />,
}));

describe("MobileHeader", () => {
  it("renders the mobile header", () => {
    render(<MobileHeader onMenuClick={jest.fn()} />);
    expect(screen.getByTestId("mobile-header")).toBeInTheDocument();
  });

  it("renders the title", () => {
    render(<MobileHeader onMenuClick={jest.fn()} />);
    expect(screen.getByText("Meus Gastos")).toBeInTheDocument();
  });

  it("renders the menu icon button", () => {
    render(<MobileHeader onMenuClick={jest.fn()} />);
    expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
  });

  it("calls onMenuClick when menu button is clicked", () => {
    const onMenuClick = jest.fn();
    render(<MobileHeader onMenuClick={onMenuClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onMenuClick).toHaveBeenCalled();
  });
});
