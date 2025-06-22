import React, { useState, useEffect, useCallback } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  className?: string;
  containerClassName?: string;
  error?: string;
  isCurrency?: boolean;
}

export const Input = ({
  id,
  label,
  className = "",
  containerClassName = "",
  error,
  isCurrency = false,
  onChange,
  onBlur,
  value,
  type = "text",
  ...props
}: InputProps) => {
  const [displayValue, setDisplayValue] = useState<string>(
    isCurrency && typeof value === "number"
      ? new Intl.NumberFormat("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value)
      : String(value || "")
  );

  useEffect(() => {
    if (isCurrency) {
      const numericValue =
        typeof value === "string"
          ? parseFloat(value.replace(/\./g, "").replace(",", "."))
          : (value as number);

      if (
        !isNaN(numericValue) &&
        numericValue !== null &&
        numericValue !== undefined
      ) {
        setDisplayValue(
          new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(numericValue)
        );
      } else {
        setDisplayValue("");
      }
    } else {
      // Para inputs não monetários, apenas exibe o valor diretamente
      setDisplayValue(String(value || ""));
    }
  }, [isCurrency, value]);

  const formatCurrency = useCallback((rawValue: string) => {
    const cleanedValue = rawValue.replace(/[^\d]/g, "");

    if (!cleanedValue) {
      return { formatted: "", numeric: 0 };
    }

    let integerPart = cleanedValue.slice(0, -2);
    let decimalPart = cleanedValue.slice(-2);

    if (cleanedValue.length <= 2) {
      integerPart = "0";
      decimalPart = cleanedValue.padStart(2, "0");
    }

    const numericValue = parseFloat(`${integerPart}.${decimalPart}`);

    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);

    return { formatted, numeric: numericValue };
  }, []);

  const handleCurrencyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawInput = e.target.value;
      const { formatted, numeric } = formatCurrency(rawInput);

      setDisplayValue(formatted);

      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: String(numeric),
            name: e.target.name,
          },
        };
        onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      }
    },
    [onChange, formatCurrency]
  );

  const handleCurrencyBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const rawInput = e.target.value;
      const { numeric } = formatCurrency(rawInput);

      setDisplayValue(
        new Intl.NumberFormat("pt-BR", {
          style: "decimal",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(numeric)
      );

      if (onBlur) {
        onBlur(e);
      }
    },
    [onBlur, formatCurrency]
  );

  const baseClasses =
    "block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm " +
    "focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

  const errorClasses = error
    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
    : "";

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        type={isCurrency ? "text" : type}
        value={isCurrency ? displayValue : value}
        onChange={isCurrency ? handleCurrencyChange : onChange}
        onBlur={isCurrency ? handleCurrencyBlur : onBlur}
        className={`${baseClasses} ${errorClasses} ${className}`}
        {...props}
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
