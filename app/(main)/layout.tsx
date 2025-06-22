"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MobileHeader } from "@/components/MobileHeader";
import { NavBar } from "@/components/NavBar";
import { SideBar } from "@/components/SideBar";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

// import React, { useState, useEffect } from "react";
// import { UserButton, useAuth, useUser } from "@clerk/nextjs";
// import Link from "next/link";
// import { MenuIcon, XIcon } from "lucide-react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex-col">
        <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />

        <NavBar />

        <main className="flex-1 pt-20 md:pt-20 overflow-auto">
          <div className="container mx-auto px-4 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
