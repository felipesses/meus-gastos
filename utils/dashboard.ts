import { format, parse, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export const getMonthName = (selectedMonth: string) => {
  const date = parse(selectedMonth, "yyyy-MM", new Date());
  const label = format(date, "MMMM", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const generateMonthOptions = () => {
  const options = [];
  const today = new Date();
  for (let i = -11; i <= 12; i++) {
    const date = subMonths(today, -i);
    const value = format(date, "yyyy-MM");
    let label = format(date, "MMMM yyyy", { locale: ptBR });

    label = capitalize(label);

    options.push({ value, label });
  }
  return options;
};
export const monthOptions = generateMonthOptions();
