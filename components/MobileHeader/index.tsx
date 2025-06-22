import { MenuIcon } from "lucide-react";

export const MobileHeader = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <header
      data-testid="mobile-header"
      className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-200 fixed w-full top-0 z-10"
    >
      <button
        onClick={onMenuClick}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <MenuIcon size={24} className="text-gray-800" />
      </button>

      <h1 className="text-2xl font-bold text-gray-900">Meus Gastos</h1>

      <div className="w-8 h-8" />
    </header>
  );
};
