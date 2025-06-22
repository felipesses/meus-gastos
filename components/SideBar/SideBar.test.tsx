/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { SideBar } from "./index";
import { navItems } from "@/utils/navItems";
import { render, screen, fireEvent } from "@/utils/test-utils";

jest.mock("@clerk/nextjs", () => ({
  UserButton: () => <div data-testid="user-button" />,
  useUser: () => ({ user: { id: "123" } }),
}));

// Mock lucide-react XIcon
jest.mock("lucide-react", () => ({
  XIcon: (props: any) => <svg data-testid="x-icon" {...props} />,
}));

describe("SideBar", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(<SideBar isOpen={false} onClose={onClose} />);
    expect(screen.queryByTestId("opacity-component")).not.toBeInTheDocument();
  });

  it("renders when isOpen is true", () => {
    render(<SideBar isOpen={true} onClose={onClose} />);
    expect(screen.getByTestId("side-bar")).toBeInTheDocument();
  });

  it("renders the menu title", () => {
    render(<SideBar isOpen={true} onClose={onClose} />);
    expect(screen.getByText("Menu")).toBeInTheDocument();
  });

  it("renders the UserButton", () => {
    render(<SideBar isOpen={true} onClose={onClose} />);
    expect(screen.getByTestId("user-button")).toBeInTheDocument();
  });

  it("renders greeting when user exists", () => {
    render(<SideBar isOpen={true} onClose={onClose} />);
    expect(screen.getByText("Olá")).toBeInTheDocument();
  });

  it("renders all nav items", () => {
    render(<SideBar isOpen={true} onClose={onClose} />);
    navItems.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: item.name })).toHaveAttribute(
        "href",
        item.href
      );
    });
  });

  it("calls onClose when overlay is clicked", () => {
    render(<SideBar isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("side-bar").previousSibling as Element);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when XIcon button is clicked", () => {
    render(<SideBar isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("x-icon").parentElement as Element);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when a nav item is clicked", () => {
    render(<SideBar isOpen={true} onClose={onClose} />);
    const link = screen.getByRole("link", { name: navItems[0].name });
    fireEvent.click(link);
    expect(onClose).toHaveBeenCalled();
  });
});
