import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 48,
  color = "text-gray-800",
  message = "Carregando...",
}) => {
  return (
    <div
      data-testid="loading-spinner"
      className="flex flex-col items-center justify-center p-4"
    >
      <Loader2
        className={`animate-spin ${color}`}
        size={size}
        data-testid="loading-spinner-icon"
      />
      {message && <p className={`mt-3 text-lg ${color}`}>{message}</p>}
    </div>
  );
};
