import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";

import type { Metadata } from "next";

import "./globals.css";
import { MessageProvider } from "@/context/MessageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meus Gastos",
  description: "Gerencie suas finanças de forma simples e eficiente.",
  icons: {
    icon: ["/apple-touch-icon.png?v=4"],
    apple: ["/apple-touch-icon.png?v=4"],
    shortcut: ["/apple-touch-icon.png"],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={ptBR} afterSignOutUrl="/">
      <MessageProvider>
        <html lang="pt-BR">
          <body className={inter.className}>{children}</body>
        </html>
      </MessageProvider>
    </ClerkProvider>
  );
}
