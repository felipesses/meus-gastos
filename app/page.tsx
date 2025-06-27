import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4 text-center">
      <div className="bg-white text-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full">
        <h1 className="text-4xl font-bold mb-4">Bem-vindo(a) ao Meus Gastos</h1>

        <p className="text-lg mb-8">
          Sua ferramenta intuitiva para gerenciar suas finanças.
        </p>

        <ClerkLoading>
          <Loader2 className="animate-spin text-gray-600 mx-auto" size={48} />
        </ClerkLoading>

        <ClerkLoaded>
          <SignedOut>
            <div className="flex flex-col space-y-4">
              <Link href="/sign-in" passHref>
                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors duration-300 text-lg font-semibold shadow-md">
                  Entrar
                </button>
              </Link>

              <Link href="/sign-up" passHref>
                <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors duration-300 text-lg font-semibold shadow-md">
                  Registrar
                </button>
              </Link>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex flex-col items-center space-y-4">
              <p className="text-lg mb-2">Você já está logado(a)!</p>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: {
                      width: "4rem",
                      height: "4rem",
                    },
                  },
                }}
              />
              <Link href="/dashboard" passHref>
                <button className="mt-4 bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-colors duration-300 text-lg font-semibold shadow-md">
                  Ir para o Dashboard
                </button>
              </Link>
            </div>
          </SignedIn>
        </ClerkLoaded>
      </div>
    </div>
  );
}
