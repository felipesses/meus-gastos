import { navItems } from "@/utils/navItems";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export const NavBar = () => {
  return (
    <nav
      data-testid="nav-bar"
      className="hidden md:flex bg-white shadow-sm py-3 px-6 items-center justify-between border-b border-gray-200 fixed w-full top-0 z-10"
    >
      <div className="flex items-center space-x-4">
        <div className="flex flex-row  items-center justify-center">
          <Image
            src="/logo.png"
            alt="Logo Meus Gastos"
            width={64}
            height={64}
            priority
          />
          <h1 className="text-2xl font-bold text-gray-900">Meus Gastos</h1>
        </div>

        <ul className="flex space-x-4">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 py-1.5 px-3 rounded-md"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <UserButton
        appearance={{
          elements: {
            avatarBox: {
              width: "3rem",
              height: "3rem",
            },
          },
        }}
      />
    </nav>
  );
};
