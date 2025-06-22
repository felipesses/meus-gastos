import { navItems } from "@/utils/navItems";
import { UserButton, useUser } from "@clerk/nextjs";

import { XIcon } from "lucide-react"; // Ícones para o menu hambúrguer
import Link from "next/link";

export const SideBar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { user } = useUser();

  return (
    <>
      {isOpen && (
        <div
          data-testid="opacity-component"
          className="fixed inset-0 bg-black opacity-25 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        data-testid="side-bar"
        className={`
            fixed inset-y-0 left-0 w-64 bg-gray-800 text-white p-4 transform transition-transform duration-300 ease-in-out z-30
            ${isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}
            md:hidden 
            `}
      >
        <div className="flex justify-between items-center mb-8 md:hidden">
          <h2 className="text-2xl font-semibold text-gray-50">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 text-white"
          >
            <XIcon size={24} />
          </button>
        </div>

        <div className="mb-8 flex flex-col items-center md:hidden">
          <UserButton />

          {user && <p className="mt-2 text-lg font-medium text-gray-50">Olá</p>}
        </div>

        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <Link
                href={item.href}
                className="flex items-center p-3 rounded-xl hover:bg-gray-700 transition-colors duration-200"
                onClick={onClose}
              >
                <span className="text-lg">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};
