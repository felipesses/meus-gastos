import React from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import { render, RenderOptions } from "@testing-library/react";

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;

const AllProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ClerkProvider publishableKey={clerkPublishableKey}>{children}</ClerkProvider>
);

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
